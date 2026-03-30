// 订单管理工具函数

import type {
  DeliveryStatusMap,
  OrderStatusMap,
} from './types';
import {
  DeliveryStatus,
  OrderStatus,
  RecordType,
} from './types';

/**
 * 生成订单编号
 * 格式：DD-YYYYMMDD-XXX
 */
export function generateOrderCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `DD-${year}${month}${day}-${random}`;
}

/**
 * 格式化金额
 * @param amount 金额（元）
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
 * @param amount 金额（元）
 * @returns 带货币符号的金额字符串
 */
export function formatCurrency(amount: number): string {
  return `¥${formatAmount(amount)}`;
}

/**
 * 金额转为万元显示
 * @param amount 金额（元）
 * @returns 万元显示的金额
 */
export function amountToWan(amount: number): number {
  return amount / 10000;
}

/**
 * 万元转为元
 * @param amount 金额（万元）
 * @returns 元
 */
export function wanToAmount(amount: number): number {
  return amount * 10000;
}

/**
 * 格式化金额为万元显示
 * @param amount 金额（元）
 * @returns 格式化后的万元字符串
 */
export function formatAmountWan(amount: number): string {
  const wan = amountToWan(amount);
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(wan);
}

/**
 * 获取订单状态映射
 */
export function getOrderStatusMap(): Record<OrderStatus, OrderStatusMap> {
  return {
    [OrderStatus.NotStarted]: { text: '待开始', color: 'default' },
    [OrderStatus.InProgress]: { text: '执行中', color: 'processing' },
    [OrderStatus.Paused]: { text: '已暂停', color: 'warning' },
    [OrderStatus.Completed]: { text: '已完成', color: 'success' },
    [OrderStatus.Cancelled]: { text: '已取消', color: 'error' },
  };
}

/**
 * 获取交付状态映射
 */
export function getDeliveryStatusMap(): Record<DeliveryStatus, DeliveryStatusMap> {
  return {
    [DeliveryStatus.NotStarted]: { text: '未开始', color: 'default' },
    [DeliveryStatus.InProgress]: { text: '进行中', color: 'processing' },
    [DeliveryStatus.Completed]: { text: '已完成', color: 'success' },
    [DeliveryStatus.Delayed]: { text: '已延期', color: 'warning' },
  };
}

/**
 * 获取记录类型文本
 */
export function getRecordTypeText(type: RecordType): string {
  const map: Record<RecordType, string> = {
    [RecordType.ProgressUpdate]: '进度更新',
    [RecordType.StatusChange]: '状态变更',
    [RecordType.ProblemRecord]: '问题记录',
    [RecordType.Other]: '其他',
  };
  return map[type];
}

/**
 * 获取订单状态文本
 */
export function getOrderStatusText(status: OrderStatus): string {
  return getOrderStatusMap()[status].text;
}

/**
 * 获取交付状态文本
 */
export function getDeliveryStatusText(status: DeliveryStatus): string {
  return getDeliveryStatusMap()[status].text;
}

/**
 * 判断订单是否可编辑
 * @param status 订单状态
 * @returns 是否可编辑
 */
export function isOrderEditable(status: OrderStatus): boolean {
  return status === OrderStatus.NotStarted || status === OrderStatus.InProgress;
}

/**
 * 判断订单是否可删除
 * @param status 订单状态
 * @returns 是否可删除
 */
export function isOrderDeletable(status: OrderStatus): boolean {
  return status === OrderStatus.NotStarted;
}

/**
 * 判断是否可以更新订单状态
 * @param currentStatus 当前状态
 * @param targetStatus 目标状态
 * @returns 是否允许
 */
export function canUpdateOrderStatus(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
  // 状态流转规则
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.NotStarted]: [OrderStatus.InProgress],
    [OrderStatus.InProgress]: [OrderStatus.Paused, OrderStatus.Completed],
    [OrderStatus.Paused]: [OrderStatus.InProgress, OrderStatus.Cancelled],
    [OrderStatus.Completed]: [],
    [OrderStatus.Cancelled]: [],
  };
  
  return allowedTransitions[currentStatus]?.includes(targetStatus) || false;
}

/**
 * 获取允许的下一状态
 * @param currentStatus 当前状态
 * @returns 允许的下一状态列表
 */
export function getAllowedNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.NotStarted]: [OrderStatus.InProgress],
    [OrderStatus.InProgress]: [OrderStatus.Paused, OrderStatus.Completed],
    [OrderStatus.Paused]: [OrderStatus.InProgress, OrderStatus.Cancelled],
    [OrderStatus.Completed]: [],
    [OrderStatus.Cancelled]: [],
  };
  
  return allowedTransitions[currentStatus] || [];
}

/**
 * 计算已完成金额
 * @param orderAmount 订单金额
 * @param progress 进度百分比
 * @returns 已完成金额
 */
export function calculateCompletedAmount(orderAmount: number, progress: number): number {
  return (orderAmount * progress) / 100;
}

/**
 * 计算剩余金额
 * @param orderAmount 订单金额
 * @param completedAmount 已完成金额
 * @returns 剩余金额
 */
export function calculateRemainingAmount(orderAmount: number, completedAmount: number): number {
  return Math.max(0, orderAmount - completedAmount);
}

/**
 * 验证进度值
 * @param progress 进度值
 * @returns 是否有效
 */
export function validateProgress(progress: number): boolean {
  return progress >= 0 && progress <= 100;
}

/**
 * 验证日期范围
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 是否有效
 */
export function validateDateRange(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return true;
  return new Date(startDate) <= new Date(endDate);
}

/**
 * 计算交付进度
 * @param plans 交付计划列表
 * @returns 完成的阶段数
 */
export function calculateDeliveryProgress(plans: { deliveryStatus: DeliveryStatus }[]): number {
  return plans.filter(p => p.deliveryStatus === DeliveryStatus.Completed).length;
}

/**
 * 判断交付计划是否延期
 * @param planEndDate 计划完成日期
 * @param actualEndDate 实际完成日期（可选）
 * @returns 是否延期
 */
export function isDeliveryDelayed(planEndDate: string, actualEndDate?: string): boolean {
  const planDate = new Date(planEndDate);
  const compareDate = actualEndDate ? new Date(actualEndDate) : new Date();
  
  return compareDate > planDate;
}

