import { defineStore } from 'pinia'
import { useConfigStore } from './config'
import generatorApi from '@/api/modules/generator'
import { ApiError } from '@/types/error'

export interface Version {
  id: number
  configId: number
  moduleName: string
  version: string
  description: string
  createdAt: string
  createdBy: string
  changedFiles?: string[]
  fileCount?: number
  deployed?: boolean
  deployedAt?: string
}

export interface VersionDiff {
  file: string
  type: 'added' | 'modified' | 'deleted'
  diff?: string
  oldContent?: string
  newContent?: string
}

export interface VersionState {
  versions: Version[]
  currentVersion: Version | null
  diff: VersionDiff[]
  isLoading: boolean
  isComparing: boolean
  error: ApiError | null
}

/**
 * 版本管理Store
 */
export const useVersionStore = defineStore('version', {
  state: (): VersionState => ({
    versions: [],
    currentVersion: null,
    diff: [],
    isLoading: false,
    isComparing: false,
    error: null
  }),

  getters: {
    /**
     * 获取版本列表
     */
    getVersions: (state): Version[] => {
      return state.versions
    },

    /**
     * 获取当前版本
     */
    getCurrentVersion: (state): Version | null => {
      return state.currentVersion
    },

    /**
     * 获取最新版本
     */
    getLatestVersion: (state): Version | null => {
      if (state.versions.length === 0) return null

      return state.versions.reduce(
        (latest, current) => {
          if (!latest) return current
          return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        },
        null as Version | null
      )
    },

    /**
     * 获取版本差异
     */
    getVersionDiff: (state): VersionDiff[] => {
      return state.diff
    },

    /**
     * 获取特定版本
     */
    getVersionById:
      (state) =>
      (id: number): Version | undefined => {
        return state.versions.find((version) => version.id === id)
      }
  },

  actions: {
    /**
     * 获取配置的版本历史
     * @param configId 配置ID
     */
    async fetchVersions(configId: number): Promise<Version[]> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.getList(configId)
        // this.versions = response.data

        // 模拟数据
        const configStore = useConfigStore()
        const config = await configStore.fetchConfigById(configId)

        this.versions = [
          {
            id: 1,
            configId,
            moduleName: config.moduleName,
            version: '1.0.0',
            description: '初始版本',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
            createdBy: '张三',
            fileCount: 4,
            deployed: true,
            deployedAt: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString()
          },
          {
            id: 2,
            configId,
            moduleName: config.moduleName,
            version: '1.0.1',
            description: '修复列表页查询条件',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
            createdBy: '李四',
            fileCount: 5,
            deployed: true,
            deployedAt: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString()
          },
          {
            id: 3,
            configId,
            moduleName: config.moduleName,
            version: '1.1.0',
            description: '增加批量导入功能',
            createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
            createdBy: '张三',
            fileCount: 7,
            deployed: false
          }
        ]

        return this.versions
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '获取版本历史失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 获取版本详情
     * @param versionId 版本ID
     */
    async fetchVersionById(versionId: number): Promise<Version> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.getById(versionId)
        // const version = response.data

        // 模拟数据
        const version = this.versions.find((v) => v.id === versionId)
        if (!version) {
          throw new Error('版本不存在')
        }

        // 补充版本的文件变更信息
        version.changedFiles = [
          'src/views/system/user/UserManagement.vue',
          'src/views/system/user/components/UserFormDialog.vue',
          'src/router/modules/system.ts',
          'src/api/modules/user.ts'
        ]

        this.currentVersion = version
        return version
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '获取版本详情失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 创建新版本
     * @param configId 配置ID
     * @param data 版本数据
     */
    async createVersion(
      configId: number,
      data: {
        version: string
        description: string
      }
    ): Promise<Version> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.create(configId, data)
        // const newVersion = response.data

        // 模拟数据
        const configStore = useConfigStore()
        const config = await configStore.fetchConfigById(configId)

        const newVersion: Version = {
          id: Math.max(0, ...this.versions.map((v) => v.id)) + 1,
          configId,
          moduleName: config.moduleName,
          version: data.version,
          description: data.description,
          createdAt: new Date().toISOString(),
          createdBy: '当前用户',
          fileCount: 6,
          deployed: false
        }

        this.versions.push(newVersion)
        this.currentVersion = newVersion
        return newVersion
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '创建版本失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 比较两个版本的差异
     * @param versionId1 版本ID1
     * @param versionId2 版本ID2
     */
    async compareVersions(versionId1: number, versionId2: number): Promise<VersionDiff[]> {
      this.isComparing = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.compare(versionId1, versionId2)
        // this.diff = response.data

        // 模拟数据
        const version1 = this.versions.find((v) => v.id === versionId1)
        const version2 = this.versions.find((v) => v.id === versionId2)

        if (!version1 || !version2) {
          throw new Error('版本不存在')
        }

        this.diff = [
          {
            file: 'src/views/system/user/UserManagement.vue',
            type: 'modified',
            diff: '@@ -45,6 +45,14 @@\n     </el-table-column>\n     <el-table-column prop="email" label="邮箱" />\n     <el-table-column prop="phone" label="手机号" />\n+    <el-table-column prop="department" label="部门">\n+      <template #default="{ row }">\n+        <span>{{ getDepartmentName(row.departmentId) }}</span>\n+      </template>\n+    </el-table-column>\n+    <el-table-column prop="role" label="角色">\n+      <template #default="{ row }">\n+        <el-tag v-for="role in row.roles" :key="role.id">{{ role.name }}</el-tag>\n+      </template>\n+    </el-table-column>\n     <el-table-column prop="status" label="状态">\n       <template #default="{ row }">\n         <el-tag :type="row.status === 1 ? \'success\' : \'danger\'">'
          },
          {
            file: 'src/views/system/user/components/UserFormDialog.vue',
            type: 'modified',
            diff: '@@ -36,6 +36,14 @@\n       <el-form-item label="手机号" prop="phone">\n         <el-input v-model="form.phone" placeholder="请输入手机号" />\n       </el-form-item>\n+      \n+      <el-form-item label="部门" prop="departmentId">\n+        <el-select v-model="form.departmentId" placeholder="请选择部门">\n+          <el-option\n+            v-for="dept in departments"\n+            :key="dept.id"\n+            :label="dept.name"\n+            :value="dept.id"\n+          />\n+        </el-select>\n+      </el-form-item>'
          },
          {
            file: 'src/api/modules/department.ts',
            type: 'added',
            newContent:
              "import request from '@/utils/request'\n\n/**\n * 部门管理API\n */\nconst departmentApi = {\n  /**\n   * 获取部门列表\n   */\n  getList: () => {\n    return request({\n      url: '/api/system/departments',\n      method: 'get'\n    })\n  },\n  \n  /**\n   * 获取部门详情\n   */\n  getById: (id: number) => {\n    return request({\n      url: `/api/system/departments/${id}`,\n      method: 'get'\n    })\n  }\n}\n\nexport default departmentApi"
          }
        ]

        return this.diff
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '比较版本差异失败' }
        throw error
      } finally {
        this.isComparing = false
      }
    },

    /**
     * 更新版本
     * @param versionId 版本ID
     * @param data 更新数据
     */
    async updateVersion(
      versionId: number,
      data: {
        version?: string
        description?: string
      }
    ): Promise<Version> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.update(versionId, data)
        // const updatedVersion = response.data

        // 模拟数据
        const index = this.versions.findIndex((v) => v.id === versionId)
        if (index === -1) {
          throw new Error('版本不存在')
        }

        const updatedVersion = {
          ...this.versions[index],
          ...data
        }

        this.versions[index] = updatedVersion
        if (this.currentVersion && this.currentVersion.id === versionId) {
          this.currentVersion = updatedVersion
        }

        return updatedVersion
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '更新版本失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 删除版本
     * @param versionId 版本ID
     */
    async deleteVersion(versionId: number): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // await generatorApi.version.delete(versionId)

        // 模拟数据
        const index = this.versions.findIndex((v) => v.id === versionId)
        if (index !== -1) {
          this.versions.splice(index, 1)
        }

        if (this.currentVersion && this.currentVersion.id === versionId) {
          this.currentVersion = null
        }
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '删除版本失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 部署版本
     * @param versionId 版本ID
     */
    async deployVersion(versionId: number): Promise<Version> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.deploy(versionId)
        // const deployedVersion = response.data

        // 模拟数据
        const index = this.versions.findIndex((v) => v.id === versionId)
        if (index === -1) {
          throw new Error('版本不存在')
        }

        const deployedVersion = {
          ...this.versions[index],
          deployed: true,
          deployedAt: new Date().toISOString()
        }

        this.versions[index] = deployedVersion
        if (this.currentVersion && this.currentVersion.id === versionId) {
          this.currentVersion = deployedVersion
        }

        return deployedVersion
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '部署版本失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 回滚到指定版本
     * @param versionId 版本ID
     */
    async rollbackToVersion(versionId: number): Promise<Version> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.rollback(versionId)
        // const newVersion = response.data

        // 模拟数据
        const targetVersion = this.versions.find((v) => v.id === versionId)
        if (!targetVersion) {
          throw new Error('目标版本不存在')
        }

        const configStore = useConfigStore()
        const config = await configStore.fetchConfigById(targetVersion.configId)

        // 创建一个新的回滚版本
        const newVersion: Version = {
          id: Math.max(0, ...this.versions.map((v) => v.id)) + 1,
          configId: targetVersion.configId,
          moduleName: config.moduleName,
          version: `${targetVersion.version}-rollback-${new Date().toISOString().slice(0, 10)}`,
          description: `回滚到版本 ${targetVersion.version}`,
          createdAt: new Date().toISOString(),
          createdBy: '当前用户',
          fileCount: targetVersion.fileCount || 0,
          deployed: false
        }

        this.versions.push(newVersion)
        this.currentVersion = newVersion
        return newVersion
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '回滚版本失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 导出版本
     * @param versionId 版本ID
     */
    async exportVersion(versionId: number): Promise<Blob> {
      this.isLoading = true
      this.error = null

      try {
        // TODO: 实际API调用
        // const response = await generatorApi.version.export(versionId)
        // return response

        // 模拟数据
        const version = this.versions.find((v) => v.id === versionId)
        if (!version) {
          throw new Error('版本不存在')
        }

        const zipContent = JSON.stringify(version, null, 2)
        const blob = new Blob([zipContent], { type: 'application/zip' })
        return blob
      } catch (error: unknown) {
        this.error = { message: (error as Error).message || '导出版本失败' }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 设置当前版本
     */
    setCurrentVersion(version: Version | null): void {
      this.currentVersion = version
    },

    /**
     * 清空错误信息
     */
    clearError(): void {
      this.error = null
    }
  }
})

export default useVersionStore
