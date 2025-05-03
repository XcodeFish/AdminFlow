import { ElMessage } from 'element-plus'
import { getUserList } from '@/api/modules/user'
import type { UserQueryParams } from '@/types/user'

/**
 * 导出功能Hook
 */
export function useExport() {
  /**
   * 导出用户数据
   * @param params 查询参数
   */
  const exportUserData = async (params: UserQueryParams) => {
    try {
      ElMessage.info('正在准备导出数据...')

      // 获取所有数据（不分页）
      const exportParams = {
        ...params,
        page: 1,
        pageSize: 1000 // 导出更多数据
      }

      const res = await getUserList(exportParams)
      const { items } = res.data

      if (!items || items.length === 0) {
        ElMessage.warning('没有数据可导出')
        return
      }

      // 准备CSV数据
      const headers = [
        '用户名',
        '真实姓名',
        '昵称',
        '手机号',
        '邮箱',
        '角色',
        '部门',
        '状态',
        '创建时间',
        '最后登录'
      ]

      const rows = items.map((user) => [
        user.username || '',
        user.realName || '',
        user.nickname || '',
        user.phone || '',
        user.email || '',
        (user.roles || []).map((r) => r.roleName).join(','),
        '', // 部门名称需要单独处理
        user.status === 1 ? '启用' : '禁用',
        user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
        user.lastLoginTime ? new Date(user.lastLoginTime).toLocaleString() : ''
      ])

      // 创建CSV内容
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

      // 创建Blob和下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `用户数据_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出用户数据失败:', error)
      ElMessage.error('导出失败')
    }
  }

  return {
    exportUserData
  }
}
