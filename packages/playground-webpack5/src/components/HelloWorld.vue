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
  data: () => ({
    message: 'Hello World',
    obj: {
      foo: 1,
      bar: 2,
      xxx: {
        a: 1,
        b: [1, 2, 3],
      },
    },
  }),
};
</script>

<style>
.hello-world {
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
