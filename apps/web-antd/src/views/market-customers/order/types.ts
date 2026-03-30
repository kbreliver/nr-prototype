// 订单管理相关类型定义

// 订单状态枚举
export enum OrderStatus {
  NotStarted = 1, // 待开始
  InProgress = 2, // 执行中
  Paused = 3, // 已暂停
  Completed = 4, // 已完成
  Cancelled = 5, // 已取消
}

// 交付状态枚举
export enum DeliveryStatus {
  NotStarted = 1, // 未开始
  InProgress = 2, // 进行中
  Completed = 3, // 已完成
  Delayed = 4, // 已延期
}

// 执行记录类型枚举
export enum RecordType {
  ProgressUpdate = 1, // 进度更新
  StatusChange = 2, // 状态变更
  ProblemRecord = 3, // 问题记录
  Other = 4, // 其他
}

// 订单状态映射类型
export interface OrderStatusMap {
  text: string;
  color: string;
}

// 交付状态映射类型
export interface DeliveryStatusMap {
  text: string;
  color: string;
}

// 订单基本信息
export interface Order {
  id?: number;
  orderCode: string; // 订单编号
  orderName: string; // 订单名称
  customerId: number; // 客户ID
  customerName: string; // 客户名称
  contractId: number; // 关联合同ID
  contractCode: string; // 合同编号
  contractName?: string; // 合同名称
  projectId?: number; // 关联项目ID
  projectCode?: string; // 项目编号
  projectName?: string; // 项目名称
  orderAmount: number; // 订单金额(元)
  completedAmount: number; // 已完成金额(元)
  planStartDate?: string; // 计划开始日期
  planEndDate?: string; // 计划完成日期
  actualStartDate?: string; // 实际开始日期
  actualEndDate?: string; // 实际完成日期
  orderStatus: OrderStatus; // 订单状态
  progress: number; // 执行进度(0-100)
  responsiblePerson: string; // 订单负责人
  responsiblePersonId?: number; // 负责人ID
  remark?: string; // 备注说明
  createBy?: number;
  createByName?: string;
  createTime?: string;
  updateBy?: number;
  updateByName?: string;
  updateTime?: string;
}

// 交付计划
export interface DeliveryPlan {
  id?: number;
  orderId?: number;
  stageOrder: number; // 阶段序号
  deliveryContent: string; // 交付内容
  planStartDate: string; // 计划开始日期
  planEndDate: string; // 计划完成日期
  actualStartDate?: string; // 实际开始日期
  actualEndDate?: string; // 实际完成日期
  deliveryStatus: DeliveryStatus; // 交付状态
  remark?: string; // 备注
}

// 执行记录
export interface ExecutionRecord {
  id?: number;
  orderId: number; // 订单ID
  recordTime: string; // 记录时间
  executor: string; // 执行人
  executorId?: number; // 执行人ID
  recordType: RecordType; // 记录类型
  content: string; // 执行内容
  attachments?: string[]; // 附件列表
  createTime?: string;
}

// 订单搜索表单
export interface OrderSearchForm {
  keyword?: string; // 关键字(订单名称或编号)
  customerName?: string; // 客户名称
  orderStatus?: OrderStatus; // 订单状态
  contractCode?: string; // 关联合同
  responsiblePerson?: string; // 负责人
  createDateRange?: [string, string]; // 创建日期范围
}

// 订单表单
export interface OrderForm {
  orderName: string; // 订单名称
  contractId?: number; // 关联合同ID
  contractCode?: string; // 合同编号
  contractName?: string; // 合同名称
  customerId?: number; // 客户ID
  customerName?: string; // 客户名称
  orderAmount: number; // 订单金额(万元)
  planStartDate?: string; // 计划开始日期
  planEndDate?: string; // 计划完成日期
  responsiblePersonId?: number; // 负责人ID
  responsiblePerson?: string; // 负责人姓名
  remark?: string; // 备注说明
}

// 订单统计数据
export interface OrderStatistics {
  orderAmount: number; // 订单金额
  completedAmount: number; // 已完成金额
  remainingAmount: number; // 剩余金额
  progress: number; // 执行进度
  projectCount: number; // 关联项目数
}

