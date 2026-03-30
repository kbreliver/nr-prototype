/**
 * 项目实施模块 - 常量定义
 */

import {
  ApprovalStatus,
  HardwareDeliveryStage,
  ProjectStatus,
  SoftwareDeliveryType,
  TaskStatus,
  TaskType,
  TemplateStatus,
  TemplateType,
} from './types';

// ==================== 状态选项 ====================

/** 项目状态选项 */
export const PROJECT_STATUS_OPTIONS = [
  { label: '待启动', value: ProjectStatus.PENDING_START, color: 'default' },
  { label: '实施中', value: ProjectStatus.IN_IMPLEMENTATION, color: 'processing' },
  { label: '运行中', value: ProjectStatus.IN_OPERATION, color: 'blue' },
  { label: '已暂停', value: ProjectStatus.PAUSED, color: 'warning' },
  { label: '已结项', value: ProjectStatus.COMPLETED, color: 'success' },
  { label: '已取消', value: ProjectStatus.CANCELLED, color: 'error' },
];

/** 任务状态选项 */
export const TASK_STATUS_OPTIONS = [
  { label: '待办', value: TaskStatus.PENDING, color: 'default' },
  { label: '进行中', value: TaskStatus.IN_PROGRESS, color: 'processing' },
  { label: '已完成', value: TaskStatus.COMPLETED, color: 'success' },
];

/** 审批状态选项 */
export const APPROVAL_STATUS_OPTIONS = [
  { label: '待审批', value: ApprovalStatus.PENDING, color: 'default' },
  { label: '审批中', value: ApprovalStatus.IN_PROGRESS, color: 'processing' },
  { label: '已通过', value: ApprovalStatus.APPROVED, color: 'success' },
  { label: '已拒绝', value: ApprovalStatus.REJECTED, color: 'error' },
];

/** 任务类型选项 */
export const TASK_TYPE_OPTIONS = [
  { label: '软件交付', value: TaskType.SOFTWARE, color: 'blue' },
  { label: '硬件交付', value: TaskType.HARDWARE, color: 'orange' },
  { label: '其他', value: TaskType.OTHER, color: 'default' },
];

/** 软件交付类型选项 */
export const SOFTWARE_DELIVERY_TYPE_OPTIONS = [
  { label: '账户开通', value: SoftwareDeliveryType.ACCOUNT_SETUP },
  { label: '账号创建', value: SoftwareDeliveryType.ACCOUNT_CREATE },
  { label: '模块启用', value: SoftwareDeliveryType.MODULE_ENABLE },
];

/** 硬件交付环节选项 */
export const HARDWARE_STAGE_OPTIONS = [
  { label: '硬件发货', value: HardwareDeliveryStage.SHIPMENT },
  { label: '到货验收', value: HardwareDeliveryStage.RECEIPT },
  { label: '安装调试', value: HardwareDeliveryStage.INSTALLATION },
  { label: '安装完成确认', value: HardwareDeliveryStage.CONFIRMATION },
];

/** 方案类型选项 */
export const TEMPLATE_TYPE_OPTIONS = [
  { label: '标准型', value: TemplateType.STANDARD, color: 'blue' },
  { label: '快速型', value: TemplateType.FAST, color: 'green' },
  { label: '定制型', value: TemplateType.CUSTOM, color: 'purple' },
];

/** 方案状态选项 */
export const TEMPLATE_STATUS_OPTIONS = [
  { label: '启用', value: TemplateStatus.ENABLED, color: 'success' },
  { label: '停用', value: TemplateStatus.DISABLED, color: 'default' },
];

// ==================== 状态映射 ====================

/** 项目状态映射 */
export const PROJECT_STATUS_MAP = Object.fromEntries(
  PROJECT_STATUS_OPTIONS.map((item) => [item.value, item]),
);

/** 任务状态映射 */
export const TASK_STATUS_MAP = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((item) => [item.value, item]),
);

/** 审批状态映射 */
export const APPROVAL_STATUS_MAP = Object.fromEntries(
  APPROVAL_STATUS_OPTIONS.map((item) => [item.value, item]),
);

/** 任务类型映射 */
export const TASK_TYPE_MAP = Object.fromEntries(
  TASK_TYPE_OPTIONS.map((item) => [item.value, item]),
);

/** 软件交付类型映射 */
export const SOFTWARE_DELIVERY_TYPE_MAP = Object.fromEntries(
  SOFTWARE_DELIVERY_TYPE_OPTIONS.map((item) => [item.value, item]),
);

/** 硬件交付环节映射 */
export const HARDWARE_STAGE_MAP = Object.fromEntries(
  HARDWARE_STAGE_OPTIONS.map((item) => [item.value, item]),
);

/** 方案类型映射 */
export const TEMPLATE_TYPE_MAP = Object.fromEntries(
  TEMPLATE_TYPE_OPTIONS.map((item) => [item.value, item]),
);

/** 方案状态映射 */
export const TEMPLATE_STATUS_MAP = Object.fromEntries(
  TEMPLATE_STATUS_OPTIONS.map((item) => [item.value, item]),
);

// ==================== 其他常量 ====================

/** 分页大小选项 */
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20;

/** 日期格式 */
export const DATE_FORMAT = 'YYYY-MM-DD';

/** 日期时间格式 */
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 时间范围选项 */
export const TIME_RANGE_OPTIONS = [
  { label: '最近7天', value: 7 },
  { label: '最近30天', value: 30 },
  { label: '最近90天', value: 90 },
  { label: '自定义', value: 0 },
];

