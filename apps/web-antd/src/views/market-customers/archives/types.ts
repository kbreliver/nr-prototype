// 客户档案相关类型定义

// 客户级别枚举
export enum CustomerLevel {
  Key = 1, // 重点客户
  Normal = 2, // 普通客户
  Potential = 3, // 潜在客户
}

// 客户状态枚举
export enum CustomerStatus {
  Potential = 1, // 潜在客户
  Intention = 2, // 意向客户
  Cooperating = 3, // 合作中
  Lost = 4, // 已流失
}

// 客户级别映射类型
export interface CustomerLevelMap {
  text: string;
  color: string;
}

// 客户状态映射类型
export interface CustomerStatusMap {
  text: string;
  color: string;
}

// 客户基本信息
export interface CustomerProfile {
  id?: number;
  customerCode: string; // 客户编号
  customerName: string; // 客户名称
  customerShortName?: string; // 客户简称
  creditCode?: string; // 统一社会信用代码
  registeredCapital?: string; // 注册资本
  industry?: string; // 所属行业
  region?: string; // 客户地区
  level: CustomerLevel; // 客户级别
  status: CustomerStatus; // 客户状态
  establishDate?: string; // 成立日期
  legalRepresentative?: string; // 法定代表人
  website?: string; // 企业网站
  responsiblePerson: string; // 客户负责人
  address?: string; // 公司地址
  tags?: string[]; // 客户标签
  introduction?: string; // 客户简介
  
  // 法人组织关联（新增）
  legalEntityId?: number; // 关联的法人组织ID
  legalEntityCode?: string; // 法人组织编号
  legalEntityName?: string; // 法人组织名称
  legalEntityPath?: string; // 组织路径（如：集团>子公司>工厂）
  
  createBy?: number;
  createByName?: string;
  createTime?: string;
  updateByName?: string;
  updateTime?: string;
}

// 组织架构节点
export interface OrganizationNode {
  id: number;
  key: string; // Tree组件需要
  title: string; // 部门名称
  departmentName: string; // 部门名称
  parentId?: number; // 上级部门ID
  responsiblePerson?: string; // 部门负责人
  phone?: string; // 部门电话
  function?: string; // 部门职能
  sortOrder?: number; // 排序号
  children?: OrganizationNode[];
  createTime?: string;
  updateTime?: string;
}

// 联系人性别枚举
export enum Gender {
  Male = 1, // 男
  Female = 2, // 女
}

// 联系人信息
export interface ContactPerson {
  id?: number;
  customerId: number; // 客户ID
  name: string; // 姓名
  gender?: Gender; // 性别
  position?: string; // 职位
  departmentId?: number; // 所属部门ID
  departmentName?: string; // 所属部门名称
  mobile?: string; // 手机号
  email?: string; // 邮箱
  telephone?: string; // 固定电话
  wechat?: string; // 微信号
  isPrimary: boolean; // 是否主要联系人
  remark?: string; // 备注
  createTime?: string;
  updateTime?: string;
}

// 业务类型枚举
export enum BusinessType {
  Opportunity = 1, // 商机
  Solution = 2, // 方案
  Contract = 3, // 合同
  Project = 4, // 项目
  Created = 99, // 客户创建
}

// 业务历史记录
export interface BusinessHistory {
  id: number;
  customerId: number;
  businessType: BusinessType; // 业务类型
  businessId?: number; // 业务ID
  businessCode?: string; // 业务编号
  businessName: string; // 业务名称
  businessAmount?: number; // 业务金额
  businessStatus?: string; // 业务状态
  businessTime: string; // 业务时间
  operator?: string; // 操作人
  remark?: string; // 备注
}

// 业务类型映射
export interface BusinessTypeMap {
  text: string;
  color: string;
  icon?: string;
}

// 客户统计数据
export interface CustomerStatistics {
  opportunityCount: number; // 商机数量
  solutionCount: number; // 方案数量
  contractCount: number; // 合同数量
  projectCount: number; // 项目数量
  totalAmount: number; // 成交总额
  paidAmount?: number; // 回款总额
  paymentRate?: number; // 回款率
}

// 搜索表单
export interface SearchForm {
  keyword?: string; // 关键字（客户名称或编号）
  industry?: string;
  level?: CustomerLevel;
  status?: CustomerStatus;
}

// 组织架构模板来源
export enum TemplateSource {
  Company = 1, // 本公司
  Customer = 2, // 其他客户
  Industry = 3, // 行业模板
}

// 组织架构模板
export interface OrganizationTemplate {
  sourceType: TemplateSource;
  sourceId?: number;
  sourceName?: string;
  treeData: OrganizationNode[];
  copyName: boolean; // 复制部门名称
  copyStructure: boolean; // 复制层级结构
  copyFunction: boolean; // 复制职能说明
}

// 联系人搜索表单
export interface ContactSearchForm {
  name?: string;
  position?: string;
  departmentId?: number;
}

// 业务历史筛选
export interface BusinessHistoryFilter {
  businessType?: BusinessType;
  timeRange?: string; // 最近一月、最近三月、最近半年、最近一年、全部
}

