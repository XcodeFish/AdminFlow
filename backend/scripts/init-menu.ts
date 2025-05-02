/**
 * 初始化基础菜单结构脚本
 *
 * 运行方式: npm run init:menu
 *
 * 创建基础菜单结构:
 * - 仪表盘（菜单，无父级）
 * - 系统管理（目录，无父级）
 *   - 用户管理（系统管理的子菜单）
 *   - 角色管理（系统管理的子菜单）
 *   - 菜单管理（系统管理的子菜单）
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MenuService } from '../src/modules/menu/menu.service';
import { CreateMenuDto } from '../src/modules/menu/dto/create-menu.dto';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const menuService = app.get(MenuService);
  const logger = new Logger('InitMenuScript');

  try {
    logger.log('开始初始化基础菜单...');

    // 检查是否已有菜单数据，避免重复创建
    const [existingMenus, count] = await menuService.findAll({
      page: 1,
      limit: 10,
      menuName: '',
      status: undefined,
    });

    if (count > 0) {
      logger.warn('系统中已存在菜单数据，如需重新初始化，请先清空菜单表');
      return;
    }

    // 1. 创建仪表盘菜单
    const dashboardMenu = await createMenu(menuService, {
      menuName: '仪表盘',
      path: '/dashboard',
      component: 'dashboard/index',
      menuType: 'C', // 菜单类型
      orderNum: 1,
      icon: 'dashboard',
      isCache: 0,
      isVisible: 1,
      status: 1,
      perms: 'dashboard:view',
      remark: '系统仪表盘',
    });
    logger.log(`仪表盘菜单创建成功，ID: ${dashboardMenu.id}`);

    // 2. 创建系统管理目录
    const systemDir = await createMenu(menuService, {
      menuName: '系统管理',
      path: '/system',
      menuType: 'M', // 目录类型
      orderNum: 2,
      icon: 'setting',
      isCache: 0,
      isVisible: 1,
      status: 1,
      perms: 'system:view',
      remark: '系统管理目录',
    });
    logger.log(`系统管理目录创建成功，ID: ${systemDir.id}`);

    // 3. 创建用户管理菜单（系统管理的子菜单）
    const userMenu = await createMenu(menuService, {
      menuName: '用户管理',
      parentId: systemDir.id,
      path: '/system/user',
      component: 'system/user/index',
      menuType: 'C', // 菜单类型
      orderNum: 1,
      icon: 'user',
      isCache: 0,
      isVisible: 1,
      status: 1,
      perms: 'system:user:list',
      remark: '用户管理菜单',
    });
    logger.log(`用户管理菜单创建成功，ID: ${userMenu.id}`);

    // 4. 创建角色管理菜单（系统管理的子菜单）
    const roleMenu = await createMenu(menuService, {
      menuName: '角色管理',
      parentId: systemDir.id,
      path: '/system/role',
      component: 'system/role/index',
      menuType: 'C', // 菜单类型
      orderNum: 2,
      icon: 'peoples',
      isCache: 0,
      isVisible: 1,
      status: 1,
      perms: 'system:role:list',
      remark: '角色管理菜单',
    });
    logger.log(`角色管理菜单创建成功，ID: ${roleMenu.id}`);

    // 5. 创建菜单管理菜单（系统管理的子菜单）
    const menuMenu = await createMenu(menuService, {
      menuName: '菜单管理',
      parentId: systemDir.id,
      path: '/system/menu',
      component: 'system/menu/index',
      menuType: 'C', // 菜单类型
      orderNum: 3,
      icon: 'tree-table',
      isCache: 0,
      isVisible: 1,
      status: 1,
      perms: 'system:menu:list',
      remark: '菜单管理菜单',
    });
    logger.log(`菜单管理菜单创建成功，ID: ${menuMenu.id}`);

    logger.log('基础菜单初始化完成！');
  } catch (error) {
    logger.error(`菜单初始化失败: ${error.message}`);
    logger.error(error.stack);
  } finally {
    await app.close();
  }
}

// 辅助函数：创建菜单
async function createMenu(menuService: MenuService, menuData: CreateMenuDto) {
  return await menuService.create(menuData);
}

bootstrap();
