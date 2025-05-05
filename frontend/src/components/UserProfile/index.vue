<!-- frontend/src/components/UserProfile/index.vue -->
<template>
  <el-dialog v-model="dialogVisible" title="个人信息" width="600px" :close-on-click-modal="false"
    :before-close="handleClose">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人信息" name="basic">
        <!-- 基本信息表单项 -->
        <BasicInfoForm ref="basicFormRef" :user-info="userInfo" @form-change="handleFormChange" />

        <!-- 角色信息(只读展示) -->
        <el-form-item label="角色">
          <div class="role-tags">
            <el-tag v-for="role in userRoles" :key="role.id" :type="role.status === 1 ? 'primary' : 'info'"
              class="role-tag">
              {{ role.roleName }}
            </el-tag>
            <span v-if="!userRoles.length" class="text-muted">无角色信息</span>
          </div>
        </el-form-item>
      </el-tab-pane>

      <el-tab-pane label="修改密码" name="password">
        <PasswordForm ref="pwdFormRef"  />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">保 存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cloneDeep, isEqual } from 'lodash-es' // 用于深比较对象
import type { User, Role } from '@/types/user'
import BasicInfoForm from './components/BasicInfoForm.vue'
import PasswordForm from './components/PasswordForm.vue'
import { updateUser } from '@/api/modules/user'
import { useUserStore } from '@/store/modules/user'
import { showSuccess, showError, showInfo, showWarning } from '../../utils/message'

interface Props {
  visible: boolean
  userInfo: User
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const activeTab = ref('basic')
const basicFormRef = ref()
const pwdFormRef = ref()
const formData = ref<User>({})
const originalFormData = ref<User>({})
const userRoles = computed<Role[]>(() => props.userInfo.roles || [])
const router = useRouter()
// 判断基本信息是否有修改
const hasBasicInfoChanged = computed(() => {
  // 排除username和roles字段，只比较可编辑的字段
  const { username, roles, ...rest } = formData.value
  const { username: _, roles: __, ...originalRest } = originalFormData.value
  return !isEqual(rest, originalRest)
})

// 处理表单数据变化
const handleFormChange = (data: User) => {
  formData.value = data

  // 首次加载时保存原始数据，用于后续比较
  if (Object.keys(originalFormData.value).length === 0) {
    originalFormData.value = cloneDeep(data)
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  pwdFormRef.value?.reset()
  originalFormData.value = {}
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 判断密码表单是否有输入（任一字段有值）
    const hasPasswordInput = pwdFormRef.value?.formData?.oldPassword ||
      pwdFormRef.value?.formData?.newPassword ||
      pwdFormRef.value?.formData?.confirmPassword

    // 检查基本信息是否有变化
    if (!hasBasicInfoChanged.value && !hasPasswordInput) {
      // 情况1: 什么都没改，直接关闭
      showInfo('未做任何修改')
      dialogVisible.value = false
      return
    }

    let basicInfoUpdated = false

    // 处理基本信息更新
    if (hasBasicInfoChanged.value) {
      const valid = await basicFormRef.value.validate()
      if (valid && props.userInfo.id) {
        const { username, roles, ...updateData } = formData.value

        try {
          await updateUser(props.userInfo.id, updateData)
          userStore.updateUserInfo(updateData)
          emit('refresh')
          basicInfoUpdated = true

          // 如果用户在密码标签上并且填写了密码信息，则不关闭
          if (activeTab.value !== 'password' || !hasPasswordInput) {
            showSuccess('个人信息更新成功')
            dialogVisible.value = false
            return
          } else {
            showSuccess('个人信息更新成功')
          }
        } catch (error) {
          showError('个人信息更新失败')
          console.error('基本信息更新失败', error)
          return
        }
      }
    }

    // 处理密码修改
    if (activeTab.value === 'password') {
      // 情况2: 用户在密码标签页但没有输入密码信息
      if (!hasPasswordInput) {
        if (basicInfoUpdated) {
          // 基本信息已更新，弹框已关闭，不需要进一步处理
          return
        } else {
          // 既没改基本信息，也没输入密码信息
          showInfo('请输入密码信息或切换到基本信息进行修改')
          return // 不关闭弹框，等待用户操作
        }
      }

      // 情况3: 用户填写了密码信息
      try {
        const passwordChanged = await pwdFormRef.value.changePassword()
        console.log('passwordChanged', passwordChanged)

        if (passwordChanged) {
          // 密码修改成功
          showSuccess('密码修改成功，即将退出登录...')
          setTimeout(async () => {
            await userStore.logoutAction()
            router.push('/login')
          }, 1500)
        } else {
          // 密码修改失败
          if (!basicInfoUpdated) {
            showError('密码修改失败')
            // 不关闭弹框，让用户可以修改再试
          } else {
            // 基本信息更新成功，但密码修改失败
            showWarning('基本信息已更新，但密码修改失败')
            dialogVisible.value = false
          }
        }
      } catch (error: any) {
        console.error('密码修改失败', error)

        if (error.message?.includes('验证')) {
          // 表单验证错误，给出更明确的提示
          showWarning('请正确填写所有密码字段')
        } else {
          showError('密码修改失败')
        }

        // 如果基本信息已更新，关闭对话框
        if (basicInfoUpdated) {
          showWarning('基本信息已更新，但密码未修改')
          dialogVisible.value = false
        }
      }
    }
  } catch (error) {
    console.error('操作失败', error)
    showError('操作失败，请重试')
  }
}
</script>

<style scoped>
.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.text-muted {
  color: #909399;
  font-style: italic;
}
</style>
