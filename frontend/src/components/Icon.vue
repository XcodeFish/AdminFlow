<template>
  <span class="icon-wrapper">
    <Icon v-if="isIconify(icon)" :icon="icon" :width="size" :height="size" />
    <el-icon v-else :size="size">
      <component :is="icon" />
    </el-icon>
  </span>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { isIconify } from '@/utils/validate'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 16
  }
})
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
