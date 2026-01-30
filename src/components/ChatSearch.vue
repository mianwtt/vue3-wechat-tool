<template>
  <div class="chat-search" :class="{ 'dark': appearance.darkMode }">
    <div class="search-input-wrapper">
      <a-input
        :value="searchKeyword"
        @update:value="handleSearchInput"
        placeholder="搜索聊天内容"
        class="search-input"
        @press-enter="handleEnter"
        @keydown="handleKeydown"
        allow-clear
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>
      
      <div class="search-controls" v-if="searchKeyword">
        <span class="search-count" v-if="searchStore.hasResults">
          {{ searchStore.currentResultNumber }}/{{ searchStore.resultCount }}
        </span>
        <span class="search-count" v-else>无结果</span>
        
        <a-button-group size="small">
          <a-button @click="navigatePrevious" size="small" :disabled="!searchStore.hasResults">
            <template #icon><UpOutlined /></template>
          </a-button>
          <a-button @click="navigateNext" size="small" :disabled="!searchStore.hasResults">
            <template #icon><DownOutlined /></template>
          </a-button>
        </a-button-group>
        
        <a-button @click="clearSearch" size="small" danger>
          清除
        </a-button>
      </div>
    </div>
    
    <div class="search-filters" v-if="searchKeyword">
      <a-select
        :value="searchStore.searchFilter.sender"
        @update:value="handleFilterChange"
        style="width: 120px"
        size="small"
      >
        <a-select-option value="all">全部发送者</a-select-option>
        <a-select-option value="own">仅自己</a-select-option>
        <a-select-option value="other">仅对方</a-select-option>
        <a-select-option 
          v-for="user in userStore.userList.filter(user => user.role === 'other')" 
          :key="user.id" 
          :value="user.id"
        >
          {{ user.nickname }}
        </a-select-option>
      </a-select>
      
      <span class="search-hint">仅搜索文本内容</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { SearchOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue';
import useStore from '@/store';

const { useSearchStore, useUserStore } = useStore();

const props = defineProps({
  appearance: {
    type: Object,
    default: () => ({}),
  }
});

const searchKeyword = computed({
  get: () => useSearchStore.searchKeyword,
  set: (value) => useSearchStore.setSearchKeyword(value)
});

const handleSearchInput = (value) => {
  searchKeyword.value = value;
};

const handleFilterChange = (value) => {
  useSearchStore.setSearchFilter({ sender: value });
};

const handleEnter = (e) => {
  if (e.shiftKey) {
    navigatePrevious();
  } else {
    navigateNext();
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    clearSearch();
  }
};

const navigateNext = () => {
  useSearchStore.navigateToNext();
};

const navigatePrevious = () => {
  useSearchStore.navigateToPrevious();
};

const clearSearch = () => {
  useSearchStore.clearSearch();
};
</script>

<style lang="less" scoped>
.chat-search {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-top: none;
  padding: 12px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &.dark {
    background: #1f1f1f;
    border-color: #434343;
    
    .search-input {
      background: #141414;
      border-color: #434343;
      color: #d9d9d9;
    }
    
    .search-count {
      color: #d9d9d9;
    }
    
    .search-hint {
      color: #8c8c8c;
    }
  }
  
  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .search-input {
      flex: 1;
    }
    
    .search-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      
      .search-count {
        font-size: 12px;
        color: #666;
        margin-right: 4px;
      }
    }
  }
  
  .search-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .search-hint {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>