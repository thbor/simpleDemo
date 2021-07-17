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
    { path: '/myCharts', component: '@/pages/myCharts'},
    { path: '/error', component: '@/pages/error'},
    { path: '*', redirect:'/error'},  //没有这个页面时跳转
  ],
  fastRefresh: {},
  dva: {},
  qiankun:{
    master:{
      apps:[
        {name:"app1",entry:"//localhost:7001"},
        {name:"app2",entry:"//localhost:7002"},
      ]
    },
  }
});
