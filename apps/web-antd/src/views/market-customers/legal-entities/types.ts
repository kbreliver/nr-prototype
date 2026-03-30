/**
 * 法人组织管理 - 类型定义
 * 
 * 用于管理客户的法人组织层级关系（集团-子公司-工厂等）
 * 与客户内部组织（部门架构）是不同的概念
 */

// 法人组织类型枚举
export enum LegalEntityType {
  GroupHeadquarters = 1, // 集团总部
  Company = 2,           // 公司
  Subsidiary = 3,        // 子公司
  Branch = 4,            // 分公司
  Office = 5,            // 办事处
  Factory = 6,           // 工厂
}

// 数据来源枚举
export enum DataSource {
  Manual = 1,      // 手动录入
  ThirdParty = 2,  // 第三方接口
  Import = 3,      // 批量导入
}

// 法人组织信息
export interface LegalEntity {
  id?: number;
  entityCode: string;              // 组织编号（LE-YYYYMMDD-XXX）
  entityName: string;              // 组织名称
  entityShortName?: string;        // 简称
  creditCode?: string;             // 统一社会信用代码
  legalRepresentative?: string;    // 法定代表人
  registeredCapital?: string;      // 注册资本
  establishDate?: string;          // 成立日期
  address?: string;                // 注册地址
  
  // 层级关系
  parentEntityId?: number;         // 上级组织ID
  parentEntityName?: string;       // 上级组织名称
  entityLevel: number;             // 层级（1,2,3...）
  entityType: LegalEntityType;     // 组织类型
  entityPath?: string;             // 组织路径（集团 > 子公司 > 工厂）
  
  // 客户关联
  isCustomer: boolean;             // 是否已创建客户
  customerId?: number;             // 关联的客户ID
  customerCode?: string;           // 客户编号
  
  // 其他信息
  industry?: string;               // 所属行业
  businessScope?: string;          // 经营范围
  contactPhone?: string;           // 联系电话
  dataSource: DataSource;          // 数据来源
  
  // 树形结构
  children?: LegalEntity[];        // 子组织
  key?: string;                    // Tree组件需要
  title?: string;                  // Tree组件需要
  
  // 统计信息
  childrenCount?: number;          // 下属组织数量
  customerCount?: number;          // 关联客户数量（包括下属组织）
  
  // 元数据
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

// 搜索表单
export interface LegalEntitySearchForm {
  entityName?: string;
  creditCode?: string;
  entityType?: LegalEntityType;
  isCustomer?: boolean;
}

// 第三方接口响应数据
export interface ThirdPartyEntityData {
  name: string;
  creditCode: string;
  legalRepresentative?: string;
  registeredCapital?: string;
  establishDate?: string;
  address?: string;
  businessScope?: string;
  industry?: string;
  contactPhone?: string;
  
  // 股权结构信息
  shareholders?: Array<{
    name: string;
    creditCode?: string;
    shareholdingRatio?: number;
  }>;
}

// 法人组织类型映射
export interface LegalEntityTypeMap {
  value: LegalEntityType;
  label: string;
  icon: string;
  color: string;
}

// 数据来源映射
export interface DataSourceMap {
  value: DataSource;
  label: string;
  color: string;
}

