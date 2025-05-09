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
      <el-table-column label="" align="center" prop="configId" />
      <el-table-column label="" align="center" prop="configSnapshot" />
      <el-table-column label="" align="center" prop="fileSnapshot" />
      <el-table-column label="" align="center" prop="version" />
      <el-table-column label="" align="center" prop="description" />
      <el-table-column label="" align="center" prop="creator" />
      <el-table-column label="" align="center" prop="createdAt" />

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
        <el-form-item label="" prop="configId">
          <el-input v-model="form.configId" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="" prop="configSnapshot">
          <el-input v-model="form.configSnapshot" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="" prop="fileSnapshot">
          <el-input v-model="form.fileSnapshot" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="" prop="version">
          <el-input v-model="form.version" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="" prop="description">
          <el-input v-model="form.description" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="" prop="creator">
          <el-input v-model="form.creator" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="" prop="createdAt">
          <el-input v-model="form.createdAt" placeholder="请输入" />
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
  getGenversionList,
  getGenversionDetail,
  createGenversion,
  updateGenversion,
  deleteGenversion
} from '@/api/genVersion';
import Pagination from '@/components/Pagination';

export default {
  name: 'Genversion',
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
      configId: null,
      configSnapshot: null,
      fileSnapshot: null,
      version: null,
      description: null,
      creator: null,
      createdAt: null,
    });

    const rules = {
      configId: [
        {  required: true,  message: configId不能为空,  },
      ],
      configSnapshot: [
        {  required: true,  message: configSnapshot不能为空,  },
      ],
      fileSnapshot: [
        {  required: true,  message: fileSnapshot不能为空,  },
      ],
      version: [
        {  required: true,  message: version不能为空,  },
      ],
      creator: [
        {  required: true,  message: creator不能为空,  },
      ],
      createdAt: [
        {  required: true,  message: createdAt不能为空,  },
      ],
    };

    const dialogTitle = computed(() => {
      return dialogStatus.value === 'create' ? '新增' : '编辑';
    });

    const resetForm = () => {
      form.configId = null;
      form.configSnapshot = null;
      form.fileSnapshot = null;
      form.version = null;
      form.description = null;
      form.creator = null;
      form.createdAt = null;
    };

    const getList = async () => {
      listLoading.value = true;
      try {
        const { data } = await getGenversionList(query);
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
        const { data } = await getGenversionDetail(row.id);
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

        await deleteGenversion(row.id);
        ElMessage.success('删除成功');
        getList();
      } catch (error) {
        console.error('删除失败', error);
      }
    };

    const submitForm = async () => {
      try {
        if (dialogStatus.value === 'create') {
          await createGenversion(form);
          ElMessage.success('创建成功');
        } else {
          await updateGenversion(form.id, form);
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