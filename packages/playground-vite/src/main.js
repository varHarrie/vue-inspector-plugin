import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import ArcoVue from '@arco-design/web-vue';

import '@arco-design/web-vue/dist/arco.css';

import App from './App.vue';

const router = new createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '',
      component: () => import('./views/ParentView.vue'),
      children: [
        { path: '/a', component: () => import('./views/AlphaView.vue') },
        { path: '/b', component: () => import('./views/BetaView.vue') },
      ],
    },
  ],
});

const app = createApp(App);

app.use(router);
app.use(ArcoVue);
app.mount('#app');
