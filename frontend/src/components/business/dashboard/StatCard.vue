<template>
  <div class="stat-card" :class="{ [`stat-card--${type}`]: type }">
    <div class="stat-card__icon" v-if="icon">
      <el-icon>
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stat-card__content">
      <div class="stat-card__title">{{ title }}</div>
      <div class="stat-card__value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}>()
</script>

<style lang="scss" scoped>
.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  align-items: center;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.875rem;
    color: #666;
    margin-right: 1rem;
  }

  &__content {
    flex: 1;
  }

  &__title {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  &__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
  }

  &--primary {
    .stat-card__icon {
      color: #1890ff;
    }

    .stat-card__value {
      color: #0c6dd3;
    }
  }

  &--success {
    .stat-card__icon {
      color: #52c41a;
    }

    .stat-card__value {
      color: #389e0d;
    }
  }

  &--warning {
    .stat-card__icon {
      color: #faad14;
    }

    .stat-card__value {
      color: #d48806;
    }
  }

  &--danger {
    .stat-card__icon {
      color: #f5222d;
    }

    .stat-card__value {
      color: #cf1322;
    }
  }
}
</style>
