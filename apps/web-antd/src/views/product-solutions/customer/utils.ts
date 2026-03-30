/**
 * 客户方案模块 - 工具函数
 */

import dayjs from 'dayjs';
import type { SolutionStatusMap, ApprovalResultMap } from './types';
import { SolutionStatus, ApprovalResult } from './types';

/**
 * 生成方案编号
 * 格式：CS-YYYYMMDD-XXX
 * @param sequence 序号（可选）
 * @returns 方案编号
 */
export function generateSolutionCode(sequence?: number): string {
  const dateStr = dayjs().format('YYYYMMDD');
  const seq = sequence ? String(sequence).padStart(3, '0') : '001';
  return `CS-${dateStr}-${seq}`;
}

/**
 * 格式化金额
 * @param amount 金额
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * 格式化金额（带货币符号）
 * @param amount 金额
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return `¥${formatAmount(amount, decimals)}`;
}

/**
 * 数字转中文大写金额
 * @param amount 金额
 * @returns 中文大写金额
 */
export function convertAmountToChinese(amount: number): string {
  // 中文数字
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  // 基本单位
  const cnIntRadice = ['', '拾', '佰', '仟'];
  // 对应整数部分扩展单位
  const cnIntUnits = ['', '万', '亿', '兆'];
  // 对应小数部分单位
  const cnDecUnits = ['角', '分'];
  // 整数金额时后面跟的字符
  const cnInteger = '整';
  // 整型完以后的单位
  const cnIntLast = '元';
  // 最大处理的数字
  const maxNum = 9999999999999999.99;
  
  // 金额整数部分
  let integerNum: number;
  // 金额小数部分
  let decimalNum: number;
  // 输出的中文金额字符串
  let chineseStr = '';
  
  if (amount === 0) {
    return cnNums[0] + cnIntLast + cnInteger;
  }
  
  // 转换为字符串
  amount = Math.abs(amount);
  
  if (amount >= maxNum) {
    return '金额过大，无法转换';
  }
  
  // 转换为字符串
  const amountStr = amount.toFixed(2);
  const parts = amountStr.split('.');
  
  integerNum = Number.parseInt(parts[0], 10);
  decimalNum = Number.parseInt(parts[1], 10);
  
  // 获取整型部分转换
  if (integerNum > 0) {
    let zeroCount = 0;
    const IntLen = String(integerNum).length;
    
    for (let i = 0; i < IntLen; i++) {
      const n = String(integerNum).substring(i, i + 1);
      const p = IntLen - i - 1;
      const q = p / 4;
      const m = p % 4;
      
      if (n === '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        // 归零
        zeroCount = 0;
        chineseStr += cnNums[Number.parseInt(n, 10)] + cnIntRadice[m];
      }
      
      if (m === 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  
  // 小数部分
  if (decimalNum > 0) {
    const decStr = String(decimalNum);
    
    for (let i = 0; i < decStr.length; i++) {
      const n = decStr.substring(i, i + 1);
      if (n !== '0') {
        chineseStr += cnNums[Number.parseInt(n, 10)] + cnDecUnits[i];
      }
    }
  }
  
  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum === 0) {
    chineseStr += cnInteger;
  }
  
  return chineseStr;
}

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format);
}

/**
 * 获取方案状态映射
 * @returns 方案状态映射对象
 */
export function getSolutionStatusMap(): Record<number, SolutionStatusMap> {
  return {
    [SolutionStatus.Draft]: { text: '草稿', color: 'default' },
    [SolutionStatus.Approving]: { text: '审批中', color: 'processing' },
    [SolutionStatus.Published]: { text: '已发布', color: 'success' },
    [SolutionStatus.Rejected]: { text: '已驳回', color: 'error' },
  };
}

/**
 * 获取审批结果映射
 * @returns 审批结果映射对象
 */
export function getApprovalResultMap(): Record<number, ApprovalResultMap> {
  return {
    [ApprovalResult.Pending]: { text: '待审批', color: 'default' },
    [ApprovalResult.Approved]: { text: '通过', color: 'success' },
    [ApprovalResult.Rejected]: { text: '驳回', color: 'error' },
  };
}

/**
 * 计算小计
 * @param quantity 数量
 * @param unitPrice 单价
 * @returns 小计
 */
export function calculateSubtotal(quantity: number, unitPrice: number): number {
  return Number((quantity * unitPrice).toFixed(2));
}

/**
 * 计算折扣金额
 * @param subtotal 小计
 * @param discountRate 折扣率（百分比，如90表示90%即打9折，100表示原价无折扣）
 * @returns 折扣金额（减少的金额）
 */
export function calculateDiscountAmount(subtotal: number, discountRate: number): number {
  return Number((subtotal * (100 - discountRate) / 100).toFixed(2));
}

/**
 * 计算总价
 * @param subtotal 小计
 * @param discountAmount 折扣金额
 * @param additionalFee 附加费用
 * @returns 总价
 */
export function calculateTotalAmount(
  subtotal: number,
  discountAmount: number,
  additionalFee: number
): number {
  return Number((subtotal - discountAmount + additionalFee).toFixed(2));
}

/**
 * 验证方案编号格式
 * @param code 方案编号
 * @returns 是否有效
 */
export function validateSolutionCode(code: string): boolean {
  const pattern = /^CS-\d{8}-\d{3}$/;
  return pattern.test(code);
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function validatePhone(phone: string): boolean {
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phone);
}

/**
 * 获取审批节点名称
 * @param nodeId 节点ID
 * @returns 节点名称
 */
export function getApprovalNodeName(nodeId: number): string {
  const nodeNames: Record<number, string> = {
    1: '部门市场负责人',
    2: '部门商务负责人',
    3: '部门经理',
  };
  return nodeNames[nodeId] || '未知节点';
}

/**
 * 获取下一个审批节点
 * @param currentNode 当前节点
 * @returns 下一个审批节点ID，如果没有则返回null
 */
export function getNextApprovalNode(currentNode: number): number | null {
  const nodeSequence = [1, 2, 3]; // 部门市场负责人 -> 部门商务负责人 -> 部门经理
  
  const currentIndex = nodeSequence.indexOf(currentNode);
  
  if (currentIndex < nodeSequence.length - 1) {
    return nodeSequence[currentIndex + 1];
  }
  
  return null; // 无下一个节点
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

