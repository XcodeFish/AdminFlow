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
    getList: () => request.get('/v1/generator/datasource'),
    create: (data: DatasourceCreateDto) => request.post('/v1/generator/datasource', data),
    update: (id: number, data: DatasourceUpdateDto) =>
      request.put(`/v1/generator/datasource/${id}`, data),
    delete: (id: number) => request.del(`/v1/generator/datasource/${id}`),
    test: (data: DatasourceTestDto) => request.post('/v1/generator/datasource/test', data)
  },

  // 表结构相关
  table: {
    getList: (datasourceId: number) =>
      request.get('/v1/generator/table', { params: { datasourceId } }),
    getColumns: (tableId: number) => request.get(`/v1/generator/table/${tableId}/columns`),
    getRelations: (tableId: number) => request.get(`/v1/generator/table/${tableId}/relations`),
    refresh: (tableId: number) => request.post(`/v1/generator/table/${tableId}/refresh`)
  },

  // 配置相关
  config: {
    getList: () => request.get('/v1/generator/config'),
    getById: (id: number) => request.get(`/v1/generator/config/${id}`),
    create: (data: ConfigCreateDto) => request.post('/v1/generator/config', data),
    update: (id: number, data: ConfigUpdateDto) => request.put(`/v1/generator/config/${id}`, data),
    delete: (id: number) => request.del(`/v1/generator/config/${id}`),
    duplicate: (id: number) => request.post(`/v1/generator/config/${id}/duplicate`),
    export: (id: number) => request.get(`/v1/generator/config/${id}/export`, { responseType: 'blob' }),
    import: (formData: FormData) =>
      request.post('/v1/generator/config/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
  },

  // 代码生成与预览
  code: {
    generate: (configId: number) => request.post(`/v1/generator/code/generate/${configId}`),
    preview: (configId: number) => request.get(`/v1/generator/code/preview/${configId}`),
    saveChanges: (data: SaveChangesDto) => request.post('/v1/generator/code/save', data),
    download: (configId: number) =>
      request.get(`/v1/generator/code/download/${configId}`, { responseType: 'blob' })
  },

  // 版本管理
  version: {
    getList: (configId: number) => request.get('/v1/generator/version', { params: { configId } }),
    getById: (id: number) => request.get(`/v1/generator/version/${id}`),
    create: (data: VersionCreateDto) => request.post('/v1/generator/version', data),
    compare: (params: CompareVersionsDto) => request.get('/v1/generator/version/compare', { params }),
    rollback: (versionId: number) => request.post(`/v1/generator/version/${versionId}/rollback`),
    delete: (id: number) => request.del(`/v1/generator/version/${id}`)
  },

  // 部署管理
  deploy: {
    deploy: (data: DeployRequestDto) => request.post('/v1/generator/deploy', data),
    status: (deploymentId: number) => request.get(`/v1/generator/deploy/${deploymentId}/status`),
    logs: (deploymentId: number) => request.get(`/v1/generator/deploy/${deploymentId}/logs`),
    cancel: (deploymentId: number) => request.post(`/v1/generator/deploy/${deploymentId}/cancel`),
    retry: (deploymentId: number) => request.post(`/v1/generator/deploy/${deploymentId}/retry`)
  }
}
