<template>
  <div class="table-designer">
    <div class="table-designer__header">
      <h3>表格设计器</h3>
      <div class="table-designer__toolbar">
        <el-button size="small" type="primary">保存设计</el-button>
        <el-button size="small">预览</el-button>
        <el-button size="small">清空</el-button>
      </div>
    </div>

    <div class="table-designer__content">
      <div class="table-designer__main">
        <div class="design-area">
          <div class="empty-tip" v-if="columns.length === 0">
            <el-icon size="40">
              <Grid />
            </el-icon>
            <p>请添加表格列数据</p>
          </div>
          <div v-else class="table-preview">
            <el-table :data="previewData" border style="width: 100%">
              <el-table-column v-if="tableConfig.showCheckbox" type="selection" width="55"></el-table-column>
              <el-table-column v-for="column in displayedColumns" :key="column.prop" :prop="column.prop"
                :label="column.label" :width="column.width" :sortable="column.sortable" :fixed="column.fixed">
              </el-table-column>
              <el-table-column v-if="tableConfig.showOperation" label="操作" width="180" fixed="right">
                <template #default>
                  <el-button v-for="(btn, index) in tableConfig.operations" :key="index" size="small"
                    :type="btn.type || 'primary'" link>
                    {{ btn.label }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <div class="table-designer__sidebar">
        <el-tabs>
          <el-tab-pane label="列设置">
            <div class="action-bar">
              <el-button size="small" type="primary" @click="addColumn">
                <el-icon>
                  <Plus />
                </el-icon>
                添加列
              </el-button>
            </div>

            <draggable v-model="columns" item-key="prop" handle=".drag-handle" animation="300" class="column-list">
              <template #item="{ element, index }">
                <div class="column-item" :class="{ 'is-active': activeColumnIndex === index }"
                  @click="setActiveColumn(index)">
                  <div class="drag-handle">
                    <el-icon>
                      <Rank />
                    </el-icon>
                  </div>
                  <div class="column-info">
                    <div class="column-title">{{ element.label || '未命名列' }}</div>
                    <div class="column-prop">{{ element.prop }}</div>
                  </div>
                  <div class="column-visible">
                    <el-switch v-model="element.visible" @change="updateDisplayedColumns"></el-switch>
                  </div>
                  <div class="column-actions">
                    <el-button type="danger" circle size="small" icon="Delete"
                      @click.stop="removeColumn(index)"></el-button>
                  </div>
                </div>
              </template>
            </draggable>
          </el-tab-pane>

          <el-tab-pane label="表格配置">
            <el-form label-position="top" size="small">
              <el-form-item label="表格标题">
                <el-input v-model="tableConfig.title"></el-input>
              </el-form-item>
              <el-form-item label="显示复选框">
                <el-switch v-model="tableConfig.showCheckbox"></el-switch>
              </el-form-item>
              <el-form-item label="显示分页">
                <el-switch v-model="tableConfig.showPagination"></el-switch>
              </el-form-item>
              <el-form-item label="每页条数">
                <el-input-number v-model="tableConfig.pageSize" :min="5" :max="100" :step="5"></el-input-number>
              </el-form-item>
              <el-form-item label="显示操作列">
                <el-switch v-model="tableConfig.showOperation"></el-switch>
              </el-form-item>
              <el-form-item label="表格大小">
                <el-radio-group v-model="tableConfig.size">
                  <el-radio label="大" value="large">大</el-radio>
                  <el-radio label="中" value="default">中</el-radio>
                  <el-radio label="小" value="small">小</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="表格样式">
                <el-radio-group v-model="tableConfig.border">
                  <el-radio label="带边框" :value="true">带边框</el-radio>
                  <el-radio label="无边框" :value="false">无边框</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="斑马纹">
                <el-switch v-model="tableConfig.stripe"></el-switch>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="操作按钮" v-if="tableConfig.showOperation">
            <div class="action-bar">
              <el-button size="small" type="primary" @click="addOperation">
                <el-icon>
                  <Plus />
                </el-icon>
                添加按钮
              </el-button>
            </div>

            <draggable v-model="tableConfig.operations" item-key="id" handle=".drag-handle" animation="300"
              class="operation-list">
              <template #item="{ element, index }">
                <div class="operation-item">
                  <div class="drag-handle">
                    <el-icon>
                      <Rank />
                    </el-icon>
                  </div>
                  <div class="operation-info">
                    <el-input v-model="element.label" placeholder="按钮文本" size="small"></el-input>
                  </div>
                  <div class="operation-type">
                    <el-select v-model="element.type" size="small">
                      <el-option label="主要" value="primary"></el-option>
                      <el-option label="成功" value="success"></el-option>
                      <el-option label="警告" value="warning"></el-option>
                      <el-option label="危险" value="danger"></el-option>
                      <el-option label="信息" value="info"></el-option>
                    </el-select>
                  </div>
                  <div class="operation-actions">
                    <el-button type="danger" circle size="small" icon="Delete"
                      @click.stop="removeOperation(index)"></el-button>
                  </div>
                </div>
              </template>
            </draggable>
          </el-tab-pane>
        </el-tabs>

        <div class="column-properties" v-if="activeColumnIndex !== null">
          <div class="properties-title">列属性设置</div>
          <el-form label-position="top" size="small">
            <el-form-item label="列标签">
              <el-input v-model="columns[activeColumnIndex].label"></el-input>
            </el-form-item>
            <el-form-item label="属性名">
              <el-input v-model="columns[activeColumnIndex].prop"></el-input>
            </el-form-item>
            <el-form-item label="列宽">
              <el-input-number v-model="columns[activeColumnIndex].width" :min="50" :max="500"></el-input-number>
            </el-form-item>
            <el-form-item label="可排序">
              <el-switch v-model="columns[activeColumnIndex].sortable"></el-switch>
            </el-form-item>
            <el-form-item label="固定列">
              <el-select v-model="columns[activeColumnIndex].fixed">
                <el-option label="不固定" value=""></el-option>
                <el-option label="左侧固定" value="left"></el-option>
                <el-option label="右侧固定" value="right"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="对齐方式">
              <el-radio-group v-model="columns[activeColumnIndex].align">
                <el-radio label="左对齐" value="left">左对齐</el-radio>
                <el-radio label="居中" value="center">居中</el-radio>
                <el-radio label="右对齐" value="right">右对齐</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Plus, Grid, Rank } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'

// 表格列定义
interface TableColumn {
  prop: string
  label: string
  width?: number
  sortable?: boolean
  fixed?: '' | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  visible: boolean
}

// 操作按钮定义
interface OperationButton {
  id: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  permission?: string
}

// 表格配置
interface TableConfig {
  title: string
  showCheckbox: boolean
  showPagination: boolean
  pageSize: number
  showOperation: boolean
  operations: OperationButton[]
  size: 'large' | 'default' | 'small'
  border: boolean
  stripe: boolean
}

// 表格列数据
const columns = ref<TableColumn[]>([])

// 表格配置数据
const tableConfig = reactive<TableConfig>({
  title: '数据列表',
  showCheckbox: true,
  showPagination: true,
  pageSize: 10,
  showOperation: true,
  operations: [
    { id: uuidv4(), label: '编辑', type: 'primary' },
    { id: uuidv4(), label: '删除', type: 'danger' }
  ],
  size: 'default',
  border: true,
  stripe: false
})

// 实际显示的列
const displayedColumns = computed(() => {
  return columns.value.filter(col => col.visible)
})

// 当前选中的列索引
const activeColumnIndex = ref<number | null>(null)

// 预览数据
const previewData = ref([
  { id: 1, name: '示例数据1', status: '正常', createTime: '2023-05-01' },
  { id: 2, name: '示例数据2', status: '异常', createTime: '2023-05-02' }
])

// 设置活跃列
const setActiveColumn = (index: number) => {
  activeColumnIndex.value = index
}

// 添加列
const addColumn = () => {
  const newColumn: TableColumn = {
    prop: `field_${columns.value.length + 1}`,
    label: `字段${columns.value.length + 1}`,
    width: 120,
    sortable: false,
    fixed: '',
    align: 'left',
    visible: true
  }
  columns.value.push(newColumn)
  setActiveColumn(columns.value.length - 1)
  updateDisplayedColumns()
}

// 移除列
const removeColumn = (index: number) => {
  columns.value.splice(index, 1)
  if (activeColumnIndex.value === index) {
    activeColumnIndex.value = columns.value.length > 0 ? 0 : null
  } else if (activeColumnIndex.value !== null && activeColumnIndex.value > index) {
    activeColumnIndex.value -= 1
  }
  updateDisplayedColumns()
}

// 添加操作按钮
const addOperation = () => {
  const newOperation: OperationButton = {
    id: uuidv4(),
    label: `按钮${tableConfig.operations.length + 1}`,
    type: 'primary'
  }
  tableConfig.operations.push(newOperation)
}

// 移除操作按钮
const removeOperation = (index: number) => {
  tableConfig.operations.splice(index, 1)
}

// 更新显示列
const updateDisplayedColumns = () => {
  // 仅用于触发计算属性更新
  columns.value = [...columns.value]
}

// 初始化默认列
const initDefaultColumns = () => {
  columns.value = [
    { prop: 'id', label: 'ID', width: 80, sortable: true, fixed: '', align: 'center', visible: true },
    { prop: 'name', label: '名称', width: 120, sortable: false, fixed: '', align: 'left', visible: true },
    { prop: 'status', label: '状态', width: 100, sortable: false, fixed: '', align: 'center', visible: true },
    { prop: 'createTime', label: '创建时间', width: 180, sortable: true, fixed: '', align: 'center', visible: true }
  ]
}

// 初始化调用
initDefaultColumns()
</script>

<style scoped>
.table-designer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.table-designer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.table-designer__content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.table-designer__main {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.table-designer__sidebar {
  width: 340px;
  background-color: #fff;
  border-left: 1px solid #e4e7ed;
  padding: 16px;
  overflow-y: auto;
}

.design-area {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  min-height: 400px;
}

.empty-tip {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.table-preview {
  margin-top: 16px;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.column-list,
.operation-list {
  margin-bottom: 16px;
}

.column-item,
.operation-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.column-item.is-active {
  background-color: #e6f1fc;
  border-color: #a3d0fd;
}

.drag-handle {
  cursor: move;
  margin-right: 8px;
  color: #909399;
}

.column-info,
.operation-info {
  flex: 1;
  overflow: hidden;
}

.column-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-prop {
  color: #909399;
  font-size: 12px;
}

.column-visible,
.operation-type {
  margin: 0 8px;
}

.column-actions,
.operation-actions {
  margin-left: 8px;
}

.properties-title {
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}
</style>
