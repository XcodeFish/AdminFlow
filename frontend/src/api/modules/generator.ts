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
  SaveChangesDto,
  ImportTableParams
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
    test: (data: DatasourceTestDto) =>
      request.post('/v1/generator/datasource/test-connection', data)
  },

  // 表结构相关
  table: {
    getList: (datasourceId: number) =>
      request.get('/v1/generator/datasource/' + datasourceId + '/tables'),
    getColumns: (datasourceId: number, tableName: string) =>
      request.get(`/v1/generator/datasource/${datasourceId}/tables/${tableName}`)
    // 以下API在后端可能没有对应实现，暂时注释或保留
    // getRelations: (tableId: number) => request.get(`/v1/generator/table/${tableId}/relations`),
    // refresh: (tableId: number) => request.post(`/v1/generator/table/${tableId}/refresh`)
  },

  // 配置相关
  config: {
    getList: () => request.get('/v1/generator/configs'),
    getById: (id: number) => request.get(`/v1/generator/configs/${id}`),
    create: (data: ConfigCreateDto) => request.post('/v1/generator/configs', data),
    update: (id: number, data: ConfigUpdateDto) => request.put(`/v1/generator/configs/${id}`, data),
    delete: (id: number) => request.del(`/v1/generator/configs/${id}`),
    duplicate: (id: number) => request.post(`/v1/generator/configs/${id}/duplicate`),
    export: (id: number) =>
      request.get(`/v1/generator/configs/${id}/export`, { responseType: 'blob' }),
    import: (data: ImportTableParams) => request.post('/v1/generator/configs/import-table', data)
  },

  // 代码生成与预览
  code: {
    generate: (configId: number) => request.post(`/v1/generator/generate/deploy/${configId}`),
    preview: (configId: number) => request.get(`/v1/generator/generate/preview/${configId}`),
    saveChanges: (data: SaveChangesDto) => request.post('/v1/generator/generate/save', data),
    download: (configId: number) =>
      request.get(`/v1/generator/generate/download/${configId}`, { responseType: 'blob' })
  },

  // 版本管理
  version: {
    getList: (configId: number) => request.get('/v1/generator/versions', { params: { configId } }),
    getById: (id: number) => request.get(`/v1/generator/versions/${id}`),
    create: (data: VersionCreateDto) => request.post('/v1/generator/versions', data),
    compare: (params: CompareVersionsDto) =>
      request.get('/v1/generator/versions/compare', { params }),
    rollback: (versionId: number) => request.post(`/v1/generator/versions/${versionId}/rollback`),
    delete: (id: number) => request.del(`/v1/generator/versions/${id}`)
  },

  // 部署管理
  deploy: {
    deploy: (data: DeployRequestDto) => request.post('/v1/generator/generate/deploy', data),
    status: (deploymentId: number) => request.get(`/v1/generator/generate/deploy/${deploymentId}/status`),
    logs: (deploymentId: number) => request.get(`/v1/generator/generate/deploy/${deploymentId}/logs`),
    cancel: (deploymentId: number) => request.post(`/v1/generator/generate/deploy/${deploymentId}/cancel`),
    retry: (deploymentId: number) => request.post(`/v1/generator/generate/deploy/${deploymentId}/retry`)
  }
}
