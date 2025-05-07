<template>
  <div class="form-designer">
    <div class="form-designer__header">
      <h3>表单设计器</h3>
      <div class="form-designer__toolbar">
        <el-button size="small" type="primary">保存设计</el-button>
        <el-button size="small">预览</el-button>
        <el-button size="small">清空</el-button>
      </div>
    </div>

    <div class="form-designer__content">
      <div class="form-designer__sidebar">
        <div class="components-title">控件库</div>
        <div class="component-list">
          <div v-for="component in componentList" :key="component.type" class="component-item" draggable="true"
            @dragstart="handleDragStart($event, component)">
            <el-icon>
              <component :is="component.icon"></component>
            </el-icon>
            <span>{{ component.label }}</span>
          </div>
        </div>
      </div>

      <div class="form-designer__main">
        <div class="design-area" @dragover="handleDragOver" @drop="handleDrop">
          <template v-if="fields.length > 0">
            <draggable v-model="fields" item-key="id" handle=".drag-handle" animation="300" class="field-list">
              <template #item="{ element, index }">
                <div class="field-item" :class="{ 'is-active': activeField && activeField.id === element.id }"
                  @click="setActiveField(element)">
                  <div class="drag-handle">
                    <el-icon>
                      <DragIcon />
                    </el-icon>
                  </div>
                  <div class="field-content">
                    <div class="field-label">{{ element.label }}</div>
                    <div class="field-preview">
                      <component :is="'el-' + element.component" v-bind="element.props" disabled></component>
                    </div>
                  </div>
                  <div class="field-actions">
                    <el-button type="danger" circle size="small" icon="Delete"
                      @click.stop="removeField(index)"></el-button>
                  </div>
                </div>
              </template>
            </draggable>
          </template>
          <div v-else class="empty-tip">
            <el-icon size="40">
              <Plus />
            </el-icon>
            <p>从左侧拖拽控件到此处，开始设计表单</p>
          </div>
        </div>
      </div>

      <div class="form-designer__properties" v-if="activeField">
        <div class="properties-title">属性设置</div>
        <el-form label-position="top" size="small">
          <el-form-item label="字段名">
            <el-input v-model="activeField.name"></el-input>
          </el-form-item>
          <el-form-item label="标签文本">
            <el-input v-model="activeField.label"></el-input>
          </el-form-item>
          <el-form-item label="控件类型">
            <el-select v-model="activeField.component" disabled>
              <el-option v-for="item in componentOptions" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="必填">
            <el-switch v-model="activeField.required"></el-switch>
          </el-form-item>
          <el-form-item label="显示在表单">
            <el-switch v-model="activeField.showInForm"></el-switch>
          </el-form-item>
          <el-form-item label="显示在列表">
            <el-switch v-model="activeField.showInList"></el-switch>
          </el-form-item>
          <el-form-item label="显示在搜索">
            <el-switch v-model="activeField.showInSearch"></el-switch>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { GeneratorField } from '@/types/generator'
import { Plus, Delete as DeleteIcon } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'

// 扩展GeneratorField类型
interface ExtendedGeneratorField extends GeneratorField {
  id: string
  label: string
  required: boolean
  component: string
  props: Record<string, any>
}

// 组件列表
const componentList = ref([
  { type: 'input', label: '输入框', icon: 'EditPen', component: 'input' },
  { type: 'number', label: '数字输入框', icon: 'Sort', component: 'input-number' },
  { type: 'select', label: '下拉选择框', icon: 'Select', component: 'select' },
  { type: 'radio', label: '单选框组', icon: 'Check', component: 'radio-group' },
  { type: 'checkbox', label: '复选框组', icon: 'Finished', component: 'checkbox-group' },
  { type: 'date', label: '日期选择器', icon: 'Calendar', component: 'date-picker' },
  { type: 'time', label: '时间选择器', icon: 'Clock', component: 'time-picker' },
  { type: 'switch', label: '开关', icon: 'Open', component: 'switch' },
  { type: 'slider', label: '滑块', icon: 'RefreshRight', component: 'slider' },
  { type: 'textarea', label: '文本域', icon: 'Document', component: 'input' },
  { type: 'cascader', label: '级联选择器', icon: 'Operation', component: 'cascader' }
])

// 下拉组件选项
const componentOptions = ref([
  { label: '输入框', value: 'input' },
  { label: '数字输入框', value: 'input-number' },
  { label: '下拉选择框', value: 'select' },
  { label: '单选框组', value: 'radio-group' },
  { label: '复选框组', value: 'checkbox-group' },
  { label: '日期选择器', value: 'date-picker' },
  { label: '时间选择器', value: 'time-picker' },
  { label: '开关', value: 'switch' },
  { label: '滑块', value: 'slider' },
  { label: '文本域', value: 'textarea' },
  { label: '级联选择器', value: 'cascader' }
])

// 表单字段数据
const fields = ref<ExtendedGeneratorField[]>([])

// 当前选中的字段
const activeField = ref<ExtendedGeneratorField | null>(null)

// 拖拽处理
const handleDragStart = (event: DragEvent, component: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('component', JSON.stringify(component))
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    const componentData = JSON.parse(event.dataTransfer.getData('component'))
    const newField: ExtendedGeneratorField = {
      id: uuidv4(), // 添加唯一ID用于拖拽排序
      name: `field_${fields.value.length + 1}`,
      label: componentData.label,
      component: componentData.component,
      type: componentData.type,
      showInList: true,
      showInForm: true,
      showInSearch: false,
      queryType: 'eq',
      required: false,
      props: {}
    }

    fields.value.push(newField)
    setActiveField(newField)
  }
}

// 设置活跃字段
const setActiveField = (field: ExtendedGeneratorField) => {
  activeField.value = field
}

// 移除字段
const removeField = (index: number) => {
  fields.value.splice(index, 1)
  if (fields.value.length === 0) {
    activeField.value = null
  }
}
</script>

<style scoped>
.form-designer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.form-designer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.form-designer__content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.form-designer__sidebar {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 12px;
  overflow-y: auto;
}

.form-designer__main {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.form-designer__properties {
  width: 280px;
  background-color: #fff;
  border-left: 1px solid #e4e7ed;
  padding: 12px;
  overflow-y: auto;
}

.components-title,
.properties-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.component-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: move;
  transition: all 0.3s;
}

.component-item:hover {
  background-color: #e6f1fc;
  border-color: #a3d0fd;
}

.component-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

.design-area {
  min-height: 600px;
  background-color: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 16px;
}

.empty-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.field-list {
  width: 100%;
}

.field-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.field-item.is-active {
  background-color: #e6f1fc;
  border-color: #a3d0fd;
}

.drag-handle {
  cursor: move;
  margin-right: 8px;
  color: #909399;
}

.field-content {
  flex: 1;
}

.field-label {
  margin-bottom: 4px;
  font-weight: bold;
}

.field-preview {
  padding: 8px 0;
}

.field-actions {
  margin-left: 8px;
}
</style>
