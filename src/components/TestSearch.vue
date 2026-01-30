<template>
  <div class="test-search">
    <h3>Search Test Component</h3>
    <div class="test-controls">
      <a-input v-model:value="testKeyword" placeholder="Test search keyword" />
      <a-button @click="testSearch">Test Search</a-button>
      <a-button @click="testNavigation">Test Navigation</a-button>
    </div>
    <div class="test-results">
      <p>Search Results: {{ searchStore.searchResults.length }}</p>
      <p>Current Index: {{ searchStore.currentResultIndex }}</p>
      <p>Current Result: {{ searchStore.currentResult }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useStore from '@/store';

const { useSearchStore } = useStore();
const testKeyword = ref('测试');

const testSearch = () => {
  console.log('Testing search with keyword:', testKeyword.value);
  useSearchStore.setSearchKeyword(testKeyword.value);
  console.log('Search results:', useSearchStore.searchResults);
  console.log('Has results:', useSearchStore.hasResults);
};

const testNavigation = () => {
  if (useSearchStore.hasResults) {
    console.log('Testing navigation...');
    useSearchStore.navigateToNext();
    console.log('After navigate next:', useSearchStore.currentResult);
  }
};
</script>

<style scoped>
.test-search {
  position: fixed;
  top: 100px;
  right: 20px;
  background: white;
  border: 1px solid #ccc;
  padding: 20px;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.test-results {
  font-size: 12px;
}
</style>