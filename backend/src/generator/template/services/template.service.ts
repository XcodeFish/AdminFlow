import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Template } from '../entities/template.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { QueryTemplateDto } from '../dto/query-template.dto';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    try {
      const template = this.templateRepository.create(createTemplateDto);
      return this.templateRepository.save(template);
    } catch (error) {
      this.logger.error(`创建模板失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    query: QueryTemplateDto,
  ): Promise<{
    items: Template[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { name, type, isBuiltin, isActive, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const queryBuilder =
        this.templateRepository.createQueryBuilder('template');

      if (name) {
        queryBuilder.andWhere('template.name LIKE :name', {
          name: `%${name}%`,
        });
      }

      if (type) {
        queryBuilder.andWhere('template.type = :type', { type });
      }

      if (isBuiltin !== undefined) {
        queryBuilder.andWhere('template.isBuiltin = :isBuiltin', { isBuiltin });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('template.isActive = :isActive', { isActive });
      }

      const [items, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('template.createdAt', 'DESC')
        .getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`获取模板列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Template> {
    try {
      const template = await this.templateRepository.findOne({ where: { id } });

      if (!template) {
        throw new NotFoundException(`模板 [ID: ${id}] 不存在`);
      }

      return template;
    } catch (error) {
      this.logger.error(`获取模板详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(
    id: number,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    try {
      const template = await this.findOne(id);
      Object.assign(template, updateTemplateDto);
      return this.templateRepository.save(template);
    } catch (error) {
      this.logger.error(`更新模板失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const template = await this.findOne(id);
      await this.templateRepository.remove(template);
    } catch (error) {
      this.logger.error(`删除模板失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByKey(templateKey: string): Promise<Template> {
    try {
      const template = await this.templateRepository.findOne({
        where: { templateKey, isActive: true },
      });

      if (!template) {
        throw new NotFoundException(
          `模板 [Key: ${templateKey}] 不存在或未激活`,
        );
      }

      return template;
    } catch (error) {
      this.logger.error(`根据Key获取模板失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      const count = await this.templateRepository.count();

      if (count === 0) {
        this.logger.log('初始化内置模板');
        await this.initializeDefaultTemplates();
      }
    } catch (error) {
      this.logger.error(`初始化模板失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async initializeDefaultTemplates(): Promise<void> {
    // 在这里可以添加默认的代码模板
    const defaultTemplates = [
      {
        name: '实体类模板',
        description: 'NestJS实体类代码模板',
        type: 'backend',
        templateKey: 'entity',
        content: `import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('{{tableName}}')
export class {{className}} {
  @PrimaryGeneratedColumn()
  id: number;
{{#each fields}}
{{#if this.isPrimary}}
{{else}}
  @Column({{#if this.columnOptions}}{{{this.columnOptions}}}{{/if}})
  {{this.name}}: {{this.tsType}};
{{/if}}
{{/each}}

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`,
        isBuiltin: true,
        isActive: true,
      },
      {
        name: 'DTO模板',
        description: 'NestJS DTO代码模板',
        type: 'backend',
        templateKey: 'dto',
        content: `import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class Create{{className}}Dto {
{{#each fields}}
{{#if this.isPrimary}}
{{else}}
  {{#if this.validate}}
  {{#each this.validate}}
  {{this.decoratorCode}}
  {{/each}}
  {{/if}}
  {{this.name}}: {{this.tsType}};
{{/if}}
{{/each}}
}`,
        isBuiltin: true,
        isActive: true,
      },
      {
        name: '控制器模板',
        description: 'NestJS控制器代码模板',
        type: 'backend',
        templateKey: 'controller',
        content: `import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  ParseIntPipe
} from '@nestjs/common';
import { {{className}}Service } from './{{fileName}}.service';
import { Create{{className}}Dto } from './dto/create-{{fileName}}.dto';
import { Update{{className}}Dto } from './dto/update-{{fileName}}.dto';
import { Query{{className}}Dto } from './dto/query-{{fileName}}.dto';

@Controller('{{apiPrefix}}')
export class {{className}}Controller {
  constructor(private readonly {{propertyName}}Service: {{className}}Service) {}

  @Post()
  async create(@Body() create{{className}}Dto: Create{{className}}Dto) {
    const data = await this.{{propertyName}}Service.create(create{{className}}Dto);
    return {
      code: 200,
      message: '创建成功',
      data
    };
  }

  @Get()
  async findAll(@Query() query: Query{{className}}Dto) {
    const data = await this.{{propertyName}}Service.findAll(query);
    return {
      code: 200,
      message: '操作成功',
      data
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.{{propertyName}}Service.findOne(id);
    return {
      code: 200,
      message: '操作成功',
      data
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() update{{className}}Dto: Update{{className}}Dto
  ) {
    const data = await this.{{propertyName}}Service.update(id, update{{className}}Dto);
    return {
      code: 200,
      message: '更新成功',
      data
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.{{propertyName}}Service.remove(id);
    return {
      code: 200,
      message: '删除成功',
      data: null
    };
  }
}`,
        isBuiltin: true,
        isActive: true,
      },
      {
        name: '服务模板',
        description: 'NestJS服务代码模板',
        type: 'backend',
        templateKey: 'service',
        content: `import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {{className}} } from './entities/{{fileName}}.entity';
import { Create{{className}}Dto } from './dto/create-{{fileName}}.dto';
import { Update{{className}}Dto } from './dto/update-{{fileName}}.dto';
import { Query{{className}}Dto } from './dto/query-{{fileName}}.dto';

@Injectable()
export class {{className}}Service {
  private readonly logger = new Logger({{className}}Service.name);

  constructor(
    @InjectRepository({{className}})
    private {{propertyName}}Repository: Repository<{{className}}>,
  ) {}

  async create(create{{className}}Dto: Create{{className}}Dto): Promise<{{className}}> {
    try {
      const {{propertyName}} = this.{{propertyName}}Repository.create(create{{className}}Dto);
      return this.{{propertyName}}Repository.save({{propertyName}});
    } catch (error) {
      this.logger.error(\`创建{{className}}失败: \${error.message}\`, error.stack);
      throw error;
    }
  }

  async findAll(query: Query{{className}}Dto): Promise<{ items: {{className}}[]; total: number; page: number; limit: number }> {
    try {
      const { page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.{{propertyName}}Repository.createQueryBuilder('{{propertyName}}');

      // 这里可以添加查询条件

      const [items, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('{{propertyName}}.createdAt', 'DESC')
        .getManyAndCount();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(\`获取{{className}}列表失败: \${error.message}\`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<{{className}}> {
    try {
      const {{propertyName}} = await this.{{propertyName}}Repository.findOne({ where: { id } });

      if (!{{propertyName}}) {
        throw new NotFoundException(\`{{className}} [ID: \${id}] 不存在\`);
      }

      return {{propertyName}};
    } catch (error) {
      this.logger.error(\`获取{{className}}详情失败: \${error.message}\`, error.stack);
      throw error;
    }
  }

  async update(id: number, update{{className}}Dto: Update{{className}}Dto): Promise<{{className}}> {
    try {
      const {{propertyName}} = await this.findOne(id);

      // 合并更新数据
      Object.assign({{propertyName}}, update{{className}}Dto);

      // 保存更新
      return this.{{propertyName}}Repository.save({{propertyName}});
    } catch (error) {
      this.logger.error(\`更新{{className}}失败: \${error.message}\`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const {{propertyName}} = await this.findOne(id);
      await this.{{propertyName}}Repository.remove({{propertyName}});
    } catch (error) {
      this.logger.error(\`删除{{className}}失败: \${error.message}\`, error.stack);
      throw error;
    }
  }
}`,
        isBuiltin: true,
        isActive: true,
      },
      // 前端模板
      {
        name: 'Vue列表页模板',
        description: 'Vue列表页模板',
        type: 'frontend',
        templateKey: 'vue-list',
        content: `<template>
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
      {{#each fields}}
      {{#if this.showInList}}
      <el-table-column label="{{this.comment}}" align="center">
        <template #default="{ row }">
          {{ row.{{this.name}} }}
        </template>
      </el-table-column>
      {{/if}}
      {{/each}}

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
        {{#each fields}}
        {{#if this.showInForm}}
        <el-form-item label="{{this.comment}}" prop="{{this.name}}">
          <el-input v-model="form.{{this.name}}" placeholder="请输入{{this.comment}}" />
        </el-form-item>
        {{/if}}
        {{/each}}
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
  get{{className}}List,
  get{{className}}Detail,
  create{{className}},
  update{{className}},
  delete{{className}}
} from '@/api/{{moduleName}}';
import Pagination from '@/components/Pagination';

export default {
  name: '{{className}}',
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
      {{#each fields}}
      {{#if this.showInForm}}
      {{this.name}}: null,
      {{/if}}
      {{/each}}
    });

    const rules = {
      {{#each fields}}
      {{#if this.showInForm}}
      {{#if this.validate}}
      {{this.name}}: [
        {{#each this.validate}}
        { {{#each this}} {{@key}}: {{this}}, {{/each}} },
        {{/each}}
      ],
      {{/if}}
      {{/if}}
      {{/each}}
    };

    const dialogTitle = computed(() => {
      return dialogStatus.value === 'create' ? '新增{{moduleDescription}}' : '编辑{{moduleDescription}}';
    });

    const resetForm = () => {
      {{#each fields}}
      {{#if this.showInForm}}
      form.{{this.name}} = null;
      {{/if}}
      {{/each}}
    };

    const getList = async () => {
      listLoading.value = true;
      try {
        const { data } = await get{{className}}List(query);
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
        const { data } = await get{{className}}Detail(row.id);
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

        await delete{{className}}(row.id);
        ElMessage.success('删除成功');
        getList();
      } catch (error) {
        console.error('删除失败', error);
      }
    };

    const submitForm = async () => {
      try {
        if (dialogStatus.value === 'create') {
          await create{{className}}(form);
          ElMessage.success('创建成功');
        } else {
          await update{{className}}(form.id, form);
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
</script>`,
        isBuiltin: true,
        isActive: true,
      },
      {
        name: 'Vue API模板',
        description: 'Vue API请求模板',
        type: 'frontend',
        templateKey: 'vue-api',
        content: `import request from '@/utils/request';

export function get{{className}}List(query) {
  return request({
    url: '{{apiPrefix}}',
    method: 'get',
    params: query
  });
}

export function get{{className}}Detail(id) {
  return request({
    url: \`{{apiPrefix}}/\${id}\`,
    method: 'get'
  });
}

export function create{{className}}(data) {
  return request({
    url: '{{apiPrefix}}',
    method: 'post',
    data
  });
}

export function update{{className}}(id, data) {
  return request({
    url: \`{{apiPrefix}}/\${id}\`,
    method: 'put',
    data
  });
}

export function delete{{className}}(id) {
  return request({
    url: \`{{apiPrefix}}/\${id}\`,
    method: 'delete'
  });
}`,
        isBuiltin: true,
        isActive: true,
      },
    ];

    for (const template of defaultTemplates) {
      await this.templateRepository.save(template);
    }
  }
}
