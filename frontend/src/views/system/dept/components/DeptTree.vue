<template>
  <div class="dept-tree-container">
    <div class="tree-header">
      <h4>部门树</h4>
      <el-input
        v-model="filterText"
        placeholder="输入关键字进行过滤"
        clearable
      />
    </div>
    <div class="tree-content">
      <el-tree
        ref="deptTreeRef"
        :data="deptTreeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        default-expand-all
        highlight-current
        node-key="id"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span class="label">{{ node.label }}</span>
            <span class="actions">
              <el-button
                type="primary"
                link
                @click.stop="handleAddDept(data.id)"
              >新增</el-button>
              <el-button
                type="primary"
                link
                @click.stop="handleEditDept(data)"
              >编辑</el-button>
              <el-button
                type="danger"
                link
                @click.stop="handleDeleteDept(data)"
                :disabled="hasChildren(data)"
              >删除</el-button>
            </span>
          </div>
        </template>
      </el-tree>
      <div v-if="loading" class="loading-overlay">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElTree } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import type { DeptTree } from '@/types/dept'
import type { FilterNodeMethodFunction } from 'element-plus/es/components/tree/src/tree.type'

// 定义组件属性
const props = defineProps<{
  deptTreeData: DeptTree[]
  loading: boolean
}>()

// 定义组件事件
const emit = defineEmits<{
  (e: 'node-click', data: DeptTree): void
  (e: 'add', parentId: string): void
  (e: 'edit', data: DeptTree): void
  (e: 'delete', data: DeptTree): void
}>()

// 树组件引用
const deptTreeRef = ref<InstanceType<typeof ElTree>>()

// 过滤文本
const filterText = ref('')

// 树节点默认配置
const defaultProps = {
  children: 'children',
  label: 'deptName'
}

// 监听过滤文本变化，实时过滤树节点
watch(filterText, (val) => {
  deptTreeRef.value?.filter(val)
})

// 修改过滤节点方法
const filterNode: FilterNodeMethodFunction = (value, data) => {
  if (!value) return true
  return (data as unknown as DeptTree).deptName.includes(value as string)
}

// 判断是否有子节点
const hasChildren = (data: DeptTree) => {
  return data.children && data.children.length > 0
}

// 处理节点点击
const handleNodeClick = (data: DeptTree) => {
  emit('node-click', data)
}

// 处理添加部门
const handleAddDept = (parentId: string) => {
  emit('add', parentId)
}

// 处理编辑部门
const handleEditDept = (data: DeptTree) => {
  emit('edit', data)
}

// 处理删除部门
const handleDeleteDept = (data: DeptTree) => {
  emit('delete', data)
}
</script>

<style lang="scss" scoped>
.dept-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebeef5;

  .tree-header {
    padding: 12px;
    border-bottom: 1px solid #ebeef5;

    h4 {
      margin: 0 0 12px 0;
      font-weight: 500;
    }
  }

  .tree-content {
    flex: 1;
    padding: 12px;
    overflow: auto;
    position: relative;

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;

    .actions {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .actions {
      opacity: 1;
    }
  }
}
</style>
