# UI组件规范文档

## 一、组件设计原则

### 1.1 基本原则

1. **单一职责**：每个组件应专注于解决单一问题
2. **可组合性**：组件可被轻松组合以构建复杂界面
3. **可重用性**：组件设计应考虑复用场景
4. **可测试性**：组件易于进行单元测试
5. **可扩展性**：组件接口设计允许扩展功能

### 1.2 组件结构

1. **界面与逻辑分离**：使用Composables/Hooks抽离复杂逻辑
2. **内聚性**：相关功能应保持在同一组件内
3. **最小化副作用**：减少对全局状态的依赖和修改
4. **适当粒度**：避免过大的组件，但也不要过度拆分

## 二、组件分类标准

### 2.1 基础组件

提供基本UI功能，不包含业务逻辑，通常是对Element Plus等UI库的二次封装。

**特点**：

- 高复用性
- 无业务依赖
- 接口稳定
- 样式统一

**示例**：

- BaseButton
- BaseInput
- BaseTable
- BaseDialog
- BaseForm

### 2.2 业务组件

包含特定业务场景的组件，可能依赖于业务数据结构和流程。

**特点**：

- 中等复用性
- 包含业务逻辑
- 适用于多个页面

**示例**：

- UserSelector（用户选择器）
- DepartmentTree（部门树）
- PermissionCheckbox（权限勾选框）
- FileUploader（文件上传组件）

### 2.3 页面组件

特定页面的主要组件，通常不复用，负责组织页面结构和数据流转。

**特点**：

- 低复用性
- 集成多个子组件
- 管理页面状态
- 处理页面级别的业务逻辑

**示例**：

- UserManagement
- RolePermission
- SystemSetting

### 2.4 布局组件

管理页面布局的组件，提供整体结构。

**特点**：

- 页面框架结构
- 管理导航和定位
- 处理响应式布局

**示例**：

- MainLayout
- Sidebar
- Header
- TabsView

## 三、组件开发规范

### 3.1 命名规范

1. **组件名**：使用PascalCase命名

   ```
   UserList.vue
   PermissionSelector.vue
   ```

2. **前缀规范**：
   - 基础组件以Base开头：`BaseButton.vue`
   - 业务组件使用功能描述：`UserSelector.vue`
   - 页面组件以功能命名：`UserManagement.vue`

3. **目录组织**：

   ```
   components/
   ├── base/           # 基础组件
   │   ├── BaseButton.vue
   │   └── BaseTable.vue
   ├── business/        # 业务组件
   │   ├── UserSelector.vue
   │   └── DepartmentTree.vue
   └── layout/         # 布局组件
       ├── MainLayout.vue
       └── Sidebar.vue
   ```

### 3.2 Props 设计规范

1. **类型定义**：使用TypeScript类型定义props

   ```typescript
   interface Props {
     /** 用户ID */
     userId: number;
     /** 是否显示详情 */
     showDetail?: boolean;
     /** 尺寸大小 */
     size?: 'small' | 'medium' | 'large';
   }

   const props = withDefaults(defineProps<Props>(), {
     showDetail: false,
     size: 'medium'
   });
   ```

2. **必要Props**：
   - 必须添加类型校验
   - 必须添加注释说明用途
   - 为可选props提供默认值

3. **命名规则**：
   - 使用camelCase命名
   - 布尔类型props使用`is`/`has`前缀
   - 回调函数props使用`on`前缀

### 3.3 Events 设计规范

1. **命名规则**：使用kebab-case命名

   ```typescript
   const emit = defineEmits<{
     /** 项目被选中时触发 */
     (e: 'item-select', item: Item): void;
     /** 表单提交时触发 */
     (e: 'submit', formData: FormData): void;
   }>();
   ```

2. **事件回调参数**：
   - 事件应传递有用的数据
   - 避免传递过多参数，推荐1-2个
   - 必要时使用对象封装多个参数

### 3.4 插槽设计规范

1. **默认插槽**：提供组件主要内容区域

   ```vue
   <template>
     <div class="card">
       <div class="card-header">
         <slot name="header">默认标题</slot>
       </div>
       <div class="card-body">
         <slot>默认内容</slot>
       </div>
       <div class="card-footer">
         <slot name="footer"></slot>
       </div>
     </div>
   </template>
   ```

2. **命名插槽**：拓展组件不同区域的定制能力
3. **作用域插槽**：向插槽内容传递数据

### 3.5 组件通信规范

1. **父子组件**：Props down, Events up
2. **远亲组件**：使用Pinia状态管理
3. **全局事件**：必要时使用事件总线
4. **Provide/Inject**：用于跨多级组件传递

## 四、样式规范

### 4.1 样式作用域

1. **局部样式**：使用`<style scoped>`限制样式作用域

   ```vue
   <style scoped>
   .component-class {
     color: #333;
   }
   </style>
   ```

2. **全局样式**：使用`<style>`用于主题颜色等全局样式
3. **样式穿透**：使用`:deep()`选择器修改子组件样式

   ```vue
   <style scoped>
   .component :deep(.el-input) {
     width: 200px;
   }
   </style>
   ```

### 4.2 样式命名

1. **BEM命名法**：Block-Element-Modifier

   ```css
   .user-card {} /* Block */
   .user-card__title {} /* Element */
   .user-card--active {} /* Modifier */
   ```

2. **命名空间**：使用组件名作为前缀避免冲突

   ```css
   .user-selector__item {}
   .role-selector__item {}
   ```

### 4.3 主题变量

1. **使用CSS变量**：定义全局主题变量

   ```css
   :root {
     --primary-color: #1890ff;
     --success-color: #52c41a;
     --warning-color: #faad14;
     --error-color: #f5222d;
     --font-size-base: 14px;
     --border-radius-base: 4px;
   }
   ```

2. **组件使用变量**：

   ```css
   .btn-primary {
     background-color: var(--primary-color);
   }
   ```

## 五、基础组件规范

### 5.1 表单类组件

1. **统一接口**：所有表单组件必须支持v-model
2. **验证支持**：支持表单验证规则
3. **尺寸规范**：支持sm、md、lg三种尺寸
4. **禁用状态**：支持disabled属性
5. **必填标记**：支持required属性，显示*号

```vue
<template>
  <div class="base-input" :class="[`base-input--${size}`, {'is-disabled': disabled}]">
    <label v-if="label" class="base-input__label">
      <span v-if="required" class="base-input__required">*</span>
      {{ label }}
    </label>
    <input
      class="base-input__inner"
      :value="modelValue"
      @input="handleInput"
      :disabled="disabled"
      :placeholder="placeholder"
    />
    <div v-if="error" class="base-input__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** 绑定值 */
  modelValue: string;
  /** 输入框标签 */
  label?: string;
  /** 占位文本 */
  placeholder?: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  disabled: false,
  required: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>
```

### 5.2 表格组件

1. **标准接口**：
   - 数据源data
   - 列定义columns
   - 分页配置pagination
   - 选择事件selection-change
   - 排序事件sort-change

2. **功能支持**：
   - 排序
   - 筛选
   - 多选
   - 分页
   - 自定义列

3. **性能优化**：
   - 虚拟滚动
   - 按需渲染
   - 分页加载

### 5.3 弹窗组件

1. **标准接口**：
   - 显示状态visible
   - 标题title
   - 确认按钮回调onConfirm
   - 取消按钮回调onCancel
   - 宽度width
   - 显示遮罩层mask

2. **功能支持**：
   - 拖拽
   - 全屏
   - 关闭动画
   - 按ESC关闭

3. **嵌套使用**：支持多层弹窗嵌套

## 六、组件文档规范

### 6.1 组件文档结构

每个组件必须提供文档，包含以下内容：

1. **组件介绍**：说明组件的用途和使用场景
2. **代码示例**：提供基本使用示例和高级用法示例
3. **Props 说明**：列出所有props及其类型、默认值和说明
4. **Events 说明**：列出组件触发的所有事件
5. **Slots 说明**：列出组件的所有插槽
6. **常见问题**：解答使用中的常见问题

### 6.2 示例代码

```markdown
# UserSelector 用户选择器

用于选择系统中的用户，支持单选和多选模式。

## 基本用法

```vue
<template>
  <UserSelector v-model="selectedUsers" />
</template>

<script setup>
import { ref } from 'vue';
import UserSelector from '@/components/business/UserSelector.vue';

const selectedUsers = ref([]);
</script>
```

## 多选模式

```vue
<template>
  <UserSelector v-model="selectedUsers" multiple />
</template>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | array/number | [] | 选中的用户ID或ID数组 |
| multiple | boolean | false | 是否多选 |
| departmentId | number | - | 部门ID筛选 |
| disabled | boolean | false | 是否禁用 |

## Events

| 名称 | 参数 | 说明 |
|------|------|------|
| update:modelValue | (value: array/number) | 选中值变化时触发 |
| change | (value: array/number) | 选中值变化时触发 |

## Slots

| 名称 | 说明 |
|------|------|
| default | 自定义选择器的触发元素 |
| option | 自定义选项内容，参数: { user } |

```

## 七、组件复用策略

### 7.1 封装Element Plus

1. **统一风格**：对Element Plus组件进行封装，统一项目风格
2. **简化接口**：根据项目需求简化组件接口
3. **增强功能**：添加项目特定的功能
4. **统一处理**：处理全局配置和主题

```vue
<!-- BaseTable.vue -->
<template>
  <div class="base-table">
    <div class="base-table__header" v-if="$slots.header || title">
      <div class="base-table__title" v-if="title">{{ title }}</div>
      <slot name="header"></slot>
    </div>

    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="data"
      :border="border"
      :stripe="stripe"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
      />

      <slot></slot>

      <template v-if="columns && columns.length">
        <el-table-column
          v-for="(column, index) in columns"
          :key="column.prop || index"
          v-bind="column"
        >
          <template #default="scope" v-if="column.render">
            <component
              :is="column.render"
              :row="scope.row"
              :index="scope.$index"
            />
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="$slots.operation"
        label="操作"
        :width="operationWidth"
        :fixed="operationFixed ? 'right' : undefined"
      >
        <template #default="scope">
          <slot name="operation" :row="scope.row" :index="scope.$index"></slot>
        </template>
      </el-table-column>
    </el-table>

    <div class="base-table__footer" v-if="pagination && data.length">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
```

### 7.2 复杂组件封装策略

1. **逻辑分离**：使用Composables抽离业务逻辑
2. **UI组件化**：将UI部分拆分为可复用的组件
3. **状态管理**：使用Pinia管理复杂状态
4. **低耦合**：降低组件间的耦合度

```typescript
// 拆分为Composable
export function useUserTable(options = {}) {
  const { immediate = true } = options;

  const loading = ref(false);
  const userList = ref([]);
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const queryParams = reactive({
    keyword: '',
    status: '',
    deptId: undefined
  });

  const fetchUsers = async () => {
    loading.value = true;
    try {
      const { list, total } = await getUserList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...queryParams
      });
      userList.value = list;
      pagination.total = total;
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = (page) => {
    pagination.page = page;
    fetchUsers();
  };

  const handleSizeChange = (size) => {
    pagination.pageSize = size;
    pagination.page = 1;
    fetchUsers();
  };

  const handleSearch = () => {
    pagination.page = 1;
    fetchUsers();
  };

  const handleReset = () => {
    Object.assign(queryParams, {
      keyword: '',
      status: '',
      deptId: undefined
    });
    pagination.page = 1;
    fetchUsers();
  };

  if (immediate) {
    fetchUsers();
  }

  return {
    loading,
    userList,
    pagination,
    queryParams,
    fetchUsers,
    handlePageChange,
    handleSizeChange,
    handleSearch,
    handleReset
  };
}
```

## 八、组件测试规范

### 8.1 测试原则

1. **组件单元测试**：测试组件的基本功能和边界情况
2. **关注交互**：测试用户交互和组件事件
3. **模拟依赖**：模拟API调用和外部依赖
4. **覆盖率要求**：核心组件测试覆盖率≥80%

### 8.2 测试示例

```typescript
// BaseButton.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import BaseButton from '../BaseButton.vue';

describe('BaseButton', () => {
  it('renders with default props', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: 'Button'
      }
    });

    expect(wrapper.text()).toContain('Button');
    expect(wrapper.classes()).toContain('base-button');
    expect(wrapper.classes()).toContain('base-button--md');
    expect(wrapper.classes()).toContain('base-button--primary');
  });

  it('supports different types', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: 'Button',
        type: 'danger'
      }
    });

    expect(wrapper.classes()).toContain('base-button--danger');
  });

  it('supports different sizes', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: 'Button',
        size: 'sm'
      }
    });

    expect(wrapper.classes()).toContain('base-button--sm');
  });

  it('disables the button when disabled prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: 'Button',
        disabled: true
      }
    });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('is-disabled');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: 'Button'
      }
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        label: 'Button',
        disabled: true
      }
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
});
```

## 九、组件性能优化

### 9.1 优化策略

1. **按需渲染**：
   - 使用`v-if`/`v-show`控制组件渲染
   - 列表使用虚拟滚动
   - 分页加载数据

2. **避免不必要的渲染**：
   - 使用`shallowRef`和`shallowReactive`
   - 为`v-for`提供唯一key
   - 避免在模板使用复杂计算

3. **懒加载组件**：
   - 路由组件懒加载
   - 使用`defineAsyncComponent`

### 9.2 优化示例

```typescript
// 虚拟列表组件
const VirtualList = defineComponent({
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 40
    }
  },
  setup(props) {
    const containerRef = ref<HTMLElement | null>(null);
    const scrollTop = ref(0);
    const viewportHeight = ref(0);

    // 计算可视区域内的项目
    const visibleItems = computed(() => {
      if (!containerRef.value) return [];

      const startIndex = Math.floor(scrollTop.value / props.itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(viewportHeight.value / props.itemHeight) + 1,
        props.items.length
      );

      return props.items.slice(startIndex, endIndex).map((item, index) => ({
        item,
        index: startIndex + index,
        style: {
          position: 'absolute',
          top: `${(startIndex + index) * props.itemHeight}px`,
          height: `${props.itemHeight}px`,
          width: '100%'
        }
      }));
    });

    // 总高度
    const totalHeight = computed(() => {
      return props.items.length * props.itemHeight;
    });

    // 监听滚动事件
    const handleScroll = () => {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop;
      }
    };

    // 监听容器大小变化
    onMounted(() => {
      if (containerRef.value) {
        viewportHeight.value = containerRef.value.clientHeight;

        // 使用ResizeObserver监听容器大小变化
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            viewportHeight.value = entry.contentRect.height;
          }
        });

        resizeObserver.observe(containerRef.value);

        // 清理
        onBeforeUnmount(() => {
          if (containerRef.value) {
            resizeObserver.unobserve(containerRef.value);
          }
        });
      }
    });

    return {
      containerRef,
      visibleItems,
      totalHeight,
      handleScroll
    };
  },
  render() {
    return h('div', {
      ref: 'containerRef',
      style: {
        height: '100%',
        overflow: 'auto',
        position: 'relative'
      },
      onScroll: this.handleScroll
    }, [
      h('div', {
        style: {
          height: `${this.totalHeight}px`,
          position: 'relative'
        }
      }, this.visibleItems.map(({ item, index, style }) => {
        return h('div', {
          key: index,
          style
        }, this.$slots.default ? this.$slots.default({ item, index }) : null);
      }))
    ]);
  }
});
```

## 十、无障碍设计规范

### 10.1 基本原则

1. **语义化标签**：使用正确的HTML标签表达内容结构
2. **键盘导航**：确保组件可通过键盘导航
3. **焦点管理**：合理管理焦点状态
4. **屏幕阅读器支持**：提供适当的aria属性和标签

### 10.2 实现细节

1. **表单控件**：
   - 使用label标签关联控件
   - 提供错误信息的aria-describedby
   - 使用aria-required标记必填字段

2. **按钮和链接**：
   - 使用适当的按钮类型
   - 提供描述性文本
   - 为纯图标按钮提供aria-label

3. **对话框**：
   - 使用aria-modal="true"
   - 使用aria-labelledby引用标题
   - 显示时自动聚焦第一个控件

4. **表格**：
   - 使用正确的表格标签结构
   - 提供表头和摘要
   - 使用scope属性标记表头

### 10.3 示例

```vue
<template>
  <div class="form-group">
    <label :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <input
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-input"
      :aria-describedby="errorId"
      :aria-invalid="!!error"
      :aria-required="required"
    />

    <div v-if="error" :id="errorId" class="form-error" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: String,
  label: String,
  required: Boolean,
  error: String,
  id: String
});

const emit = defineEmits(['update:modelValue']);

const uniqueId = computed(() => props.id || `input-${Date.now()}`);
const errorId = computed(() => `${uniqueId.value}-error`);
</script>
```
