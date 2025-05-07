import { defineStore } from 'pinia'
import { ApiError } from '@/types/error'

export interface PreviewFileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  children?: PreviewFileNode[]
  extension?: string
  size?: number
  content?: string
  language?: string
}

export interface PreviewState {
  fileTree: PreviewFileNode[]
  selectedFileId: string | null
  selectedFile: PreviewFileNode | null
  generationId: string | null
  isLoading: boolean
  error: ApiError | null
}

/**
 * 代码预览Store
 * 负责管理代码生成预览和文件展示
 */
export const usePreviewStore = defineStore('preview', {
  state: (): PreviewState => ({
    fileTree: [],
    selectedFileId: null,
    selectedFile: null,
    generationId: null,
    isLoading: false,
    error: null
  }),

  getters: {
    /**
     * 获取文件树
     */
    getFileTree(state) {
      return state.fileTree
    },

    /**
     * 获取当前选中的文件
     */
    getCurrentFile(state) {
      return state.selectedFile
    },

    /**
     * 获取文件结构平铺列表（用于搜索等）
     */
    getFlatFileList(state): PreviewFileNode[] {
      const result: PreviewFileNode[] = []

      const flatten = (nodes: PreviewFileNode[]) => {
        for (const node of nodes) {
          result.push(node)
          if (node.children && node.children.length > 0) {
            flatten(node.children)
          }
        }
      }

      flatten(state.fileTree)
      return result
    },

    /**
     * 通过ID获取文件
     */
    getFileById:
      (state) =>
      (fileId: string): PreviewFileNode | null => {
        const findById = (nodes: PreviewFileNode[]): PreviewFileNode | null => {
          for (const node of nodes) {
            if (node.id === fileId) {
              return node
            }
            if (node.children && node.children.length > 0) {
              const found = findById(node.children)
              if (found) return found
            }
          }
          return null
        }

        return findById(state.fileTree)
      }
  },

  actions: {
    /**
     * 加载生成的代码预览
     * @param generationId 生成ID
     */
    async loadPreviewFiles(generationId: string) {
      this.isLoading = true
      this.error = null
      this.generationId = generationId

      try {
        // TODO: 替换为实际API调用
        // const response = await previewApi.files.getTree(generationId)
        // this.fileTree = response.data

        // 模拟数据
        this.fileTree = [
          {
            id: 'root',
            name: 'project',
            path: '/',
            type: 'directory',
            children: [
              {
                id: 'src',
                name: 'src',
                path: '/src',
                type: 'directory',
                children: [
                  {
                    id: 'components',
                    name: 'components',
                    path: '/src/components',
                    type: 'directory',
                    children: [
                      {
                        id: 'user-list',
                        name: 'UserList.vue',
                        path: '/src/components/UserList.vue',
                        type: 'file',
                        extension: '.vue',
                        size: 1024,
                        language: 'vue'
                      },
                      {
                        id: 'user-form',
                        name: 'UserForm.vue',
                        path: '/src/components/UserForm.vue',
                        type: 'file',
                        extension: '.vue',
                        size: 2048,
                        language: 'vue'
                      }
                    ]
                  },
                  {
                    id: 'views',
                    name: 'views',
                    path: '/src/views',
                    type: 'directory',
                    children: [
                      {
                        id: 'user',
                        name: 'User.vue',
                        path: '/src/views/User.vue',
                        type: 'file',
                        extension: '.vue',
                        size: 3072,
                        language: 'vue'
                      }
                    ]
                  },
                  {
                    id: 'api',
                    name: 'api',
                    path: '/src/api',
                    type: 'directory',
                    children: [
                      {
                        id: 'user-api',
                        name: 'user.ts',
                        path: '/src/api/user.ts',
                        type: 'file',
                        extension: '.ts',
                        size: 1024,
                        language: 'typescript'
                      }
                    ]
                  }
                ]
              },
              {
                id: 'package',
                name: 'package.json',
                path: '/package.json',
                type: 'file',
                extension: '.json',
                size: 512,
                language: 'json'
              },
              {
                id: 'readme',
                name: 'README.md',
                path: '/README.md',
                type: 'file',
                extension: '.md',
                size: 1024,
                language: 'markdown'
              }
            ]
          }
        ]

        // 重置选中的文件
        this.selectedFileId = null
        this.selectedFile = null

        return this.fileTree
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 选择文件
     * @param fileId 文件ID
     */
    async selectFile(fileId: string) {
      this.isLoading = true
      this.error = null

      try {
        const file = this.getFileById(fileId)

        if (!file) {
          throw new Error('文件不存在')
        }

        if (file.type === 'directory') {
          throw new Error('不能选择目录')
        }

        this.selectedFileId = fileId

        if (!file.content && this.generationId) {
          // 如果还没有加载内容，则加载
          // TODO: 替换为实际API调用
          // const response = await previewApi.files.getContent(this.generationId, file.path)
          // file.content = response.data.content

          // 模拟内容
          switch (fileId) {
            case 'user-list':
              file.content = `<template>
  <div class="user-list">
    <a-table :columns="columns" :data-source="users" :loading="loading">
      <template #action="{ record }">
        <a-button type="link" @click="handleEdit(record)">编辑</a-button>
        <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getUserList } from '@/api/user';

export default defineComponent({
  name: 'UserList',
  setup() {
    const users = ref([]);
    const loading = ref(false);

    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '操作', key: 'action', slots: { customRender: 'action' } },
    ];

    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await getUserList();
        users.value = response.data;
      } catch (error) {
        console.error('获取用户列表失败', error);
      } finally {
        loading.value = false;
      }
    };

    const handleEdit = (record) => {
      // 处理编辑逻辑
      console.log('编辑用户', record);
    };

    const handleDelete = (record) => {
      // 处理删除逻辑
      console.log('删除用户', record);
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      columns,
      handleEdit,
      handleDelete,
    };
  },
});
</script>

<style scoped>
.user-list {
  padding: 20px;
}
</style>`
              break
            case 'user-api':
              file.content = `import request from '@/utils/request';

/**
 * 获取用户列表
 */
export function getUserList(params) {
  return request({
    url: '/api/users',
    method: 'get',
    params
  });
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
export function getUserById(id) {
  return request({
    url: \`/api/users/\${id}\`,
    method: 'get'
  });
}

/**
 * 创建用户
 * @param data 用户数据
 */
export function createUser(data) {
  return request({
    url: '/api/users',
    method: 'post',
    data
  });
}

/**
 * 更新用户
 * @param id 用户ID
 * @param data 用户数据
 */
export function updateUser(id, data) {
  return request({
    url: \`/api/users/\${id}\`,
    method: 'put',
    data
  });
}

/**
 * 删除用户
 * @param id 用户ID
 */
export function deleteUser(id) {
  return request({
    url: \`/api/users/\${id}\`,
    method: 'delete'
  });
}`
              break
            default:
              file.content = `// ${file.name} 的内容\n// 这是自动生成的代码\n`
          }
        }

        this.selectedFile = { ...file }
        return this.selectedFile
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 导出生成的代码
     */
    async exportCode() {
      this.isLoading = true
      this.error = null

      try {
        if (!this.generationId) {
          throw new Error('没有生成ID')
        }

        // TODO: 替换为实际API调用
        // const response = await previewApi.export(this.generationId)
        // window.location.href = response.data.downloadUrl

        // 模拟导出
        console.log('导出代码', this.generationId)

        // 模拟下载（实际环境中会是真实的下载链接）
        const link = document.createElement('a')
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent('模拟导出文件内容')}`
        link.download = `generated-code-${this.generationId}.zip`
        link.click()

        return true
      } catch (error: unknown) {
        this.error = error as ApiError
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 搜索文件
     * @param keyword 关键字
     */
    searchFiles(keyword: string): PreviewFileNode[] {
      if (!keyword.trim()) {
        return []
      }

      const lowerKeyword = keyword.toLowerCase()

      return this.getFlatFileList.filter(
        (file) =>
          file.name.toLowerCase().includes(lowerKeyword) ||
          file.path.toLowerCase().includes(lowerKeyword)
      )
    },

    /**
     * 重置预览状态
     */
    resetPreview() {
      this.fileTree = []
      this.selectedFileId = null
      this.selectedFile = null
      this.generationId = null
      this.isLoading = false
      this.error = null
    }
  },

  persist: {
    key: 'preview-state',
    storage: sessionStorage,
    pick: ['selectedFileId', 'generationId']
  }
})
