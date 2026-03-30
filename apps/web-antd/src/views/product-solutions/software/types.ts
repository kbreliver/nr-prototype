/**
 * 软件产品库 - 类型定义
 */

// 产品状态枚举
export enum ProductStatus {
  /** 在研 */
  InDevelopment = 1,
  /** 在售 */
  OnSale = 2,
  /** 停售 */
  Discontinued = 3,
  /** 已下线 */
  Offline = 4,
}

// 发布类型枚举
export enum ReleaseType {
  /** 重大更新 */
  Major = 1,
  /** 功能更新 */
  Feature = 2,
  /** 问题修复 */
  Bugfix = 3,
}

// 发布状态枚举
export enum ReleaseStatus {
  /** 开发中 */
  InDevelopment = 1,
  /** 测试中 */
  Testing = 2,
  /** 已发布 */
  Released = 3
}

// 开发状态枚举
export enum DevStatus {
  /** 已完成 */
  Completed = 1,
  /** 开发中 */
  InDevelopment = 2,
  /** 计划中 */
  Planned = 3,
}

/**
 * 软件产品信息
 */
export interface SoftwareProduct {
  /** 主键ID */
  id: number;
  /** 产品编码 */
  productCode: string;
  /** 产品名称 */
  productName: string;
  /** 产品简称 */
  productShortName?: string;
  /** 产品英文名 */
  productNameEn?: string;
  /** 产品分类ID */
  productCategoryId?: number;
  /** 产品分类名称 */
  productCategory: string;
  /** 产品状态 */
  productStatus: ProductStatus;
  /** 产品图标 */
  productIcon?: string;
  /** 产品简介 */
  productIntro?: string;
  /** 技术架构 */
  techArchitecture?: string;
  /** 开发语言（逗号分隔） */
  devLanguages?: string[];
  /** 数据库类型（逗号分隔） */
  databaseTypes?: string[];
  /** 部署方式（逗号分隔） */
  deployModes?: string[];
  /** 运行环境 */
  runtimeEnv?: string;
  /** 所属产品线ID */
  productLineId?: number;
  /** 产品负责人ID */
  productManagerId?: number;
  /** 技术负责人ID */
  techManagerId?: number;
  /** 市场定位 */
  marketPosition?: string;
  /** 竞争优势 */
  competitiveEdge?: string;
  /** 官网地址 */
  websiteUrl?: string;
  /** 演示地址 */
  demoUrl?: string;
  /** 文档地址 */
  docUrl?: string;
  /** 源码仓库地址 */
  repoUrl?: string;
  /** 当前版本号 */
  currentVersion?: string;
  /** 标签（逗号分隔） */
  tags?: string[];
  /** 备注说明 */
  remark?: string;
  /** 授权方式 */
  licenseType?: string;
  /** 模块数量 */
  moduleCount?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建人 */
  createBy?: number;
  /** 更新人 */
  updateBy?: number;
}

/**
 * 产品模块信息
 */
export interface ProductModule {
  /** 主键ID */
  id?: number;
  /** 产品ID */
  productId: number;
  /** 模块编码 */
  moduleCode: string;
  /** 模块名称 */
  moduleName: string;
  /** 模块分组 */
  moduleGroup: 'basic' | 'core' | 'extension';
  /** 是否必选 */
  isRequired: boolean;
  /** 父级模块ID */
  parentId?: number;
  /** 模块描述 */
  moduleDesc?: string;
  /** 功能清单（JSON） */
  functionList?: string[];
  /** 技术依赖 */
  techDependency?: string;
  /** 开发状态 */
  devStatus: DevStatus;
  /** 排序 */
  sortOrder?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 产品版本信息
 */
export interface ProductVersion {
  /** 主键ID */
  id?: number;
  /** 产品ID */
  productId: number;
  /** 版本号 */
  versionNumber: string;
  /** 版本名称 */
  versionName?: string;
  /** 发布类型 */
  releaseType: ReleaseType;
  /** 发布日期 */
  releaseDate: string;
  /** 发布状态 */
  releaseStatus: ReleaseStatus;
  /** 更新内容 */
  updateContent: string;
  /** 新增功能（JSON数组） */
  newFeatures?: string[];
  /** 优化项（JSON数组） */
  optimizations?: string[];
  /** 修复问题（JSON数组） */
  bugFixes?: string[];
  /** 兼容性说明 */
  compatibilityNote?: string;
  /** 升级指南 */
  upgradeGuide?: string;
  /** 文档地址 */
  docUrl?: string;
  /** 是否当前版本 */
  isCurrent?: boolean;
  /** 发布人ID */
  releaseBy?: number;
  /** 发布人姓名 */
  releaseByName?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 产品授权信息
 */
export interface ProductLicense {
  /** 主键ID */
  id?: number;
  /** 产品ID */
  productId: number;
  /** 授权类型 */
  licenseType: string;
  /** 授权模式 */
  licenseMode: string;
  /** 授权价格 */
  licensePrice?: number;
  /** 价格单位 */
  priceUnit?: string;
  /** 有效期（天） */
  validDays?: number;
  /** 最小用户数 */
  minUsers?: number;
  /** 最大用户数，0表示不限 */
  maxUsers?: number;
  /** 包含模块（JSON数组） */
  includedModules?: number[];
  /** 授权说明 */
  licenseDesc?: string;
  /** 合同模板文件地址 */
  contractTemplate?: string;
  /** 是否启用 */
  isEnabled: boolean;
  /** 排序 */
  sortOrder?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 产品使用记录
 */
export interface ProductUsage {
  /** 主键ID */
  id?: number;
  /** 产品ID */
  productId: number;
  /** 客户ID */
  customerId: number;
  /** 客户名称 */
  customer: string;
  /** 项目ID */
  projectId: number;
  /** 项目名称 */
  project: string;
  /** 使用版本 */
  version: string;
  /** 授权方式 */
  authType: string;
  /** 授权数量 */
  authUsers: number;
  /** 部署时间 */
  deployTime: string;
  /** 运行状态 */
  runStatus: string;
}

/**
 * 搜索表单
 */
export interface SearchForm {
  /** 产品名称 */
  productName?: string;
  /** 产品编码 */
  productCode?: string;
  /** 产品分类 */
  productCategory?: string;
  /** 产品状态 */
  productStatus?: ProductStatus | string;
  /** 授权方式 */
  licenseType?: string;
}

/**
 * 产品表单
 */
export interface ProductForm {
  /** 产品编码 */
  productCode: string;
  /** 产品名称 */
  productName: string;
  /** 产品简称 */
  productShortName?: string;
  /** 产品英文名 */
  productNameEn?: string;
  /** 产品分类 */
  productCategory: string;
  /** 产品状态 */
  productStatus: ProductStatus;
  /** 产品图标 */
  productIcon?: string;
  /** 产品简介 */
  productIntro?: string;
  /** 技术架构 */
  techArchitecture?: string;
  /** 开发语言 */
  devLanguages?: string[];
  /** 数据库类型 */
  databaseTypes?: string[];
  /** 部署方式 */
  deployModes?: string[];
  /** 运行环境 */
  runtimeEnv?: string;
  /** 所属产品线 */
  productLine?: string;
  /** 产品负责人 */
  productManager?: number;
  /** 技术负责人 */
  techManager?: number;
  /** 销售负责人 */
  salesManager?: number;
  /** 市场定位 */
  marketPosition?: string;
  /** 竞争优势 */
  competitiveEdge?: string;
  /** 官网地址 */
  websiteUrl?: string;
  /** 演示地址 */
  demoUrl?: string;
  /** 文档地址 */
  docUrl?: string;
  /** 源码仓库 */
  repoUrl?: string;
  /** 标签 */
  tags?: string[];
  /** 备注说明 */
  remark?: string;
}

/**
 * 产品状态映射
 */
export interface ProductStatusMap {
  text: string;
  color: string;
}

