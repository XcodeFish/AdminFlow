import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

export function useDraggable<T>(
  dataList: Ref<T[]>,
  options: {
    onDragEnd?: (newList: T[]) => void
    rowKey?: string
  } = {}
) {
  const { onDragEnd, rowKey = 'id' } = options
  const tableRef = ref<any>(null)
  const isDragging = ref(false)
  const draggingIndex = ref(-1)

  // 设置拖拽相关属性
  const setDraggable = () => {
    if (!tableRef.value) return

    const table = tableRef.value
    const tbody = table.$el.querySelector('.el-table__body tbody')

    if (!tbody) return

    const rows = tbody.querySelectorAll('tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      row.setAttribute('draggable', 'true')
      row.dataset.index = i.toString()

      // 绑定事件
      row.addEventListener('dragstart', handleRowDragStart)
      row.addEventListener('dragend', handleRowDragEnd)
      row.addEventListener('dragover', handleRowDragOver)
      row.addEventListener('dragenter', handleRowDragEnter)
    }
  }

  // 拖拽开始
  const handleRowDragStart = (e: DragEvent) => {
    if (!e.target) return

    isDragging.value = true
    const row = e.target as HTMLElement
    draggingIndex.value = parseInt(row.dataset.index || '-1', 10)

    // 设置拖拽效果
    row.classList.add('dragging')

    // 设置拖拽数据
    e.dataTransfer?.setData('text/plain', row.dataset.index || '')
  }

  // 拖拽结束
  const handleRowDragEnd = (e: DragEvent) => {
    if (!e.target) return

    isDragging.value = false
    const row = e.target as HTMLElement
    row.classList.remove('dragging')

    // 调用外部回调
    if (onDragEnd) {
      onDragEnd([...dataList.value])
    }
  }

  // 拖拽经过
  const handleRowDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  // 拖拽进入
  const handleRowDragEnter = (e: DragEvent) => {
    e.preventDefault()
    if (!e.target || !isDragging.value) return

    // 获取目标行
    let targetRow = (e.target as HTMLElement).closest('tr')
    if (!targetRow) return

    const targetIndex = parseInt(targetRow.dataset.index || '-1', 10)
    if (targetIndex === -1 || targetIndex === draggingIndex.value) return

    // 移动数据
    const temp = dataList.value[draggingIndex.value]
    if (draggingIndex.value < targetIndex) {
      // 向下拖动
      for (let i = draggingIndex.value; i < targetIndex; i++) {
        dataList.value[i] = dataList.value[i + 1]
      }
    } else {
      // 向上拖动
      for (let i = draggingIndex.value; i > targetIndex; i--) {
        dataList.value[i] = dataList.value[i - 1]
      }
    }
    dataList.value[targetIndex] = temp

    // 更新拖拽索引
    draggingIndex.value = targetIndex
  }

  // 移除事件监听
  const removeDraggable = () => {
    if (!tableRef.value) return

    const table = tableRef.value
    const tbody = table.$el.querySelector('.el-table__body tbody')

    if (!tbody) return

    const rows = tbody.querySelectorAll('tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      row.removeAttribute('draggable')

      // 移除事件
      row.removeEventListener('dragstart', handleRowDragStart)
      row.removeEventListener('dragend', handleRowDragEnd)
      row.removeEventListener('dragover', handleRowDragOver)
      row.removeEventListener('dragenter', handleRowDragEnter)
    }
  }

  // 手动更新拖拽效果
  const updateDraggable = () => {
    removeDraggable()
    setDraggable()
  }

  onMounted(() => {
    // 等待DOM更新后再设置拖拽
    setTimeout(() => {
      setDraggable()
    }, 300)
  })

  onBeforeUnmount(() => {
    removeDraggable()
  })

  return {
    tableRef,
    updateDraggable
  }
}
