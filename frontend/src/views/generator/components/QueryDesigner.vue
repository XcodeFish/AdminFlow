<template>
  <div class="query-designer">
    <div class="query-designer__header">
      <h3>查询设计器</h3>
      <div class="query-designer__toolbar">
        <el-button size="small" type="primary">保存设计</el-button>
        <el-button size="small">预览</el-button>
        <el-button size="small">清空</el-button>
      </div>
    </div>

    <div class="query-designer__content">
      <div class="query-designer__sidebar">
        <div class="components-title">条件设置</div>
        <el-form label-position="top" size="small">
          <el-form-item label="查询布局">
            <el-radio-group v-model="queryConfig.layout">
              <el-radio label="inline">行内布局</el-radio>
              <el-radio label="horizontal">水平布局</el-radio>
              <el-radio label="vertical">垂直布局</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="标签位置">
            <el-radio-group v-model="queryConfig.labelPosition">
              <el-radio label="left">左对齐</el-radio>
              <el-radio label="right">右对齐</el-radio>
              <el-radio label="top">顶部对齐</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="标签宽度">
            <el-input-number v-model="queryConfig.labelWidth" :min="0" :max="200" :step="10"
              :disabled="queryConfig.labelPosition === 'top'"></el-input-number>
          </el-form-item>

          <el-form-item label="每行条件数">
            <el-input-number v-model="queryConfig.columnsPerRow" :min="1" :max="6"
              :disabled="queryConfig.layout === 'vertical'"></el-input-number>
          </el-form-item>

          <el-form-item label="组件尺寸">
            <el-radio-group v-model="queryConfig.size">
              <el-radio label="default">默认</el-radio>
              <el-radio label="small">小</el-radio>
              <el-radio label="large">大</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="展示折叠按钮">
            <el-switch v-model="queryConfig.showCollapse"></el-switch>
          </el-form-item>

          <el-form-item label="默认展开条件数" v-if="queryConfig.showCollapse">
            <el-input-number v-model="queryConfig.defaultExpanded" :min="1" :max="10"></el-input-number>
          </el-form-item>
        </el-form>

        <div class="action-bar">
          <el-button size="small" type="primary" @click="addField">
            <el-icon>
              <Plus />
            </el-icon>
            添加查询条件
          </el-button>
        </div>
      </div>

      <div class="query-designer__main">
        <div class="design-area">
          <div class="empty-tip" v-if="fields.length === 0">
            <el-icon size="40">
              <Search />
            </el-icon>
            <p>请添加查询条件</p>
          </div>
          <div v-else class="query-preview">
            <div class="query-form">
              <el-form :label-position="queryConfig.labelPosition"
                :label-width="queryConfig.labelPosition !== 'top' ? `${queryConfig.labelWidth}px` : undefined"
                :size="queryConfig.size" class="query-form__content" :class="`query-form__${queryConfig.layout}`">
                <div class="query-form__row" v-for="(rowFields, rowIndex) in groupedFields" :key="rowIndex">
                  <el-form-item v-for="field in rowFields" :key="field.id" :label="field.label" class="query-form__item"
                    :style="getFieldStyle()">
                    <component :is="`el-${field.component}`" v-model="field.value" :placeholder="`请输入${field.label}`"
                      style="width: 100%" v-bind="field.props"></component>
                  </el-form-item>
                </div>

                <div class="query-form__buttons">
                  <el-button type="primary" :size="queryConfig.size">
                    <el-icon>
                      <Search />
                    </el-icon>
                    查询
                  </el-button>
                  <el-button :size="queryConfig.size">
                    <el-icon>
                      <RefreshRight />
                    </el-icon>
                    重置
                  </el-button>
                  <el-button v-if="queryConfig.showCollapse && fields.length > queryConfig.defaultExpanded"
                    type="primary" text :size="queryConfig.size">
                    展开 <el-icon>
                      <ArrowDown />
                    </el-icon>
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>
        </div>
      </div>

      <div class="query-designer__properties">
        <div class="field-list">
          <div class="properties-title">查询条件列表</div>
          <draggable v-model="fields" item-key="id" handle=".drag-handle" animation="300" class="field-list__content">
            <template #item="{ element, index }">
              <div class="field-item" :class="{ 'is-active': activeFieldIndex === index }"
                @click="setActiveField(index)">
                <div class="drag-handle">
                  <el-icon>
                    <Rank />
                  </el-icon>
                </div>
                <div class="field-info">
                  <div class="field-name">{{ element.label }}</div>
                  <div class="field-type">{{ getComponentLabel(element.component) }}</div>
                </div>
                <div class="field-actions">
                  <el-button type="danger" circle size="small" icon="Delete"
                    @click.stop="removeField(index)"></el-button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <div class="field-properties" v-if="activeFieldIndex !== null">
          <div class="properties-title">条件属性</div>
          <el-form label-position="top" size="small">
            <el-form-item label="标签名称">
              <el-input v-model="fields[activeFieldIndex].label"></el-input>
            </el-form-item>

            <el-form-item label="字段名称">
              <el-input v-model="fields[activeFieldIndex].name"></el-input>
            </el-form-item>

            <el-form-item label="控件类型">
              <el-select v-model="fields[activeFieldIndex].component">
                <el-option v-for="comp in componentOptions" :key="comp.value" :label="comp.label"
                  :value="comp.value"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="查询方式">
              <el-select v-model="fields[activeFieldIndex].queryType">
                <el-option label="等于" value="eq"></el-option>
                <el-option label="不等于" value="ne"></el-option>
                <el-option label="大于" value="gt"></el-option>
                <el-option label="大于等于" value="ge"></el-option>
                <el-option label="小于" value="lt"></el-option>
                <el-option label="小于等于" value="le"></el-option>
                <el-option label="包含" value="like"></el-option>
                <el-option label="不包含" value="notLike"></el-option>
                <el-option label="开始于" value="startWith"></el-option>
                <el-option label="结束于" value="endWith"></el-option>
                <el-option label="在...中" value="in"></el-option>
                <el-option label="不在...中" value="notIn"></el-option>
                <el-option label="为空" value="isNull"></el-option>
                <el-option label="不为空" value="isNotNull"></el-option>
                <el-option label="时间范围" value="between"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="默认值">
              <el-input :value="String(fields[activeFieldIndex].defaultValue || '')"
                @input="fields[activeFieldIndex].defaultValue = $event"></el-input>
            </el-form-item>

            <template v-if="fields[activeFieldIndex].component === 'select'">
              <el-form-item label="选项来源">
                <el-select v-model="fields[activeFieldIndex].optionSource">
                  <el-option label="静态选项" value="static"></el-option>
                  <el-option label="字典数据" value="dict"></el-option>
                  <el-option label="远程数据" value="remote"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item v-if="fields[activeFieldIndex].optionSource === 'static'" label="静态选项">
                <div v-for="(option, idx) in fields[activeFieldIndex].options" :key="idx" class="option-item">
                  <el-input v-model="option.label" placeholder="选项名" class="option-label"></el-input>
                  <el-input v-model="option.value" placeholder="选项值" class="option-value"></el-input>
                  <el-button type="danger" size="small" icon="Delete" circle @click="removeOption(idx)"></el-button>
                </div>
                <el-button size="small" type="primary" @click="addOption">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加选项
                </el-button>
              </el-form-item>

              <el-form-item v-if="fields[activeFieldIndex].optionSource === 'dict'" label="字典类型">
                <el-select v-model="fields[activeFieldIndex].dictType">
                  <el-option label="性别" value="sys_user_sex"></el-option>
                  <el-option label="状态" value="sys_normal_disable"></el-option>
                  <el-option label="是否" value="sys_yes_no"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item v-if="fields[activeFieldIndex].optionSource === 'remote'" label="数据接口">
                <el-input v-model="fields[activeFieldIndex].remoteUrl" placeholder="请输入数据接口地址"></el-input>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Search, RefreshRight, ArrowDown, Rank } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'

// 查询配置类型
interface QueryConfig {
  layout: 'inline' | 'horizontal' | 'vertical'
  labelPosition: 'left' | 'right' | 'top'
  labelWidth: number
  columnsPerRow: number
  size: 'default' | 'small' | 'large'
  showCollapse: boolean
  defaultExpanded: number
}

// 查询字段类型
interface QueryField {
  id: string
  name: string
  label: string
  component: string
  queryType: string
  defaultValue?: string | number | boolean
  value?: any
  props?: Record<string, any>
  optionSource?: 'static' | 'dict' | 'remote'
  options?: Array<{ label: string; value: string | number }>
  dictType?: string
  remoteUrl?: string
}

// 组件选项
const componentOptions = [
  { label: '输入框', value: 'input' },
  { label: '数字输入框', value: 'input-number' },
  { label: '下拉选择', value: 'select' },
  { label: '日期选择器', value: 'date-picker' },
  { label: '时间选择器', value: 'time-picker' },
  { label: '日期时间选择器', value: 'date-time-picker' },
  { label: '日期范围选择器', value: 'date-range-picker' },
  { label: '单选框组', value: 'radio-group' },
  { label: '复选框组', value: 'checkbox-group' },
  { label: '开关', value: 'switch' },
  { label: '级联选择器', value: 'cascader' }
]

// 查询配置
const queryConfig = reactive<QueryConfig>({
  layout: 'inline',
  labelPosition: 'right',
  labelWidth: 80,
  columnsPerRow: 3,
  size: 'default',
  showCollapse: true,
  defaultExpanded: 3
})

// 查询字段
const fields = ref<QueryField[]>([])

// 当前选中的字段索引
const activeFieldIndex = ref<number | null>(null)

// 按行分组的字段
const groupedFields = computed(() => {
  const result: QueryField[][] = []
  const perRow = queryConfig.columnsPerRow

  for (let i = 0; i < fields.value.length; i += perRow) {
    result.push(fields.value.slice(i, i + perRow))
  }

  return result
})

// 根据组件类型获取组件标签
const getComponentLabel = (componentType: string) => {
  const component = componentOptions.find(item => item.value === componentType)
  return component ? component.label : componentType
}

// 获取查询条件样式
const getFieldStyle = () => {
  if (queryConfig.layout === 'inline') {
    return { marginRight: '16px' }
  } else if (queryConfig.layout === 'horizontal') {
    const width = `${100 / queryConfig.columnsPerRow}%`
    return { width }
  }
  return {}
}

// 设置活跃字段
const setActiveField = (index: number) => {
  activeFieldIndex.value = index
}

// 添加查询条件
const addField = () => {
  const newField: QueryField = {
    id: uuidv4(),
    name: `field_${fields.value.length + 1}`,
    label: `条件${fields.value.length + 1}`,
    component: 'input',
    queryType: 'eq',
    value: '',
    props: {},
    optionSource: 'static',
    options: [
      { label: '选项1', value: '1' },
      { label: '选项2', value: '2' }
    ]
  }

  fields.value.push(newField)
  setActiveField(fields.value.length - 1)
}

// 移除查询条件
const removeField = (index: number) => {
  fields.value.splice(index, 1)
  if (activeFieldIndex.value === index) {
    activeFieldIndex.value = fields.value.length > 0 ? 0 : null
  } else if (activeFieldIndex.value !== null && activeFieldIndex.value > index) {
    activeFieldIndex.value -= 1
  }
}

// 添加选项
const addOption = () => {
  if (activeFieldIndex.value !== null && fields.value[activeFieldIndex.value].options) {
    fields.value[activeFieldIndex.value].options!.push({
      label: `选项${fields.value[activeFieldIndex.value].options!.length + 1}`,
      value: `${fields.value[activeFieldIndex.value].options!.length + 1}`
    })
  }
}

// 移除选项
const removeOption = (index: number) => {
  if (activeFieldIndex.value !== null && fields.value[activeFieldIndex.value].options) {
    fields.value[activeFieldIndex.value].options!.splice(index, 1)
  }
}

// 初始化默认查询条件
const initDefaultFields = () => {
  fields.value = [
    {
      id: uuidv4(),
      name: 'keyword',
      label: '关键词',
      component: 'input',
      queryType: 'like',
      value: '',
      props: {}
    },
    {
      id: uuidv4(),
      name: 'status',
      label: '状态',
      component: 'select',
      queryType: 'eq',
      value: '',
      props: {},
      optionSource: 'static',
      options: [
        { label: '正常', value: '1' },
        { label: '停用', value: '0' }
      ]
    },
    {
      id: uuidv4(),
      name: 'createTime',
      label: '创建时间',
      component: 'date-picker',
      queryType: 'eq',
      value: '',
      props: {
        type: 'date',
        placeholder: '请选择日期'
      }
    }
  ]
}

// 初始化调用
initDefaultFields()
</script>

<style scoped>
.query-designer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.query-designer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.query-designer__content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.query-designer__sidebar {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 16px;
  overflow-y: auto;
}

.query-designer__main {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.query-designer__properties {
  width: 300px;
  background-color: #fff;
  border-left: 1px solid #e4e7ed;
  padding: 16px;
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

.action-bar {
  margin: 16px 0;
  display: flex;
  justify-content: center;
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

.query-preview {
  padding: 16px;
}

.query-form {
  width: 100%;
}

.query-form__content {
  width: 100%;
}

.query-form__inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.query-form__horizontal .query-form__row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.query-form__buttons {
  margin-top: 16px;
  display: flex;
  align-items: center;
}

.query-form__buttons .el-button {
  margin-right: 8px;
}

.field-list__content {
  margin-top: 16px;
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

.field-info {
  flex: 1;
  overflow: hidden;
}

.field-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-type {
  color: #909399;
  font-size: 12px;
}

.field-actions {
  margin-left: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.option-label,
.option-value {
  margin-right: 8px;
}
</style>
