<template>
  <div class="preview-confirm-step">
    <div class="step-header">
      <h3>预览确认</h3>
      <p class="description">
        请确认您的配置信息，查看生成代码预览，并确认是否生成代码。
      </p>
    </div>

    <div class="config-summary">
      <el-descriptions title="配置摘要" :column="1" border>
        <!-- 基本信息 -->
        <el-descriptions-item label="模块名称">
          {{ wizardData.basicInfo.moduleName }}
        </el-descriptions-item>
        <el-descriptions-item label="模块描述">
          {{ wizardData.basicInfo.moduleDescription }}
        </el-descriptions-item>
        <el-descriptions-item label="表名">
          {{ tableDetail?.tableName }}
        </el-descriptions-item>
        <el-descriptions-item label="作者">
          {{ wizardData.basicInfo.author }}
        </el-descriptions-item>

        <!-- 字段信息 -->
        <el-descriptions-item label="字段总数">
          {{ fields.length }}
        </el-descriptions-item>
        <el-descriptions-item label="列表显示字段">
          {{ wizardData.pageConfig.listColumns.length }} 个
        </el-descriptions-item>
        <el-descriptions-item label="表单显示字段">
          {{ wizardData.pageConfig.formColumns.length }} 个
        </el-descriptions-item>
        <el-descriptions-item label="查询显示字段">
          {{ wizardData.pageConfig.searchColumns.length }} 个
        </el-descriptions-item>

        <!-- 高级配置 -->
        <el-descriptions-item label="模板类型">
          {{ getTemplateTypeLabel(getAdvancedOption('templateType')) }}
        </el-descriptions-item>
        <el-descriptions-item label="启用功能">
          <el-tag v-if="wizardData.advancedConfig.enableImport" size="small" class="mr-1">导入</el-tag>
          <el-tag v-if="wizardData.advancedConfig.enableExport" size="small" class="mr-1">导出</el-tag>
          <el-tag v-if="wizardData.advancedConfig.batchOperations" size="small" class="mr-1">批量操作</el-tag>
          <el-tag v-if="getAdvancedOption('enablePrint')" size="small" class="mr-1">打印</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="生成选项">
          <el-tag v-if="getAdvancedOption('generateFrontend')" size="small" type="success" class="mr-1">前端代码</el-tag>
          <el-tag v-if="getAdvancedOption('generateBackend')" size="small" type="success" class="mr-1">后端代码</el-tag>
          <el-tag v-if="getAdvancedOption('generateSql')" size="small" type="success" class="mr-1">SQL脚本</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="preview-actions">
      <el-alert v-if="!previewResult && !isLoading" title="请点击'生成预览'按钮查看代码预览" type="info" :closable="false" />

      <el-button v-if="!previewResult" type="primary" @click="generatePreview" :loading="isLoading">
        生成预览
      </el-button>
    </div>

    <!-- 生成结果统计 -->
    <div class="generation-stats" v-if="previewResult">
      <el-result icon="success" title="代码生成预览就绪" sub-title="请在右侧查看生成的代码文件">
        <template #extra>
          <div class="stats-cards">
            <el-card class="stats-card">
              <template #header>
                <div class="card-header">
                  <span>前端文件</span>
                </div>
              </template>
              <div class="card-content">{{ statistics.frontendFiles }}</div>
            </el-card>

            <el-card class="stats-card">
              <template #header>
                <div class="card-header">
                  <span>后端文件</span>
                </div>
              </template>
              <div class="card-content">{{ statistics.backendFiles }}</div>
            </el-card>

            <el-card class="stats-card">
              <template #header>
                <div class="card-header">
                  <span>SQL文件</span>
                </div>
              </template>
              <div class="card-content">{{ statistics.sqlFiles }}</div>
            </el-card>

            <el-card class="stats-card">
              <template #header>
                <div class="card-header">
                  <span>代码行数</span>
                </div>
              </template>
              <div class="card-content">{{ statistics.totalCodeLines }}</div>
            </el-card>
          </div>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElDescriptions, ElDescriptionsItem, ElTag, ElButton, ElAlert, ElResult, ElCard } from 'element-plus'
import { useWizardStore } from '@/store/modules/wizard'
import { useWizardState } from '../hooks/useWizardState'
import { usePreview } from '../hooks/usePreview'
import { useFieldConfig } from '../hooks/useFieldConfig'

// 获取向导状态
const wizardStore = useWizardStore()
const { wizardData, isLoading } = useWizardState()
const tableDetail = computed(() => wizardStore.tableDetail)

// 获取字段配置
const { fields } = useFieldConfig()

// 获取预览相关功能
const { previewResult, statistics, getFullPreviewResult } = usePreview()

// 获取高级配置选项
const getAdvancedOption = (key: string) => {
  if (!wizardData.advancedConfig || !wizardData.advancedConfig.customOptions) {
    return null
  }
  return wizardData.advancedConfig.customOptions[key]
}

// 获取模板类型标签
const getTemplateTypeLabel = (templateType: string | null) => {
  const typeMap: Record<string, string> = {
    'default': '默认模板',
    'simple': '简单模板',
    'detailed': '详细模板'
  }
  return typeMap[templateType || 'default'] || '默认模板'
}

// 生成预览
const generatePreview = async () => {
  try {
    await getFullPreviewResult()
  } catch (error) {
    console.error('生成预览失败:', error)
  }
}

// 保存表单数据
const saveFormData = async () => {
  // 预览页面没有表单，直接返回成功
  return true
}

// 暴露方法给父组件
defineExpose({
  saveFormData
})
</script>

<style lang="scss" scoped>
.preview-confirm-step {
  padding: 16px;

  .step-header {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .description {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
  }

  .config-summary {
    margin-bottom: 24px;
  }

  .preview-actions {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .generation-stats {
    margin-top: 24px;

    .stats-cards {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;

      .stats-card {
        width: 150px;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-content {
          font-size: 24px;
          text-align: center;
          font-weight: bold;
          padding: 16px 0;
        }
      }
    }
  }

  .mr-1 {
    margin-right: 4px;
  }
}
</style>
