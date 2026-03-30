<script lang="ts" setup>
import { h, reactive, ref, computed, watch } from 'vue';
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
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Table,
  Upload,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
import type { PaymentPlan } from './types';
import { ContractType, CreateMethod } from './types';
import { validateDateRange } from './utils';
import { getContractById, getMockSolutionsByCustomerId } from './mock';
import { mockCustomerList } from '../archives/mock';

defineOptions({
  name: 'ContractEdit',
});

const route = useRoute();
const router = useRouter();

// 获取合同ID（编辑模式）
const contractId = ref(route.query.id ? Number(route.query.id) : null);
const isExistingContract = computed(() => !!contractId.value);

function parseRouteMode(modeParam: unknown) {
  const value = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  if (value === 'edit' || value === 'view') {
    return value;
  }
  return undefined;
}

const initialMode = parseRouteMode(route.query.mode);
const isEditMode = ref(!isExistingContract.value || initialMode === 'edit');
const isViewMode = computed(() => !isEditMode.value);

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
  if (!isExistingContract.value) {
    handleBack();
    return;
  }
  isEditMode.value = false;
  updateRouteMode('view');
}

const formRef = ref<FormInstance>();

// 表单数据
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
  paymentPlans: [],
  attachments: [],
  remark: '',
});

// 客户列表
const customerList = mockCustomerList;

// 方案列表（根据选中的客户动态加载）
const solutionList = ref<any[]>([]);

// 负责人列表（Mock）
const responsiblePersonList = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
  { id: 5, name: '周八' },
  { id: 6, name: '吴九' },
  { id: 7, name: '钱十' },
];

// 表单验证规则
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

// 客户选择变化
function handleCustomerChange(customerId: number | undefined) {
  if (!customerId) return;
  
  const customer = customerList.find((c) => c.id === customerId);
  if (customer) {
    formData.customerName = customer.customerName;
    
    // 加载该客户的方案列表
    solutionList.value = getMockSolutionsByCustomerId(customerId);
  }
  
  // 清空方案选择
  formData.solutionId = undefined;
  formData.solutionName = '';
}

// 方案选择变化
function handleSolutionChange(solutionId: number | undefined) {
  if (!solutionId) return;
  
  const solution = solutionList.value.find((s) => s.id === solutionId);
  if (solution) {
    formData.solutionName = solution.solutionName;
    
    // 自动填充合同名称（如果为空）
    if (!formData.contractName) {
      formData.contractName = solution.solutionName;
    }
    
    // 自动填充合同金额
    formData.contractAmount = solution.totalPrice / 10000; // 转为万元
  }
}

// 负责人选择变化
function handleResponsiblePersonChange(personId: number | undefined) {
  if (!personId) return;
  
  const person = responsiblePersonList.find((p) => p.id === personId);
  if (person) {
    formData.responsiblePerson = person.name;
  }
}

// 添加回款计划
function handleAddPaymentPlan() {
  formData.paymentPlans.push({
    period: '',
    planDate: '',
    planAmount: 0,
    description: '',
  });
}

// 删除回款计划
function handleDeletePaymentPlan(index: number) {
  formData.paymentPlans.splice(index, 1);
}

// 回款计划表格列
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
        customRender: ({ text }) => (text === null || text === undefined ? '-' : Number(text).toFixed(2)),
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
      customRender: ({ record, index }) => ({
        children: Input,
        props: {
          value: record.period,
          placeholder: '如：首款、进度款',
          maxlength: 50,
        },
        on: {
          'update:value': (value: string) => {
            formData.paymentPlans[index].period = value;
          },
        },
      }),
    },
    {
      title: '计划回款日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 160,
      customRender: ({ record, index }) => {
        return h(DatePicker as any, {
          value: record.planDate ? dayjs(record.planDate) : null,
          format: 'YYYY-MM-DD',
          style: { width: '100%' },
          'onUpdate:value': (value: Dayjs | null) => {
            formData.paymentPlans[index].planDate = value ? value.format('YYYY-MM-DD') : '';
          },
        });
      },
    },
    {
      title: '计划金额(万)',
      dataIndex: 'planAmount',
      key: 'planAmount',
      width: 150,
      customRender: ({ record, index }) => ({
        children: InputNumber,
        props: {
          value: record.planAmount,
          min: 0,
          precision: 2,
          step: 0.01,
          style: { width: '100%' },
        },
        on: {
          'update:value': (value: number) => {
            formData.paymentPlans[index].planAmount = value;
          },
        },
      }),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      customRender: ({ record, index }) => ({
        children: Input,
        props: {
          value: record.description,
          placeholder: '回款条件说明',
          maxlength: 200,
        },
        on: {
          'update:value': (value: string) => {
            formData.paymentPlans[index].description = value;
          },
        },
      }),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      customRender: ({ index }) =>
        h(Button, {
          type: 'link',
          danger: true,
          size: 'small',
          onClick: () => handleDeletePaymentPlan(index),
        }, () => [h(DeleteOutlined), ' 删除']),
    },
  ];
});

// 计算回款计划总额
const paymentPlanTotal = computed(() => {
  return formData.paymentPlans.reduce((sum: number, plan: PaymentPlan) => sum + (plan.planAmount || 0), 0);
});

// 回款计划总额是否等于合同金额
const isPaymentPlanValid = computed(() => {
  if (formData.paymentPlans.length === 0) return true;
  return Math.abs(paymentPlanTotal.value - formData.contractAmount) < 0.01;
});

// 文件上传
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

// 删除附件
function handleDeleteAttachment(index: number) {
  formData.attachments.splice(index, 1);
}

// 保存草稿
async function handleSaveDraft() {
  try {
    await formRef.value?.validate();
    
    // 验证回款计划
    if (formData.paymentPlans.length > 0 && !isPaymentPlanValid.value) {
      message.error('回款计划金额总和必须等于合同金额');
      return;
    }
    
    // 验证日期范围
    const startDateStr = formData.startDate ? formData.startDate.format('YYYY-MM-DD') : '';
    const endDateStr = formData.endDate ? formData.endDate.format('YYYY-MM-DD') : '';
    if (startDateStr && endDateStr && !validateDateRange(startDateStr, endDateStr)) {
      message.error('合同开始日期不能晚于结束日期');
      return;
    }
    
    message.success('保存草稿成功');
    router.push('/market-customers/contract');
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 提交审批
async function handleSubmitApproval() {
  try {
    await formRef.value?.validate();
    
    // 验证回款计划
    if (formData.paymentPlans.length === 0) {
      message.error('请添加回款计划');
      return;
    }
    
    if (!isPaymentPlanValid.value) {
      message.error('回款计划金额总和必须等于合同金额');
      return;
    }
    
    // 验证附件
    if (formData.attachments.length === 0) {
      message.error('提交审批时必须上传合同附件');
      return;
    }
    
    // 验证日期范围
    const startDateStr = formData.startDate ? formData.startDate.format('YYYY-MM-DD') : '';
    const endDateStr = formData.endDate ? formData.endDate.format('YYYY-MM-DD') : '';
    if (startDateStr && endDateStr && !validateDateRange(startDateStr, endDateStr)) {
      message.error('合同开始日期不能晚于结束日期');
      return;
    }
    
    message.success('提交审批成功');
    router.push('/market-customers/contract');
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 返回
function handleBack() {
  router.push('/market-customers/contract');
}

// 加载合同数据（编辑模式）
function loadContractData() {
  if (!contractId.value) return;
  
  const contract = getContractById(contractId.value);
  if (contract) {
    // 填充表单数据
    formData.contractCode = contract.contractCode || '';
    formData.contractName = contract.contractName;
    formData.customerId = contract.customerId;
    formData.customerName = contract.customerName;
    formData.solutionId = contract.solutionId;
    formData.solutionName = contract.solutionName || '';
    formData.contractAmount = contract.contractAmount / 10000; // 转为万元
    // 将字符串日期转换为 dayjs 对象
    formData.signDate = contract.signDate ? dayjs(contract.signDate) : null;
    formData.startDate = contract.startDate ? dayjs(contract.startDate) : null;
    formData.endDate = contract.endDate ? dayjs(contract.endDate) : null;
    formData.responsiblePerson = contract.responsiblePerson;
    formData.contractType = contract.contractType || ContractType.Sales;
    formData.contractTerms = contract.contractTerms || '';
    formData.paymentPlans = contract.paymentPlans || [];
    formData.attachments = contract.attachments || [];
    formData.remark = contract.remark || '';
    
    // 加载方案列表
    if (contract.customerId) {
      solutionList.value = getMockSolutionsByCustomerId(contract.customerId);
    }
  }
}

watch(() => route.query.mode, (mode) => {
  if (!isExistingContract.value) return;
  isEditMode.value = parseRouteMode(mode) === 'edit';
});

watch(() => route.query.id, (id) => {
  contractId.value = id ? Number(id) : null;
  if (!contractId.value) {
    isEditMode.value = true;
  } else {
    isEditMode.value = parseRouteMode(route.query.mode) === 'edit';
    if (!parseRouteMode(route.query.mode)) {
      updateRouteMode('view');
    }
  }
  loadContractData();
});

// 初始化
if (isExistingContract.value) {
  loadContractData();
  if (!initialMode) {
    updateRouteMode('view');
  }
} else {
  // 新建模式，设置默认负责人为当前用户（Mock为张三）
  formData.responsiblePersonId = 1;
  formData.responsiblePerson = '张三';
}
</script>

<template>
  <div class="p-4">
    <!-- 页面头部 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center">
        <Button type="text" @click="handleBack"> ← 返回 </Button>
        <div class="ml-4">
          <h1 class="text-2xl font-bold">
            {{ isExistingContract ? (isEditMode ? '编辑合同' : '合同详情') : '新建合同' }}
          </h1>
          <p v-if="isExistingContract" class="text-gray-500 mt-1">
            合同编号: {{ formData.contractCode || '-' }}
          </p>
        </div>
      </div>
      <Space>
        <template v-if="isViewMode">
          <Button @click="handleBack">返回</Button>
          <Button
            v-if="isExistingContract"
            type="primary"
            @click="handleEnterEdit"
          >
            编辑
          </Button>
        </template>
        <template v-else>
          <Button @click="handleCancelEdit">取消</Button>
          <Button @click="handleSaveDraft">保存草稿</Button>
          <Button type="primary" @click="handleSubmitApproval">
            提交审批
          </Button>
        </template>
      </Space>
    </div>

    <!-- 表单内容卡片 -->
    <Card>
      <Form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        :disabled="isViewMode"
      >
        <!-- 基本信息 -->
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
                <Select.Option :value="CreateMethod.FromSolution">从客户方案创建</Select.Option>
                <Select.Option :value="CreateMethod.FromQuotation">从报价单创建</Select.Option>
                <Select.Option :value="CreateMethod.Manual">手动创建</Select.Option>
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
                :filter-option="(input: string, option: any) => 
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                "
                :options="customerList.map(c => ({
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
                :options="responsiblePersonList.map(p => ({
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

        <!-- 合同条款 -->
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

        <!-- 回款计划 -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-3">
            回款计划
            <span v-if="!isPaymentPlanValid" class="ml-2 text-red-500 text-sm font-normal">
              （总额：{{ paymentPlanTotal.toFixed(2) }}万，应等于合同金额：{{ formData.contractAmount.toFixed(2) }}万）
            </span>
            <span v-else-if="paymentPlanTotal > 0" class="ml-2 text-green-600 text-sm font-normal">
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

        <!-- 合同附件 -->
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
                    <span>📄 {{ file.fileName }}</span>
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
              </Form.Item>
            </Col>
          </Row>
        </div>

        <!-- 备注说明 -->
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
    </Card>
  </div>
</template>

<style scoped>
:deep(.ant-table-cell) {
  padding: 12px 8px;
}
</style>
