<template>
  <div class="say-button">
    <button @click="onClick">{{ text }}</button>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
  },
  computed: {
    text() {
      return `Hello, ${this.name}`;
    },
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
