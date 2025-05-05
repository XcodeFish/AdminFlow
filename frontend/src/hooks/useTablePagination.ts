import { ref } from 'vue'

export default function useTablePagination(defaultPage = 1, defaultPageSize = 10) {
  // 当前页码
  const currentPage = ref(defaultPage)
  // 每页数量
  const pageSize = ref(defaultPageSize)

  // 处理页码变更
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
  }

  // 处理每页数量变更
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 重置为第一页
  }

  return {
    currentPage,
    pageSize,
    handleCurrentChange,
    handleSizeChange
  }
}
