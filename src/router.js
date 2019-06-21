import Vue from 'vue'
import Router from 'vue-router'

import * as firebase from 'firebase/app';
import 'firebase/auth';

import Home from '@/views/home'
import Login from '@/views/login'
import Suppliers from '@/views/suppliers'

Vue.use(Router)

const router =  new Router({
  //mode: 'history',
  routes: [
    {
      path: '*',
      redirect: '/login'
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta : { auth: false }
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta : { auth: true }
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: Suppliers,
      meta : { auth: true }
    },
    
  ]
})

router.beforeEach((to, from, next) => {

  const authUrl = to.matched.some(route => route.meta.auth )

  if ( !authUrl) {
    next()
  }

  firebase.auth().onAuthStateChanged(function(user) {

    if (user) {
      // user signed in
      if (user && to.path == '/login')  {  //redirect to home if user is already logged in
        next('/home')
      } else { // else proceed
        next()
      }
    } else {
      // No user is signed in.
      next('login')
    }
  });
})


export default router