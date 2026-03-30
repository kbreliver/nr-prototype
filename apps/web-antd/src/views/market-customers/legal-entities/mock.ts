/**
 * 法人组织管理 - Mock数据
 * 
 * 与客户档案数据建立对应关系：
 * - XX科技有限公司（客户ID: 1）对应 华北科技集团 > 北京分公司 > XX科技有限公司（组织ID: 3）
 * - YY制造集团（客户ID: 2）对应 长三角制造集团 > YY制造集团（组织ID: 12）
 * - ZZ集团有限公司（客户ID: 3）对应 华南科技集团 > ZZ集团有限公司（组织ID: 21）
 */

import type { LegalEntity } from './types';
import { DataSource, LegalEntityType } from './types';

// Mock法人组织数据 - 树形结构
export const mockLegalEntityTree: LegalEntity[] = [
  // ========== 集团1：华北科技集团 ==========
  {
    id: 1,
    entityCode: 'LE-20240101-001',
    entityName: '华北科技集团',
    entityShortName: '华北集团',
    creditCode: '91110000MA00000001',
    legalRepresentative: '刘董事长',
    registeredCapital: '100000万元',
    establishDate: '2000-01-15',
    address: '北京市朝阳区XX路XX号',
    parentEntityId: undefined,
    entityLevel: 1,
    entityType: LegalEntityType.GroupHeadquarters,
    entityPath: '华北科技集团',
    isCustomer: false,
    customerId: undefined,
    industry: '科技制造',
    businessScope: '技术开发、技术服务、软硬件销售、系统集成',
    contactPhone: '010-12345678',
    dataSource: DataSource.Manual,
    childrenCount: 2,
    customerCount: 2,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-11-01 10:00:00',
    children: [
      {
        id: 2,
        entityCode: 'LE-20240102-001',
        entityName: '北京分公司',
        entityShortName: '华北-北京',
        creditCode: '91110000MA00000002',
        legalRepresentative: '张总经理',
        registeredCapital: '10000万元',
        establishDate: '2005-06-20',
        address: '北京市海淀区中关村XX号',
        parentEntityId: 1,
        entityLevel: 2,
        entityType: LegalEntityType.Branch,
        entityPath: '华北科技集团 > 北京分公司',
        isCustomer: false,
        customerId: undefined,
        industry: '科技制造',
        businessScope: '技术开发、软件服务',
        contactPhone: '010-23456789',
        dataSource: DataSource.Manual,
        childrenCount: 2,
        customerCount: 1,
        createTime: '2024-01-02 10:00:00',
        updateTime: '2024-11-02 10:00:00',
        children: [
          {
            id: 3,
            entityCode: 'LE-20240615-001',
            entityName: 'XX科技有限公司',
            entityShortName: 'XX科技',
            creditCode: '91110000MA01234567',
            legalRepresentative: '张某某',
            registeredCapital: '5000万元',
            establishDate: '2015-03-15',
            address: '北京市海淀区中关村软件园XX号楼',
            parentEntityId: 2,
            entityLevel: 3,
            entityType: LegalEntityType.Subsidiary,
            entityPath: '华北科技集团 > 北京分公司 > XX科技有限公司',
            isCustomer: true,
            customerId: 1,
            customerCode: 'CUS-20240615-001',
            industry: '智能制造',
            businessScope: '工业自动化、智能制造系统集成',
            contactPhone: '010-34567890',
            dataSource: DataSource.Manual,
            childrenCount: 0,
            customerCount: 1,
            createTime: '2024-06-15 10:30:00',
            updateTime: '2024-11-05 14:20:00',
          },
          {
            id: 4,
            entityCode: 'LE-20240103-001',
            entityName: '海淀研发中心',
            entityShortName: '研发中心',
            creditCode: '91110000MA00000004',
            legalRepresentative: '李主任',
            registeredCapital: '2000万元',
            establishDate: '2012-09-10',
            address: '北京市海淀区上地XX园',
            parentEntityId: 2,
            entityLevel: 3,
            entityType: LegalEntityType.Office,
            entityPath: '华北科技集团 > 北京分公司 > 海淀研发中心',
            isCustomer: false,
            customerId: undefined,
            industry: '科技研发',
            businessScope: '技术研发、产品设计',
            contactPhone: '010-45678901',
            dataSource: DataSource.Manual,
            childrenCount: 0,
            customerCount: 0,
            createTime: '2024-01-03 10:00:00',
            updateTime: '2024-11-03 10:00:00',
          },
        ],
      },
      {
        id: 5,
        entityCode: 'LE-20240104-001',
        entityName: '天津制造基地',
        entityShortName: '天津基地',
        creditCode: '91120000MA00000005',
        legalRepresentative: '王厂长',
        registeredCapital: '8000万元',
        establishDate: '2008-11-05',
        address: '天津市滨海新区XX工业园',
        parentEntityId: 1,
        entityLevel: 2,
        entityType: LegalEntityType.Factory,
        entityPath: '华北科技集团 > 天津制造基地',
        isCustomer: false,
        customerId: undefined,
        industry: '制造业',
        businessScope: '设备制造、组装',
        contactPhone: '022-12345678',
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 0,
        createTime: '2024-01-04 10:00:00',
        updateTime: '2024-11-04 10:00:00',
      },
    ],
  },
  
  // ========== 集团2：长三角制造集团 ==========
  {
    id: 11,
    entityCode: 'LE-20240201-001',
    entityName: '长三角制造集团',
    entityShortName: '长三角集团',
    creditCode: '91310000MA00000011',
    legalRepresentative: '陈董事长',
    registeredCapital: '200000万元',
    establishDate: '1998-03-20',
    address: '上海市浦东新区XX大道XX号',
    parentEntityId: undefined,
    entityLevel: 1,
    entityType: LegalEntityType.GroupHeadquarters,
    entityPath: '长三角制造集团',
    isCustomer: false,
    customerId: undefined,
    industry: '制造业',
    businessScope: '机械制造、电子产品制造、贸易',
    contactPhone: '021-12345678',
    dataSource: DataSource.Manual,
    childrenCount: 2,
    customerCount: 1,
    createTime: '2024-02-01 10:00:00',
    updateTime: '2024-11-01 11:00:00',
    children: [
      {
        id: 12,
        entityCode: 'LE-20240720-001',
        entityName: 'YY制造集团',
        entityShortName: 'YY集团',
        creditCode: '91310000MA02345678',
        legalRepresentative: '李某某',
        registeredCapital: '10000万元',
        establishDate: '2010-05-20',
        address: '上海市浦东新区张江高科技园区XX路XX号',
        parentEntityId: 11,
        entityLevel: 2,
        entityType: LegalEntityType.Subsidiary,
        entityPath: '长三角制造集团 > YY制造集团',
        isCustomer: true,
        customerId: 2,
        customerCode: 'CUS-20240720-001',
        industry: '制造业',
        businessScope: '机械制造、电子产品制造',
        contactPhone: '021-23456789',
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 1,
        createTime: '2024-07-20 09:15:00',
        updateTime: '2024-11-06 16:30:00',
      },
      {
        id: 13,
        entityCode: 'LE-20240202-001',
        entityName: '苏州工厂',
        entityShortName: '苏州厂',
        creditCode: '91320000MA00000013',
        legalRepresentative: '周厂长',
        registeredCapital: '5000万元',
        establishDate: '2012-07-15',
        address: '江苏省苏州市工业园区XX路XX号',
        parentEntityId: 11,
        entityLevel: 2,
        entityType: LegalEntityType.Factory,
        entityPath: '长三角制造集团 > 苏州工厂',
        isCustomer: false,
        customerId: undefined,
        industry: '制造业',
        businessScope: '精密零件制造、模具加工',
        contactPhone: '0512-12345678',
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 0,
        createTime: '2024-02-02 10:00:00',
        updateTime: '2024-11-02 11:00:00',
      },
    ],
  },
  
  // ========== 集团3：华南科技集团 ==========
  {
    id: 21,
    entityCode: 'LE-20240301-001',
    entityName: '华南科技集团',
    entityShortName: '华南集团',
    creditCode: '91440000MA00000021',
    legalRepresentative: '王董事长',
    registeredCapital: '150000万元',
    establishDate: '2005-01-10',
    address: '广东省广州市天河区XX大道XX号',
    parentEntityId: undefined,
    entityLevel: 1,
    entityType: LegalEntityType.GroupHeadquarters,
    entityPath: '华南科技集团',
    isCustomer: false,
    customerId: undefined,
    industry: '智能制造',
    businessScope: '工业物联网、智能制造、大数据服务',
    contactPhone: '020-12345678',
    dataSource: DataSource.Manual,
    childrenCount: 2,
    customerCount: 1,
    createTime: '2024-03-01 10:00:00',
    updateTime: '2024-11-01 12:00:00',
    children: [
      {
        id: 22,
        entityCode: 'LE-20240528-001',
        entityName: 'ZZ集团有限公司',
        entityShortName: 'ZZ集团',
        creditCode: '91440000MA03456789',
        legalRepresentative: '王某某',
        registeredCapital: '20000万元',
        establishDate: '2008-08-10',
        address: '广州市天河区珠江新城XX大厦',
        parentEntityId: 21,
        entityLevel: 2,
        entityType: LegalEntityType.Subsidiary,
        entityPath: '华南科技集团 > ZZ集团有限公司',
        isCustomer: true,
        customerId: 3,
        customerCode: 'CUS-20240528-001',
        industry: '智能制造',
        businessScope: '工业物联网平台、智能制造解决方案',
        contactPhone: '020-23456789',
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 1,
        createTime: '2024-05-28 14:00:00',
        updateTime: '2024-11-03 10:45:00',
      },
      {
        id: 23,
        entityCode: 'LE-20240302-001',
        entityName: '深圳研发中心',
        entityShortName: '深圳研发',
        creditCode: '91440300MA00000023',
        legalRepresentative: '林主任',
        registeredCapital: '3000万元',
        establishDate: '2010-06-01',
        address: '深圳市南山区科技园XX路XX号',
        parentEntityId: 21,
        entityLevel: 2,
        entityType: LegalEntityType.Office,
        entityPath: '华南科技集团 > 深圳研发中心',
        isCustomer: false,
        customerId: undefined,
        industry: '科技研发',
        businessScope: 'AI算法研发、物联网技术研发',
        contactPhone: '0755-12345678',
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 0,
        createTime: '2024-03-02 10:00:00',
        updateTime: '2024-11-02 12:00:00',
      },
    ],
  },
  
  // ========== 集团4：中西部工业集团（无客户关联）==========
  {
    id: 31,
    entityCode: 'LE-20240401-001',
    entityName: '中西部工业集团',
    entityShortName: '中西部集团',
    creditCode: '91510000MA00000031',
    legalRepresentative: '赵董事长',
    registeredCapital: '80000万元',
    establishDate: '2003-09-15',
    address: '四川省成都市高新区XX街XX号',
    parentEntityId: undefined,
    entityLevel: 1,
    entityType: LegalEntityType.GroupHeadquarters,
    entityPath: '中西部工业集团',
    isCustomer: false,
    customerId: undefined,
    industry: '制造业',
    businessScope: '重工业制造、机械设备、工程承包',
    contactPhone: '028-12345678',
    dataSource: DataSource.Manual,
    childrenCount: 2,
    customerCount: 0,
    createTime: '2024-04-01 10:00:00',
    updateTime: '2024-11-01 13:00:00',
    children: [
      {
        id: 32,
        entityCode: 'LE-20240402-001',
        entityName: '成都制造公司',
        entityShortName: '成都制造',
        creditCode: '91510000MA00000032',
        legalRepresentative: '钱总经理',
        registeredCapital: '6000万元',
        establishDate: '2008-04-20',
        address: '成都市郫都区XX工业园',
        parentEntityId: 31,
        entityLevel: 2,
        entityType: LegalEntityType.Subsidiary,
        entityPath: '中西部工业集团 > 成都制造公司',
        isCustomer: false,
        customerId: undefined,
        industry: '制造业',
        businessScope: '机械设备制造、零部件加工',
        contactPhone: '028-23456789',
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 0,
        createTime: '2024-04-02 10:00:00',
        updateTime: '2024-11-02 13:00:00',
      },
      {
        id: 33,
        entityCode: 'LE-20240403-001',
        entityName: '重庆分公司',
        entityShortName: '重庆分公司',
        creditCode: '91500000MA00000033',
        legalRepresentative: '孙总经理',
        registeredCapital: '4000万元',
        establishDate: '2011-10-08',
        address: '重庆市渝北区XX大道XX号',
        parentEntityId: 31,
        entityLevel: 2,
        entityType: LegalEntityType.Branch,
        entityPath: '中西部工业集团 > 重庆分公司',
        isCustomer: false,
        customerId: undefined,
        industry: '制造业',
        businessScope: '工程机械销售、售后服务',
        contactPhone: '023-12345678',
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 0,
        createTime: '2024-04-03 10:00:00',
        updateTime: '2024-11-03 13:00:00',
      },
    ],
  },
];

// 扁平化的法人组织列表（用于Select等组件）
export const mockLegalEntityList: LegalEntity[] = [
  // 华北科技集团
  mockLegalEntityTree[0],
  ...mockLegalEntityTree[0].children!,
  ...mockLegalEntityTree[0].children![0].children!,
  ...mockLegalEntityTree[0].children![1] ? [mockLegalEntityTree[0].children![1]] : [],
  
  // 长三角制造集团
  mockLegalEntityTree[1],
  ...mockLegalEntityTree[1].children!,
  
  // 华南科技集团
  mockLegalEntityTree[2],
  ...mockLegalEntityTree[2].children!,
  
  // 中西部工业集团
  mockLegalEntityTree[3],
  ...mockLegalEntityTree[3].children!,
];

// 根据ID获取法人组织
export function getMockLegalEntityById(id: number): LegalEntity | undefined {
  return mockLegalEntityList.find(entity => entity.id === id);
}

// 获取顶级组织（集团）列表
export function getMockTopLevelEntities(): LegalEntity[] {
  return mockLegalEntityTree.filter(entity => !entity.parentEntityId);
}

// 根据客户ID获取关联的法人组织
export function getMockLegalEntityByCustomerId(customerId: number): LegalEntity | undefined {
  return mockLegalEntityList.find(entity => entity.customerId === customerId);
}

// 获取同一集团下的所有客户
export function getMockGroupCustomers(entityId: number): LegalEntity[] {
  const entity = getMockLegalEntityById(entityId);
  if (!entity) return [];
  
  // 找到根组织（集团）
  let root = entity;
  while (root.parentEntityId) {
    const parent = getMockLegalEntityById(root.parentEntityId);
    if (!parent) break;
    root = parent;
  }
  
  // 递归查找所有是客户的节点
  const customers: LegalEntity[] = [];
  
  function traverse(node: LegalEntity) {
    if (node.isCustomer) {
      customers.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  traverse(root);
  
  return customers;
}

