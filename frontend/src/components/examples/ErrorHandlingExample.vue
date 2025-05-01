<template>
  <div class="error-handling-example">
    <h3>错误处理示例组件</h3>

    <el-divider content-position="left">API错误处理</el-divider>

    <el-space direction="vertical" alignment="start" size="large" fill>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>基本API错误处理</span>
            <el-button type="primary" @click="fetchDataWithError">
              触发API错误
            </el-button>
          </div>
        </template>
        <div>使用globalErrorHandler处理API请求错误</div>
      </el-card>

      <el-card>
        <template #header>
          <div class="card-header">
            <span>使用异步包装器</span>
            <el-button type="primary" @click="fetchWithWrapper">
              安全API调用
            </el-button>
          </div>
        </template>
        <div>使用createAsyncWrapper简化错误处理流程</div>
      </el-card>
    </el-space>

    <el-divider content-position="left">组件错误边界</el-divider>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>错误边界演示</span>
          <el-button type="danger" @click="triggerComponentError">
            触发组件错误
          </el-button>
        </div>
      </template>

      <error-boundary @error="onErrorCaptured">
        <div v-if="showErrorComponent">
          <!-- 故意访问一个不存在的属性来触发错误 -->
          {{ nonExistentObject.property }}
        </div>
        <div v-else>
          点击「触发组件错误」按钮将触发一个渲染错误
        </div>

        <template #fallback="{ error, reset }">
          <div class="fallback-content">
            <p>自定义错误回退内容:</p>
            <p>{{ error.message }}</p>
            <el-button size="small" @click="reset">重置组件</el-button>
          </div>
        </template>
      </error-boundary>
    </el-card>

    <el-divider content-position="left">错误状态</el-divider>

    <el-card v-if="errorHandler.hasErrors.value">
      <template #header>
        <div class="card-header">
          <span>错误历史记录</span>
          <el-button type="info" size="small" @click="errorHandler.clearErrors()">
            清除历史
          </el-button>
        </div>
      </template>

      <el-table :data="errorHandler.errors.value" stripe style="width: 100%">
        <el-table-column prop="message" label="错误信息" />
        <el-table-column prop="timestamp" label="时间">
          <template #default="scope">
            {{ new Date(scope.row.timestamp).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态码" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useErrorHandler, globalErrorHandler } from '@/composables/useErrorHandler'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import axios from 'axios'

// 使用错误处理工具
const errorHandler = globalErrorHandler

// 组件错误状态
const showErrorComponent = ref(false)

// 模拟API错误
async function fetchDataWithError() {
  try {
    // 故意请求一个不存在的API
    await axios.get('/api/non-existent-endpoint')
  } catch (error) {
    // 使用全局错误处理器处理错误
    errorHandler.handleError(error, 'error', {
      showNotification: true,
      showMessage: false
    })
  }
}

// 使用异步包装器
const fetchWithWrapper = errorHandler.createAsyncWrapper(
  async () => {
    // 故意请求一个不存在的API
    return await axios.get('/api/another-non-existent-endpoint')
  },
  {
    level: 'warning',
    showMessage: true,
    showNotification: false,
    // 自定义错误处理回调
    onError: (error) => {
      console.log('自定义错误处理逻辑', error)
    }
  }
)

// 触发组件错误
function triggerComponentError() {
  showErrorComponent.value = true
}

// 错误边界捕获到错误
function onErrorCaptured(errorInfo: any) {
  console.log('错误边界捕获到错误:', errorInfo)
}
</script>

<style scoped>
.error-handling-example {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fallback-content {
  padding: 16px;
  background: #f8f8f8;
  border-radius: 4px;
  margin-top: 16px;
}
</style>
