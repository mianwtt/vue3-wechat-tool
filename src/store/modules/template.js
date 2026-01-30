import { defineStore } from "pinia";
import { indexedDBStorage } from "@/utils/storage";
import { useChatStore } from "./chat";
import { useSearchStore } from "./search";

export const useTemplateStore = defineStore("toolTemplate", {
  state: () => ({
    list: [],
  }),
  actions: {
    async init() {
      const toolTemplate = await indexedDBStorage.getItem('toolTemplate');
      if (!toolTemplate) return;
      const {list} = JSON.parse(toolTemplate);
      this.list = list;
    },
    // 新增聊天模板
    add(params) {
      this.list.unshift({
        id: `template-${Date.now()}`,
        ...params
      })
    },
    delete(id) {
      this.list = this.list.filter(item => item.id != id);
    },
    // 加载模板数据
    loadTemplate(templateData) {
      const chatStore = useChatStore();
      const searchStore = useSearchStore();
      
      // Clear search when loading new template
      searchStore.clearSearch();
      
      // Load template data into chat store
      if (templateData.chatList) {
        chatStore.chatList = templateData.chatList;
      }
      if (templateData.activeType) {
        chatStore.activeType = templateData.activeType;
      }
      if (templateData.generateConfig) {
        chatStore.generateConfig = templateData.generateConfig;
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: indexedDBStorage,
      },
    ],
  },
});
