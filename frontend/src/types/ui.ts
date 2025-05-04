
// 按钮类型
export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'

// 按钮尺寸
export type ButtonSize = 'small' | 'medium' | 'large' | 'default' | 'middle'



// 表单布局类型
export type FormLayout = 'horizontal' | 'vertical' | 'inline'

// 组件适配器接口
export interface ComponentAdapters {
  [key: string]: ComputedRef<string>
}

// 属性处理器接口
export interface PropHandlers {
  buttonType: (type: ButtonType) => Record<string, any>
  buttonSize: (size: ButtonSize) => Record<string, any>
  formLayout: (layout: FormLayout) => Record<string, any>
  [key: string]: (...args: any[]) => Record<string, any>
}

// 定义列的接口
export interface TableColumn {
  key?: string
  dataIndex?: string
  title?: string
  prop?: string
  label?: string
  render?: (row: RowData) => any
  [key: string]: any
}

// 定义行数据类型
export type RowData = Record<string, any>

// 定义组件Props接口
export interface TableProps {
  data: RowData[]
  columns: TableColumn[]
  loading?: boolean
  rowKey?: string | ((row: RowData) => string)
  selection?: boolean
}

export interface ElementTableProps {
  data: RowData[]
  columns: TableColumn[]
  loading: boolean
  rowKey: string | ((row: RowData) => string)
  border: boolean
}

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizes: number[]
}

export type ElementPaginationProps = {
  'current-page': number
  'page-size': number
  'page-sizes': number[]
  total: number
  layout: string
  onSizeChange: (size: number) => void
  onCurrentChange: (page: number) => void
}

