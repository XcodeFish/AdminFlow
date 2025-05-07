import request from '@/utils/request'
import type {
  ConfigCreateDto,
  ConfigUpdateDto,
  DatasourceCreateDto,
  DatasourceTestDto,
  DatasourceUpdateDto,
  VersionCreateDto,
  CompareVersionsDto,
  DeployRequestDto,
  SaveChangesDto
} from '@/types/generator'

/**
 * 代码生成器API模块
 */
export default {
  // 数据源相关
  datasource: {
    getList: () => request.get('/generator/datasource'),
    create: (data: DatasourceCreateDto) => request.post('/generator/datasource', data),
    update: (id: number, data: DatasourceUpdateDto) =>
      request.put(`/generator/datasource/${id}`, data),
    delete: (id: number) => request.del(`/generator/datasource/${id}`),
    test: (data: DatasourceTestDto) => request.post('/generator/datasource/test', data)
  },

  // 表结构相关
  table: {
    getList: (datasourceId: number) =>
      request.get('/generator/table', { params: { datasourceId } }),
    getColumns: (tableId: number) => request.get(`/generator/table/${tableId}/columns`),
    getRelations: (tableId: number) => request.get(`/generator/table/${tableId}/relations`),
    refresh: (tableId: number) => request.post(`/generator/table/${tableId}/refresh`)
  },

  // 配置相关
  config: {
    getList: () => request.get('/generator/config'),
    getById: (id: number) => request.get(`/generator/config/${id}`),
    create: (data: ConfigCreateDto) => request.post('/generator/config', data),
    update: (id: number, data: ConfigUpdateDto) => request.put(`/generator/config/${id}`, data),
    delete: (id: number) => request.del(`/generator/config/${id}`),
    duplicate: (id: number) => request.post(`/generator/config/${id}/duplicate`),
    export: (id: number) => request.get(`/generator/config/${id}/export`, { responseType: 'blob' }),
    import: (formData: FormData) =>
      request.post('/generator/config/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
  },

  // 代码生成与预览
  code: {
    generate: (configId: number) => request.post(`/generator/code/generate/${configId}`),
    preview: (configId: number) => request.get(`/generator/code/preview/${configId}`),
    saveChanges: (data: SaveChangesDto) => request.post('/generator/code/save', data),
    download: (configId: number) =>
      request.get(`/generator/code/download/${configId}`, { responseType: 'blob' })
  },

  // 版本管理
  version: {
    getList: (configId: number) => request.get('/generator/version', { params: { configId } }),
    getById: (id: number) => request.get(`/generator/version/${id}`),
    create: (data: VersionCreateDto) => request.post('/generator/version', data),
    compare: (params: CompareVersionsDto) => request.get('/generator/version/compare', { params }),
    rollback: (versionId: number) => request.post(`/generator/version/${versionId}/rollback`),
    delete: (id: number) => request.del(`/generator/version/${id}`)
  },

  // 部署管理
  deploy: {
    deploy: (data: DeployRequestDto) => request.post('/generator/deploy', data),
    status: (deploymentId: number) => request.get(`/generator/deploy/${deploymentId}/status`),
    logs: (deploymentId: number) => request.get(`/generator/deploy/${deploymentId}/logs`),
    cancel: (deploymentId: number) => request.post(`/generator/deploy/${deploymentId}/cancel`),
    retry: (deploymentId: number) => request.post(`/generator/deploy/${deploymentId}/retry`)
  }
}
