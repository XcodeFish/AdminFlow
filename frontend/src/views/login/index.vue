<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-logo">
        <img src="@/assets/vue.svg" alt="Logo" class="logo-image" />
        <h1 class="login-title">Admin Flow</h1>
        <div class="login-subtitle">智能高效的后台管理系统</div>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" size="large" clearable />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="请输入密码" :prefix-icon="Lock" size="large" show-password
            clearable />
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          <el-button text @click="handleForgotPassword">忘记密码？</el-button>
        </div>

        <el-button :loading="loading" type="primary" class="login-button" size="large" @click="handleLogin">
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>

        <div class="other-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="social-login">
            <el-tooltip content="微信登录" placement="top">
              <div class="social-icon">
                <el-icon>
                  <ChatDotRound />
                </el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="钉钉登录" placement="top">
              <div class="social-icon">
                <el-icon>
                  <Bell />
                </el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="邮箱登录" placement="top">
              <div class="social-icon">
                <el-icon>
                  <Message />
                </el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-form>

      <div class="login-footer">
        <p>Copyright © 2024 Admin Flow. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { User, Lock, ChatDotRound, Bell, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import type { LoginParams } from '@/types/auth'

// 路由实例
const router = useRouter()
const route = useRoute()
// 用户 store
const userStore = useUserStore()
// 登录表单 ref
const loginFormRef = ref<FormInstance>()
// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive<LoginParams>({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
})

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true

      // 执行登录
      await userStore.login(loginForm)

      ElMessage.success('登录成功')
      console.log('登录成功，准备跳转', {
        token: userStore.token,
        hasUserInfo: Boolean(userStore.userInfo)
      })

      // 跳转到首页或重定向页面
      const redirect = route.query.redirect as string

      // 添加延迟，让路由系统有时间处理权限
      setTimeout(() => {
        if (redirect) {
          console.log('跳转到重定向页面:', redirect)
          router.push(redirect)
        } else {
          console.log('跳转到默认首页: /dashboard')
          router.push('/dashboard')
        }
      }, 300)
    } catch (error: any) {
      // 登录失败处理
      console.error('登录失败:', error)
      loading.value = false
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

// 忘记密码
const handleForgotPassword = () => {
  router.push('/auth/forgot-password')
}
</script>


<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  background-image: url('@/assets/login-bg.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.login-card {
  width: 400px;
  padding: 40px 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.08);
}

.login-logo {
  text-align: center;
  margin-bottom: 40px;

  .logo-image {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .login-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1f2f3d;
  }

  .login-subtitle {
    margin-top: 8px;
    font-size: 14px;
    color: #909399;
  }
}

.login-form {
  margin-bottom: 24px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 4px;
  margin-bottom: 24px;
}

.captcha-container {
  display: flex;
  align-items: center;

  .captcha-input {
    flex: 1;
    margin-right: 12px;
  }

  .captcha-image {
    width: 120px;
    height: 40px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .captcha-loading {
      font-size: 12px;
      color: #909399;
    }
  }
}

.other-login {
  margin-bottom: 24px;

  .divider {
    display: flex;
    align-items: center;
    color: #909399;
    font-size: 12px;
    margin: 20px 0;

    &:before,
    &:after {
      content: '';
      flex: 1;
      border-top: 1px solid #ebeef5;
    }

    span {
      padding: 0 12px;
    }
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 24px;

    .social-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #e6f7ff;
        color: #409eff;
      }

      .el-icon {
        font-size: 20px;
      }
    }
  }
}

.login-footer {
  text-align: center;
  color: #909399;
  font-size: 12px;
}
</style>
