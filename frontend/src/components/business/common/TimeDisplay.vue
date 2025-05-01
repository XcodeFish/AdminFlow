<template>
  <div class="time-display">
    {{ formattedTime }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// 使用computed计算格式化后的时间
const time = ref(new Date())
const formattedTime = computed(() => {
  const hours = time.value.getHours().toString().padStart(2, '0')
  const minutes = time.value.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

onMounted(() => {
  // 每秒更新一次时间
  setInterval(() => {
    time.value = new Date()
  }, 1000)
})
</script>

<style lang="scss" scoped>
.time-display {
  font-size: 2.5rem;
  font-weight: 500;
  color: #333;
  line-height: 1;
  margin-bottom: 0.25rem;
}
</style>
