<!-- frontend/src/components/common/ImageUploader.vue -->
<template>
  <div class="image-uploader">
    <el-upload class="uploader" action="/api/upload" :show-file-list="false" :on-success="handleSuccess"
      :before-upload="beforeUpload">
      <img v-if="modelValue" :src="modelValue" class="uploaded-image" />
      <el-icon v-else class="uploader-icon">
        <Plus />
      </el-icon>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: String,
  maxSize: {
    type: Number,
    default: 2 // 默认2MB
  }
})

const emit = defineEmits(['update:modelValue'])

const handleSuccess = (res: any) => {
  if (res.code === 200) {
    emit('update:modelValue', res.data.url)
    ElMessage.success('上传成功')
  }
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
  }

  if (!isLtMaxSize) {
    ElMessage.error(`上传图片大小不能超过 ${props.maxSize}MB!`)
  }

  return isImage && isLtMaxSize
}
</script>

<style scoped>
.image-uploader {
  display: flex;
  justify-content: center;
}

.uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
}

.uploader:hover {
  border-color: #409EFF;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.uploaded-image {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style>
