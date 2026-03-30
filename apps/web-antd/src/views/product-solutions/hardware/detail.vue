<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
import type { DeviceForm, HardwareDevice, UsageRecord } from './types';
import { DeviceStatus } from './types';

defineOptions({
  name: 'HardwareDeviceDetail',
});

const route = useRoute();
const router = useRouter();

// 获取设备ID
const deviceId = ref(route.params.id || '');
const isEdit = ref(route.query.mode === 'edit');
const activeTab = ref('basic');

// 设备状态映射
const deviceStatusMap: Record<number, { text: string; color: string }> = {
  1: { text: '启用', color: 'success' },
  2: { text: '停用', color: 'default' },
};

// 设备基本信息表单
const formRef = ref<FormInstance>();
const basicForm = reactive<DeviceForm>({
  brand: '',
  deviceCategory: '',
  deviceCode: '',
  deviceModel: '',
  deviceName: '',
  parameters: {},
  remark: '',
  specification: '',
  status: DeviceStatus.Enabled,
  unitPrice: 0,
});

// 表单验证规则
const rules = {
  brand: [{ message: '请输入品牌', required: true }],
  deviceCategory: [{ message: '请选择设备类别', required: true }],
  deviceCode: [
    { message: '请输入设备编号', required: true },
    {
      message: '设备编号格式：HD-XXXXXXX',
      pattern: /^HD-[A-Z0-9]{7,20}$/,
    },
  ],
  deviceModel: [{ message: '请输入设备型号', required: true }],
  deviceName: [{ message: '请输入设备名称', required: true }],
  status: [{ message: '请选择状态', required: true }],
  unitPrice: [
    { message: '请输入单价', required: true },
    { message: '单价必须大于0', min: 0.01, type: 'number' },
  ],
};

// 设备完整信息（包含只读字段）
const deviceInfo = ref<HardwareDevice | null>(null);

// 技术参数列表
interface ParameterItem {
  key: string;
  label: string;
  value: string;
}

const parameterList = ref<ParameterItem[]>([]);
const newParamKey = ref('');
const newParamLabel = ref('');
const newParamValue = ref('');

// 使用记录数据
const usageList = ref<UsageRecord[]>([]);

// 使用记录表格列
const usageColumns: TableColumnsType = [
  { dataIndex: 'customer', title: '客户名称', width: 200 },
  { dataIndex: 'project', title: '项目编号', width: 150 },
  { dataIndex: 'quantity', title: '使用数量', width: 100 },
  { dataIndex: 'deployDate', title: '部署日期', width: 120 },
  {
    dataIndex: 'status',
    key: 'status',
    title: '状态',
    width: 100,
  },
];

// 返回列表
function handleBack() {
  router.back();
}

// 切换编辑模式
function toggleEdit() {
  isEdit.value = !isEdit.value;
}

// 保存
async function handleSave() {
  try {
    await formRef.value?.validate();
    // 将参数列表转换为对象
    const parameters: Record<string, any> = {};
    parameterList.value.forEach((param) => {
      parameters[param.key] = param.value;
    });
    basicForm.parameters = parameters;

    message.success('保存成功');
    isEdit.value = false;
  } catch {
    message.error('请填写必填项');
  }
}

// 删除设备
function handleDeleteDevice() {
  router.push('/product-solutions/hardware');
  message.success('删除成功');
}

// 添加参数
function handleAddParameter() {
  if (!newParamKey.value || !newParamLabel.value) {
    message.warning('请输入参数名称和显示名称');
    return;
  }

  // 检查是否已存在
  if (parameterList.value.some((p) => p.key === newParamKey.value)) {
    message.warning('参数名称已存在');
    return;
  }

  parameterList.value.push({
    key: newParamKey.value,
    label: newParamLabel.value,
    value: newParamValue.value,
  });

  // 清空输入
  newParamKey.value = '';
  newParamLabel.value = '';
  newParamValue.value = '';
}

// 删除参数
function handleDeleteParameter(key: string) {
  const index = parameterList.value.findIndex((p) => p.key === key);
  if (index > -1) {
    parameterList.value.splice(index, 1);
  }
}

// 跳转到库存管理
function handleGotoInventory() {
  if (deviceId.value) {
    router.push(`/product-solutions/hardware/inventory/${deviceId.value}`);
  }
}

// 初始化数据（模拟从服务器加载）
if (deviceId.value) {
  // Mock 数据
  deviceInfo.value = {
    brand: '品牌A',
    createBy: 1,
    createByName: '张三',
    createTime: '2024-01-15 10:30:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024001',
    deviceModel: 'TS-100',
    deviceName: '温度传感器',
    id: 1,
    parameters: {
      accuracy: '±0.5℃',
      interface: 'RS485',
      powerConsumption: '5W',
      responseTime: '1秒',
      temperatureRange: '-40~80℃',
      voltage: '12-24V DC',
    },
    remark: '高精度工业温度传感器，适用于各种工业环境',
    specification: '采用进口高精度温感元件，抗干扰能力强',
    status: DeviceStatus.Enabled,
    stockQuantity: 50,
    unitPrice: 500.0,
    updateBy: 1,
    updateByName: '李四',
    updateTime: '2024-11-05 14:20:00',
    usageCount: 15,
  };

  // 填充表单
  basicForm.deviceCode = deviceInfo.value.deviceCode;
  basicForm.deviceName = deviceInfo.value.deviceName;
  basicForm.deviceModel = deviceInfo.value.deviceModel;
  basicForm.deviceCategory = deviceInfo.value.deviceCategory;
  basicForm.brand = deviceInfo.value.brand;
  basicForm.unitPrice = deviceInfo.value.unitPrice;
  basicForm.status = deviceInfo.value.status;
  basicForm.specification = deviceInfo.value.specification || '';
  basicForm.remark = deviceInfo.value.remark || '';

  // 填充参数列表
  if (deviceInfo.value.parameters) {
    const params = deviceInfo.value.parameters;
    const labelMap: Record<string, string> = {
      accuracy: '精度',
      interface: '接口类型',
      powerConsumption: '功耗',
      responseTime: '响应时间',
      temperatureRange: '温度范围',
      voltage: '电压',
    };

    parameterList.value = Object.keys(params).map((key) => ({
      key,
      label: labelMap[key] || key,
      value: params[key],
    }));
  }

  // 填充使用记录
  usageList.value = [
    {
      customer: '智慧工厂项目',
      deployDate: '2024-10-20',
      id: 1,
      project: 'PRJ-2024001',
      quantity: 10,
      status: '使用中',
    },
    {
      customer: '物联网平台项目',
      deployDate: '2024-09-15',
      id: 2,
      project: 'PRJ-2024002',
      quantity: 5,
      status: '使用中',
    },
  ];
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
            {{ basicForm.deviceName || '设备详情' }}
          </h1>
          <p class="text-gray-500 mt-1">
            设备编号: {{ basicForm.deviceCode }}
          </p>
        </div>
      </div>
      <Space>
        <Button v-if="!isEdit" type="primary" @click="toggleEdit">
          编辑
        </Button>
        <Button v-if="isEdit" type="primary" @click="handleSave">
          保存
        </Button>
        <Button v-if="isEdit" @click="toggleEdit"> 取消 </Button>
        <Button v-if="deviceId" @click="handleGotoInventory">
          库存管理
        </Button>
        <Popconfirm
          title="确定删除该设备吗？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleDeleteDevice"
        >
          <Button danger> 删除 </Button>
        </Popconfirm>
      </Space>
    </div>

    <!-- 标签页内容 -->
    <Card>
      <Tabs v-model:activeKey="activeTab">
        <!-- 基本信息 -->
        <Tabs.TabPane key="basic" tab="基本信息" force-render>
          <Form
            ref="formRef"
            :model="basicForm"
            :rules="rules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :disabled="!isEdit"
          >
            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">基础信息</h3>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="设备编号" name="deviceCode">
                    <Input
                      v-model:value="basicForm.deviceCode"
                      placeholder="HD-XXXXXXX"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="设备名称" name="deviceName">
                    <Input
                      v-model:value="basicForm.deviceName"
                      placeholder="请输入设备名称"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="设备型号" name="deviceModel">
                    <Input
                      v-model:value="basicForm.deviceModel"
                      placeholder="请输入设备型号"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="设备类别" name="deviceCategory">
                    <Select
                      v-model:value="basicForm.deviceCategory"
                      placeholder="请选择"
                    >
                      <Select.Option value="传感器">传感器</Select.Option>
                      <Select.Option value="网关">网关</Select.Option>
                      <Select.Option value="服务器">服务器</Select.Option>
                      <Select.Option value="PLC">PLC</Select.Option>
                      <Select.Option value="摄像头">摄像头</Select.Option>
                      <Select.Option value="显示器">显示器</Select.Option>
                      <Select.Option value="交换机">交换机</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="品牌" name="brand">
                    <Input
                      v-model:value="basicForm.brand"
                      placeholder="请输入品牌"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="单价（元）" name="unitPrice">
                    <InputNumber
                      v-model:value="basicForm.unitPrice"
                      :min="0"
                      :precision="2"
                      placeholder="请输入单价"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="状态" name="status">
                    <Select
                      v-model:value="basicForm.status"
                      placeholder="请选择"
                    >
                      <Select.Option :value="DeviceStatus.Enabled"
                        >启用</Select.Option
                      >
                      <Select.Option :value="DeviceStatus.Disabled"
                        >停用</Select.Option
                      >
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="规格说明" name="specification">
                    <Input.TextArea
                      v-model:value="basicForm.specification"
                      placeholder="请输入规格说明"
                      :rows="3"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="备注" name="remark">
                    <Input.TextArea
                      v-model:value="basicForm.remark"
                      placeholder="请输入备注"
                      :rows="3"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <!-- 只读字段 -->
            <div v-if="deviceInfo && !isEdit" class="mb-4">
              <h3 class="text-lg font-semibold mb-3">其他信息</h3>
              <Descriptions :column="2" bordered>
                <Descriptions.Item label="当前库存">
                  {{ deviceInfo.stockQuantity }} 台
                </Descriptions.Item>
                <Descriptions.Item label="使用次数">
                  {{ deviceInfo.usageCount }} 次
                </Descriptions.Item>
                <Descriptions.Item label="创建人">
                  {{ deviceInfo.createByName || '-' }}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {{ deviceInfo.createTime }}
                </Descriptions.Item>
                <Descriptions.Item label="更新人">
                  {{ deviceInfo.updateByName || '-' }}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {{ deviceInfo.updateTime }}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Form>
        </Tabs.TabPane>

        <!-- 参数信息 -->
        <Tabs.TabPane key="parameters" tab="参数信息">
          <div class="mb-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold">技术参数</h3>
            </div>

            <!-- 添加参数表单 -->
            <Card v-if="isEdit" class="mb-4 bg-gray-50">
              <Row :gutter="16">
                <Col :span="6">
                  <Input
                    v-model:value="newParamKey"
                    placeholder="参数名称（英文）"
                  />
                </Col>
                <Col :span="6">
                  <Input
                    v-model:value="newParamLabel"
                    placeholder="显示名称（中文）"
                  />
                </Col>
                <Col :span="8">
                  <Input
                    v-model:value="newParamValue"
                    placeholder="参数值"
                  />
                </Col>
                <Col :span="2">
                  <Button
                    type="primary"
                    block
                    @click="handleAddParameter"
                  >
                    添加参数
                  </Button>
                </Col>
              </Row>
            </Card>

            <!-- 参数列表 -->
            <Descriptions :column="2" bordered>
              <Descriptions.Item
                v-for="param in parameterList"
                :key="param.key"
                :label="param.label"
              >
                <div class="flex justify-between items-center">
                  <Input
                    v-if="isEdit"
                    v-model:value="param.value"
                    size="small"
                  />
                  <span v-else>{{ param.value }}</span>
                  <Button
                    v-if="isEdit"
                    type="link"
                    danger
                    size="small"
                    @click="handleDeleteParameter(param.key)"
                  >
                    删除
                  </Button>
                </div>
              </Descriptions.Item>
            </Descriptions>

            <div v-if="parameterList.length === 0" class="text-center py-8 text-gray-400">
              暂无参数信息
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 使用记录 -->
        <Tabs.TabPane key="usage" tab="使用记录">
          <h3 class="text-lg font-semibold mb-3">设备使用记录</h3>
          <Table
            :columns="usageColumns"
            :data-source="usageList"
            :pagination="{ pageSize: 10 }"
            :row-key="(record) => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <Tag
                  :color="record.status === '使用中' ? 'success' : 'default'"
                >
                  {{ record.status }}
                </Tag>
              </template>
            </template>
          </Table>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<style scoped>
:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}
</style>

