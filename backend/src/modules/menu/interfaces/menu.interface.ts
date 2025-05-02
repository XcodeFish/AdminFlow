export interface MenuTreeNode {
  id: string;
  menuName: string;
  parentId: string | null;
  orderNum: number;
  path: string | null;
  component: string | null;
  query: string | null;
  isExternal: number;
  isCache: number;
  menuType: string;
  isVisible: number;
  status: number;
  perms: string | null;
  icon: string | null;
  children?: MenuTreeNode[];
}

export interface UserMenuInfo {
  id: string;
  menuName: string;
  path: string | null;
  component: string | null;
  query: string | null;
  isExternal: number;
  isCache: number;
  menuType: string;
  isVisible: number;
  icon: string | null;
  perms: string | null;
  children?: UserMenuInfo[];
}
