import { ref, onMounted, onUnmounted } from 'vue'

export function useTime() {
  const currentTime = ref('')
  let timerInterval: ReturnType<typeof setInterval> | null = null

  // 更新当前时间
  const updateTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    currentTime.value = `${hours}:${minutes}`
  }

  onMounted(() => {
    // 初始化时间
    updateTime()

    // 每分钟更新一次
    timerInterval = setInterval(updateTime, 60000)
  })

  onUnmounted(() => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }
  })

  return { currentTime }
}
