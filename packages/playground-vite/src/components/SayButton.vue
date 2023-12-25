<template>
  <div class="say-button">
    <button class="my-button" @click="onClick">{{ text }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps(['name']);

const text = ref('click');

const onClick = () => {
  console.log(`Hello, ${name}`);
};
</script>

<style>
.say-button {
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
