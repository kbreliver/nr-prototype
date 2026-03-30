// 合同管理相关类型定义

// 合同状态枚举
export enum ContractStatus {
  Draft = 1, // 草稿
  Approving = 2, // 审批中
  Signed = 3, // 已签订
  Completed = 4, // 已完成
  Terminated = 5, // 已终止
}

// 审批状态枚举
export enum ApprovalStatus {
  NotSubmitted = 1, // 待提交
  Approving = 2, // 审批中
  Approved = 3, // 已通过
  Rejected = 4, // 已驳回
}

// 回款期次枚举
export enum PaymentPeriod {
  FirstPayment = 1, // 首款
  ProgressPayment = 2, // 进度款
  FinalPayment = 3, // 尾款
  Other = 4, // 其他
}

// 回款方式枚举
export enum PaymentMethod {
  BankTransfer = 1, // 银行转账
  Check = 2, // 支票
  Cash = 3, // 现金
  Other = 4, // 其他
}

// 合同类型枚举
export enum ContractType {
  Sales = 1, // 销售合同
  Service = 2, // 服务合同
  Purchase = 3, // 采购合同
  Other = 4, // 其他
}

// 合同状态映射类型
export interface ContractStatusMap {
  text: string;
  color: string;
}

// 审批状态映射类型
export interface ApprovalStatusMap {
  text: string;
  color: string;
}

// 合同基本信息
export interface Contract {
  id?: number;
  contractCode: string; // 合同编号
  contractName: string; // 合同名称
  customerId: number; // 客户ID
  customerName: string; // 客户名称
  solutionId?: number; // 关联方案ID
  solutionName?: string; // 方案名称
  solutionCode?: string; // 方案编号
  contractAmount: number; // 合同金额(元)
  paidAmount: number; // 已回款金额(元)
  unpaidAmount: number; // 未回款金额(元)
  paymentRate: number; // 回款率(%)
  signDate: string; // 签订日期
  startDate?: string; // 合同开始日期
  endDate?: string; // 合同结束日期
  contractStatus: ContractStatus; // 合同状态
  approvalStatus: ApprovalStatus; // 审批状态
  oaFlowId?: string; // OA流程ID
  contractType?: ContractType; // 合同类型
  responsiblePerson: string; // 合同负责人
  responsiblePersonId?: number; // 负责人ID
  contractTerms?: string; // 合同条款(富文本)
  attachments?: ContractAttachment[]; // 合同附件
  remark?: string; // 备注说明
  orderCount?: number; // 关联订单数量
  projectCount?: number; // 关联项目数量
  createBy?: number;
  createByName?: string;
  createTime?: string;
  updateBy?: number;
  updateByName?: string;
  updateTime?: string;
}

// 合同附件
export interface ContractAttachment {
  id?: number;
  contractId?: number;
  fileName: string; // 文件名
  fileUrl: string; // 文件URL
  fileSize: number; // 文件大小(字节)
  fileType: string; // 文件类型
  uploadTime?: string; // 上传时间
  uploadBy?: string; // 上传人
}

// 回款计划
export interface PaymentPlan {
  id?: number;
  contractId?: number;
  period: string; // 回款期次
  planDate: string; // 计划回款日期
  planAmount: number; // 计划回款金额(元)
  description?: string; // 回款说明
}

// 回款记录
export interface PaymentRecord {
  id?: number;
  contractId: number; // 合同ID
  period: string; // 回款期次
  planDate: string; // 计划回款日期
  planAmount: number; // 计划回款金额(元)
  actualDate?: string; // 实际回款日期
  actualAmount?: number; // 实际回款金额(元)
  paymentMethod?: PaymentMethod; // 回款方式
  voucher?: string; // 回款凭证(文件URL)
  voucherName?: string; // 凭证文件名
  status: number; // 回款状态：1-未回款，2-已回款
  remark?: string; // 备注
  createTime?: string;
  createByName?: string;
  updateTime?: string;
}

// 审批记录
export interface ContractApproval {
  id?: number;
  contractId: number; // 合同ID
  approvalNode: string; // 审批节点
  approver: string; // 审批人
  approverId?: number; // 审批人ID
  approvalStatus: ApprovalStatus; // 审批状态
  approvalOpinion?: string; // 审批意见
  approvalTime?: string; // 审批时间
  sortOrder: number; // 排序号
}

// 合同搜索表单
export interface ContractSearchForm {
  keyword?: string; // 关键字(合同名称或编号)
  customerName?: string; // 客户名称
  contractStatus?: ContractStatus; // 合同状态
  approvalStatus?: ApprovalStatus; // 审批状态
  signDateRange?: [string, string]; // 签订日期范围
  responsiblePerson?: string; // 负责人
}

// 创建方式枚举
export enum CreateMethod {
  FromSolution = 1, // 从客户方案创建
  FromQuotation = 2, // 从报价单创建
  Manual = 3, // 手动创建
}

// 合同表单
export interface ContractForm {
  contractName: string; // 合同名称
  createMethod: CreateMethod; // 创建方式
  customerId?: number; // 客户ID
  customerName?: string; // 客户名称
  solutionId?: number; // 关联方案ID
  solutionName?: string; // 方案名称
  contractAmount: number; // 合同金额(万元)
  signDate: string; // 签订日期
  startDate?: string; // 合同开始日期
  endDate?: string; // 合同结束日期
  responsiblePersonId?: number; // 负责人ID
  responsiblePerson?: string; // 负责人姓名
  contractType?: ContractType; // 合同类型
  contractTerms?: string; // 合同条款
  paymentPlans: PaymentPlan[]; // 回款计划
  attachments: ContractAttachment[]; // 合同附件
  remark?: string; // 备注说明
}

// 回款记录表单
export interface PaymentRecordForm {
  period: string; // 回款期次
  planDate: string; // 计划回款日期
  planAmount: number; // 计划回款金额(万元)
  actualDate?: string; // 实际回款日期
  actualAmount?: number; // 实际回款金额(万元)
  paymentMethod?: PaymentMethod; // 回款方式
  voucher?: string; // 回款凭证
  voucherName?: string; // 凭证文件名
  remark?: string; // 备注
}

// 合同统计数据
export interface ContractStatistics {
  totalAmount: number; // 合同总金额
  paidAmount: number; // 已回款金额
  unpaidAmount: number; // 未回款金额
  paymentRate: number; // 回款率
  orderCount: number; // 关联订单数
  projectCount: number; // 关联项目数
}
