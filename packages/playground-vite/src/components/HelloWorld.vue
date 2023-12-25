<template>
  <div class="hello-world">
    <p>Hello World, {{ name }}</p>
    <SayButton :name="name" />
    <a-button>test</a-button>
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
    longText: 'a'.repeat(1000),
    message:
      'Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!Hello World!',
    n: null,
    u: undefined,
    bool: true,
    obj: {
      foo: 1,
      bar: 2,
      xxx: {
        a: 1,
        b: [1, 2, 3, 5, 6, 7, 8, 9, 10],
        c: [{ a: 1, b: 2 }],
      },
      s: Symbol('foo'),
    },
  }),
  computed: {
    text() {
      return `Hello, ${this.name}`;
    },
  },
};
</script>

<style>
.hello-world {
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
