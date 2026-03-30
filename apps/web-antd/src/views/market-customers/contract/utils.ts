// 合同管理工具函数

import type {
  ApprovalStatusMap,
  ContractStatusMap,
} from './types';
import {
  ApprovalStatus,
  ContractStatus,
  ContractType,
  PaymentMethod,
} from './types';

/**
 * 生成合同编号
 * 格式：HT-YYYYMMDD-XXX
 */
export function generateContractCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `HT-${year}${month}${day}-${random}`;
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
 * 计算回款率
 * @param paidAmount 已回款金额
 * @param totalAmount 合同总金额
 * @returns 回款率百分比（保留2位小数）
 */
export function calculatePaymentRate(paidAmount: number, totalAmount: number): number {
  if (totalAmount === 0) return 0;
  return Math.round((paidAmount / totalAmount) * 10000) / 100;
}

/**
 * 计算未回款金额
 * @param totalAmount 合同总金额
 * @param paidAmount 已回款金额
 * @returns 未回款金额
 */
export function calculateUnpaidAmount(totalAmount: number, paidAmount: number): number {
  return Math.max(0, totalAmount - paidAmount);
}

/**
 * 获取合同状态映射
 */
export function getContractStatusMap(): Record<ContractStatus, ContractStatusMap> {
  return {
    [ContractStatus.Draft]: { text: '草稿', color: 'default' },
    [ContractStatus.Approving]: { text: '审批中', color: 'processing' },
    [ContractStatus.Signed]: { text: '已签订', color: 'success' },
    [ContractStatus.Completed]: { text: '已完成', color: 'success' },
    [ContractStatus.Terminated]: { text: '已终止', color: 'error' },
  };
}

/**
 * 获取审批状态映射
 */
export function getApprovalStatusMap(): Record<ApprovalStatus, ApprovalStatusMap> {
  return {
    [ApprovalStatus.NotSubmitted]: { text: '待提交', color: 'default' },
    [ApprovalStatus.Approving]: { text: '审批中', color: 'processing' },
    [ApprovalStatus.Approved]: { text: '已通过', color: 'success' },
    [ApprovalStatus.Rejected]: { text: '已驳回', color: 'error' },
  };
}

/**
 * 获取合同类型文本
 */
export function getContractTypeText(type?: ContractType): string {
  const map: Record<ContractType, string> = {
    [ContractType.Sales]: '销售合同',
    [ContractType.Service]: '服务合同',
    [ContractType.Purchase]: '采购合同',
    [ContractType.Other]: '其他',
  };
  return type ? map[type] : '-';
}

/**
 * 获取回款方式文本
 */
export function getPaymentMethodText(method?: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    [PaymentMethod.BankTransfer]: '银行转账',
    [PaymentMethod.Check]: '支票',
    [PaymentMethod.Cash]: '现金',
    [PaymentMethod.Other]: '其他',
  };
  return method ? map[method] : '-';
}

/**
 * 获取合同状态文本
 */
export function getContractStatusText(status: ContractStatus): string {
  return getContractStatusMap()[status].text;
}

/**
 * 获取审批状态文本
 */
export function getApprovalStatusText(status: ApprovalStatus): string {
  return getApprovalStatusMap()[status].text;
}

/**
 * 判断合同是否可编辑
 * @param status 合同状态
 * @returns 是否可编辑
 */
export function isContractEditable(status: ContractStatus): boolean {
  return status === ContractStatus.Draft;
}

/**
 * 判断合同是否可删除
 * @param status 合同状态
 * @param orderCount 订单数量
 * @returns 是否可删除
 */
export function isContractDeletable(status: ContractStatus, orderCount: number): boolean {
  return status === ContractStatus.Draft && orderCount === 0;
}

/**
 * 判断合同是否可提交审批
 * @param status 合同状态
 * @param approvalStatus 审批状态
 * @returns 是否可提交审批
 */
export function canSubmitApproval(status: ContractStatus, approvalStatus: ApprovalStatus): boolean {
  return status === ContractStatus.Draft && 
         (approvalStatus === ApprovalStatus.NotSubmitted || approvalStatus === ApprovalStatus.Rejected);
}

/**
 * 判断合同是否可添加回款记录
 * @param status 合同状态
 * @returns 是否可添加回款记录
 */
export function canAddPaymentRecord(status: ContractStatus): boolean {
  return status === ContractStatus.Signed || status === ContractStatus.Completed;
}

/**
 * 判断合同是否可创建订单
 * @param status 合同状态
 * @param approvalStatus 审批状态
 * @returns 是否可创建订单
 */
export function canCreateOrder(status: ContractStatus, approvalStatus: ApprovalStatus): boolean {
  return status === ContractStatus.Signed && approvalStatus === ApprovalStatus.Approved;
}

/**
 * 验证回款计划总额是否等于合同金额
 * @param plans 回款计划列表
 * @param contractAmount 合同金额
 * @returns 是否相等
 */
export function validatePaymentPlanTotal(plans: { planAmount: number }[], contractAmount: number): boolean {
  const total = plans.reduce((sum, plan) => sum + plan.planAmount, 0);
  return Math.abs(total - contractAmount) < 0.01; // 允许0.01元的误差
}

/**
 * 验证实际回款总额是否超过合同金额
 * @param records 回款记录列表
 * @param contractAmount 合同金额
 * @returns 是否超额
 */
export function validateActualPaymentTotal(records: { actualAmount?: number }[], contractAmount: number): boolean {
  const total = records.reduce((sum, record) => sum + (record.actualAmount || 0), 0);
  return total <= contractAmount;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
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
 * 获取回款状态文本
 * @param status 回款状态
 * @returns 状态文本
 */
export function getPaymentStatusText(status: number): string {
  return status === 2 ? '已回款' : '未回款';
}

/**
 * 获取回款状态颜色
 * @param status 回款状态
 * @returns 颜色
 */
export function getPaymentStatusColor(status: number): string {
  return status === 2 ? 'success' : 'warning';
}
