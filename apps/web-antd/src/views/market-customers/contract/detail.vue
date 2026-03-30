<script lang="ts" setup>
import { computed, h, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs, { Dayjs } from 'dayjs';
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Upload,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
import type {
  Contract,
  ContractApproval,
  ContractStatistics,
  PaymentPlan,
  PaymentRecord,
  PaymentRecordForm,
} from './types';
import {
  ApprovalStatus,
  ContractStatus,
  ContractType,
  CreateMethod,
} from './types';
import {
  canAddPaymentRecord,
  canCreateOrder,
  canSubmitApproval,
  formatAmountWan,
  formatCurrency,
  formatFileSize,
  getApprovalStatusMap,
  getApprovalStatusText,
  getContractStatusMap,
  getContractStatusText,
  getContractTypeText,
  getPaymentMethodText,
  getPaymentStatusColor,
  getPaymentStatusText,
  isContractEditable,
  validateDateRange,
} from './utils';
import {
  addPaymentRecord,
  deletePaymentRecord,
  getApprovalRecordsByContractId,
  getContractById,
  getMockSolutionsByCustomerId,
  getPaymentRecords,
  updateContractPaymentStatistics,
  updatePaymentRecord,
} from './mock';
import PaymentRecordModal from './components/PaymentRecordModal.vue';
import { mockCustomerList } from '../archives/mock';

defineOptions({
  name: 'ContractDetail',
});

const route = useRoute();
const router = useRouter();

const contractId = ref(route.query.id ? Number(route.query.id) : null);
const activeTab = ref('basic');

const contractStatusMap = getContractStatusMap();
const approvalStatusMap = getApprovalStatusMap();

function parseRouteMode(modeParam: unknown) {
  const value = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  if (value === 'edit' || value === 'view') {
    return value;
  }
  return undefined;
}

const isExistingContract = computed(() => !!contractId.value);
const initialMode = parseRouteMode(route.query.mode);
const isEditMode = ref(initialMode === 'edit');
const isViewMode = computed(() => !isEditMode.value);

const contractDetail = ref<Contract | null>(null);
const paymentRecords = ref<PaymentRecord[]>([]);
const approvalRecords = ref<ContractApproval[]>([]);

// 回款记录弹窗
const paymentRecordModalVisible = ref(false);
const currentPaymentRecord = ref<PaymentRecord | null>(null);
const paymentRecordMode = ref<'add' | 'edit' | 'view'>('add');

const statistics = computed<ContractStatistics>(() => {
  if (!contractDetail.value) {
    return {
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      paymentRate: 0,
      orderCount: 0,
      projectCount: 0,
    };
  }

  return {
    totalAmount: contractDetail.value.contractAmount,
    paidAmount: contractDetail.value.paidAmount,
    unpaidAmount: contractDetail.value.unpaidAmount,
    paymentRate: contractDetail.value.paymentRate,
    orderCount: contractDetail.value.orderCount || 0,
    projectCount: contractDetail.value.projectCount || 0,
  };
});

const formRef = ref<FormInstance>();

const formData = reactive<any>({
  contractCode: '',
  contractName: '',
  createMethod: CreateMethod.Manual,
  customerId: undefined,
  customerName: '',
  solutionId: undefined,
  solutionName: '',
  contractAmount: 0,
  signDate: null as Dayjs | null,
  startDate: null as Dayjs | null,
  endDate: null as Dayjs | null,
  responsiblePersonId: undefined,
  responsiblePerson: '',
  contractType: ContractType.Sales,
  contractTerms: '',
  paymentPlans: [] as PaymentPlan[],
  attachments: [],
  remark: '',
});

const customerList = mockCustomerList;
const solutionList = ref<any[]>([]);
const responsiblePersonList = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
  { id: 5, name: '周八' },
  { id: 6, name: '吴九' },
  { id: 7, name: '钱十' },
];

const formRules = {
  contractName: [
    { required: true, message: '请输入合同名称' },
    { max: 100, message: '合同名称不能超过100个字符' },
  ],
  customerId: [{ required: true, message: '请选择客户' }],
  contractAmount: [
    { required: true, message: '请输入合同金额' },
    {
      validator: (_rule: any, value: number) => {
        if (value <= 0) {
          return Promise.reject('合同金额必须大于0');
        }
        return Promise.resolve();
      },
    },
  ],
  signDate: [{ required: true, message: '请选择签订日期' }],
  responsiblePersonId: [{ required: true, message: '请选择负责人' }],
};

function handleCustomerChange(customerIdValue: number | undefined) {
  if (!customerIdValue) return;
  const customer = customerList.find((c) => c.id === customerIdValue);
  if (customer) {
    formData.customerName = customer.customerName;
    solutionList.value = getMockSolutionsByCustomerId(customerIdValue);
  }
  formData.solutionId = undefined;
  formData.solutionName = '';
}

function handleSolutionChange(solutionIdValue: number | undefined) {
  if (!solutionIdValue) return;
  const solution = solutionList.value.find((s) => s.id === solutionIdValue);
  if (solution) {
    formData.solutionName = solution.solutionName;
    if (!formData.contractName) {
      formData.contractName = solution.solutionName;
    }
    formData.contractAmount = solution.totalPrice / 10000;
  }
}

function handleResponsiblePersonChange(personId: number | undefined) {
  if (!personId) return;
  const person = responsiblePersonList.find((p) => p.id === personId);
  if (person) {
    formData.responsiblePerson = person.name;
  }
}

function handleAddPaymentPlan() {
  formData.paymentPlans.push({
    period: '',
    planDate: '',
    planAmount: 0,
    description: '',
  });
}

function handleDeletePaymentPlan(index: number) {
  formData.paymentPlans.splice(index, 1);
}

const paymentPlanColumns = computed<TableColumnsType<PaymentPlan>>(() => {
  if (isViewMode.value) {
    return [
      { title: '期次', dataIndex: 'period', key: 'period', width: 150 },
      {
        title: '计划回款日期',
        dataIndex: 'planDate',
        key: 'planDate',
        width: 160,
        customRender: ({ text }) => text || '-',
      },
      {
        title: '计划金额(万)',
        dataIndex: 'planAmount',
        key: 'planAmount',
        width: 150,
        customRender: ({ text }) =>
          text === null || text === undefined ? '-' : Number(text).toFixed(2),
      },
      {
        title: '说明',
        dataIndex: 'description',
        key: 'description',
        customRender: ({ text }) => text || '-',
      },
    ];
  }

  return [
    {
      title: '期次',
      dataIndex: 'period',
      key: 'period',
      width: 150,
      customRender: ({ record, index }) =>
        h(Input as any, {
          value: record.period,
          placeholder: '如：首款、进度款',
          maxlength: 50,
          'onUpdate:value': (value: string) => {
            formData.paymentPlans[index].period = value;
          },
        }),
    },
    {
      title: '计划回款日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 160,
      customRender: ({ record, index }) =>
        h(DatePicker as any, {
          value: record.planDate ? dayjs(record.planDate) : null,
          format: 'YYYY-MM-DD',
          style: { width: '100%' },
          'onUpdate:value': (value: Dayjs | null) => {
            formData.paymentPlans[index].planDate = value
              ? value.format('YYYY-MM-DD')
              : '';
          },
        }),
    },
    {
      title: '计划金额(万)',
      dataIndex: 'planAmount',
      key: 'planAmount',
      width: 150,
      customRender: ({ record, index }) =>
        h(InputNumber as any, {
          value: record.planAmount,
          min: 0,
          precision: 2,
          step: 0.01,
          style: { width: '100%' },
          'onUpdate:value': (value: number) => {
            formData.paymentPlans[index].planAmount = value;
          },
        }),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      customRender: ({ record, index }) =>
        h(Input as any, {
          value: record.description,
          placeholder: '回款条件说明',
          maxlength: 200,
          'onUpdate:value': (value: string) => {
            formData.paymentPlans[index].description = value;
          },
        }),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      customRender: ({ index }) =>
        h(
          Button,
          {
            type: 'link',
            danger: true,
            size: 'small',
            onClick: () => handleDeletePaymentPlan(index),
          },
          () => [h(DeleteOutlined), ' 删除'],
        ),
    },
  ];
});

const paymentPlanTotal = computed(() =>
  formData.paymentPlans.reduce(
    (sum: number, plan: PaymentPlan) => sum + (plan.planAmount || 0),
    0,
  ),
);

const isPaymentPlanValid = computed(() => {
  if (formData.paymentPlans.length === 0) return true;
  return Math.abs(paymentPlanTotal.value - formData.contractAmount) < 0.01;
});

function handleUpload(info: any) {
  if (info.file.status === 'done') {
    formData.attachments.push({
      fileName: info.file.name,
      fileUrl: info.file.response?.url || '/uploads/' + info.file.name,
      fileSize: info.file.size,
      fileType: info.file.type,
    });
    message.success('上传成功');
  } else if (info.file.status === 'error') {
    message.error('上传失败');
  }
}

function handleDeleteAttachment(index: number) {
  formData.attachments.splice(index, 1);
}

function handleBack() {
  router.push('/market-customers/contract');
}

function updateRouteMode(mode: 'view' | 'edit') {
  const currentMode = parseRouteMode(route.query.mode);
  if (currentMode === mode) return;
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      mode,
    },
  });
}

function handleEnterEdit() {
  if (!isExistingContract.value) return;
  isEditMode.value = true;
  updateRouteMode('edit');
}

function handleCancelEdit() {
  isEditMode.value = false;
  updateRouteMode('view');
  if (contractDetail.value) {
    fillFormWithContract(contractDetail.value);
  }
}

async function validateBeforeSubmit(requirePlans: boolean) {
  await formRef.value?.validate();

  if (requirePlans && formData.paymentPlans.length === 0) {
    message.error('请添加回款计划');
    throw new Error('payment');
  }

  if (formData.paymentPlans.length > 0 && !isPaymentPlanValid.value) {
    message.error('回款计划金额总和必须等于合同金额');
    throw new Error('payment-invalid');
  }

  if (requirePlans && formData.attachments.length === 0) {
    message.error('提交审批时必须上传合同附件');
    throw new Error('attachments');
  }

  const startDateStr = formData.startDate
    ? formData.startDate.format('YYYY-MM-DD')
    : '';
  const endDateStr = formData.endDate
    ? formData.endDate.format('YYYY-MM-DD')
    : '';
  if (startDateStr && endDateStr && !validateDateRange(startDateStr, endDateStr)) {
    message.error('合同开始日期不能晚于结束日期');
    throw new Error('date');
  }
}

async function handleSaveDraft() {
  try {
    await validateBeforeSubmit(false);
    message.success('保存草稿成功');
    isEditMode.value = false;
    updateRouteMode('view');
    loadContractDetail();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('payment')) return;
    if (error instanceof Error && error.message === 'attachments') return;
    if (error instanceof Error && error.message === 'date') return;
    console.error(error);
  }
}

async function handleSubmitApproval() {
  try {
    await validateBeforeSubmit(true);
    message.success('提交审批成功');
    isEditMode.value = false;
    updateRouteMode('view');
    loadContractDetail();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('payment')) return;
    if (error instanceof Error && error.message === 'attachments') return;
    if (error instanceof Error && error.message === 'date') return;
    console.error(error);
  }
}

function handleTerminate() {
  if (!contractDetail.value) return;
  Modal.confirm({
    title: '终止合同',
    content: `确定要终止合同"${contractDetail.value.contractName}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      message.success('合同已终止');
      loadContractDetail();
    },
  });
}

function handleCreateOrder() {
  if (!contractId.value) return;
  router.push({
    path: '/market-customers/order/edit',
    query: { contractId: contractId.value },
  });
}

function handleAddPayment() {
  currentPaymentRecord.value = null;
  paymentRecordMode.value = 'add';
  paymentRecordModalVisible.value = true;
}

function handleViewPaymentRecord(record: PaymentRecord) {
  currentPaymentRecord.value = record;
  paymentRecordMode.value = 'view';
  paymentRecordModalVisible.value = true;
}

function handleEditPaymentRecord(record: PaymentRecord) {
  currentPaymentRecord.value = record;
  paymentRecordMode.value = 'edit';
  paymentRecordModalVisible.value = true;
}

function handleDeletePaymentRecord(record: PaymentRecord) {
  Modal.confirm({
    title: '删除回款记录',
    content: `确定要删除回款期次为"${record.period}"的回款记录吗？删除后无法恢复。`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        // 删除回款记录
        deletePaymentRecord(record.id!);
        
        // 更新合同回款统计
        updateContractPaymentStatistics(contractId.value!);
        
        // 刷新数据
        loadContractDetail();
        
        message.success('删除成功');
      } catch (error) {
        console.error('删除回款记录失败:', error);
        message.error('删除失败');
      }
    },
  });
}

async function handlePaymentRecordSubmit(data: PaymentRecordForm) {
  if (!contractId.value || !contractDetail.value) {
    message.error('合同信息不存在');
    return;
  }

  try {
    // 转换金额单位：万元 -> 元
    const planAmount = data.planAmount * 10000;
    const actualAmount = data.actualAmount ? data.actualAmount * 10000 : undefined;

    if (paymentRecordMode.value === 'edit' && currentPaymentRecord.value) {
      // 编辑模式：更新回款记录
      const updatedRecord: PaymentRecord = {
        ...currentPaymentRecord.value,
        period: data.period,
        planDate: data.planDate,
        planAmount: planAmount,
        actualDate: data.actualDate,
        actualAmount: actualAmount,
        paymentMethod: data.paymentMethod,
        voucher: data.voucher,
        voucherName: data.voucherName,
        status: actualAmount ? 2 : 1, // 有实际金额则为已回款，否则为未回款
        remark: data.remark,
        updateTime: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-'),
        updateByName: '当前用户', // TODO: 从用户信息获取
      };

      // 更新回款记录
      updatePaymentRecord(updatedRecord);
      message.success('回款记录更新成功');
    } else {
      // 新增模式：创建回款记录
      const newRecord: PaymentRecord = {
        contractId: contractId.value,
        period: data.period,
        planDate: data.planDate,
        planAmount: planAmount,
        actualDate: data.actualDate,
        actualAmount: actualAmount,
        paymentMethod: data.paymentMethod,
        voucher: data.voucher,
        voucherName: data.voucherName,
        status: actualAmount ? 2 : 1, // 有实际金额则为已回款，否则为未回款
        remark: data.remark,
        createTime: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-'),
        createByName: '当前用户', // TODO: 从用户信息获取
      };

      // 保存回款记录
      addPaymentRecord(newRecord);
      message.success('回款记录添加成功');
    }

    // 更新合同回款统计
    updateContractPaymentStatistics(contractId.value);

    // 刷新数据
    loadContractDetail();
  } catch (error) {
    console.error('保存回款记录失败:', error);
    message.error('保存回款记录失败');
  }
}

function fillFormWithContract(contract: Contract) {
  formData.contractCode = contract.contractCode || '';
  formData.contractName = contract.contractName;
  formData.createMethod = contract.createMethod || CreateMethod.Manual;
  formData.customerId = contract.customerId;
  formData.customerName = contract.customerName;
  formData.solutionId = contract.solutionId;
  formData.solutionName = contract.solutionName || '';
  formData.contractAmount = contract.contractAmount / 10000;
  formData.signDate = contract.signDate ? dayjs(contract.signDate) : null;
  formData.startDate = contract.startDate ? dayjs(contract.startDate) : null;
  formData.endDate = contract.endDate ? dayjs(contract.endDate) : null;
  formData.responsiblePersonId = contract.responsiblePersonId;
  formData.responsiblePerson = contract.responsiblePerson;
  formData.contractType = contract.contractType || ContractType.Sales;
  formData.contractTerms = contract.contractTerms || '';
  formData.paymentPlans = (contract.paymentPlans || []).map((plan) => ({
    ...plan,
  }));
  formData.attachments = contract.attachments ? [...contract.attachments] : [];
  formData.remark = contract.remark || '';

  if (contract.customerId) {
    solutionList.value = getMockSolutionsByCustomerId(contract.customerId);
  }
}

function loadContractDetail() {
  if (!contractId.value) return;
  const contract = getContractById(contractId.value);
  if (contract) {
    contractDetail.value = contract;
    fillFormWithContract(contract);
    paymentRecords.value = getPaymentRecords(contractId.value);
    approvalRecords.value = getApprovalRecordsByContractId(contractId.value);
  } else {
    message.error('合同不存在');
    handleBack();
  }
}

const paymentColumns: TableColumnsType<PaymentRecord> = [
  {
    title: '回款期次',
    dataIndex: 'period',
    key: 'period',
    width: 100,
  },
  {
    title: '计划回款日期',
    dataIndex: 'planDate',
    key: 'planDate',
    width: 120,
  },
  {
    title: '计划金额(万)',
    dataIndex: 'planAmount',
    key: 'planAmount',
    width: 120,
    align: 'right',
    customRender: ({ record }) => formatAmountWan(record.planAmount),
  },
  {
    title: '实际回款日期',
    dataIndex: 'actualDate',
    key: 'actualDate',
    width: 120,
    customRender: ({ text }) => text || '-',
  },
  {
    title: '实际金额(万)',
    dataIndex: 'actualAmount',
    key: 'actualAmount',
    width: 120,
    align: 'right',
    customRender: ({ record }) =>
      record.actualAmount ? formatAmountWan(record.actualAmount) : '-',
  },
  {
    title: '回款方式',
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    width: 100,
    customRender: ({ record }) => getPaymentMethodText(record.paymentMethod),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    customRender: ({ record }) =>
      h(
        Tag,
        {
          color: getPaymentStatusColor(record.status),
        },
        () => getPaymentStatusText(record.status),
      ),
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    customRender: ({ record }) =>
      h(Space, { size: 'small' }, () => [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleViewPaymentRecord(record),
        }, () => '查看'),
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEditPaymentRecord(record),
        }, () => '编辑'),
        h(Button, {
          type: 'link',
          size: 'small',
          danger: true,
          onClick: () => handleDeletePaymentRecord(record),
        }, () => '删除'),
      ]),
  },
];

const approvalColumns: TableColumnsType<ContractApproval> = [
  {
    title: '审批节点',
    dataIndex: 'approvalNode',
    key: 'approvalNode',
    width: 150,
  },
  {
    title: '审批人',
    dataIndex: 'approver',
    key: 'approver',
    width: 120,
  },
  {
    title: '审批状态',
    dataIndex: 'approvalStatus',
    key: 'approvalStatus',
    width: 100,
    customRender: ({ record }) =>
      h(
        Tag,
        {
          color: approvalStatusMap[record.approvalStatus].color,
        },
        () => getApprovalStatusText(record.approvalStatus),
      ),
  },
  {
    title: '审批意见',
    dataIndex: 'approvalOpinion',
    key: 'approvalOpinion',
    ellipsis: true,
    customRender: ({ text }) => text || '-',
  },
  {
    title: '审批时间',
    dataIndex: 'approvalTime',
    key: 'approvalTime',
    width: 160,
    customRender: ({ text }) => text || '-',
  },
];

watch(
  () => route.query.mode,
  (mode) => {
    if (!isExistingContract.value) return;
    isEditMode.value = parseRouteMode(mode) === 'edit';
  },
);

watch(
  () => route.query.id,
  (id) => {
    contractId.value = id ? Number(id) : null;
    if (contractId.value) {
      if (!parseRouteMode(route.query.mode)) {
        updateRouteMode('view');
      }
      loadContractDetail();
    }
  },
);

if (isExistingContract.value) {
  loadContractDetail();
  if (!initialMode) {
    updateRouteMode('view');
  }
} else {
  message.error('缺少合同ID参数');
  handleBack();
}
</script>

<template>
  <div class="p-4">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center">
        <Button type="text" @click="handleBack"> ← 返回 </Button>
        <div class="ml-4">
          <h1 class="text-2xl font-bold">
            {{ formData.contractName || '合同详情' }}
          </h1>
          <p class="text-gray-500 mt-1 flex items-center flex-wrap gap-2">
            <span>合同编号: {{ formData.contractCode || '-' }}</span>
            <Tag
              v-if="contractDetail"
              :color="contractStatusMap[contractDetail.contractStatus].color"
            >
              {{ getContractStatusText(contractDetail.contractStatus) }}
            </Tag>
            <Tag
              v-if="contractDetail"
              :color="approvalStatusMap[contractDetail.approvalStatus].color"
            >
              {{ getApprovalStatusText(contractDetail.approvalStatus) }}
            </Tag>
          </p>
        </div>
      </div>
      <Space>
        <template v-if="isViewMode">
          <Button @click="handleBack">返回列表</Button>
          <Button
            v-if="contractDetail && isContractEditable(contractDetail.contractStatus)"
            type="primary"
            @click="handleEnterEdit"
          >
            编辑
          </Button>
          <Button
            v-if="contractDetail && canSubmitApproval(contractDetail.contractStatus, contractDetail.approvalStatus)"
            type="primary"
            ghost
            @click="handleSubmitApproval"
          >
            提交审批
          </Button>
          <Button
            v-if="contractDetail?.contractStatus === ContractStatus.Signed"
            danger
            @click="handleTerminate"
          >
            终止
          </Button>
        </template>
        <template v-else>
          <Button @click="handleCancelEdit">取消</Button>
          <Button @click="handleSaveDraft">保存草稿</Button>
          <Button type="primary" @click="handleSubmitApproval">提交审批</Button>
        </template>
      </Space>
    </div>

    <Card v-if="contractDetail" size="small" class="mb-3">
      <div class="flex flex-wrap">
        <div class="flex-1 min-w-[160px] text-center px-4 py-2">
          <div class="text-gray-500 mb-2">合同金额</div>
          <div class="text-2xl font-semibold text-red-600">
            {{ formatAmountWan(statistics.totalAmount) }}
            <span class="text-sm text-gray-400 ml-1">万</span>
          </div>
        </div>
        <div class="border-l border-gray-200 hidden md:block"></div>
        <div class="flex-1 min-w-[160px] text-center px-4 py-2">
          <div class="text-gray-500 mb-2">已回款</div>
          <div class="text-2xl font-semibold text-green-600">
            {{ formatAmountWan(statistics.paidAmount) }}
            <span class="text-sm text-gray-400 ml-1">万</span>
          </div>
        </div>
        <div class="border-l border-gray-200 hidden md:block"></div>
        <div class="flex-1 min-w-[160px] text-center px-4 py-2">
          <div class="text-gray-500 mb-2">未回款</div>
          <div class="text-2xl font-semibold text-red-500">
            {{ formatAmountWan(statistics.unpaidAmount) }}
            <span class="text-sm text-gray-400 ml-1">万</span>
          </div>
        </div>
        <div class="border-l border-gray-200 hidden md:block"></div>
        <div class="flex-1 min-w-[160px] text-center px-4 py-2">
          <div class="text-gray-500 mb-2">回款率</div>
          <div class="text-2xl font-semibold text-orange-500">
            {{ statistics.paymentRate }}%
          </div>
        </div>
        <div class="border-l border-gray-200 hidden md:block"></div>
        <div class="flex-1 min-w-[160px] text-center px-4 py-2">
          <div class="text-gray-500 mb-2">关联订单</div>
          <div class="text-2xl font-semibold">
            {{ statistics.orderCount }}
            <span class="text-sm text-gray-400 ml-1">个</span>
          </div>
        </div>
        <div class="border-l border-gray-200 hidden md:block"></div>
        <div class="flex-1 min-w-[160px] text-center px-4 py-2">
          <div class="text-gray-500 mb-2">关联项目</div>
          <div class="text-2xl font-semibold">
            {{ statistics.projectCount }}
            <span class="text-sm text-gray-400 ml-1">个</span>
          </div>
        </div>
      </div>
    </Card>

    <Card>
      <Tabs v-model:activeKey="activeTab">
        <Tabs.TabPane key="basic" tab="基本信息" force-render>
          <Form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :disabled="isViewMode"
          >
            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">基本信息</h3>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="合同名称" name="contractName">
                    <Input
                      v-model:value="formData.contractName"
                      placeholder="请输入合同名称"
                      :maxlength="100"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="创建方式">
                    <Select
                      v-model:value="formData.createMethod"
                      placeholder="请选择创建方式"
                      :disabled="isExistingContract"
                    >
                      <Select.Option :value="CreateMethod.FromSolution">
                        从客户方案创建
                      </Select.Option>
                      <Select.Option :value="CreateMethod.FromQuotation">
                        从报价单创建
                      </Select.Option>
                      <Select.Option :value="CreateMethod.Manual">
                        手动创建
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="客户名称" name="customerId">
                    <Select
                      v-model:value="formData.customerId"
                      placeholder="请选择客户"
                      show-search
                      :filter-option="(input, option) =>
                        option?.label?.toLowerCase().includes(input.toLowerCase())"
                      :options="customerList.map((c) => ({
                        value: c.id,
                        label: c.customerName,
                      }))"
                      @change="(value: any) => handleCustomerChange(value)"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="关联客户方案">
                    <Select
                      v-model:value="formData.solutionId"
                      placeholder="请选择方案"
                      :disabled="!formData.customerId"
                      allow-clear
                      @change="(value: any) => handleSolutionChange(value)"
                    >
                      <Select.Option
                        v-for="solution in solutionList"
                        :key="solution.id"
                        :value="solution.id"
                      >
                        {{ solution.solutionName }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="合同金额(万)" name="contractAmount">
                    <InputNumber
                      v-model:value="formData.contractAmount"
                      :min="0"
                      :precision="2"
                      :step="0.01"
                      style="width: 100%"
                      placeholder="请输入合同金额"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="签订日期" name="signDate">
                    <DatePicker
                      v-model:value="formData.signDate"
                      format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="合同开始日期">
                    <DatePicker
                      v-model:value="formData.startDate"
                      format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="合同结束日期">
                    <DatePicker
                      v-model:value="formData.endDate"
                      format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="合同负责人" name="responsiblePersonId">
                    <Select
                      v-model:value="formData.responsiblePersonId"
                      placeholder="请选择负责人"
                      :options="responsiblePersonList.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))"
                      @change="(value: any) => handleResponsiblePersonChange(value)"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="合同类型">
                    <Select v-model:value="formData.contractType" placeholder="请选择合同类型">
                      <Select.Option :value="ContractType.Sales">销售合同</Select.Option>
                      <Select.Option :value="ContractType.Service">服务合同</Select.Option>
                      <Select.Option :value="ContractType.Purchase">采购合同</Select.Option>
                      <Select.Option :value="ContractType.Other">其他</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">合同条款</h3>
              <Row>
                <Col :span="24">
                  <Form.Item label="合同条款" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
                    <Input.TextArea
                      v-model:value="formData.contractTerms"
                      :rows="6"
                      placeholder="请输入合同条款内容"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">
                回款计划
                <span
                  v-if="!isPaymentPlanValid"
                  class="ml-2 text-red-500 text-sm font-normal"
                >
                  （总额：{{ paymentPlanTotal.toFixed(2) }}万，应等于合同金额：{{
                    formData.contractAmount.toFixed(2)
                  }}万）
                </span>
                <span
                  v-else-if="paymentPlanTotal > 0"
                  class="ml-2 text-green-600 text-sm font-normal"
                >
                  （总额：{{ paymentPlanTotal.toFixed(2) }}万 ✓）
                </span>
              </h3>
              <Row>
                <Col :span="24">
                  <div class="mb-4">
                    <Button v-if="isEditMode" type="dashed" @click="handleAddPaymentPlan">
                      <template #icon>
                        <PlusOutlined />
                      </template>
                      添加回款计划
                    </Button>
                  </div>

                  <Table
                    v-if="formData.paymentPlans.length > 0"
                    :columns="paymentPlanColumns"
                    :data-source="formData.paymentPlans"
                    :pagination="false"
                    :row-key="(_record: any, index?: number) => index ?? 0"
                  />
                </Col>
              </Row>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">合同附件</h3>
              <Row>
                <Col :span="24">
                  <Form.Item label="合同附件" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
                    <template v-if="isEditMode">
                      <Upload
                        :show-upload-list="false"
                        action="/api/upload"
                        @change="handleUpload"
                      >
                        <Button>
                          <template #icon>
                            <UploadOutlined />
                          </template>
                          点击上传
                        </Button>
                        <div class="text-gray-400 text-sm mt-2">
                          支持：PDF, Word, Excel, 图片等格式
                        </div>
                      </Upload>
                    </template>

                    <div v-if="formData.attachments.length > 0" class="mt-4">
                      <div
                        v-for="(file, index) in formData.attachments"
                        :key="index"
                        class="flex items-center justify-between p-2 border rounded mb-2"
                      >
                        <span>
                          📄 {{ file.fileName }}
                          <span class="text-xs text-gray-400 ml-2">
                            ({{ formatFileSize(file.fileSize) }})
                          </span>
                        </span>
                        <Button
                          v-if="isEditMode"
                          type="link"
                          danger
                          @click="handleDeleteAttachment(index)"
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                    <div v-else class="text-gray-400">暂无附件</div>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">备注说明</h3>
              <Row>
                <Col :span="24">
                  <Form.Item label="备注说明" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
                    <Input.TextArea
                      v-model:value="formData.remark"
                      :rows="4"
                      :maxlength="500"
                      placeholder="请输入备注信息"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane key="payment" tab="回款记录">
          <div class="mb-4">
            <Button
              v-if="contractDetail && canAddPaymentRecord(contractDetail.contractStatus)"
              type="primary"
              @click="handleAddPayment"
            >
              添加回款记录
            </Button>
          </div>

          <Table
            :columns="paymentColumns"
            :data-source="paymentRecords"
            :row-key="(record) => record.id!"
            :pagination="false"
          />


        </Tabs.TabPane>

        <Tabs.TabPane key="orders" tab="关联订单">
          <div class="mb-4">
            <Button
              v-if="
                contractDetail &&
                canCreateOrder(contractDetail.contractStatus, contractDetail.approvalStatus)
              "
              type="primary"
              @click="handleCreateOrder"
            >
              新建订单
            </Button>
          </div>

          <div class="p-8 text-center text-gray-400">暂无关联订单</div>
        </Tabs.TabPane>

        <Tabs.TabPane key="approval" tab="审批记录">
          <div v-if="approvalRecords.length > 0">
            <Table
              :columns="approvalColumns"
              :data-source="approvalRecords"
              :row-key="(record) => record.id!"
              :pagination="false"
            />
          </div>
          <div v-else class="p-8 text-center text-gray-400">
            暂无审批记录
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>

    <!-- 回款记录弹窗 -->
    <PaymentRecordModal
      v-model:visible="paymentRecordModalVisible"
      :record="currentPaymentRecord"
      :mode="paymentRecordMode"
      :contract-amount="contractDetail?.contractAmount || 0"
      :paid-amount="contractDetail?.paidAmount || 0"
      @submit="handlePaymentRecordSubmit"
    />
  </div>
</template>

<style scoped>
:deep(.ant-descriptions-item-label) {
  width: 150px;
  background-color: #fafafa;
}

:deep(.ant-statistic-title) {
  color: #666;
  font-size: 14px;
}

:deep(.ant-statistic-content) {
  font-size: 24px;
}
</style>
