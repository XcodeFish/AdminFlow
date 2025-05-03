import type { RouteRecordRaw } from 'vue-router'
import { Layout } from '@/utils/import-layout'

/**
 * 静态路由（不需要权限，所有用户都可以访问）
 * 包括登录页面、错误页面等
 */
export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权限访问', requiresAuth: false }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: { title: '服务器错误', requiresAuth: false }
  }
]

/**
 * 基础路由配置 - 会在动态路由加载前添加
 * 包括布局和仪表盘等默认页面
 */
export const basicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/dashboard',
    children: [
      // 仪表盘
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Dashboard',
          affix: true,
          requiresAuth: true
        }
      }
    ]
  }
]

/**
 * 错误路由配置 - 始终放在最后
 * 用于处理未匹配的路由请求
 */
export const errorRoutes: Array<RouteRecordRaw> = [
  // 匹配所有未定义的路由，必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundRedirect',
    redirect: '/404',
    meta: { hidden: true }
  }
]
