/**
 * 项目实施模块 - 工具函数
 */

import dayjs from 'dayjs';

import {
  APPROVAL_STATUS_MAP,
  DATE_FORMAT,
  DATETIME_FORMAT,
  HARDWARE_STAGE_MAP,
  PROJECT_STATUS_MAP,
  SOFTWARE_DELIVERY_TYPE_MAP,
  TASK_STATUS_MAP,
  TASK_TYPE_MAP,
  TEMPLATE_STATUS_MAP,
  TEMPLATE_TYPE_MAP,
} from './constants';
import type {
  ApprovalStatus,
  HardwareDeliveryStage,
  ProjectStatus,
  ProjectTask,
  SoftwareDeliveryType,
  TaskStatus,
  TaskType,
  TemplateStatus,
  TemplateType,
} from './types';

// ==================== 状态工具函数 ====================

/** 获取项目状态标签 */
export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_MAP[status]?.label || status;
}

/** 获取项目状态颜色 */
export function getProjectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_MAP[status]?.color || 'default';
}

/** 获取任务状态标签 */
export function getTaskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_MAP[status]?.label || status;
}

/** 获取任务状态颜色 */
export function getTaskStatusColor(status: TaskStatus): string {
  return TASK_STATUS_MAP[status]?.color || 'default';
}

/** 获取审批状态标签 */
export function getApprovalStatusLabel(status: ApprovalStatus): string {
  return APPROVAL_STATUS_MAP[status]?.label || status;
}

/** 获取审批状态颜色 */
export function getApprovalStatusColor(status: ApprovalStatus): string {
  return APPROVAL_STATUS_MAP[status]?.color || 'default';
}

/** 获取任务类型标签 */
export function getTaskTypeLabel(type: TaskType): string {
  return TASK_TYPE_MAP[type]?.label || type;
}

/** 获取任务类型颜色 */
export function getTaskTypeColor(type: TaskType): string {
  return TASK_TYPE_MAP[type]?.color || 'default';
}

/** 获取软件交付类型标签 */
export function getSoftwareDeliveryTypeLabel(
  type: SoftwareDeliveryType,
): string {
  return SOFTWARE_DELIVERY_TYPE_MAP[type]?.label || type;
}

/** 获取硬件交付环节标签 */
export function getHardwareStageLabel(stage: HardwareDeliveryStage): string {
  return HARDWARE_STAGE_MAP[stage]?.label || stage;
}

/** 获取方案类型标签 */
export function getTemplateTypeLabel(type: TemplateType): string {
  return TEMPLATE_TYPE_MAP[type]?.label || type;
}

/** 获取方案类型颜色 */
export function getTemplateTypeColor(type: TemplateType): string {
  return TEMPLATE_TYPE_MAP[type]?.color || 'default';
}

/** 获取方案状态标签 */
export function getTemplateStatusLabel(status: TemplateStatus): string {
  return TEMPLATE_STATUS_MAP[status]?.label || status;
}

/** 获取方案状态颜色 */
export function getTemplateStatusColor(status: TemplateStatus): string {
  return TEMPLATE_STATUS_MAP[status]?.color || 'default';
}

// ==================== 日期工具函数 ====================

/** 格式化日期 */
export function formatDate(
  date?: string | Date | dayjs.Dayjs,
  format: string = DATE_FORMAT,
): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/** 格式化日期时间 */
export function formatDateTime(
  date?: string | Date | dayjs.Dayjs,
): string {
  return formatDate(date, DATETIME_FORMAT);
}

/** 计算日期范围 */
export function calculateDateRange(days: number): [string, string] {
  const endDate = dayjs();
  const startDate = endDate.subtract(days, 'day');
  return [startDate.format(DATE_FORMAT), endDate.format(DATE_FORMAT)];
}

/** 计算持续天数 */
export function calculateDuration(
  startDate: string | Date,
  endDate: string | Date,
): number {
  return dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
}

/** 判断是否延期 */
export function isDelayed(endDate: string | Date): boolean {
  return dayjs().isAfter(dayjs(endDate));
}

// ==================== 数值工具函数 ====================

/** 格式化百分比 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/** 格式化金额 */
export function formatMoney(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 计算进度 */
export function calculateProgress(
  completed: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ==================== 表单验证函数 ====================

/** 验证日期范围 */
export function validateDateRange(
  startDate?: string,
  endDate?: string,
): boolean {
  if (!startDate || !endDate) return true;
  return dayjs(startDate).isBefore(dayjs(endDate)) || dayjs(startDate).isSame(dayjs(endDate));
}

/** 验证必填项 */
export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

// ==================== 数据处理函数 ====================

/** 深拷贝 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** 生成唯一ID */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** 数组去重 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/** 数组排序 */
export function sortBy<T>(
  arr: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc',
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
}

// ==================== 树形数据处理 ====================

/** 扁平化树形数据 */
export function flattenTree<T extends { children?: T[] }>(
  tree: T[],
  childrenKey: string = 'children',
): T[] {
  const result: T[] = [];
  function traverse(nodes: T[]) {
    for (const node of nodes) {
      result.push(node);
      if (node[childrenKey]) {
        traverse(node[childrenKey]);
      }
    }
  }
  traverse(tree);
  return result;
}

/** 查找树节点 */
export function findTreeNode<T extends { children?: T[] }>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: string = 'children',
): T | null {
  for (const node of tree) {
    if (predicate(node)) return node;
    if (node[childrenKey]) {
      const found = findTreeNode(node[childrenKey], predicate, childrenKey);
      if (found) return found;
    }
  }
  return null;
}

/** 过滤树节点 */
export function filterTree<T extends { children?: T[] }>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: string = 'children',
): T[] {
  return tree
    .filter((node) => {
      if (node[childrenKey]) {
        node[childrenKey] = filterTree(node[childrenKey], predicate, childrenKey);
      }
      return predicate(node) || (node[childrenKey] && node[childrenKey].length > 0);
    })
    .map((node) => ({ ...node }));
}

// ==================== 权限判断函数 ====================

/** 判断是否有管理权限 */
export function hasManagePermission(userRole: string): boolean {
  return ['管理员', '项目总监'].includes(userRole);
}

/** 判断是否有部门权限 */
export function hasDepartmentPermission(userRole: string): boolean {
  return ['项目总监'].includes(userRole);
}

/** 判断是否是项目负责人 */
export function isProjectManager(
  userId: number,
  managerId: number,
): boolean {
  return userId === managerId;
}

/** 判断是否是任务负责人 */
export function isTaskAssignee(
  userId: number,
  assigneeId: number,
): boolean {
  return userId === assigneeId;
}

// ==================== 导出函数 ====================

/** 导出为Excel */
export async function exportToExcel(
  data: any[],
  columns: any[],
  filename: string,
): Promise<void> {
  // 使用动态导入
  const ExcelJS = (await import('exceljs')).default;
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // 添加表头
  worksheet.columns = columns.map((col) => ({
    header: col.title,
    key: col.dataIndex,
    width: col.width ? col.width / 10 : 15,
  }));

  // 添加数据
  worksheet.addRows(data);

  // 设置表头样式
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // 生成文件
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/** 导出为PDF */
export async function exportToPDF(
  title: string,
  data: any[],
  columns: any[],
  filename: string,
): Promise<void> {
  // 使用动态导入
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();
  
  // 添加标题
  doc.text(title, 14, 15);

  // 添加表格
  autoTable(doc, {
    head: [columns.map((col) => col.title)],
    body: data.map((row) =>
      columns.map((col) => row[col.dataIndex] || '-'),
    ),
    startY: 20,
  });

  // 保存文件
  doc.save(`${filename}.pdf`);
}

// ==================== 任务层级处理函数 ====================

/**
 * 计算父任务进度（子任务进度的平均值）
 */
export function calculateParentTaskProgress(children: ProjectTask[]): number {
  if (!children || children.length === 0) return 0;
  const totalProgress = children.reduce((sum, child) => sum + child.progress, 0);
  return Math.round(totalProgress / children.length);
}

/**
 * 计算父任务的开始和结束日期（取子任务的最早开始和最晚结束）
 */
export function calculateParentTaskDates(children: ProjectTask[]): {
  startDate: string;
  endDate: string;
  duration: number;
} {
  if (!children || children.length === 0) {
    const today = dayjs().format(DATE_FORMAT);
    return { startDate: today, endDate: today, duration: 1 };
  }

  const startDates = children.map((child) => dayjs(child.startDate));
  const endDates = children.map((child) => dayjs(child.endDate));

  const earliestStart = dayjs.min(startDates);
  const latestEnd = dayjs.max(endDates);

  const startDate = earliestStart.format(DATE_FORMAT);
  const endDate = latestEnd.format(DATE_FORMAT);
  const duration = calculateDuration(startDate, endDate);

  return { startDate, endDate, duration };
}

/**
 * 将扁平任务列表转换为树形结构
 */
export function buildTaskTree(tasks: ProjectTask[]): ProjectTask[] {
  if (!tasks || tasks.length === 0) return [];

  // 创建任务映射
  const taskMap = new Map<number, ProjectTask>();
  const result: ProjectTask[] = [];

  // 深拷贝任务数据，避免修改原数据
  const clonedTasks = tasks.map((task) => {
    // 移除原有的 children 属性（如果存在），确保初始化时不带空数组
    const { children, ...rest } = task;
    return { ...rest } as ProjectTask;
  });

  // 构建映射表
  clonedTasks.forEach((task) => {
    taskMap.set(task.id, task);
  });

  // 构建树形结构
  clonedTasks.forEach((task) => {
    if (task.parentId && taskMap.has(task.parentId)) {
      // 如果有父任务，添加到父任务的children中
      const parent = taskMap.get(task.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(task);
      // 标记父任务
      parent.isParent = true;
    } else {
      // 顶层任务
      result.push(task);
    }
  });

  return result;
}

/**
 * 将树形结构转换为扁平列表
 */
export function flattenTaskTree(tasks: ProjectTask[]): ProjectTask[] {
  const result: ProjectTask[] = [];

  function traverse(taskList: ProjectTask[]) {
    taskList.forEach((task) => {
      // 添加当前任务（但不包含children字段）
      const { children, ...taskWithoutChildren } = task;
      result.push(taskWithoutChildren as ProjectTask);

      // 递归处理子任务
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  }

  traverse(tasks);
  return result;
}

/**
 * 获取任务的所有子任务ID（递归）
 */
export function getChildTaskIds(task: ProjectTask): number[] {
  const ids: number[] = [];

  function collect(t: ProjectTask) {
    if (t.children && t.children.length > 0) {
      t.children.forEach((child) => {
        ids.push(child.id);
        collect(child);
      });
    }
  }

  collect(task);
  return ids;
}

/**
 * 检查任务是否可以有子任务（已经是子任务的不能再有子任务）
 */
export function canHaveChildren(task: ProjectTask, allTasks: ProjectTask[]): boolean {
  // 如果任务已经有父任务，则不能再有子任务（最多两层）
  return !task.parentId;
}

/**
 * 更新父任务的计算属性
 */
export function updateParentTaskProperties(
  parentTask: ProjectTask,
  allTasks: ProjectTask[],
): ProjectTask {
  // 获取所有子任务
  const children = allTasks.filter((t) => t.parentId === parentTask.id);

  if (children.length === 0) {
    return { ...parentTask, isParent: false };
  }

  // 计算进度
  const progress = calculateParentTaskProgress(children);

  // 计算日期范围
  const { startDate, endDate, duration } = calculateParentTaskDates(children);

  return {
    ...parentTask,
    progress,
    startDate,
    endDate,
    duration,
    isParent: true,
  };
}

