/**
 * 硬件设备库 - 类型定义
 */

// 设备状态枚举
export enum DeviceStatus {
  /** 启用 */
  Enabled = 1,
  /** 停用 */
  Disabled = 2,
}

// 操作类型枚举
export enum OperationType {
  /** 入库 */
  StockIn = '入库',
  /** 出库 */
  StockOut = '出库',
  /** 调拨 */
  Transfer = '调拨',
}

/**
 * 硬件设备信息
 */
export interface HardwareDevice {
  /** 主键ID */
  id: number;
  /** 设备编号 */
  deviceCode: string;
  /** 设备名称 */
  deviceName: string;
  /** 设备型号 */
  deviceModel: string;
  /** 设备类别 */
  deviceCategory: string;
  /** 品牌 */
  brand: string;
  /** 单价 */
  unitPrice: number;
  /** 库存数量 */
  stockQuantity: number;
  /** 状态 */
  status: DeviceStatus;
  /** 技术参数 */
  parameters?: Record<string, any>;
  /** 规格说明 */
  specification?: string;
  /** 备注 */
  remark?: string;
  /** 使用次数 */
  usageCount?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建人 */
  createBy?: number;
  /** 创建人姓名 */
  createByName?: string;
  /** 更新人 */
  updateBy?: number;
  /** 更新人姓名 */
  updateByName?: string;
}

/**
 * 库存记录
 */
export interface InventoryRecord {
  /** 主键ID */
  id: number;
  /** 操作日期 */
  operateDate: string;
  /** 操作类型 */
  operateType: string;
  /** 数量（正数为入库，负数为出库） */
  quantity: number;
  /** 来源/去向 */
  source: string;
  /** 关联项目 */
  project?: string;
  /** 操作人 */
  operator: string;
  /** 库存结余 */
  balance: number;
  /** 备注 */
  remark?: string;
}

/**
 * 使用记录
 */
export interface UsageRecord {
  /** 主键ID */
  id: number;
  /** 客户名称 */
  customer: string;
  /** 项目编号 */
  project: string;
  /** 使用数量 */
  quantity: number;
  /** 部署日期 */
  deployDate: string;
  /** 状态 */
  status: string;
}

/**
 * 搜索表单
 */
export interface SearchForm {
  /** 设备编号 */
  deviceCode?: string;
  /** 设备名称 */
  deviceName?: string;
  /** 设备类别 */
  deviceCategory?: string;
  /** 状态 */
  status?: DeviceStatus | string;
}

/**
 * 设备表单
 */
export interface DeviceForm {
  /** 设备编号 */
  deviceCode: string;
  /** 设备名称 */
  deviceName: string;
  /** 设备型号 */
  deviceModel: string;
  /** 设备类别 */
  deviceCategory: string;
  /** 品牌 */
  brand: string;
  /** 单价 */
  unitPrice: number;
  /** 状态 */
  status: DeviceStatus;
  /** 技术参数 */
  parameters?: Record<string, any>;
  /** 规格说明 */
  specification?: string;
  /** 备注 */
  remark?: string;
}

/**
 * 库存操作表单
 */
export interface InventoryForm {
  /** 设备ID */
  deviceId: number;
  /** 操作类型 */
  operateType: string;
  /** 数量 */
  quantity: number;
  /** 操作日期 */
  operateDate: string;
  /** 来源/去向 */
  source: string;
  /** 关联项目 */
  project?: string;
  /** 备注 */
  remark?: string;
}

/**
 * 设备状态映射
 */
export interface DeviceStatusMap {
  text: string;
  color: string;
}

/**
 * 设备参数项
 */
export interface DeviceParameter {
  key: string;
  label: string;
  value: string;
}

