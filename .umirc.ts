import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  // wrappers 鉴权
  routes: [
    { path: '/', component: '@/pages/index',wrappers: ['@/wrappers/auth']},
    { path: '/login', component: '@/pages/login' },
    { path: '/index', component: '@/pages/index',wrappers: ['@/wrappers/auth']},
    { path: '/error', component: '@/pages/error'},
    { path: '*', redirect:'/error'},  //没有这个页面时跳转
  ],
  fastRefresh: {},
  dva: {},
});
