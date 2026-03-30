/**
 * 客户方案模块 - 类型定义
 */

// ==================== 枚举定义 ====================

/**
 * 方案状态枚举
 */
export enum SolutionStatus {
  /** 草稿 */
  Draft = 1,
  /** 审批中 */
  Approving = 2,
  /** 已发布 */
  Published = 3,
  /** 已驳回 */
  Rejected = 4,
}

/**
 * 方案类型枚举
 */
export enum SolutionType {
  /** 标准方案 */
  Standard = 1,
  /** 定制方案 */
  Custom = 2,
}

/**
 * 审批结果枚举
 */
export enum ApprovalResult {
  /** 待审批 */
  Pending = 1,
  /** 通过 */
  Approved = 2,
  /** 驳回 */
  Rejected = 3,
}

/**
 * 审批节点枚举
 */
export enum ApprovalNode {
  /** 部门市场负责人 */
  MarketingManager = 1,
  /** 部门商务负责人 */
  BusinessManager = 2,
  /** 部门经理 */
  DepartmentManager = 3,
}

// ==================== 基础接口定义 ====================

/**
 * 客户方案基本信息
 */
export interface CustomerSolution {
  /** 主键ID */
  id: number;
  /** 方案编号 */
  solutionCode: string;
  /** 方案名称 */
  solutionName: string;
  /** 客户名称 */
  customerName: string;
  /** 客户联系人 */
  customerContact?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 方案类型 */
  solutionType: SolutionType;
  /** 行业领域 */
  industry?: string;
  /** 方案状态 */
  status: SolutionStatus;
  /** 方案说明 */
  description?: string;
  /** 总金额 */
  totalAmount: number;
  /** 创建人ID */
  createBy: number;
  /** 创建人姓名 */
  createByName: string;
  /** 创建时间 */
  createTime: string;
  /** 更新人ID */
  updateBy?: number;
  /** 更新人姓名 */
  updateByName?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 软件产品配置项
 */
export interface SoftwareConfigItem {
  /** 主键ID */
  id?: number;
  /** 方案ID */
  solutionId?: number;
  /** 产品ID */
  productId: number;
  /** 产品名称 */
  productName: string;
  /** 产品版本 */
  productVersion: string;
  /** 授权方式 */
  licenseType: string;
  /** 数量 */
  quantity: number;
  /** 单价 */
  unitPrice: number;
  /** 折扣率（百分比） */
  discountRate?: number;
  /** 折扣后单价 */
  discountedPrice?: number;
  /** 小计 */
  subtotal: number;
  /** 配置说明 */
  configNote?: string;
}

/**
 * 硬件设备配置项
 */
export interface HardwareConfigItem {
  /** 主键ID */
  id?: number;
  /** 方案ID */
  solutionId?: number;
  /** 设备ID */
  deviceId: number;
  /** 设备名称 */
  deviceName: string;
  /** 设备型号 */
  deviceModel: string;
  /** 数量 */
  quantity: number;
  /** 单价 */
  unitPrice: number;
  /** 折扣率（百分比） */
  discountRate?: number;
  /** 折扣后单价 */
  discountedPrice?: number;
  /** 小计 */
  subtotal: number;
  /** 配置说明 */
  configNote?: string;
}

/**
 * 服务项目配置项
 */
export interface ServiceConfigItem {
  /** 主键ID */
  id?: number;
  /** 方案ID */
  solutionId?: number;
  /** 服务ID */
  serviceId: number;
  /** 服务名称 */
  serviceName: string;
  /** 服务类型 */
  serviceType: string;
  /** 数量 */
  quantity: number;
  /** 单价 */
  unitPrice: number;
  /** 折扣率（百分比） */
  discountRate?: number;
  /** 折扣后单价 */
  discountedPrice?: number;
  /** 小计 */
  subtotal: number;
  /** 服务说明 */
  serviceNote?: string;
}

/**
 * 方案配置信息（包含所有配置项）
 */
export interface SolutionConfig {
  /** 软件产品列表 */
  softwareList: SoftwareConfigItem[];
  /** 硬件设备列表 */
  hardwareList: HardwareConfigItem[];
  /** 服务项目列表 */
  serviceList: ServiceConfigItem[];
}

/**
 * 方案报价信息
 */
export interface SolutionQuotation {
  /** 方案ID */
  solutionId: number;
  /** 软件产品费用 */
  softwareAmount: number;
  /** 硬件设备费用 */
  hardwareAmount: number;
  /** 服务项目费用 */
  serviceAmount: number;
  /** 费用小计 */
  subtotalAmount: number;
  /** 折扣率（百分比） */
  discountRate: number;
  /** 折扣金额 */
  discountAmount: number;
  /** 附加费用 */
  additionalFee: number;
  /** 方案总价 */
  totalAmount: number;
  /** 总价大写 */
  totalAmountChinese: string;
  /** 报价有效期（日期） */
  validityDate?: string;
  /** 报价说明 */
  quotationNote?: string;
}

/**
 * 审批记录
 */
export interface ApprovalRecord {
  /** 主键ID */
  id: number;
  /** 方案ID */
  solutionId: number;
  /** 审批节点 */
  approvalNode: ApprovalNode;
  /** 审批节点名称 */
  approvalNodeName: string;
  /** 审批人ID */
  approverId: number;
  /** 审批人姓名 */
  approverName: string;
  /** 审批时间 */
  approvalTime: string;
  /** 审批结果 */
  approvalResult: ApprovalResult;
  /** 审批意见 */
  approvalComment?: string;
  /** 节点顺序 */
  nodeOrder: number;
}

/**
 * 审批流程节点信息
 */
export interface ApprovalFlowNode {
  /** 节点编号 */
  nodeId: ApprovalNode;
  /** 节点名称 */
  nodeName: string;
  /** 节点顺序 */
  nodeOrder: number;
  /** 节点状态 */
  status: 'pending' | 'approved' | 'rejected' | 'waiting';
  /** 审批人 */
  approver?: string;
  /** 审批时间 */
  approvalTime?: string;
  /** 审批意见 */
  comment?: string;
}

// ==================== 表单定义 ====================

/**
 * 搜索表单
 */
export interface SearchForm {
  /** 方案名称 */
  solutionName?: string;
  /** 客户名称 */
  customerName?: string;
  /** 方案状态 */
  status?: SolutionStatus | string;
  /** 创建时间范围 */
  createTimeRange?: [string, string];
}

/**
 * 方案基本信息表单
 */
export interface SolutionForm {
  /** 方案编号 */
  solutionCode: string;
  /** 方案名称 */
  solutionName: string;
  /** 客户名称 */
  customerName: string;
  /** 客户联系人 */
  customerContact?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 方案类型 */
  solutionType: SolutionType;
  /** 行业领域 */
  industry?: string;
  /** 方案说明 */
  description?: string;
}

/**
 * 软件产品选择项
 */
export interface SoftwareProduct {
  /** 产品ID */
  id: number;
  /** 产品编码 */
  productCode: string;
  /** 产品名称 */
  productName: string;
  /** 当前版本 */
  currentVersion: string;
  /** 授权类型列表 */
  licenseTypes: string[];
  /** 单价 */
  unitPrice: number;
}

/**
 * 硬件设备选择项
 */
export interface HardwareDevice {
  /** 设备ID */
  id: number;
  /** 设备编码 */
  deviceCode: string;
  /** 设备名称 */
  deviceName: string;
  /** 设备型号 */
  deviceModel: string;
  /** 单价 */
  unitPrice: number;
  /** 状态：1-启用，0-停用 */
  status?: number;
  /** 库存数量 */
  stock?: number;
  /** 设备描述 */
  description?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 品牌 */
  brand?: string;
}

/**
 * 服务项目选择项
 */
export interface ServiceItem {
  /** 服务ID */
  id: number;
  /** 服务编码 */
  serviceCode: string;
  /** 服务名称 */
  serviceName: string;
  /** 服务类型 */
  serviceType: string;
  /** 单价 */
  unitPrice: number;
}

/**
 * 客户信息
 */
export interface CustomerInfo {
  /** 客户ID */
  id: number;
  /** 客户名称 */
  customerName: string;
  /** 联系人 */
  contactPerson?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 行业 */
  industry?: string;
}

/**
 * 审批人信息
 */
export interface ApproverInfo {
  /** 用户ID */
  id: number;
  /** 姓名 */
  name: string;
  /** 角色 */
  role: string;
  /** 部门 */
  department?: string;
}

// ==================== 状态映射定义 ====================

/**
 * 方案状态映射
 */
export interface SolutionStatusMap {
  text: string;
  color: string;
}

/**
 * 审批结果映射
 */
export interface ApprovalResultMap {
  text: string;
  color: string;
}

// ==================== 统计信息定义 ====================

/**
 * 方案统计信息
 */
export interface SolutionStatistics {
  /** 软件产品数量 */
  softwareCount: number;
  /** 硬件设备数量 */
  hardwareCount: number;
  /** 服务项目数量 */
  serviceCount: number;
  /** 总金额 */
  totalAmount: number;
}

/**
 * 报价明细项
 */
export interface QuotationDetailItem {
  /** 序号 */
  index: number;
  /** 类型 */
  type: '软件' | '硬件' | '服务';
  /** 名称 */
  name: string;
  /** 数量 */
  quantity: number;
  /** 单价 */
  unitPrice: number;
  /** 折扣率（百分比） */
  discountRate?: number;
  /** 折扣后单价 */
  discountedPrice?: number;
  /** 小计 */
  subtotal: number;
}

// ==================== 方案详情完整数据 ====================

/**
 * 方案详情（包含所有信息）
 */
export interface SolutionDetail {
  /** 基本信息 */
  basicInfo: CustomerSolution;
  /** 配置信息 */
  config: SolutionConfig;
  /** 报价信息 */
  quotation: SolutionQuotation;
  /** 审批记录 */
  approvalRecords: ApprovalRecord[];
  /** 统计信息 */
  statistics: SolutionStatistics;
}

