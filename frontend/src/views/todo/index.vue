<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 搜索表单 -->
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中..."
      border
      fit
      highlight-current-row
    >
      <!-- 表格列 -->
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="待办事项内容" align="center" prop="content" />
      <el-table-column label="开始时间" align="center" prop="startTime" />
      <el-table-column label="状态(0:未完成, 1:已完成, 2:已取消, 3:已过期)" align="center" prop="status" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="创建时间" align="center" prop="createdAt" />
      <el-table-column label="更新时间" align="center" prop="updatedAt" />

      <el-table-column label="操作" align="center" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="query.page"
      :limit.sync="query.limit"
      @pagination="getList"
    />

    <!-- 编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="dataForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="待办事项内容" prop="content">
          <el-input v-model="form.content" placeholder="请输入待办事项内容" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-input v-model="form.startTime" placeholder="请输入开始时间" />
        </el-form-item>
        <el-form-item label="状态(0:未完成, 1:已完成, 2:已取消, 3:已过期)" prop="status">
          <el-input v-model="form.status" placeholder="请输入状态(0:未完成, 1:已完成, 2:已取消, 3:已过期)" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createdAt">
          <el-input v-model="form.createdAt" placeholder="请输入创建时间" />
        </el-form-item>
        <el-form-item label="更新时间" prop="updatedAt">
          <el-input v-model="form.updatedAt" placeholder="请输入更新时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import {
  getTodoList,
  getTodoDetail,
  createTodo,
  updateTodo,
  deleteTodo
} from '@/api/Todo';
import Pagination from '@/components/Pagination';

export default {
  name: 'Todo',
  components: { Pagination },
  setup() {
    const listLoading = ref(false);
    const list = ref([]);
    const total = ref(0);
    const query = reactive({
      page: 1,
      limit: 10
    });

    const dialogVisible = ref(false);
    const dialogStatus = ref('');
    const form = reactive({
      content: null,
      startTime: null,
      status: null,
      userId: null,
      createdAt: null,
      updatedAt: null,
    });

    const rules = {
      content: [
        {  required: true,  message: 待办事项内容不能为空,  },
        {  max: 255,  message: 待办事项内容长度不能超过255,  },
      ],
      startTime: [
        {  required: true,  message: 开始时间不能为空,  },
      ],
      status: [
        {  required: true,  message: 状态(0:未完成, 1:已完成, 2:已取消, 3:已过期)不能为空,  },
      ],
      userId: [
        {  required: true,  message: 用户ID不能为空,  },
        {  max: 255,  message: 用户ID长度不能超过255,  },
      ],
      createdAt: [
        {  required: true,  message: 创建时间不能为空,  },
      ],
      updatedAt: [
        {  required: true,  message: 更新时间不能为空,  },
      ],
    };

    const dialogTitle = computed(() => {
      return dialogStatus.value === 'create' ? '新增' : '编辑';
    });

    const resetForm = () => {
      form.content = null;
      form.startTime = null;
      form.status = null;
      form.userId = null;
      form.createdAt = null;
      form.updatedAt = null;
    };

    const getList = async () => {
      listLoading.value = true;
      try {
        const { data } = await getTodoList(query);
        list.value = data.items;
        total.value = data.total;
      } catch (error) {
        console.error('获取列表失败', error);
      } finally {
        listLoading.value = false;
      }
    };

    const handleCreate = () => {
      resetForm();
      dialogStatus.value = 'create';
      dialogVisible.value = true;
    };

    const handleEdit = async (row) => {
      resetForm();
      dialogStatus.value = 'update';
      dialogVisible.value = true;

      try {
        const { data } = await getTodoDetail(row.id);
        Object.assign(form, data);
      } catch (error) {
        console.error('获取详情失败', error);
      }
    };

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm('确认删除该记录吗?', '警告', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        });

        await deleteTodo(row.id);
        ElMessage.success('删除成功');
        getList();
      } catch (error) {
        console.error('删除失败', error);
      }
    };

    const submitForm = async () => {
      try {
        if (dialogStatus.value === 'create') {
          await createTodo(form);
          ElMessage.success('创建成功');
        } else {
          await updateTodo(form.id, form);
          ElMessage.success('更新成功');
        }

        dialogVisible.value = false;
        getList();
      } catch (error) {
        console.error('提交表单失败', error);
      }
    };

    onMounted(() => {
      getList();
    });

    return {
      listLoading,
      list,
      total,
      query,
      dialogVisible,
      dialogStatus,
      dialogTitle,
      form,
      rules,
      getList,
      handleCreate,
      handleEdit,
      handleDelete,
      submitForm
    };
  }
};
</script>