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
    }
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
      this.searchKeyword = keyword;
      if (keyword.trim()) {
        this.performSearch();
      } else {
        this.clearSearch();
      }
    },
    
    performSearch() {
      const chatStore = useChatStore();
      const chatList = chatStore.chatList;
      
      if (!this.searchKeyword.trim()) {
        this.clearSearch();
        return;
      }
      
      this.searchResults = [];
      this.currentResultIndex = -1;
      
      const keyword = this.searchKeyword.toLowerCase();
      
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
        }
      });
      
      if (this.searchResults.length > 0) {
        this.currentResultIndex = 0;
        this.scrollToCurrentResult();
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
    
    navigateToNext() {
      if (this.searchResults.length === 0) return;
      
      this.currentResultIndex = (this.currentResultIndex + 1) % this.searchResults.length;
      this.scrollToCurrentResult();
    },
    
    navigateToPrevious() {
      if (this.searchResults.length === 0) return;
      
      this.currentResultIndex = this.currentResultIndex <= 0 
        ? this.searchResults.length - 1 
        : this.currentResultIndex - 1;
      this.scrollToCurrentResult();
    },
    
    scrollToCurrentResult() {
      if (this.currentResult) {
        const element = document.getElementById(this.currentResult.chatId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
          
          // Add highlight effect
          this.highlightResult(element);
        }
      }
    },
    
    highlightResult(element) {
      // Remove previous highlights
      document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
      });
      
      // Add highlight to current element
      element.classList.add('search-highlight');
      
      // Remove highlight after 1 second
      setTimeout(() => {
        element.classList.remove('search-highlight');
      }, 1000);
    },
    
    clearSearch() {
      this.searchKeyword = "";
      this.searchResults = [];
      this.currentResultIndex = -1;
      this.isSearching = false;
      
      // Remove all highlights
      document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
      });
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