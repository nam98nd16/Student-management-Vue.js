import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'

import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import Settings from '@/components/Settings'
import TestApi from '../services/TestApi'
import Test from '@/components/Test'
import AuthApi from '../services/AuthApi'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '*',
            redirect: '/dashboard'
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/test',
            name: 'Test',
            component: Test
        }
    ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)
  const currentToken = Vue.cookie.get('token')

  if (requiresAuth && !currentToken) {
      next('/login')
  } else if (requiresAuth && currentToken) {
      next()
  } else {
      next()
  }
})

export default router