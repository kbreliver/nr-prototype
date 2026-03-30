// 合同管理Mock数据

import type { Contract, ContractApproval, PaymentRecord } from './types';
import { ApprovalStatus, ContractStatus, ContractType, PaymentMethod } from './types';

// Mock合同列表数据（15-20条）
export const mockContractList: Contract[] = [
  {
    id: 1,
    contractCode: 'HT-20241015-001',
    contractName: 'XX科技智慧工厂项目合同',
    customerId: 1,
    customerName: 'XX科技有限公司',
    solutionId: 1,
    solutionName: '智慧工厂整体解决方案',
    solutionCode: 'CS-20241101-001',
    contractAmount: 2000000, // 200万
    paidAmount: 1500000, // 150万
    unpaidAmount: 500000, // 50万
    paymentRate: 75,
    signDate: '2024-10-15',
    startDate: '2024-10-15',
    endDate: '2025-10-14',
    contractStatus: ContractStatus.Signed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024101501',
    contractType: ContractType.Sales,
    responsiblePerson: '张三',
    responsiblePersonId: 1,
    contractTerms: '<h3>一、付款条款</h3><p>1. 首款：合同签订后5个工作日内支付合同总额的30%</p><p>2. 进度款：系统验收合格后支付合同总额的40%</p><p>3. 尾款：项目完成并通过最终验收后支付合同总额的30%</p><h3>二、交付条款</h3><p>1. 需求分析阶段：合同签订后10个工作日内完成</p><p>2. 系统设计阶段：需求确认后20个工作日内完成</p>',
    attachments: [
      {
        id: 1,
        contractId: 1,
        fileName: '合同扫描件.pdf',
        fileUrl: '/files/contracts/contract1.pdf',
        fileSize: 2048000,
        fileType: 'application/pdf',
        uploadTime: '2024-10-15 14:30:00',
        uploadBy: '张三',
      },
    ],
    remark: '本合同包含软件开发、硬件采购、实施服务等内容',
    orderCount: 1,
    projectCount: 1,
    createByName: '张三',
    createTime: '2024-10-10 09:00:00',
    updateByName: '张三',
    updateTime: '2024-10-15 14:30:00',
  },
  {
    id: 2,
    contractCode: 'HT-20241101-002',
    contractName: 'YY集团MES系统合同',
    customerId: 2,
    customerName: 'YY制造集团',
    solutionId: 2,
    solutionName: 'MES生产执行系统方案',
    solutionCode: 'CS-20241015-002',
    contractAmount: 1500000, // 150万
    paidAmount: 0,
    unpaidAmount: 1500000,
    paymentRate: 0,
    signDate: '2024-11-01',
    startDate: '2024-11-01',
    endDate: '2025-10-31',
    contractStatus: ContractStatus.Approving,
    approvalStatus: ApprovalStatus.Approving,
    oaFlowId: 'OA-2024110101',
    contractType: ContractType.Sales,
    responsiblePerson: '李四',
    responsiblePersonId: 2,
    remark: '包含MES系统实施及配套硬件设备',
    orderCount: 0,
    projectCount: 0,
    createByName: '李四',
    createTime: '2024-10-25 10:00:00',
    updateByName: '李四',
    updateTime: '2024-11-01 15:20:00',
  },
  {
    id: 3,
    contractCode: 'HT-20241110-003',
    contractName: 'ZZ集团物联网平台合同',
    customerId: 3,
    customerName: 'ZZ集团有限公司',
    solutionId: 3,
    solutionName: '工业物联网平台方案',
    solutionCode: 'CS-20241020-003',
    contractAmount: 3000000, // 300万
    paidAmount: 900000, // 90万
    unpaidAmount: 2100000, // 210万
    paymentRate: 30,
    signDate: '2024-11-10',
    startDate: '2024-11-10',
    endDate: '2025-11-09',
    contractStatus: ContractStatus.Signed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024111001',
    contractType: ContractType.Sales,
    responsiblePerson: '王五',
    responsiblePersonId: 3,
    contractTerms: '<h3>一、付款条款</h3><p>首款30%，进度款40%，尾款30%</p>',
    orderCount: 1,
    projectCount: 0,
    createByName: '王五',
    createTime: '2024-11-01 11:00:00',
    updateByName: '王五',
    updateTime: '2024-11-10 16:00:00',
  },
  {
    id: 4,
    contractCode: 'DRAFT-001',
    contractName: 'AA汽车配件数字化车间合同',
    customerId: 4,
    customerName: 'AA汽车配件',
    contractAmount: 800000, // 80万
    paidAmount: 0,
    unpaidAmount: 800000,
    paymentRate: 0,
    signDate: '2024-11-15',
    contractStatus: ContractStatus.Draft,
    approvalStatus: ApprovalStatus.NotSubmitted,
    contractType: ContractType.Sales,
    responsiblePerson: '赵六',
    responsiblePersonId: 4,
    orderCount: 0,
    projectCount: 0,
    createByName: '赵六',
    createTime: '2024-11-12 09:30:00',
    updateByName: '赵六',
    updateTime: '2024-11-12 09:30:00',
  },
  {
    id: 5,
    contractCode: 'HT-20240920-004',
    contractName: 'BB电子ERP系统升级合同',
    customerId: 5,
    customerName: 'BB电子科技',
    solutionId: 4,
    solutionName: 'ERP系统升级方案',
    solutionCode: 'CS-20240915-004',
    contractAmount: 600000, // 60万
    paidAmount: 600000, // 60万
    unpaidAmount: 0,
    paymentRate: 100,
    signDate: '2024-09-20',
    startDate: '2024-09-20',
    endDate: '2024-12-20',
    contractStatus: ContractStatus.Completed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024092001',
    contractType: ContractType.Service,
    responsiblePerson: '李四',
    responsiblePersonId: 2,
    orderCount: 1,
    projectCount: 1,
    createByName: '李四',
    createTime: '2024-09-10 14:00:00',
    updateByName: '李四',
    updateTime: '2024-11-08 10:00:00',
  },
  {
    id: 6,
    contractCode: 'HT-20241005-005',
    contractName: 'CC重工AI预测性维护系统合同',
    customerId: 6,
    customerName: 'CC重工机械',
    solutionId: 5,
    solutionName: 'AI设备预测性维护方案',
    solutionCode: 'CS-20240928-005',
    contractAmount: 1800000, // 180万
    paidAmount: 540000, // 54万
    unpaidAmount: 1260000, // 126万
    paymentRate: 30,
    signDate: '2024-10-05',
    startDate: '2024-10-05',
    endDate: '2025-10-04',
    contractStatus: ContractStatus.Signed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024100501',
    contractType: ContractType.Sales,
    responsiblePerson: '周八',
    responsiblePersonId: 6,
    orderCount: 1,
    projectCount: 1,
    createByName: '周八',
    createTime: '2024-09-25 15:30:00',
    updateByName: '周八',
    updateTime: '2024-10-05 11:00:00',
  },
  {
    id: 7,
    contractCode: 'HT-20240815-006',
    contractName: 'DD化工能源管理系统合同',
    customerId: 7,
    customerName: 'DD化工集团',
    contractAmount: 2500000, // 250万
    paidAmount: 2500000, // 250万
    unpaidAmount: 0,
    paymentRate: 100,
    signDate: '2024-08-15',
    startDate: '2024-08-15',
    endDate: '2025-02-14',
    contractStatus: ContractStatus.Completed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024081501',
    contractType: ContractType.Sales,
    responsiblePerson: '吴九',
    responsiblePersonId: 7,
    orderCount: 1,
    projectCount: 1,
    createByName: '吴九',
    createTime: '2024-08-01 10:00:00',
    updateByName: '吴九',
    updateTime: '2024-10-30 16:00:00',
  },
  {
    id: 8,
    contractCode: 'HT-20241020-007',
    contractName: 'EE食品质量追溯系统合同',
    customerId: 8,
    customerName: 'EE食品有限公司',
    solutionId: 6,
    solutionName: '产品质量追溯系统方案',
    solutionCode: 'CS-20241010-006',
    contractAmount: 1200000, // 120万
    paidAmount: 360000, // 36万
    unpaidAmount: 840000, // 84万
    paymentRate: 30,
    signDate: '2024-10-20',
    startDate: '2024-10-20',
    endDate: '2025-04-20',
    contractStatus: ContractStatus.Signed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024102001',
    contractType: ContractType.Sales,
    responsiblePerson: '张三',
    responsiblePersonId: 1,
    orderCount: 1,
    projectCount: 0,
    createByName: '张三',
    createTime: '2024-10-10 09:00:00',
    updateByName: '张三',
    updateTime: '2024-10-20 14:00:00',
  },
  {
    id: 9,
    contractCode: 'HT-20240710-008',
    contractName: 'FF物流供应链协同平台合同',
    customerId: 9,
    customerName: 'FF物流科技',
    contractAmount: 2200000, // 220万
    paidAmount: 2200000, // 220万
    unpaidAmount: 0,
    paymentRate: 100,
    signDate: '2024-07-10',
    startDate: '2024-07-10',
    endDate: '2024-12-10',
    contractStatus: ContractStatus.Completed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024071001',
    contractType: ContractType.Sales,
    responsiblePerson: '钱十',
    responsiblePersonId: 8,
    orderCount: 1,
    projectCount: 1,
    createByName: '钱十',
    createTime: '2024-06-25 11:00:00',
    updateByName: '钱十',
    updateTime: '2024-11-05 09:00:00',
  },
  {
    id: 10,
    contractCode: 'HT-20241025-009',
    contractName: 'GG贸易WMS仓储系统合同',
    customerId: 10,
    customerName: 'GG贸易公司',
    solutionId: 7,
    solutionName: '智能仓储WMS系统方案',
    solutionCode: 'CS-20241015-007',
    contractAmount: 900000, // 90万
    paidAmount: 270000, // 27万
    unpaidAmount: 630000, // 63万
    paymentRate: 30,
    signDate: '2024-10-25',
    startDate: '2024-10-25',
    endDate: '2025-04-25',
    contractStatus: ContractStatus.Signed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024102501',
    contractType: ContractType.Sales,
    responsiblePerson: '李四',
    responsiblePersonId: 2,
    orderCount: 0,
    projectCount: 0,
    createByName: '李四',
    createTime: '2024-10-15 14:00:00',
    updateByName: '李四',
    updateTime: '2024-10-25 10:00:00',
  },
  {
    id: 11,
    contractCode: 'HT-20241108-010',
    contractName: 'HH精密数据采集平台合同',
    customerId: 11,
    customerName: 'HH精密制造',
    contractAmount: 750000, // 75万
    paidAmount: 0,
    unpaidAmount: 750000,
    paymentRate: 0,
    signDate: '2024-11-08',
    startDate: '2024-11-08',
    endDate: '2025-05-08',
    contractStatus: ContractStatus.Signed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024110801',
    contractType: ContractType.Sales,
    responsiblePerson: '冯十一',
    responsiblePersonId: 9,
    orderCount: 0,
    projectCount: 0,
    createByName: '冯十一',
    createTime: '2024-10-28 10:00:00',
    updateByName: '冯十一',
    updateTime: '2024-11-08 15:00:00',
  },
  {
    id: 12,
    contractCode: 'HT-20240905-011',
    contractName: 'II智能装备AGV系统合同',
    customerId: 12,
    customerName: 'II智能装备',
    contractAmount: 1600000, // 160万
    paidAmount: 1600000, // 160万
    unpaidAmount: 0,
    paymentRate: 100,
    signDate: '2024-09-05',
    startDate: '2024-09-05',
    endDate: '2024-12-05',
    contractStatus: ContractStatus.Completed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024090501',
    contractType: ContractType.Sales,
    responsiblePerson: '陈十二',
    responsiblePersonId: 10,
    orderCount: 1,
    projectCount: 1,
    createByName: '陈十二',
    createTime: '2024-08-20 09:00:00',
    updateByName: '陈十二',
    updateTime: '2024-11-01 14:00:00',
  },
  {
    id: 13,
    contractCode: 'DRAFT-002',
    contractName: 'JJ钢铁设备健康监测系统合同',
    customerId: 13,
    customerName: 'JJ钢铁集团',
    contractAmount: 3500000, // 350万
    paidAmount: 0,
    unpaidAmount: 3500000,
    paymentRate: 0,
    signDate: '2024-11-20',
    contractStatus: ContractStatus.Draft,
    approvalStatus: ApprovalStatus.NotSubmitted,
    contractType: ContractType.Sales,
    responsiblePerson: '张三',
    responsiblePersonId: 1,
    remark: '大型国企项目，需要法务审核',
    orderCount: 0,
    projectCount: 0,
    createByName: '张三',
    createTime: '2024-11-10 10:00:00',
    updateByName: '张三',
    updateTime: '2024-11-10 10:00:00',
  },
  {
    id: 14,
    contractCode: 'HT-20240620-012',
    contractName: 'KK光电可视化监控系统合同',
    customerId: 14,
    customerName: 'KK光电科技',
    contractAmount: 950000, // 95万
    paidAmount: 0,
    unpaidAmount: 950000,
    paymentRate: 0,
    signDate: '2024-06-20',
    startDate: '2024-06-20',
    endDate: '2024-12-20',
    contractStatus: ContractStatus.Terminated,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024062001',
    contractType: ContractType.Sales,
    responsiblePerson: '卫十三',
    responsiblePersonId: 11,
    remark: '客户方要求终止合同',
    orderCount: 0,
    projectCount: 0,
    createByName: '卫十三',
    createTime: '2024-06-10 14:00:00',
    updateByName: '卫十三',
    updateTime: '2024-08-15 11:00:00',
  },
  {
    id: 15,
    contractCode: 'HT-20241030-013',
    contractName: 'LL纺织智能排产系统合同',
    customerId: 15,
    customerName: 'LL纺织集团',
    solutionId: 8,
    solutionName: '智能排产调度系统方案',
    solutionCode: 'CS-20241020-008',
    contractAmount: 1400000, // 140万
    paidAmount: 420000, // 42万
    unpaidAmount: 980000, // 98万
    paymentRate: 30,
    signDate: '2024-10-30',
    startDate: '2024-10-30',
    endDate: '2025-04-30',
    contractStatus: ContractStatus.Signed,
    approvalStatus: ApprovalStatus.Approved,
    oaFlowId: 'OA-2024103001',
    contractType: ContractType.Sales,
    responsiblePerson: '蒋十四',
    responsiblePersonId: 12,
    orderCount: 1,
    projectCount: 0,
    createByName: '蒋十四',
    createTime: '2024-10-20 09:00:00',
    updateByName: '蒋十四',
    updateTime: '2024-10-30 15:00:00',
  },
];

// 根据合同ID获取合同详情
export function getContractById(id: number): Contract | undefined {
  return mockContractList.find(c => c.id === id);
}

// 根据合同编号获取合同
export function getContractByCode(code: string): Contract | undefined {
  return mockContractList.find(c => c.contractCode === code);
}

// 根据客户ID获取合同列表
export function getContractsByCustomerId(customerId: number): Contract[] {
  return mockContractList.filter(c => c.customerId === customerId);
}

// Mock回款记录数据
export function getPaymentRecordsByContractId(contractId: number): PaymentRecord[] {
  const paymentRecordsMap: Record<number, PaymentRecord[]> = {
    1: [
      {
        id: 1,
        contractId: 1,
        period: '首款',
        planDate: '2024-10-20',
        planAmount: 600000, // 60万
        actualDate: '2024-10-18',
        actualAmount: 600000,
        paymentMethod: PaymentMethod.BankTransfer,
        status: 2,
        createTime: '2024-10-18 14:30:00',
        createByName: '张三',
      },
      {
        id: 2,
        contractId: 1,
        period: '进度款',
        planDate: '2025-01-15',
        planAmount: 800000, // 80万
        actualDate: '2025-01-20',
        actualAmount: 900000, // 90万（客户多付了10万）
        paymentMethod: PaymentMethod.BankTransfer,
        status: 2,
        createTime: '2025-01-20 10:00:00',
        createByName: '张三',
      },
      {
        id: 3,
        contractId: 1,
        period: '尾款',
        planDate: '2025-10-14',
        planAmount: 600000, // 60万
        status: 1,
        createTime: '2024-10-15 14:30:00',
        createByName: '张三',
      },
    ],
    3: [
      {
        id: 4,
        contractId: 3,
        period: '首款',
        planDate: '2024-11-15',
        planAmount: 900000, // 90万
        actualDate: '2024-11-14',
        actualAmount: 900000,
        paymentMethod: PaymentMethod.BankTransfer,
        status: 2,
        createTime: '2024-11-14 15:00:00',
        createByName: '王五',
      },
      {
        id: 5,
        contractId: 3,
        period: '进度款',
        planDate: '2025-03-10',
        planAmount: 1200000, // 120万
        status: 1,
        createTime: '2024-11-10 16:00:00',
        createByName: '王五',
      },
      {
        id: 6,
        contractId: 3,
        period: '尾款',
        planDate: '2025-11-09',
        planAmount: 900000, // 90万
        status: 1,
        createTime: '2024-11-10 16:00:00',
        createByName: '王五',
      },
    ],
    5: [
      {
        id: 7,
        contractId: 5,
        period: '首款',
        planDate: '2024-09-25',
        planAmount: 300000, // 30万
        actualDate: '2024-09-25',
        actualAmount: 300000,
        paymentMethod: PaymentMethod.BankTransfer,
        status: 2,
        createTime: '2024-09-25 11:00:00',
        createByName: '李四',
      },
      {
        id: 8,
        contractId: 5,
        period: '尾款',
        planDate: '2024-12-20',
        planAmount: 300000, // 30万
        actualDate: '2024-11-08',
        actualAmount: 300000,
        paymentMethod: PaymentMethod.BankTransfer,
        status: 2,
        createTime: '2024-11-08 10:00:00',
        createByName: '李四',
      },
    ],
    6: [
      {
        id: 9,
        contractId: 6,
        period: '首款',
        planDate: '2024-10-10',
        planAmount: 540000, // 54万
        actualDate: '2024-10-10',
        actualAmount: 540000,
        paymentMethod: PaymentMethod.BankTransfer,
        status: 2,
        createTime: '2024-10-10 14:00:00',
        createByName: '周八',
      },
      {
        id: 10,
        contractId: 6,
        period: '进度款',
        planDate: '2025-02-05',
        planAmount: 720000, // 72万
        status: 1,
        createTime: '2024-10-05 11:00:00',
        createByName: '周八',
      },
      {
        id: 11,
        contractId: 6,
        period: '尾款',
        planDate: '2025-10-04',
        planAmount: 540000, // 54万
        status: 1,
        createTime: '2024-10-05 11:00:00',
        createByName: '周八',
      },
    ],
  };

  return paymentRecordsMap[contractId] || [];
}

// Mock审批记录数据
export function getApprovalRecordsByContractId(contractId: number): ContractApproval[] {
  const approvalRecordsMap: Record<number, ContractApproval[]> = {
    1: [
      {
        id: 1,
        contractId: 1,
        approvalNode: '提交审批',
        approver: '张三',
        approverId: 1,
        approvalStatus: ApprovalStatus.Approved,
        approvalTime: '2024-10-10 14:00:00',
        sortOrder: 1,
      },
      {
        id: 2,
        contractId: 1,
        approvalNode: '部门经理审批',
        approver: '王经理',
        approverId: 100,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '同意',
        approvalTime: '2024-10-11 10:00:00',
        sortOrder: 2,
      },
      {
        id: 3,
        contractId: 1,
        approvalNode: '财务审批',
        approver: '财务部-李会计',
        approverId: 101,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '财务审核通过',
        approvalTime: '2024-10-12 15:00:00',
        sortOrder: 3,
      },
      {
        id: 4,
        contractId: 1,
        approvalNode: '法务审批',
        approver: '法务部-陈律师',
        approverId: 102,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '合同条款无问题',
        approvalTime: '2024-10-13 11:00:00',
        sortOrder: 4,
      },
      {
        id: 5,
        contractId: 1,
        approvalNode: '总经理审批',
        approver: '总经理-赵总',
        approverId: 103,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '批准',
        approvalTime: '2024-10-14 16:00:00',
        sortOrder: 5,
      },
    ],
    2: [
      {
        id: 6,
        contractId: 2,
        approvalNode: '提交审批',
        approver: '李四',
        approverId: 2,
        approvalStatus: ApprovalStatus.Approved,
        approvalTime: '2024-10-28 10:00:00',
        sortOrder: 1,
      },
      {
        id: 7,
        contractId: 2,
        approvalNode: '部门经理审批',
        approver: '王经理',
        approverId: 100,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '同意',
        approvalTime: '2024-10-29 14:00:00',
        sortOrder: 2,
      },
      {
        id: 8,
        contractId: 2,
        approvalNode: '财务审批',
        approver: '财务部-李会计',
        approverId: 101,
        approvalStatus: ApprovalStatus.Approving,
        sortOrder: 3,
      },
    ],
    3: [
      {
        id: 9,
        contractId: 3,
        approvalNode: '提交审批',
        approver: '王五',
        approverId: 3,
        approvalStatus: ApprovalStatus.Approved,
        approvalTime: '2024-11-05 09:00:00',
        sortOrder: 1,
      },
      {
        id: 10,
        contractId: 3,
        approvalNode: '部门经理审批',
        approver: '王经理',
        approverId: 100,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '同意',
        approvalTime: '2024-11-06 10:00:00',
        sortOrder: 2,
      },
      {
        id: 11,
        contractId: 3,
        approvalNode: '财务审批',
        approver: '财务部-李会计',
        approverId: 101,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '通过',
        approvalTime: '2024-11-07 11:00:00',
        sortOrder: 3,
      },
      {
        id: 12,
        contractId: 3,
        approvalNode: '法务审批',
        approver: '法务部-陈律师',
        approverId: 102,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '同意',
        approvalTime: '2024-11-08 14:00:00',
        sortOrder: 4,
      },
      {
        id: 13,
        contractId: 3,
        approvalNode: '总经理审批',
        approver: '总经理-赵总',
        approverId: 103,
        approvalStatus: ApprovalStatus.Approved,
        approvalOpinion: '批准',
        approvalTime: '2024-11-09 16:00:00',
        sortOrder: 5,
      },
    ],
  };

  return approvalRecordsMap[contractId] || [];
}

// 获取客户方案列表（Mock，用于创建合同时选择）
export function getMockSolutionsByCustomerId(customerId: number) {
  const solutionsMap: Record<number, any[]> = {
    1: [
      {
        id: 1,
        solutionCode: 'CS-20241101-001',
        solutionName: '智慧工厂整体解决方案',
        totalPrice: 2000000,
      },
    ],
    2: [
      {
        id: 2,
        solutionCode: 'CS-20241015-002',
        solutionName: 'MES生产执行系统方案',
        totalPrice: 1500000,
      },
    ],
    3: [
      {
        id: 3,
        solutionCode: 'CS-20241020-003',
        solutionName: '工业物联网平台方案',
        totalPrice: 3000000,
      },
    ],
  };

  return solutionsMap[customerId] || [];
}

// 存储回款记录的Map（用于动态添加）
const paymentRecordsStorage: Record<number, PaymentRecord[]> = {};

// 添加回款记录
export function addPaymentRecord(record: PaymentRecord): void {
  const contractId = record.contractId;
  
  if (!paymentRecordsStorage[contractId]) {
    // 如果该合同还没有存储，先初始化（从mock数据中获取已有的记录）
    paymentRecordsStorage[contractId] = [...getPaymentRecordsByContractId(contractId)];
  }
  
  // 生成新的ID
  const maxId = paymentRecordsStorage[contractId].reduce((max, r) => {
    return Math.max(max, r.id || 0);
  }, 0);
  record.id = maxId + 1;
  
  // 添加到存储
  paymentRecordsStorage[contractId].push(record);
}

// 获取回款记录（优先从存储中获取，否则从mock数据获取）
export function getPaymentRecords(contractId: number): PaymentRecord[] {
  if (paymentRecordsStorage[contractId]) {
    return paymentRecordsStorage[contractId];
  }
  return getPaymentRecordsByContractId(contractId);
}

// 删除回款记录
export function deletePaymentRecord(recordId: number): void {
  // 遍历所有合同的回款记录
  for (const contractId in paymentRecordsStorage) {
    const records = paymentRecordsStorage[contractId];
    const index = records.findIndex(r => r.id === recordId);
    if (index !== -1) {
      // 删除记录
      records.splice(index, 1);
      // 更新合同统计
      updateContractPaymentStatistics(Number(contractId));
      return;
    }
  }
}

// 更新回款记录
export function updatePaymentRecord(record: PaymentRecord): void {
  const contractId = record.contractId;
  
  if (!paymentRecordsStorage[contractId]) {
    // 如果该合同还没有存储，先初始化（从mock数据中获取已有的记录）
    paymentRecordsStorage[contractId] = [...getPaymentRecordsByContractId(contractId)];
  }
  
  // 查找并更新记录
  const records = paymentRecordsStorage[contractId];
  const index = records.findIndex(r => r.id === record.id);
  if (index !== -1) {
    // 更新记录
    records[index] = { ...record };
    // 更新合同统计
    updateContractPaymentStatistics(contractId);
  }
}

// 更新合同回款统计
export function updateContractPaymentStatistics(contractId: number): void {
  const contract = getContractById(contractId);
  if (!contract) return;
  
  // 获取所有回款记录
  const records = getPaymentRecords(contractId);
  
  // 计算已回款金额（只统计有实际回款金额的记录）
  const paidAmount = records
    .filter(r => r.actualAmount && r.actualAmount > 0)
    .reduce((sum, r) => sum + (r.actualAmount || 0), 0);
  
  // 计算未回款金额
  const unpaidAmount = Math.max(0, contract.contractAmount - paidAmount);
  
  // 计算回款率
  const paymentRate = contract.contractAmount > 0
    ? Math.round((paidAmount / contract.contractAmount) * 10000) / 100
    : 0;
  
  // 更新合同数据
  contract.paidAmount = paidAmount;
  contract.unpaidAmount = unpaidAmount;
  contract.paymentRate = paymentRate;
}
