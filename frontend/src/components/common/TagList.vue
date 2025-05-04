<!-- frontend/src/components/common/TagList.vue -->
<template>
  <div class="tag-list">
    <el-tag v-for="item in items" :key="getKey(item)" class="tag-item" :type="getTagType(item)">
      {{ getDisplay(item) }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StatusField {
  field: string
  value: any
}

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  displayField: {
    type: String,
    default: 'name'
  },
  keyField: {
    type: String,
    default: 'id'
  },
  statusField: {
    type: [Object, null],
    default: null
  }
})

const getDisplay = (item: any) => {
  return item[props.displayField]
}

const getKey = (item: any) => {
  return item[props.keyField]
}

const getTagType = (item: any) => {
  if (!props.statusField) return undefined
  const sf = props.statusField as StatusField
  return item[sf.field] === sf.value ? 'primary' : 'info'
}
</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
}

.tag-item {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
