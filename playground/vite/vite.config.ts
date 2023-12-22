import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
import Unplugin from '../../src/vite';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [Vue(), Inspect(), Unplugin()],
});
