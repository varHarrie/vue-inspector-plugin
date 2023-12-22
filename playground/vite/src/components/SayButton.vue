<template>
  <div class="say-button">
    <button class="my-button" @click="onClick">click</button>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
  },
  methods: {
    onClick() {
      console.log(`Hello, ${this.name}`);
    },
  },
};
</script>

<style>
.say-button {
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
