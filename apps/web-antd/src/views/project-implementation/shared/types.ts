/**
 * 项目实施模块 - 类型定义
 */

// ==================== 枚举类型 ====================

/** 项目状态 */
export enum ProjectStatus {
  /** 待启动 */
  PENDING_START = 'pending_start',
  /** 实施中 */
  IN_IMPLEMENTATION = 'in_implementation',
  /** 运行中 */
  IN_OPERATION = 'in_operation',
  /** 已暂停 */
  PAUSED = 'paused',
  /** 已结项 */
  COMPLETED = 'completed',
  /** 已取消 */
  CANCELLED = 'cancelled',
}

/** 任务状态 */
export enum TaskStatus {
  /** 待办 */
  PENDING = 'pending',
  /** 进行中 */
  IN_PROGRESS = 'in_progress',
  /** 已完成 */
  COMPLETED = 'completed',
}

/** 审批状态 */
export enum ApprovalStatus {
  /** 待审批 */
  PENDING = 'pending',
  /** 审批中 */
  IN_PROGRESS = 'in_progress',
  /** 已通过 */
  APPROVED = 'approved',
  /** 已拒绝 */
  REJECTED = 'rejected',
}

/** 任务类型 */
export enum TaskType {
  /** 软件交付 */
  SOFTWARE = 'software',
  /** 硬件交付 */
  HARDWARE = 'hardware',
  /** 其他 */
  OTHER = 'other',
}

/** 软件交付任务类型 */
export enum SoftwareDeliveryType {
  /** 账户开通 */
  ACCOUNT_SETUP = 'account_setup',
  /** 账号创建 */
  ACCOUNT_CREATE = 'account_create',
  /** 模块启用 */
  MODULE_ENABLE = 'module_enable',
}

/** 硬件交付环节 */
export enum HardwareDeliveryStage {
  /** 硬件发货 */
  SHIPMENT = 'shipment',
  /** 到货验收 */
  RECEIPT = 'receipt',
  /** 安装调试 */
  INSTALLATION = 'installation',
  /** 安装完成确认 */
  CONFIRMATION = 'confirmation',
}

/** 方案类型 */
export enum TemplateType {
  /** 标准型 */
  STANDARD = 'standard',
  /** 快速型 */
  FAST = 'fast',
  /** 定制型 */
  CUSTOM = 'custom',
}

/** 方案状态 */
export enum TemplateStatus {
  /** 启用 */
  ENABLED = 'enabled',
  /** 停用 */
  DISABLED = 'disabled',
}

// ==================== 数据类型 ====================

/** 项目信息 */
export interface Project {
  id: number;
  code: string;
  name: string;
  orderId: number;
  orderCode: string;
  orderName: string;
  customerId: number;
  customerName: string;
  status: ProjectStatus;
  progress: number;
  managerId: number;
  managerName: string;
  description?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** 项目任务（实施计划中的任务） */
export interface ProjectTask {
  id: number;
  projectId: number;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  status: TaskStatus;
  assigneeId: number;
  assigneeName: string;
  dependencies?: number[];
  description?: string;
  isMilestone?: boolean;
  parentId?: number;
  isParent?: boolean;
  children?: ProjectTask[];
}

/** 交付任务（任务执行中的任务） */
export interface DeliveryTask {
  id: number;
  projectId: number;
  projectName: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  assigneeId: number;
  assigneeName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** 软件交付任务 */
export interface SoftwareDeliveryTask extends DeliveryTask {
  type: TaskType.SOFTWARE;
  deliveryType: SoftwareDeliveryType;
  accountInfo?: {
    url?: string;
    username?: string;
    password?: string;
    notes?: string;
  };
  moduleConfig?: ModuleConfig[];
}

/** 硬件交付任务 */
export interface HardwareDeliveryTask extends DeliveryTask {
  type: TaskType.HARDWARE;
  stages: HardwareStageInfo[];
}

/** 硬件交付环节信息 */
export interface HardwareStageInfo {
  stage: HardwareDeliveryStage;
  status: TaskStatus;
  completedAt?: string;
  operatorId?: number;
  operatorName?: string;
  data?: any;
}

/** 模块配置 */
export interface ModuleConfig {
  id: number;
  productId: number;
  productName: string;
  moduleTree: ModuleNode[];
}

/** 模块树节点 */
export interface ModuleNode {
  id: string;
  name: string;
  path: string;
  enabled: boolean;
  enabledTime?: string;
  operatorId?: number;
  operatorName?: string;
  children?: ModuleNode[];
}

/** 项目审批记录 */
export interface ProjectApproval {
  id: number;
  projectId: number;
  node: string;
  approverId: number;
  approverName: string;
  status: ApprovalStatus;
  opinion?: string;
  approvedAt?: string;
  createdAt: string;
}

/** 监控数据 */
export interface MonitorData {
  projectId: number;
  date: string;
  pv: number;
  uv: number;
  onlineUsers: number;
  errorCount: number;
}

/** 模块使用情况 */
export interface ModuleUsage {
  moduleId: string;
  moduleName: string;
  usageCount: number;
  usageRate: number;
  lastUsedAt?: string;
  status: 'active' | 'inactive';
}

/** 异常记录 */
export interface ErrorRecord {
  id: number;
  projectId: number;
  moduleId: string;
  moduleName: string;
  errorType: string;
  errorMessage: string;
  status: 'pending' | 'processing' | 'resolved' | 'ignored';
  solution?: string;
  handlerId?: number;
  handlerName?: string;
  occurredAt: string;
  resolvedAt?: string;
}

/** 实施方案模板 */
export interface ImplementationTemplate {
  id: number;
  code: string;
  name: string;
  type: TemplateType;
  status: TemplateStatus;
  description?: string;
  tasks: TemplateTask[];
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 方案任务模板 */
export interface TemplateTask {
  id: number;
  templateId: number;
  name: string;
  order: number;
  plannedDays: number;
  roleId?: number;
  roleName?: string;
  dependencies?: number[];
  description?: string;
}

/** 项目日志 */
export interface ProjectLog {
  id: number;
  projectId: number;
  time: string;
  user: string;
  operation: string;
  description: string;
}

// ==================== 表单类型 ====================

/** 项目表单 */
export interface ProjectForm {
  name: string;
  orderId: number;
  managerId: number;
  description?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
}

/** 任务表单 */
export interface TaskForm {
  name: string;
  startDate: string | any; // 支持字符串和 Dayjs 对象
  endDate: string | any; // 支持字符串和 Dayjs 对象
  assigneeId: number;
  dependencies?: number[];
  description?: string;
  isMilestone?: boolean;
}

/** 方案表单 */
export interface TemplateForm {
  name: string;
  type: TemplateType;
  description?: string;
}

// ==================== 查询参数类型 ====================

/** 项目查询参数 */
export interface ProjectQuery {
  keyword?: string;
  orderId?: number;
  status?: ProjectStatus[];
  managerId?: number[];
  customerId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 任务查询参数 */
export interface TaskQuery {
  projectId?: number;
  type?: TaskType;
  status?: TaskStatus[];
  assigneeId?: number[];
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 方案查询参数 */
export interface TemplateQuery {
  keyword?: string;
  type?: TemplateType[];
  status?: TemplateStatus[];
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}
