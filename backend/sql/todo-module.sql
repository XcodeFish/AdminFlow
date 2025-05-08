-- Todo 模块相关SQL脚本
-- 创建于 2025-05-08T13:06:50.075Z

-- 添加菜单
INSERT INTO sys_menu (name, path, component, parent_id, icon, sort, permissions)
VALUES ('Todo管理', '/api/todo', 'todo', 0, 'el-icon-document', 100, 'todo:list');

-- 添加权限
INSERT INTO sys_permission (code, name, menu_id) VALUES ('todo:list', '查看Todo', LAST_INSERT_ID());
INSERT INTO sys_permission (code, name, menu_id) VALUES ('todo:create', '新增Todo', LAST_INSERT_ID());
INSERT INTO sys_permission (code, name, menu_id) VALUES ('todo:update', '修改Todo', LAST_INSERT_ID());
INSERT INTO sys_permission (code, name, menu_id) VALUES ('todo:delete', '删除Todo', LAST_INSERT_ID());
