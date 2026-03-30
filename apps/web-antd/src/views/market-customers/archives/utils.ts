// 客户档案工具函数

import type {
  BusinessTypeMap,
  CustomerLevelMap,
  CustomerStatusMap,
} from './types';
import {
  BusinessType,
  CustomerLevel,
  CustomerStatus,
} from './types';

/**
 * 生成客户编号
 * 格式：CUS-YYYYMMDD-XXX
 */
export function generateCustomerCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `CUS-${year}${month}${day}-${random}`;
}

/**
 * 手机号脱敏显示
 * @param phone 手机号
 * @returns 脱敏后的手机号，如：138****0001
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return true; // 允许为空
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证邮箱格式
 * @param email 邮箱
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  if (!email) return true; // 允许为空
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证统一社会信用代码
 * @param code 统一社会信用代码
 * @returns 是否有效
 */
export function validateCreditCode(code: string): boolean {
  if (!code) return true; // 允许为空
  // 统一社会信用代码为18位
  const creditCodeRegex = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
  return creditCodeRegex.test(code);
}

/**
 * 获取客户级别映射
 */
export function getCustomerLevelMap(): Record<CustomerLevel, CustomerLevelMap> {
  return {
    [CustomerLevel.Key]: { text: '重点客户', color: 'red' },
    [CustomerLevel.Normal]: { text: '普通客户', color: 'blue' },
    [CustomerLevel.Potential]: { text: '潜在客户', color: 'default' },
  };
}

/**
 * 获取客户状态映射
 */
export function getCustomerStatusMap(): Record<CustomerStatus, CustomerStatusMap> {
  return {
    [CustomerStatus.Potential]: { text: '潜在客户', color: 'default' },
    [CustomerStatus.Intention]: { text: '意向客户', color: 'blue' },
    [CustomerStatus.Cooperating]: { text: '合作中', color: 'success' },
    [CustomerStatus.Lost]: { text: '已流失', color: 'default' },
  };
}

/**
 * 获取业务类型映射
 */
export function getBusinessTypeMap(): Record<BusinessType, BusinessTypeMap> {
  return {
    [BusinessType.Opportunity]: { text: '商机', color: 'blue', icon: 'trending-up' },
    [BusinessType.Solution]: { text: '方案', color: 'green', icon: 'file-text' },
    [BusinessType.Contract]: { text: '合同', color: 'orange', icon: 'file-signature' },
    [BusinessType.Project]: { text: '项目', color: 'purple', icon: 'briefcase' },
    [BusinessType.Created]: { text: '客户创建', color: 'default', icon: 'plus-circle' },
  };
}

/**
 * 格式化金额
 * @param amount 金额
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * 格式化货币
 * @param amount 金额
 * @returns 带货币符号的金额字符串
 */
export function formatCurrency(amount: number): string {
  return `¥${formatAmount(amount)}`;
}

/**
 * 计算回款率
 * @param paidAmount 回款金额
 * @param totalAmount 总金额
 * @returns 回款率百分比
 */
export function calculatePaymentRate(paidAmount: number, totalAmount: number): number {
  if (totalAmount === 0) return 0;
  return Math.round((paidAmount / totalAmount) * 100);
}

/**
 * 获取时间范围的开始日期
 * @param range 时间范围字符串
 * @returns 开始日期
 */
export function getTimeRangeStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case '最近一月':
      return new Date(now.setMonth(now.getMonth() - 1));
    case '最近三月':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '最近半年':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '最近一年':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case '全部':
      return null;
    default:
      return null;
  }
}

/**
 * 树形数据扁平化
 * @param tree 树形数据
 * @param result 结果数组
 */
export function flattenTree<T extends { children?: T[] }>(tree: T[], result: T[] = []): T[] {
  tree.forEach(node => {
    result.push(node);
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, result);
    }
  });
  return result;
}

/**
 * 根据key查找树节点
 * @param tree 树形数据
 * @param key 节点key
 */
export function findTreeNode<T extends { key: string; children?: T[] }>(
  tree: T[],
  key: string
): T | null {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findTreeNode(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 计算树的深度
 * @param tree 树形数据
 * @param currentDepth 当前深度
 */
export function getTreeDepth<T extends { children?: T[] }>(
  tree: T[],
  currentDepth: number = 1
): number {
  if (!tree || tree.length === 0) return currentDepth - 1;
  
  let maxDepth = currentDepth;
  tree.forEach(node => {
    if (node.children && node.children.length > 0) {
      const depth = getTreeDepth(node.children, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  });
  
  return maxDepth;
}

