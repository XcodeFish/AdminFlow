import { reactive } from 'vue'
import type { FormRules } from 'element-plus'

export function useFormRules() {
  // 部门表单校验规则
  const deptFormRules = reactive<FormRules>({
    deptName: [
      { required: true, message: '部门名称不能为空', trigger: 'blur' },
      { min: 1, max: 50, message: '部门名称长度为1-50个字符', trigger: 'blur' }
    ],
    orderNum: [
      { required: true, message: '显示排序不能为空', trigger: 'blur' },
      { type: 'number', message: '显示排序必须为数字', trigger: 'blur' }
    ],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
  })

  return {
    deptFormRules
  }
}
