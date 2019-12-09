import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: '首页',
      component: (resolve) => require(['../views/Home.vue'], resolve)
    }
  ]
})

export default router
