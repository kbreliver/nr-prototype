/**
 * 法人组织管理 - 工具函数
 */

import type { LegalEntity, LegalEntityType, LegalEntityTypeMap, DataSource, DataSourceMap } from './types';

/**
 * 生成组织编号（LE-YYYYMMDD-XXX）
 */
export function generateEntityCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `LE-${year}${month}${day}-${random}`;
}

/**
 * 构建组织路径（集团 > 子公司 > 工厂）
 */
export function buildEntityPath(entity: LegalEntity, allEntities: LegalEntity[]): string {
  const path: string[] = [entity.entityName];
  let current = entity;
  
  // 向上查找父级组织
  while (current.parentEntityId) {
    const parent = allEntities.find(e => e.id === current.parentEntityId);
    if (!parent) break;
    path.unshift(parent.entityName);
    current = parent;
  }
  
  return path.join(' > ');
}

/**
 * 树形数据扁平化
 */
export function flattenEntityTree(tree: LegalEntity[]): LegalEntity[] {
  const result: LegalEntity[] = [];
  
  function traverse(nodes: LegalEntity[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  
  traverse(tree);
  return result;
}

/**
 * 根据ID查找节点
 */
export function findEntityById(tree: LegalEntity[], id: number): LegalEntity | null {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findEntityById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 构建树形结构
 */
export function buildEntityTree(flatList: LegalEntity[]): LegalEntity[] {
  const map = new Map<number, LegalEntity>();
  const roots: LegalEntity[] = [];
  
  // 第一遍：创建映射
  flatList.forEach(entity => {
    map.set(entity.id!, { ...entity, children: [] });
  });
  
  // 第二遍：构建树形结构
  flatList.forEach(entity => {
    const node = map.get(entity.id!);
    if (!node) return;
    
    if (entity.parentEntityId) {
      const parent = map.get(entity.parentEntityId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // 如果找不到父节点，作为根节点
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });
  
  return roots;
}

/**
 * 计算树的深度
 */
export function getTreeDepth(tree: LegalEntity[]): number {
  if (!tree || tree.length === 0) return 0;
  
  let maxDepth = 1;
  
  function traverse(nodes: LegalEntity[], depth: number) {
    for (const node of nodes) {
      maxDepth = Math.max(maxDepth, depth);
      if (node.children && node.children.length > 0) {
        traverse(node.children, depth + 1);
      }
    }
  }
  
  traverse(tree, 1);
  return maxDepth;
}

/**
 * 检查循环引用
 */
export function hasCircularReference(
  entityId: number,
  parentId: number,
  allEntities: LegalEntity[],
): boolean {
  // 如果父ID就是自己，立即返回true
  if (entityId === parentId) return true;
  
  // 向上查找父级链，看是否包含entityId
  let currentId = parentId;
  const visited = new Set<number>();
  
  while (currentId) {
    if (visited.has(currentId)) {
      // 检测到循环
      return true;
    }
    visited.add(currentId);
    
    if (currentId === entityId) {
      // 找到了entityId，说明存在循环引用
      return true;
    }
    
    const parent = allEntities.find(e => e.id === currentId);
    if (!parent || !parent.parentEntityId) break;
    currentId = parent.parentEntityId;
  }
  
  return false;
}

/**
 * 获取组织类型映射
 */
export function getLegalEntityTypeMap(): LegalEntityTypeMap[] {
  return [
    { value: 1, label: '集团总部', icon: 'lucide:building-2', color: 'purple' },
    { value: 2, label: '公司', icon: 'lucide:building', color: 'blue' },
    { value: 3, label: '子公司', icon: 'lucide:building', color: 'cyan' },
    { value: 4, label: '分公司', icon: 'lucide:home', color: 'green' },
    { value: 5, label: '办事处', icon: 'lucide:briefcase', color: 'teal' },
    { value: 6, label: '工厂', icon: 'lucide:factory', color: 'orange' },
  ];
}

/**
 * 根据组织类型获取标签信息
 */
export function getEntityTypeInfo(type: LegalEntityType): LegalEntityTypeMap {
  const map = getLegalEntityTypeMap();
  return map.find(item => item.value === type) || map[0]!;
}

/**
 * 获取数据来源映射
 */
export function getDataSourceMap(): DataSourceMap[] {
  return [
    { value: 1, label: '手动录入', color: 'default' },
    { value: 2, label: '第三方接口', color: 'blue' },
    { value: 3, label: '批量导入', color: 'green' },
  ];
}

/**
 * 根据数据来源获取标签信息
 */
export function getDataSourceInfo(source: DataSource): DataSourceMap {
  const map = getDataSourceMap();
  const result = map.find(item => item.value === source);
  return result || map[0]!;
}

/**
 * 格式化注册资本
 */
export function formatRegisteredCapital(capital?: string): string {
  if (!capital) return '-';
  
  // 如果已经包含单位，直接返回
  if (capital.includes('万元') || capital.includes('亿元')) {
    return capital;
  }
  
  // 尝试转换为数字
  const num = Number.parseFloat(capital);
  if (Number.isNaN(num)) return capital;
  
  // 转换为万元
  if (num >= 10000) {
    return `${(num / 10000).toFixed(2)}万元`;
  }
  
  return `${num}元`;
}

/**
 * 统计组织下的客户数量（递归）
 */
export function countCustomers(entity: LegalEntity): number {
  let count = entity.isCustomer ? 1 : 0;
  
  if (entity.children && entity.children.length > 0) {
    for (const child of entity.children) {
      count += countCustomers(child);
    }
  }
  
  return count;
}

/**
 * 获取根组织（集团）
 */
export function getRootEntity(entity: LegalEntity, allEntities: LegalEntity[]): LegalEntity {
  let current = entity;
  
  while (current.parentEntityId) {
    const parent = allEntities.find(e => e.id === current.parentEntityId);
    if (!parent) break;
    current = parent;
  }
  
  return current;
}

/**
 * 准备Tree组件所需的数据格式
 */
export function prepareTreeData(entities: LegalEntity[]): LegalEntity[] {
  return entities.map(entity => ({
    ...entity,
    key: String(entity.id),
    title: entity.entityName,
    children: entity.children ? prepareTreeData(entity.children) : undefined,
  }));
}

