import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
import Unplugin from 'vue-inspector-plugin/vite';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [Vue(), Inspect(), Unplugin()],
});
