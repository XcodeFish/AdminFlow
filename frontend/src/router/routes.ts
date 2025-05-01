import type { RouteRecordRaw } from 'vue-router';

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
  }
];

// 动态路由（需要根据用户权限动态添加）
export const asyncRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
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

  // 系统管理
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      requiresAuth: true,
      keepAlive: true,
      permission: 'system:view'
    },
    children: [
      // {
      //   path: 'user',
      //   name: 'User',
      //   component: () => import('@/views/system/user/index.vue'),
      //   meta: {
      //     title: '用户管理',
      //     icon: 'User',
      //     requiresAuth: true,
      //     keepAlive: true,
      //     permission: 'system:user:list'
      //   }
      // },
      // {
      //   path: 'role',
      //   name: 'Role',
      //   component: () => import('@/views/system/role/index.vue'),
      //   meta: {
      //     title: '角色管理',
      //     icon: 'UserFilled',
      //     requiresAuth: true,
      //     keepAlive: true,
      //     permission: 'system:role:list'
      //   }
      // },
      // {
      //   path: 'menu',
      //   name: 'Menu',
      //   component: () => import('@/views/system/menu/index.vue'),
      //   meta: {
      //     title: '菜单管理',
      //     icon: 'Menu',
      //     requiresAuth: true,
      //     keepAlive: true,
      //     permission: 'system:menu:list'
      //   }
      // },
      // {
      //   path: 'dept',
      //   name: 'Dept',
      //   component: () => import('@/views/system/dept/index.vue'),
      //   meta: {
      //     title: '部门管理',
      //     icon: 'OfficeBuilding',
      //     requiresAuth: true,
      //     keepAlive: true,
      //     permission: 'system:dept:list'
      //   }
      // },
      // {
      //   path: 'dict',
      //   name: 'Dict',
      //   component: () => import('@/views/system/dict/index.vue'),
      //   meta: {
      //     title: '字典管理',
      //     icon: 'ri-book-2-line',
      //     requiresAuth: true,
      //     keepAlive: true,
      //     permission: 'system:dict:list'
      //   }
      // },
       // 字典数据管理路由
    // {
    //   path: 'dict/data',
    //   name: 'DictData',
    //   component: () => import('@/views/system/dict/data.vue'),
    //   meta: {
    //     title: '字典数据',
    //     icon: 'ri-book-open-line',
    //     hidden: true,
    //     keepAlive: true,
    //     activeMenu: '/system/dict',
    //     permission: ['system:dict:list']
    //   }
    // },
      // {
      //   path: 'config',
      //   name: 'Config',
      //   component: () => import('@/views/system/config/index.vue'),
      //   meta: {
      //     title: '参数配置',
      //     icon: 'Tools',
      //     requiresAuth: true,
      //     keepAlive: true,
      //     permission: 'system:config:list'
      //   }
      // }
    ]
  },

  // 系统监控
  // {
  //   path: '/monitor',
  //   name: 'Monitor',
  //   component: () => import('@/layouts/index.vue'),
  //   redirect: '/monitor/server',
  //   meta: {
  //     title: '系统监控',
  //     icon: 'Monitor',
  //     requiresAuth: true,
  //     permission: 'monitor:view'
  //   },
  //   children: [
  //     {
  //       path: 'server',
  //       name: 'Server',
  //       component: () => import('@/views/monitor/server/index.vue'),
  //       meta: {
  //         title: '服务器监控',
  //         icon: 'CpuChip',
  //         requiresAuth: true,
  //         permission: 'monitor:server:list'
  //       }
  //     },
  //     {
  //       path: 'online',
  //       name: 'Online',
  //       component: () => import('@/views/monitor/online/index.vue'),
  //       meta: {
  //         title: '在线用户',
  //         icon: 'UserFilled',
  //         requiresAuth: true,
  //         permission: 'monitor:online:list'
  //       }
  //     },
  //     {
  //       path: 'log',
  //       name: 'Log',
  //       component: () => import('@/layouts/index.vue'),
  //       redirect: '/monitor/log/operation',
  //       meta: {
  //         title: '日志管理',
  //         icon: 'Notebook',
  //         requiresAuth: true,
  //         permission: 'monitor:log:view'
  //       },
  //       children: [
  //         {
  //           path: 'operation',
  //           name: 'OperationLog',
  //           component: () => import('@/views/monitor/log/operation/index.vue'),
  //           meta: {
  //             title: '操作日志',
  //             icon: 'Operation',
  //             requiresAuth: true,
  //             permission: 'monitor:log:operation:list'
  //           }
  //         },
  //         {
  //           path: 'login',
  //           name: 'LoginLog',
  //           component: () => import('@/views/monitor/log/login/index.vue'),
  //           meta: {
  //             title: '登录日志',
  //             icon: 'Reading',
  //             requiresAuth: true,
  //             permission: 'monitor:log:login:list'
  //           }
  //         }
  //       ]
  //     }
  //   ]
  // },

  // 个人中心
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/layout/index.vue'),
    redirect: '/profile/index',
    meta: {hidden: true},
    children: [
      // {
      //   path: 'index',
      //   name: 'ProfileIndex',
      //   component: () => import('@/views/profile/index.vue'),
      //   meta: {
      //     title: '个人中心',
      //     icon: 'User',
      //     requiresAuth: true
      //   }
      // }
    ]
  },

  // 匹配所有未定义的路由，必须放在最后
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {hidden: true }
  }
];
