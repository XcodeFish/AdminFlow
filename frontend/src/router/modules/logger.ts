import { RouteRecordRaw } from 'vue-router'
import { Layout } from '@/utils/import-layout'

// 日志管理模块路由
const loggerRoutes: RouteRecordRaw = {
  path: '/logger',
  component: Layout,
  redirect: '/logger/operation',
  name: 'Logger',
  meta: {
    title: '日志管理',
    icon: 'Document',
    requiresAuth: true,
    permissions: ['logger:view']
  },
  children: [
    // 操作日志管理
    {
      path: 'operation',
      name: 'OperationLog',
      component: () => import('@/views/logger/operation/index.vue'),
      meta: {
        title: '操作日志',
        requiresAuth: true,
        permissions: ['logger:operation:view']
      }
    },
    // 操作日志详情
    {
      path: 'operation/detail/:id',
      name: 'OperationLogDetail',
      component: () => import('@/views/logger/operation/detail.vue'),
      meta: {
        title: '操作日志详情',
        requiresAuth: true,
        permissions: ['logger:operation:view'],
        hidden: true
      }
    },
    // 接口日志管理
    {
      path: 'apiLog',
      name: 'ApiLog',
      component: () => import('@/views/logger/apiLog/index.vue'),
      meta: {
        title: '接口日志',
        requiresAuth: true,
        permissions: ['logger:api:view']
      }
    },
    // 接口日志详情
    {
      path: 'apiLog/detail/:id',
      name: 'ApiLogDetail',
      component: () => import('@/views/logger/apiLog/detail.vue'),
      meta: {
        title: '接口日志详情',
        requiresAuth: true,
        permissions: ['logger:api:view'],
        hidden: true
      }
    },
    // 日志统计分析
    {
      path: 'dashboard',
      name: 'LogDashboard',
      component: () => import('@/views/logger/logDashboard/index.vue'),
      meta: {
        title: '日志统计',
        requiresAuth: true,
        permissions: ['logger:view']
      }
    }
  ]
}

export default loggerRoutes
