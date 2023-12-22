<template>
  <div class="beta-view">
    <h3>BetaView</h3>
    <HelloWorld name="beta" />
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
.beta-view {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
