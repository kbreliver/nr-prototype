<script lang="ts" setup>
import { computed, h, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs, { Dayjs } from 'dayjs';
import { SyncOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
import type { DeliveryPlan, ExecutionRecord, Order, OrderStatistics } from './types';
import {
  calculateRemainingAmount,
  formatAmountWan,
  getDeliveryStatusMap,
  getOrderStatusMap,
  getOrderStatusText,
  getRecordTypeText,
  isOrderEditable,
  validateDateRange,
  wanToAmount,
} from './utils';
import { getDeliveryPlansByOrderId, getExecutionRecordsByOrderId, getMockSignedContracts, getOrderById } from './mock';

defineOptions({
  name: 'OrderDetail',
});

const route = useRoute();
const router = useRouter();

// 获取订单ID
const orderId = ref(route.query.id ? Number(route.query.id) : null);
const activeTab = ref('basic');

// 解析路由模式
function parseRouteMode(modeParam: unknown) {
  const value = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  if (value === 'edit' || value === 'view') {
    return value;
  }
  return undefined;
}

const isExistingOrder = computed(() => !!orderId.value);
const initialMode = parseRouteMode(route.query.mode);
const isEditMode = ref(initialMode === 'edit');
const isViewMode = computed(() => !isEditMode.value);

// 映射数据
const orderStatusMap = getOrderStatusMap();
const deliveryStatusMap = getDeliveryStatusMap();

// 订单数据
const orderData = ref<Order | null>(null);
// 交付计划数据
const deliveryPlans = ref<DeliveryPlan[]>([]);
// 执行记录数据
const executionRecords = ref<ExecutionRecord[]>([]);

// 表单引用和数据
const formRef = ref<FormInstance>();
const formData = reactive<{
  orderName: string;
  contractId?: number;
  contractCode: string;
  contractName: string;
  customerId?: number;
  customerName: string;
  orderAmount: number;
  planStartDate: Dayjs | null;
  planEndDate: Dayjs | null;
  responsiblePersonId?: number;
  responsiblePerson: string;
  remark: string;
}>({
  orderName: '',
  contractId: undefined,
  contractCode: '',
  contractName: '',
  customerId: undefined,
  customerName: '',
  orderAmount: 0,
  planStartDate: null,
  planEndDate: null,
  responsiblePersonId: undefined,
  responsiblePerson: '',
  remark: '',
});

// 已签订合同列表
const signedContracts = getMockSignedContracts();

// 负责人列表（Mock）
const responsiblePersonList = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
  { id: 5, name: '周七' },
  { id: 6, name: '周八' },
];

// 表单验证规则
const formRules = {
  orderName: [{ required: true, message: '请输入订单名称' }],
  contractId: [{ required: true, message: '请选择关联合同' }],
  orderAmount: [
    { required: true, message: '请输入订单金额' },
    {
      validator: (_rule: any, value: number) => {
        if (value <= 0) {
          return Promise.reject('订单金额必须大于0');
        }
        return Promise.resolve();
      },
    },
  ],
  responsiblePersonId: [{ required: true, message: '请选择负责人' }],
};

// 更新路由模式
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

// 填充表单数据
function fillFormWithOrder(order: Order) {
  formData.orderName = order.orderName;
  formData.contractId = order.contractId;
  formData.contractCode = order.contractCode;
  formData.contractName = order.contractName || '';
  formData.customerId = order.customerId;
  formData.customerName = order.customerName;
  formData.orderAmount = order.orderAmount / 10000; // 转为万元
  formData.planStartDate = order.planStartDate ? dayjs(order.planStartDate) : null;
  formData.planEndDate = order.planEndDate ? dayjs(order.planEndDate) : null;
  formData.responsiblePerson = order.responsiblePerson;
  formData.remark = order.remark || '';
  
  // 查找负责人ID
  const person = responsiblePersonList.find((p) => p.name === order.responsiblePerson);
  if (person) {
    formData.responsiblePersonId = person.id;
  }
}

// 加载订单详情
function loadOrderDetail() {
  if (!orderId.value) return;
  const order = getOrderById(orderId.value);
  if (order) {
    orderData.value = order;
    fillFormWithOrder(order);
    deliveryPlans.value = getDeliveryPlansByOrderId(orderId.value);
    executionRecords.value = getExecutionRecordsByOrderId(orderId.value);
  } else {
    message.error('订单不存在');
    router.push('/market-customers/order');
  }
}

// 合同选择变化
function handleContractChange(contractId: number | undefined) {
  if (!contractId) return;
  const contract = signedContracts.find((c) => c.id === contractId);
  if (contract) {
    formData.contractCode = contract.contractCode;
    formData.contractName = contract.contractName;
    formData.customerName = contract.customerName;
    
    // 自动填充订单名称（如果为空）
    if (!formData.orderName) {
      formData.orderName = contract.contractName.replace('合同', '订单');
    }
    
    // 自动填充订单金额
    formData.orderAmount = contract.contractAmount / 10000; // 转为万元
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

// 进入编辑模式
function handleEnterEdit() {
  if (!isExistingOrder.value) return;
  isEditMode.value = true;
  updateRouteMode('edit');
}

// 取消编辑
function handleCancelEdit() {
  isEditMode.value = false;
  updateRouteMode('view');
  if (orderData.value) {
    fillFormWithOrder(orderData.value);
  }
}

// 保存订单
async function handleSave() {
  try {
    await formRef.value?.validate();
    
    // 验证日期范围
    const startDateStr = formData.planStartDate 
      ? formData.planStartDate.format('YYYY-MM-DD')
      : '';
    const endDateStr = formData.planEndDate 
      ? formData.planEndDate.format('YYYY-MM-DD')
      : '';
    
    if (!validateDateRange(startDateStr, endDateStr)) {
      message.error('计划开始日期不能晚于完成日期');
      return;
    }
    
    // 验证订单金额不能超过合同金额
    if (formData.contractId) {
      const contract = signedContracts.find((c) => c.id === formData.contractId);
      if (contract) {
        const orderAmountYuan = wanToAmount(formData.orderAmount);
        if (orderAmountYuan > contract.contractAmount) {
          message.error('订单金额不能超过合同金额');
          return;
        }
      }
    }
    
    message.success('保存成功');
    isEditMode.value = false;
    updateRouteMode('view');
    loadOrderDetail();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 统计数据
const statistics = computed<OrderStatistics>(() => {
  if (!orderData.value) {
    return {
      orderAmount: 0,
      completedAmount: 0,
      remainingAmount: 0,
      progress: 0,
      projectCount: 0,
    };
  }
  
  return {
    orderAmount: orderData.value.orderAmount,
    completedAmount: orderData.value.completedAmount,
    remainingAmount: calculateRemainingAmount(orderData.value.orderAmount, orderData.value.completedAmount),
    progress: orderData.value.progress,
    projectCount: orderData.value.projectId ? 1 : 0,
  };
});

// 返回列表
function handleBack() {
  router.push('/market-customers/order');
}

// 更新状态
function handleUpdateStatus() {
  message.info('更新订单状态功能开发中');
}

// 查看合同详情
function handleViewContract() {
  if (!orderData.value) return;
  router.push({
    path: '/market-customers/contract/detail',
    query: { id: orderData.value.contractId },
  });
}

// 关联项目
function handleLinkProject() {
  message.info('关联项目功能开发中');
}

// 交付计划表格列
const deliveryColumns: TableColumnsType<DeliveryPlan> = [
  { title: '阶段', dataIndex: 'stageOrder', key: 'stageOrder', width: 80, align: 'center' },
  { title: '交付内容', dataIndex: 'deliveryContent', key: 'deliveryContent', width: 200, align: 'left' },
  { title: '计划开始', dataIndex: 'planStartDate', key: 'planStartDate', width: 120, align: 'center' },
  { title: '计划完成', dataIndex: 'planEndDate', key: 'planEndDate', width: 120, align: 'center' },
  { 
    title: '实际开始', 
    dataIndex: 'actualStartDate', 
    key: 'actualStartDate', 
    width: 120,
    align: 'center',
    customRender: ({ text }) => text || '-',
  },
  { 
    title: '实际完成', 
    dataIndex: 'actualEndDate', 
    key: 'actualEndDate', 
    width: 120,
    align: 'center',
    customRender: ({ text }) => text || '-',
  },
  {
    title: '状态',
    dataIndex: 'deliveryStatus',
    key: 'deliveryStatus',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      const statusInfo = deliveryStatusMap[record.deliveryStatus];
      return h(Tag, { color: statusInfo.color }, () => statusInfo.text);
    },
  },
];

// 执行记录表格列
const recordColumns: TableColumnsType<ExecutionRecord> = [
  { title: '时间', dataIndex: 'recordTime', key: 'recordTime', width: 160, align: 'center' },
  { title: '执行人', dataIndex: 'executor', key: 'executor', width: 100, align: 'center' },
  { 
    title: '记录类型', 
    dataIndex: 'recordType', 
    key: 'recordType', 
    width: 100,
    align: 'center',
    customRender: ({ record }) => getRecordTypeText(record.recordType),
  },
  { title: '执行内容', dataIndex: 'content', key: 'content', align: 'left', ellipsis: true },
];

// 监听路由模式变化
watch(
  () => route.query.mode,
  (mode) => {
    if (!isExistingOrder.value) return;
    isEditMode.value = parseRouteMode(mode) === 'edit';
  },
);

// 监听路由ID变化
watch(
  () => route.query.id,
  (id) => {
    const newId = id ? Number(id) : null;
    orderId.value = newId;
    if (newId) {
      if (!parseRouteMode(route.query.mode)) {
        updateRouteMode('view');
      }
      loadOrderDetail();
    }
  },
);

// 初始化加载数据
if (isExistingOrder.value) {
  loadOrderDetail();
  if (!initialMode) {
    updateRouteMode('view');
  }
} else {
  message.error('缺少订单ID参数');
  handleBack();
}
</script>

<template>
  <div class="order-detail-page">
    <div v-if="orderData" class="detail-container">
      <!-- 页面头部：返回按钮 + 标题 + 状态标签 + 操作按钮组（右侧） -->
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center">
          <Button type="text" @click="handleBack"> ← 返回 </Button>
          <div class="ml-4">
            <h1 class="text-2xl font-bold">
              {{ formData.orderName || orderData.orderName || '订单详情' }}
            </h1>
            <p class="text-gray-500 mt-1 flex items-center flex-wrap gap-2">
              <span>订单编号: {{ orderData.orderCode }}</span>
              <Tag :color="orderStatusMap[orderData.orderStatus].color">
                {{ getOrderStatusText(orderData.orderStatus) }}
              </Tag>
            </p>
          </div>
        </div>
        <Space>
          <template v-if="isViewMode">
            <Button @click="handleBack">返回列表</Button>
            <Button
              v-if="isOrderEditable(orderData.orderStatus)"
              type="primary"
              @click="handleEnterEdit"
            >
              编辑
            </Button>
            <Button 
              type="primary"
              ghost
              @click="handleUpdateStatus"
            >
              <template #icon>
                <SyncOutlined />
              </template>
              更新状态
            </Button>
            <Button @click="handleLinkProject">
              关联项目
            </Button>
          </template>
          <template v-else>
            <Button @click="handleCancelEdit">取消</Button>
            <Button type="primary" @click="handleSave">保存</Button>
          </template>
        </Space>
      </div>

      <!-- 统计信息卡片 -->
      <Card v-if="orderData" size="small" class="mb-3">
        <div class="flex flex-wrap">
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">订单金额</div>
            <div class="text-2xl font-semibold text-red-600">
              {{ formatAmountWan(statistics.orderAmount) }}
              <span class="text-sm text-gray-400 ml-1">万</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">已完成</div>
            <div class="text-2xl font-semibold text-green-600">
              {{ formatAmountWan(statistics.completedAmount) }}
              <span class="text-sm text-gray-400 ml-1">万</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">未完成</div>
            <div class="text-2xl font-semibold text-red-500">
              {{ formatAmountWan(statistics.remainingAmount) }}
              <span class="text-sm text-gray-400 ml-1">万</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">执行进度</div>
            <div class="text-2xl font-semibold text-orange-500">
              {{ statistics.progress }}%
            </div>
          </div>
        </div>
      </Card>

      <!-- 标签页区域 -->
      <Card>
        <Tabs v-model:activeKey="activeTab">
          <!-- 基本信息 -->
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
                    <Form.Item label="订单编号">
                      <Input :value="orderData.orderCode" disabled />
                    </Form.Item>
                  </Col>
                  <Col :span="12">
                    <Form.Item label="订单名称" name="orderName">
                      <Input
                        v-model:value="formData.orderName"
                        placeholder="请输入订单名称"
                        :maxlength="100"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row :gutter="24">
                  <Col :span="12">
                    <Form.Item label="客户名称">
                      <Input v-model:value="formData.customerName" disabled />
                    </Form.Item>
                  </Col>
                  <Col :span="12">
                    <Form.Item label="关联合同" name="contractId">
                      <Select
                        v-model:value="formData.contractId"
                        placeholder="请选择合同"
                        :disabled="isViewMode || isExistingOrder"
                        @change="(value: any) => handleContractChange(value)"
                      >
                        <Select.Option
                          v-for="contract in signedContracts"
                          :key="contract.id"
                          :value="contract.id"
                        >
                          {{ contract.contractCode }} - {{ contract.contractName }}
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row :gutter="24">
                  <Col :span="12">
                    <Form.Item label="订单金额(万)" name="orderAmount">
                      <InputNumber
                        v-model:value="formData.orderAmount"
                        :min="0"
                        :precision="2"
                        :step="0.01"
                        style="width: 100%"
                        placeholder="请输入订单金额"
                      />
                    </Form.Item>
                  </Col>
                  <Col :span="12">
                    <Form.Item label="创建日期">
                      <Input :value="orderData.createTime?.split(' ')[0]" disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Row :gutter="24">
                  <Col :span="12">
                    <Form.Item label="计划开始日期">
                      <DatePicker
                        :value="formData.planStartDate as any"
                        format="YYYY-MM-DD"
                        style="width: 100%"
                        @update:value="(val: any) => formData.planStartDate = val"
                      />
                    </Form.Item>
                  </Col>
                  <Col :span="12">
                    <Form.Item label="计划完成日期">
                      <DatePicker
                        :value="formData.planEndDate as any"
                        format="YYYY-MM-DD"
                        style="width: 100%"
                        @update:value="(val: any) => formData.planEndDate = val"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row :gutter="24">
                  <Col :span="12">
                    <Form.Item label="实际开始日期">
                      <Input :value="orderData.actualStartDate || '-'" disabled />
                    </Form.Item>
                  </Col>
                  <Col :span="12">
                    <Form.Item label="实际完成日期">
                      <Input :value="orderData.actualEndDate || '-'" disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Row :gutter="24">
                  <Col :span="12">
                    <Form.Item label="订单负责人" name="responsiblePersonId">
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
                    <Form.Item label="订单状态">
                      <Tag :color="orderStatusMap[orderData.orderStatus].color">
                        {{ getOrderStatusText(orderData.orderStatus) }}
                      </Tag>
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

          <!-- 关联合同 -->
          <Tabs.TabPane key="contract" tab="关联合同">
            <Descriptions :column="2" bordered>
              <Descriptions.Item label="合同编号">
                <a @click="handleViewContract">{{ orderData.contractCode }}</a>
              </Descriptions.Item>
              <Descriptions.Item label="合同名称">{{ orderData.contractName }}</Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>

          <!-- 交付计划 -->
          <Tabs.TabPane key="delivery" tab="交付计划">
            <Table
              :columns="deliveryColumns"
              :data-source="deliveryPlans"
              :row-key="(record) => record.id!"
              :pagination="false"
            />
          </Tabs.TabPane>

          <!-- 执行记录 -->
          <Tabs.TabPane key="execution" tab="执行记录">
            <Table
              :columns="recordColumns"
              :data-source="executionRecords"
              :row-key="(record) => record.id!"
              :pagination="false"
            />
          </Tabs.TabPane>

          <!-- 项目关联 -->
          <Tabs.TabPane key="project" tab="项目关联">
            <Descriptions :column="2" bordered>
              <Descriptions.Item label="项目编号">{{ orderData.projectCode || '-' }}</Descriptions.Item>
              <Descriptions.Item label="项目名称">{{ orderData.projectName || '-' }}</Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.order-detail-page {
  padding: 16px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

:deep(.ant-table-thead > tr > th) {
  text-align: center;
  background: #fafafa;
}

:deep(.ant-table-cell) {
  padding: 12px 8px;
}
</style>

