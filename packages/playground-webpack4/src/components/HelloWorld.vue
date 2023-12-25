<template>
  <div class="hello-world">
    <p>Hello World, {{ name }}</p>
    <SayButton :name="name" />
  </div>
</template>

<script>
import SayButton from './SayButton.vue';

export default {
  components: {
    SayButton,
  },
  props: {
    name: String,
  },
};
</script>

<style>
.hello-world {
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
