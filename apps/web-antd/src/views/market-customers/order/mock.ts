// 订单管理Mock数据

import type { DeliveryPlan, ExecutionRecord, Order } from './types';
import { DeliveryStatus, OrderStatus, RecordType } from './types';

// Mock订单列表数据
export const mockOrderList: Order[] = [
  {
    id: 1,
    orderCode: 'DD-20241020-001',
    orderName: 'XX科技智慧工厂项目订单',
    customerId: 1,
    customerName: 'XX科技有限公司',
    contractId: 1,
    contractCode: 'HT-20241015-001',
    contractName: 'XX科技智慧工厂项目合同',
    orderAmount: 2000000, // 200万
    completedAmount: 1200000, // 120万
    planStartDate: '2024-10-25',
    planEndDate: '2025-04-25',
    actualStartDate: '2024-10-25',
    orderStatus: OrderStatus.InProgress,
    progress: 60,
    responsiblePerson: '张三',
    responsiblePersonId: 1,
    remark: '按计划执行中',
    createByName: '张三',
    createTime: '2024-10-20 09:00:00',
    updateByName: '张三',
    updateTime: '2024-11-10 14:30:00',
  },
  {
    id: 2,
    orderCode: 'DD-20241112-002',
    orderName: 'ZZ集团物联网平台订单',
    customerId: 3,
    customerName: 'ZZ集团有限公司',
    contractId: 3,
    contractCode: 'HT-20241110-003',
    contractName: 'ZZ集团物联网平台合同',
    orderAmount: 3000000, // 300万
    completedAmount: 0,
    planStartDate: '2024-11-15',
    planEndDate: '2025-05-15',
    orderStatus: OrderStatus.NotStarted,
    progress: 0,
    responsiblePerson: '王五',
    responsiblePersonId: 3,
    createByName: '王五',
    createTime: '2024-11-12 10:00:00',
    updateByName: '王五',
    updateTime: '2024-11-12 10:00:00',
  },
  {
    id: 3,
    orderCode: 'DD-20240925-003',
    orderName: 'BB电子ERP系统升级订单',
    customerId: 5,
    customerName: 'BB电子科技',
    contractId: 5,
    contractCode: 'HT-20240920-004',
    contractName: 'BB电子ERP系统升级合同',
    orderAmount: 600000, // 60万
    completedAmount: 600000,
    planStartDate: '2024-09-25',
    planEndDate: '2024-12-20',
    actualStartDate: '2024-09-25',
    actualEndDate: '2024-11-08',
    orderStatus: OrderStatus.Completed,
    progress: 100,
    responsiblePerson: '李四',
    responsiblePersonId: 2,
    createByName: '李四',
    createTime: '2024-09-25 09:00:00',
    updateByName: '李四',
    updateTime: '2024-11-08 10:00:00',
  },
  {
    id: 4,
    orderCode: 'DD-20241010-004',
    orderName: 'CC重工AI预测性维护系统订单',
    customerId: 6,
    customerName: 'CC重工机械',
    contractId: 6,
    contractCode: 'HT-20241005-005',
    contractName: 'CC重工AI预测性维护系统合同',
    orderAmount: 1800000, // 180万
    completedAmount: 720000, // 72万
    planStartDate: '2024-10-10',
    planEndDate: '2025-04-10',
    actualStartDate: '2024-10-10',
    orderStatus: OrderStatus.InProgress,
    progress: 40,
    responsiblePerson: '周八',
    responsiblePersonId: 6,
    createByName: '周八',
    createTime: '2024-10-10 11:00:00',
    updateByName: '周八',
    updateTime: '2024-11-09 16:00:00',
  },
  {
    id: 5,
    orderCode: 'DD-20240820-005',
    orderName: 'DD化工能源管理系统订单',
    customerId: 7,
    customerName: 'DD化工集团',
    contractId: 7,
    contractCode: 'HT-20240815-006',
    contractName: 'DD化工能源管理系统合同',
    orderAmount: 2500000, // 250万
    completedAmount: 2500000,
    planStartDate: '2024-08-20',
    planEndDate: '2025-02-20',
    actualStartDate: '2024-08-20',
    actualEndDate: '2024-10-30',
    orderStatus: OrderStatus.Completed,
    progress: 100,
    responsiblePerson: '吴九',
    responsiblePersonId: 7,
    createByName: '吴九',
    createTime: '2024-08-20 10:00:00',
    updateByName: '吴九',
    updateTime: '2024-10-30 16:00:00',
  },
  {
    id: 6,
    orderCode: 'DD-20241025-006',
    orderName: 'EE食品质量追溯系统订单',
    customerId: 8,
    customerName: 'EE食品有限公司',
    contractId: 8,
    contractCode: 'HT-20241020-007',
    contractName: 'EE食品质量追溯系统合同',
    orderAmount: 1200000, // 120万
    completedAmount: 360000, // 36万
    planStartDate: '2024-10-25',
    planEndDate: '2025-04-25',
    actualStartDate: '2024-10-25',
    orderStatus: OrderStatus.InProgress,
    progress: 30,
    responsiblePerson: '张三',
    responsiblePersonId: 1,
    createByName: '张三',
    createTime: '2024-10-25 14:00:00',
    updateByName: '张三',
    updateTime: '2024-11-11 10:00:00',
  },
  {
    id: 7,
    orderCode: 'DD-20240715-007',
    orderName: 'FF物流供应链协同平台订单',
    customerId: 9,
    customerName: 'FF物流科技',
    contractId: 9,
    contractCode: 'HT-20240710-008',
    contractName: 'FF物流供应链协同平台合同',
    orderAmount: 2200000, // 220万
    completedAmount: 2200000,
    planStartDate: '2024-07-15',
    planEndDate: '2024-12-15',
    actualStartDate: '2024-07-15',
    actualEndDate: '2024-11-05',
    orderStatus: OrderStatus.Completed,
    progress: 100,
    responsiblePerson: '钱十',
    responsiblePersonId: 8,
    createByName: '钱十',
    createTime: '2024-07-15 11:00:00',
    updateByName: '钱十',
    updateTime: '2024-11-05 09:00:00',
  },
  {
    id: 8,
    orderCode: 'DD-20240910-008',
    orderName: 'II智能装备AGV系统订单',
    customerId: 12,
    customerName: 'II智能装备',
    contractId: 12,
    contractCode: 'HT-20240905-011',
    contractName: 'II智能装备AGV系统合同',
    orderAmount: 1600000, // 160万
    completedAmount: 1600000,
    planStartDate: '2024-09-10',
    planEndDate: '2024-12-10',
    actualStartDate: '2024-09-10',
    actualEndDate: '2024-11-01',
    orderStatus: OrderStatus.Completed,
    progress: 100,
    responsiblePerson: '陈十二',
    responsiblePersonId: 10,
    createByName: '陈十二',
    createTime: '2024-09-10 09:00:00',
    updateByName: '陈十二',
    updateTime: '2024-11-01 14:00:00',
  },
  {
    id: 9,
    orderCode: 'DD-20241105-009',
    orderName: 'LL纺织智能排产系统订单',
    customerId: 15,
    customerName: 'LL纺织集团',
    contractId: 15,
    contractCode: 'HT-20241030-013',
    contractName: 'LL纺织智能排产系统合同',
    orderAmount: 1400000, // 140万
    completedAmount: 420000, // 42万
    planStartDate: '2024-11-05',
    planEndDate: '2025-05-05',
    actualStartDate: '2024-11-05',
    orderStatus: OrderStatus.InProgress,
    progress: 30,
    responsiblePerson: '蒋十四',
    responsiblePersonId: 12,
    createByName: '蒋十四',
    createTime: '2024-11-05 09:00:00',
    updateByName: '蒋十四',
    updateTime: '2024-11-11 15:00:00',
  },
  {
    id: 10,
    orderCode: 'DD-20241030-010',
    orderName: 'MM制造MES系统订单',
    customerId: 16,
    customerName: 'MM制造有限公司',
    contractId: 16,
    contractCode: 'HT-20241025-014',
    contractName: 'MM制造MES系统合同',
    orderAmount: 2800000, // 280万
    completedAmount: 0,
    planStartDate: '2024-11-01',
    planEndDate: '2025-06-01',
    orderStatus: OrderStatus.NotStarted,
    progress: 0,
    responsiblePerson: '孙十五',
    responsiblePersonId: 13,
    createByName: '孙十五',
    createTime: '2024-10-30 15:00:00',
    updateByName: '孙十五',
    updateTime: '2024-10-30 15:00:00',
  },
  {
    id: 11,
    orderCode: 'DD-20240920-011',
    orderName: 'NN能源SCADA系统订单',
    customerId: 17,
    customerName: 'NN能源集团',
    contractId: 17,
    contractCode: 'HT-20240915-015',
    contractName: 'NN能源SCADA系统合同',
    orderAmount: 3200000, // 320万
    completedAmount: 1280000, // 128万
    planStartDate: '2024-09-20',
    planEndDate: '2025-03-20',
    actualStartDate: '2024-09-20',
    orderStatus: OrderStatus.Paused,
    progress: 40,
    responsiblePerson: '周十六',
    responsiblePersonId: 14,
    remark: '因客户需求变更暂停',
    createByName: '周十六',
    createTime: '2024-09-20 10:00:00',
    updateByName: '周十六',
    updateTime: '2024-11-10 11:00:00',
  },
];

// 根据订单ID获取订单详情
export function getOrderById(id: number): Order | undefined {
  return mockOrderList.find(o => o.id === id);
}

// 根据订单编号获取订单
export function getOrderByCode(code: string): Order | undefined {
  return mockOrderList.find(o => o.orderCode === code);
}

// 根据合同ID获取订单列表
export function getOrdersByContractId(contractId: number): Order[] {
  return mockOrderList.filter(o => o.contractId === contractId);
}

// Mock交付计划数据
export function getDeliveryPlansByOrderId(orderId: number): DeliveryPlan[] {
  const deliveryPlansMap: Record<number, DeliveryPlan[]> = {
    1: [
      {
        id: 1,
        orderId: 1,
        stageOrder: 1,
        deliveryContent: '需求分析',
        planStartDate: '2024-10-25',
        planEndDate: '2024-11-05',
        actualStartDate: '2024-10-25',
        actualEndDate: '2024-11-03',
        deliveryStatus: DeliveryStatus.Completed,
      },
      {
        id: 2,
        orderId: 1,
        stageOrder: 2,
        deliveryContent: '系统设计',
        planStartDate: '2024-11-06',
        planEndDate: '2024-11-20',
        actualStartDate: '2024-11-04',
        deliveryStatus: DeliveryStatus.InProgress,
      },
      {
        id: 3,
        orderId: 1,
        stageOrder: 3,
        deliveryContent: '开发实施',
        planStartDate: '2024-11-21',
        planEndDate: '2025-02-20',
        deliveryStatus: DeliveryStatus.NotStarted,
      },
      {
        id: 4,
        orderId: 1,
        stageOrder: 4,
        deliveryContent: '系统测试',
        planStartDate: '2025-02-21',
        planEndDate: '2025-03-20',
        deliveryStatus: DeliveryStatus.NotStarted,
      },
      {
        id: 5,
        orderId: 1,
        stageOrder: 5,
        deliveryContent: '上线部署',
        planStartDate: '2025-03-21',
        planEndDate: '2025-04-10',
        deliveryStatus: DeliveryStatus.NotStarted,
      },
      {
        id: 6,
        orderId: 1,
        stageOrder: 6,
        deliveryContent: '验收培训',
        planStartDate: '2025-04-11',
        planEndDate: '2025-04-25',
        deliveryStatus: DeliveryStatus.NotStarted,
      },
    ],
    2: [
      {
        id: 7,
        orderId: 2,
        stageOrder: 1,
        deliveryContent: '需求调研',
        planStartDate: '2024-11-15',
        planEndDate: '2024-11-30',
        deliveryStatus: DeliveryStatus.NotStarted,
      },
      {
        id: 8,
        orderId: 2,
        stageOrder: 2,
        deliveryContent: '方案设计',
        planStartDate: '2024-12-01',
        planEndDate: '2024-12-31',
        deliveryStatus: DeliveryStatus.NotStarted,
      },
    ],
  };

  return deliveryPlansMap[orderId] || [];
}

// Mock执行记录数据
export function getExecutionRecordsByOrderId(orderId: number): ExecutionRecord[] {
  const executionRecordsMap: Record<number, ExecutionRecord[]> = {
    1: [
      {
        id: 1,
        orderId: 1,
        recordTime: '2024-11-10 14:30:00',
        executor: '张三',
        executorId: 1,
        recordType: RecordType.ProgressUpdate,
        content: '完成需求分析阶段，进入系统设计阶段。已完成功能模块划分和技术架构设计。',
        createTime: '2024-11-10 14:30:00',
      },
      {
        id: 2,
        orderId: 1,
        recordTime: '2024-11-05 16:00:00',
        executor: '李四',
        executorId: 2,
        recordType: RecordType.ProblemRecord,
        content: '发现需求变更：客户要求增加移动端管理功能，需要评估工作量和工期影响。',
        createTime: '2024-11-05 16:00:00',
      },
      {
        id: 3,
        orderId: 1,
        recordTime: '2024-10-25 09:00:00',
        executor: '张三',
        executorId: 1,
        recordType: RecordType.StatusChange,
        content: '订单开始执行，项目启动会议已召开，明确各方职责和里程碑节点。',
        createTime: '2024-10-25 09:00:00',
      },
    ],
    2: [
      {
        id: 4,
        orderId: 2,
        recordTime: '2024-11-12 10:00:00',
        executor: '王五',
        executorId: 3,
        recordType: RecordType.StatusChange,
        content: '订单已创建，等待开始执行。',
        createTime: '2024-11-12 10:00:00',
      },
    ],
    11: [
      {
        id: 5,
        orderId: 11,
        recordTime: '2024-11-10 11:00:00',
        executor: '周十六',
        executorId: 14,
        recordType: RecordType.StatusChange,
        content: '订单已暂停，原因：客户需求变更，需要重新评估方案。',
        createTime: '2024-11-10 11:00:00',
      },
      {
        id: 6,
        orderId: 11,
        recordTime: '2024-10-15 14:00:00',
        executor: '周十六',
        executorId: 14,
        recordType: RecordType.ProgressUpdate,
        content: '完成系统架构设计，开始进入开发阶段。',
        createTime: '2024-10-15 14:00:00',
      },
    ],
  };

  return executionRecordsMap[orderId] || [];
}

// 获取已签订的合同列表（用于创建订单时选择）
export function getMockSignedContracts() {
  return [
    { id: 1, contractCode: 'HT-20241015-001', contractName: 'XX科技智慧工厂项目合同', contractAmount: 2000000, customerName: 'XX科技有限公司' },
    { id: 3, contractCode: 'HT-20241110-003', contractName: 'ZZ集团物联网平台合同', contractAmount: 3000000, customerName: 'ZZ集团有限公司' },
    { id: 6, contractCode: 'HT-20241005-005', contractName: 'CC重工AI预测性维护系统合同', contractAmount: 1800000, customerName: 'CC重工机械' },
    { id: 8, contractCode: 'HT-20241020-007', contractName: 'EE食品质量追溯系统合同', contractAmount: 1200000, customerName: 'EE食品有限公司' },
    { id: 10, contractCode: 'HT-20241025-009', contractName: 'GG贸易WMS仓储系统合同', contractAmount: 900000, customerName: 'GG贸易公司' },
    { id: 11, contractCode: 'HT-20241108-010', contractName: 'HH精密数据采集平台合同', contractAmount: 750000, customerName: 'HH精密制造' },
    { id: 15, contractCode: 'HT-20241030-013', contractName: 'LL纺织智能排产系统合同', contractAmount: 1400000, customerName: 'LL纺织集团' },
    { id: 16, contractCode: 'HT-20241025-014', contractName: 'MM制造MES系统合同', contractAmount: 2800000, customerName: 'MM制造有限公司' },
    { id: 17, contractCode: 'HT-20240915-015', contractName: 'NN能源SCADA系统合同', contractAmount: 3200000, customerName: 'NN能源集团' },
  ];
}

