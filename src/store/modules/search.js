import { defineStore } from "pinia";
import { indexedDBStorage } from "@/utils/storage";
import { useChatStore } from "./chat";
import { useUserStore } from "./user";

export const useSearchStore = defineStore("toolSearch", {
  state: () => ({
    searchKeyword: "",
    searchResults: [],
    currentResultIndex: -1,
    isSearching: false,
    searchFilter: {
      sender: "all", // all, own, other, or specific user ID
    },
    highlightedElements: [], // Track highlighted elements
    originalContents: new Map() // Store original message contents
  }),
  getters: {
    hasResults() {
      return this.searchResults.length > 0;
    },
    currentResult() {
      return this.searchResults[this.currentResultIndex] || null;
    },
    resultCount() {
      return this.searchResults.length;
    },
    currentResultNumber() {
      return this.currentResultIndex + 1;
    }
  },
  actions: {
    setSearchKeyword(keyword) {
      // Clear previous search first
      this.clearSearch();

      this.searchKeyword = keyword;
      if (keyword.trim()) {
        this.performSearch();
      }
    },

    performSearch() {
      const chatStore = useChatStore();
      const chatList = chatStore.chatList;

      if (!this.searchKeyword.trim()) {
        return;
      }

      this.searchResults = [];
      this.currentResultIndex = -1;

      const keyword = this.searchKeyword.toLowerCase();

      // First, restore all original contents
      this.restoreAllContents();

      chatList.forEach((chat, index) => {
        // Only search text-based messages
        if (!this.isTextSearchable(chat)) {
          return;
        }

        // Apply sender filter
        if (this.searchFilter.sender !== "all") {
          if (this.searchFilter.sender === "own" && chat.role !== "own") return;
          if (this.searchFilter.sender === "other" && chat.role !== "other") return;
          if (this.searchFilter.sender.startsWith("user-") && chat.user?.id !== this.searchFilter.sender) return;
        }

        const content = this.getSearchableContent(chat);
        if (content && content.toLowerCase().includes(keyword)) {
          this.searchResults.push({
            chatId: chat.id,
            index: index,
            content: content,
            keyword: keyword
          });

          // Highlight the content in the DOM
          this.highlightMessageContent(chat.id, content, keyword);
        }
      });

      console.log(`Search completed: Found ${this.searchResults.length} results for "${this.searchKeyword}"`);

      if (this.searchResults.length > 0) {
        this.currentResultIndex = 0;
        // Delay to ensure DOM is updated
        setTimeout(() => {
          this.scrollToCurrentResult();
        }, 100);
      }

      this.isSearching = true;
    },

    isTextSearchable(chat) {
      return ["text", "voice"].includes(chat.type);
    },

    getSearchableContent(chat) {
      switch (chat.type) {
        case "text":
          return chat.content;
        case "voice":
          return chat.content || ""; // Voice-to-text content
        default:
          return "";
      }
    },

    highlightMessageContent(chatId, content, keyword) {
      // Find the message element
      const messageElement = document.querySelector(`#${chatId} .wechat-item-text`);
      if (!messageElement) return;

      // Store original content if not already stored
      if (!this.originalContents.has(chatId)) {
        this.originalContents.set(chatId, messageElement.innerHTML);
      }

      // Create highlighted version
      const regex = new RegExp(`(${keyword})`, 'gi');
      const highlightedContent = content.replace(regex, '<mark class="search-keyword">$1</mark>');

      // Update the element
      messageElement.innerHTML = highlightedContent;
    },

    restoreAllContents() {
      // Restore all original message contents
      this.originalContents.forEach((originalContent, chatId) => {
        const messageElement = document.querySelector(`#${chatId} .wechat-item-text`);
        if (messageElement) {
          messageElement.innerHTML = originalContent;
        }
      });
      this.originalContents.clear();
    },

    navigateToNext() {
      if (this.searchResults.length === 0) {
        console.log('No search results to navigate');
        return;
      }

      // Remove highlight from current result
      this.unhighlightCurrentResult();

      this.currentResultIndex = (this.currentResultIndex + 1) % this.searchResults.length;
      console.log(`Navigating to next result: ${this.currentResultNumber}/${this.resultCount}`);
      this.scrollToCurrentResult();
    },

    navigateToPrevious() {
      if (this.searchResults.length === 0) {
        console.log('No search results to navigate');
        return;
      }

      // Remove highlight from current result
      this.unhighlightCurrentResult();

      this.currentResultIndex = this.currentResultIndex <= 0
        ? this.searchResults.length - 1
        : this.currentResultIndex - 1;
      console.log(`Navigating to previous result: ${this.currentResultNumber}/${this.resultCount}`);
      this.scrollToCurrentResult();
    },

    unhighlightCurrentResult() {
      if (this.currentResult) {
        const element = document.getElementById(this.currentResult.chatId);
        if (element) {
          element.classList.remove('search-highlight-active');
        }
      }
    },

    scrollToCurrentResult() {
      if (this.currentResult) {
        const element = document.getElementById(this.currentResult.chatId);
        if (element) {
          console.log(`Scrolling to element with ID: ${this.currentResult.chatId}`);

          // Clear previous active highlights
          document.querySelectorAll('.search-highlight-active').forEach(el => {
            el.classList.remove('search-highlight-active');
          });

          // Add active highlight to current element
          element.classList.add('search-highlight-active');

          // Scroll to element with offset for better visibility
          const elementRect = element.getBoundingClientRect();
          const container = element.closest('.phone-body');

          if (container) {
            const containerRect = container.getBoundingClientRect();
            const scrollTop = container.scrollTop + elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);

            container.scrollTo({
              top: scrollTop,
              behavior: "smooth"
            });
          } else {
            // Fallback to element.scrollIntoView
            element.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }

        } else {
          console.warn(`Element with ID ${this.currentResult.chatId} not found`);
        }
      } else {
        console.warn('No current result to scroll to');
      }
    },

    clearHighlights() {
      // Remove all highlight classes
      document.querySelectorAll('.search-highlight-active').forEach(el => {
        el.classList.remove('search-highlight-active');
      });

      // Restore all original contents
      this.restoreAllContents();
    },

    clearSearch() {
      console.log('Clearing search');
      this.searchKeyword = "";
      this.searchResults = [];
      this.currentResultIndex = -1;
      this.isSearching = false;
      this.clearHighlights();
    },

    setSearchFilter(filter) {
      this.searchFilter = { ...this.searchFilter, ...filter };
      if (this.searchKeyword.trim()) {
        this.performSearch();
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: indexedDBStorage,
        paths: ["searchFilter"],
      },
    ],
  },
});