<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiService from '@/services/apiService';
import type { Item } from '@/services/apiService'; 

const items = ref<Item[]>([]);
const newItem = ref<Item>({ id: 0, name: '' });

const loadData = async () => {
  try {
    var message = await apiService.fetchData('test-value');
    console.log(message);
  } catch (error) {
    console.error('Error loading data', error);
  }
};

const addItem = async () => {
  try {
    const addedItem = await apiService.postData('items', newItem.value);
    items.value.push(addedItem);
    newItem.value.name = '';
  } catch (error) {
    console.error('Error adding item', error);
  }
};

onMounted(loadData);
</script>

<template>
  <div>
    <h1>Items List</h1>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>

    <input v-model="newItem.name" placeholder="New Item" />
    <button @click="addItem">Add Item</button>
  </div>
</template>
