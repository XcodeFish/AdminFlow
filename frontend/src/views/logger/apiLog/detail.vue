<template>
  <div class="api-log-detail-container">
    <div class="header">
      <el-page-header @back="goBack" title="返回" content="接口日志详情" />
    </div>

    <div class="content" v-loading="loading">
      <LogDetail v-if="logDetail" :log-detail="logDetail" />
      <el-empty v-else description="无法获取日志详情" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiLogDetail } from '@/api/modules/logger'
import type { ApiLog } from '@/types/logger'
import LogDetail from './components/LogDetail.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const logDetail = ref<ApiLog | null>(null)

// 获取日志详情
const fetchLogDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    return
  }

  loading.value = true
  try {
    const { data, code } = await getApiLogDetail(id)
    if (code === 200 && data) {
      logDetail.value = data
    }
  } catch (error) {
    console.error('获取接口日志详情失败', error)
  } finally {
    loading.value = false
  }
}

// 返回列表页
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchLogDetail()
})
</script>

<style lang="scss" scoped>
.api-log-detail-container {
  padding: 20px;

  .header {
    margin-bottom: 20px;
  }

  .content {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    min-height: 200px;
  }
}
</style>
