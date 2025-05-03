<template>
  <div class="iframe-container">
    <iframe v-if="iframeUrl" :src="iframeUrl" frameborder="0" width="100%" height="100%" scrolling="auto"></iframe>
    <div v-else class="iframe-error">
      <el-empty description="无效的 URL"></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// 获取当前路由
const route = useRoute()

// 调试日志
onMounted(() => {
  console.log('🚩 IFrame Layout 组件被加载', route)
})

// 从路由元数据中获取iframe URL
const iframeUrl = computed(() => {
  // 优先从路由query参数中获取
  if (route.query.url && typeof route.query.url === 'string') {
    console.log('🚩 从query参数获取iframe URL:', route.query.url)
    return route.query.url
  }

  // 然后从路由元数据中获取
  if (route.meta.iframeUrl) {
    console.log('🚩 从meta获取iframe URL:', route.meta.iframeUrl)
    return route.meta.iframeUrl
  }

  // 最后从path中提取URL（如果path本身是URL）
  if (route.path && (route.path.startsWith('http://') || route.path.startsWith('https://'))) {
    console.log('🚩 从path获取iframe URL:', route.path)
    return route.path
  }

  console.warn('⚠️ 没有找到有效的iframe URL')
  return null
})
</script>

<style lang="scss" scoped>
.iframe-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 100px);
  overflow: hidden;
  background-color: #fff;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .iframe-error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }
}
</style>
