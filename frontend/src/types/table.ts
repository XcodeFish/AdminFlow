export interface TableColumn<T = any> {
  /** 列类型 */
  type?: 'selection' | 'index' | 'expand'
  /** 列属性名 */
  prop?: keyof T & string
  /** 列标题 */
  label: string
  /** 列宽度 */
  width?: string | number
  /** 最小列宽度 */
  minWidth?: string | number
  /** 是否固定列 */
  fixed?: 'left' | 'right' | boolean
  /** 是否可排序 */
  sortable?: boolean | 'custom'
  /** 自定义格式化函数 */
  formatter?: (row: T, column: any, cellValue: any, index: number) => any
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 表头对齐方式 */
  headerAlign?: 'left' | 'center' | 'right'
  /** 是否显示tooltip */
  showOverflowTooltip?: boolean
  /** 自定义类名 */
  className?: string
  /** 多级表头 */
  children?: TableColumn<T>[]
  /** 自定义插槽名 */
  slot?: string
  /** 是否隐藏 */
  hidden?: boolean
}

export interface TableProps<T = any> {
  /** 表格数据 */
  data: T[]
  /** 表格列配置 */
  columns: TableColumn<T>[]
  /** 是否带有纵向边框 */
  border?: boolean
  /** 是否为斑马纹表格 */
  stripe?: boolean
  /** 表格尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 是否高亮当前行 */
  highlightCurrentRow?: boolean
  /** 行数据的Key */
  rowKey?: string | ((row: T) => string)
  /** 表格加载状态 */
  loading?: boolean
  /** 空数据文本 */
  emptyText?: string
  /** 表格高度 */
  height?: string | number
  /** 表格最大高度 */
  maxHeight?: string | number
}

export interface TableEmits<T = any> {
  /** 选择项发生变化 */
  (e: 'selection-change', selection: T[]): void
  /** 单元格点击事件 */
  (e: 'cell-click', row: T, column: TableColumn<T>, cell: HTMLElement, event: Event): void
  /** 行点击事件 */
  (e: 'row-click', row: T, column: TableColumn<T>, event: Event): void
  /** 排序变化事件 */
  (
    e: 'sort-change',
    { column, prop, order }: { column: TableColumn<T>; prop: string; order: string }
  ): void
}

export interface TableExpose {
  /** 清空选择 */
  clearSelection: () => void
  /** 选择行 */
  toggleRowSelection: (row: any, selected?: boolean) => void
  /** 全选 */
  toggleAllSelection: () => void
  /** 排序 */
  sort: (prop: string, order: 'ascending' | 'descending' | null) => void
  /** 清除排序 */
  clearSort: () => void
}
