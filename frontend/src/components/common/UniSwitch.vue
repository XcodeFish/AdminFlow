<template>
  <el-switch :model-value="modelValue" @update:model-value="updateValue" :active-value="activeValue"
    :inactive-value="inactiveValue" v-bind="$attrs" />

</template>

<script setup lang="ts">

const isInitialRender = ref(true)

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: false
  },
  activeValue: {
    type: [String, Number, Boolean],
    default: true
  },
  inactiveValue: {
    type: [String, Number, Boolean],
    default: false
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'change'])


// 更新值
const updateValue = (value: any) => {
  // 如果是初始渲染，只更新值但不触发change事件
  if (isInitialRender.value) {
    emit('update:modelValue', value)
    // 下一个渲染周期将标记设为false
    nextTick(() => {
      isInitialRender.value = false
    })
    return
  }

  // 非初始渲染，正常触发事件
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
/* 如果需要自定义样式可以在这里添加 */
</style>
