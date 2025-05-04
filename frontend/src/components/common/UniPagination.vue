<!-- 统一的分页组件 -->
<template>
  <component :is="paginationComponent" v-bind="getPaginationProps()" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { type PaginationProps, type ElementPaginationProps } from '@/types/ui'


type CombinedPaginationProps = ElementPaginationProps | Record<string, never>

const props = defineProps<PaginationProps>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [size: number]
}>()


// 根据当前UI库返回对应的分页组件
const paginationComponent = computed<string>(() => {
  return 'el-pagination'
})

// 根据当前UI库生成分页属性
const getPaginationProps = (): CombinedPaginationProps => {
  return {
    'current-page': props.page,
    'page-size': props.pageSize,
    'page-sizes': props.pageSizes,
    total: props.total,
    layout: 'total, sizes, prev, pager, next, jumper',
    onSizeChange: (size: number) => emit('update:pageSize', size),
    onCurrentChange: (page: number) => emit('update:page', page)
  }
}
</script>
