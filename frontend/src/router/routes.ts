import type { RouteRecordRaw } from 'vue-router'

// 静态路由（不需要权限，所有用户都可以访问）
export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  // {
  //   path: '/social-callback',
  //   name: 'SocialCallback',
  //   component: () => import('@/views/auth/social-callback.vue'),
  //   meta: { title: '第三方登录', requiresAuth: false }
  // },
  // {
  //   path: '/auth',
  //   name: 'Auth',
  //   component: () => import('@/layouts/index.vue'),
  //   meta: { hidden: true, requiresAuth: false },
  //   children: [
  //     {
  //       path: 'forgot-password',
  //       name: 'ForgotPassword',
  //       component: () => import('@/views/auth/forgot-password.vue'),
  //       meta: { title: '忘记密码', requiresAuth: false }
  //     }
  //   ]
  // },
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
  },
  // 主布局和基础路由
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
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
  },
  // 系统管理（单独一个主路由）
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/menu',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      requiresAuth: true
    },
    children: [
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'Menu',
          requiresAuth: true
        }
      },
      // 添加测试路由
      {
        path: 'test',
        name: 'SystemTest',
        component: () => import('@/views/system/test.vue'),
        meta: {
          title: '测试页面',
          icon: 'Tools',
          requiresAuth: true
        }
      }
    ]
  }
]

// 动态路由（需要根据用户权限动态添加）
export const asyncRoutes: Array<RouteRecordRaw> = [
  // 个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/layout/index.vue'),
    redirect: '/profile/index',
    meta: { hidden: true },
    children: []
  },

  // 匹配所有未定义的路由，必须放在最后
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true }
  }
]
