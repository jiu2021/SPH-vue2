//引入
import Vue from "vue"
import VueRouter from "vue-router"
//使用插件
Vue.use(VueRouter);
//引入路由组件
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Search from '@/pages/Search'
//引入store
import store from '@/store'

//先把VueRouter原型对象的push先保存一份
let originPush = VueRouter.prototype.push;
let originReplace = VueRouter.prototype.replace;
//重写push、replace
//第一个参数：告诉原来push方法往哪里跳转
VueRouter.prototype.push = function(location, resolve, reject) {
  if (resolve && reject) {
    originPush.call(this, location, resolve, reject);
  } else {
    originPush.call(this, location, () => {}, () => {});
  }
}
VueRouter.prototype.replace = function(location, resolve, reject) {
  if (resolve && reject) {
    originReplace.call(this, location, resolve, reject);
  } else {
    originReplace.call(this, location, () => {}, () => {});
  }
}

let router = new VueRouter({
  //配置路由
  routes: [{
      path: "/home",
      component: Home,
      meta: { show: true }
    },
    {
      path: "/login",
      component: Login,
      meta: { show: false }
    },
    {
      path: "/register",
      component: Register,
      meta: { show: false }
    },
    {
      path: "/search/:keyword?",
      component: Search,
      meta: { show: true },
      name: "search"
    },
    //重定向，初始化首页
    {
      path: "*",
      redirect: "/home"
    }
  ]
});


//全局前置守卫
router.beforeEach(async(to, from, next) => {
  let token = store.state.user.token;
  let name = store.state.user.userInfo.name;
  if (token) {
    //用户登录了
    //console.log('有token');
    if (to.path == '/login') {
      next('/home');
    } else {
      //访问非登录页
      if (name) {
        //有用户信息
        next();
      } else {
        //获取用户信息
        try {
          await store.dispatch('getUserInfo');
          next();
        } catch (error) {
          //token失效
          await store.dispatch('userLogout');
          next('/login');
        }
      }
    }
  } else {
    //未登录
    //console.log('未登录');
    next();
  }
});


export default router;