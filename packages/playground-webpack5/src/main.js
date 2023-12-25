import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import Antd from 'ant-design-vue';

import 'ant-design-vue/dist/antd.css';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(Antd);

const router = new VueRouter({
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

new Vue({ router, render: (h) => h(App) }).$mount('#app');
