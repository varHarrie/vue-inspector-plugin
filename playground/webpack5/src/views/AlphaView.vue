<template>
  <div class="alpha-view">
    <h3>AlphaView</h3>
    <HelloWorld name="alpha" />
  </div>
</template>

<script>
import HelloWorld from '../components/HelloWorld.vue';

export default {
  components: {
    HelloWorld,
  },
};
</script>

<style>
.alpha-view {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
