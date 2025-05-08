import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Template } from './entities/template.entity';

// 加载环境变量
dotenv.config();

async function main() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'adminflow',
    entities: [Template],
    synchronize: false,
  });

  try {
    // 初始化连接
    await dataSource.initialize();
    console.log('数据库连接已建立');

    console.log('开始修复Vue列表页模板...');

    // 查找Vue列表页模板
    const templateRepository = dataSource.getRepository(Template);
    const template = await templateRepository.findOne({
      where: {
        templateKey: 'vue-list',
      },
    });

    if (!template) {
      console.error('找不到Vue列表页模板!');
      return;
    }

    console.log('找到模板ID:', template.id);

    // 获取原始内容
    const originalContent = template.content;
    console.log(
      '原始内容包含嵌套语法:',
      originalContent.includes('{{ row.{{this.name}} }}'),
    );

    // 修复嵌套语法
    const fixedContent = originalContent.replace(
      /<el-table-column label="{{this\.comment}}" align="center">\s*<template #default="\{ row \}">\s*{{ row\.{{this\.name}} }}\s*<\/template>\s*<\/el-table-column>/g,
      '<el-table-column label="{{this.comment}}" align="center" prop="{{this.name}}" />',
    );

    console.log('修复后内容是否不同:', fixedContent !== originalContent);

    // 更新模板
    template.content = fixedContent;
    await templateRepository.save(template);

    console.log('Vue列表页模板修复完成!');
  } catch (error) {
    console.error('修复模板时出错:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('数据库连接已关闭');
    }
  }
}

main();
