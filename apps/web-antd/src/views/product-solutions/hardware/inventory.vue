<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
import type { HardwareDevice, InventoryForm, InventoryRecord } from './types';
import dayjs, { Dayjs } from 'dayjs';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

defineOptions({
  name: 'HardwareInventoryManagement',
});

const route = useRoute();
const router = useRouter();

// 获取设备ID
const deviceId = ref(route.params.id || '');

// 设备信息
const deviceInfo = ref<HardwareDevice | null>(null);

// 抽屉显示状态
const drawerVisible = ref(false);
const drawerTitle = ref('入库');

// 库存操作表单
const formRef = ref<FormInstance>();
const inventoryForm = reactive<InventoryForm>({
  deviceId: Number(deviceId.value),
  operateDate: dayjs().format('YYYY-MM-DD'),
  operateType: '入库',
  project: '',
  quantity: 0,
  remark: '',
  source: '',
});

// 图表相关
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 表单验证规则
const rules = {
  operateDate: [{ message: '请选择操作日期', required: true }],
  operateType: [{ message: '请选择操作类型', required: true }],
  quantity: [
    { message: '请输入数量', required: true },
    { 
      message: '数量不能为0', 
      type: 'number' as const,
      validator: (_rule: any, value: number) => {
        if (value === 0) {
          return Promise.reject('数量不能为0');
        }
        return Promise.resolve();
      }
    },
  ],
  source: [{ message: '请输入来源/去向', required: true }],
};

// 库存记录数据
const loading = ref(false);
const inventoryRecords = ref<InventoryRecord[]>([]);

// 库存记录表格列
const columns: TableColumnsType<InventoryRecord> = [
  {
    dataIndex: 'operateDate',
    key: 'operateDate',
    title: '日期',
    width: 120,
  },
  {
    dataIndex: 'operateType',
    key: 'operateType',
    title: '类型',
    width: 80,
  },
  {
    align: 'right',
    dataIndex: 'quantity',
    key: 'quantity',
    title: '数量',
    width: 100,
  },
  {
    dataIndex: 'source',
    key: 'source',
    title: '来源/去向',
    width: 180,
  },
  {
    dataIndex: 'project',
    key: 'project',
    title: '关联项目',
    width: 150,
  },
  {
    dataIndex: 'operator',
    key: 'operator',
    title: '操作人',
    width: 100,
  },
  {
    align: 'right',
    dataIndex: 'balance',
    key: 'balance',
    title: '库存结余',
    width: 100,
  },
  {
    dataIndex: 'remark',
    key: 'remark',
    title: '备注',
    ellipsis: true,
  },
];

// 加载设备信息
function loadDeviceInfo() {
  // Mock 数据
  deviceInfo.value = {
    brand: '品牌A',
    createTime: '2024-01-15 10:30:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024001',
    deviceModel: 'TS-100',
    deviceName: '温度传感器',
    id: Number(deviceId.value),
    status: 1,
    stockQuantity: 50,
    unitPrice: 500.0,
    updateTime: '2024-11-05 14:20:00',
    usageCount: 15,
  };
}

// 加载库存记录
function loadInventoryRecords() {
  loading.value = true;
  // Mock 数据
  setTimeout(() => {
    inventoryRecords.value = [
      {
        balance: 50,
        id: 1,
        operateDate: '2024-11-05',
        operateType: '出库',
        operator: '张三',
        project: 'PRJ-2024001',
        quantity: -5,
        remark: '用于智慧工厂项目',
        source: '智慧工厂项目',
      },
      {
        balance: 55,
        id: 2,
        operateDate: '2024-10-20',
        operateType: '入库',
        operator: '李四',
        project: '',
        quantity: 30,
        remark: '从供应商A采购',
        source: '供应商A采购',
      },
      {
        balance: 25,
        id: 3,
        operateDate: '2024-09-15',
        operateType: '出库',
        operator: '王五',
        project: 'PRJ-2024002',
        quantity: -10,
        remark: '用于物联网项目',
        source: '物联网项目',
      },
      {
        balance: 35,
        id: 4,
        operateDate: '2024-08-10',
        operateType: '入库',
        operator: '管理员',
        project: '',
        quantity: 35,
        remark: '初始库存',
        source: '初始库存',
      },
    ];
    loading.value = false;
    
    // 数据加载完成后渲染图表
    setTimeout(() => {
      renderInventoryChart();
    }, 100);
  }, 300);
}

// 提交库存操作
async function handleSubmit() {
  try {
    await formRef.value?.validate();

    // 根据操作类型调整数量符号
    let actualQuantity = inventoryForm.quantity;
    if (inventoryForm.operateType === '出库') {
      actualQuantity = -Math.abs(actualQuantity);
    } else if (inventoryForm.operateType === '入库') {
      actualQuantity = Math.abs(actualQuantity);
    }

    // 出库时检查库存
    if (inventoryForm.operateType === '出库') {
      const currentStock = inventoryStats.value.currentStock;
      if (Math.abs(actualQuantity) > currentStock) {
        message.error(`库存不足，当前库存：${currentStock}`);
        return;
      }

      // 出库时必须填写关联项目
      if (!inventoryForm.project) {
        message.error('出库操作必须填写关联项目');
        return;
      }
    }

    // 模拟提交
    message.success('操作成功');

    // 重置表单
    formRef.value?.resetFields();
    inventoryForm.operateType = '入库';
    inventoryForm.quantity = 0;
    inventoryForm.source = '';
    inventoryForm.project = '';
    inventoryForm.remark = '';
    inventoryForm.operateDate = dayjs().format('YYYY-MM-DD');

    // 刷新记录和设备信息
    loadInventoryRecords();
    loadDeviceInfo();
  } catch {
    message.error('请填写必填项');
  }
}

// 取消操作
function handleCancel() {
  formRef.value?.resetFields();
  inventoryForm.operateType = '入库';
  inventoryForm.quantity = 0;
  inventoryForm.source = '';
  inventoryForm.project = '';
  inventoryForm.remark = '';
  inventoryForm.operateDate = dayjs().format('YYYY-MM-DD');
}

// 返回
function handleBack() {
  router.back();
}

// 日期选择器变化
function handleDateChange(_date: string | Dayjs, dateString: string) {
  inventoryForm.operateDate = dateString;
}

// 打开抽屉
function openDrawer(type: string) {
  drawerTitle.value = type;
  inventoryForm.operateType = type;
  drawerVisible.value = true;
}

// 关闭抽屉
function closeDrawer() {
  drawerVisible.value = false;
  handleCancel();
}

// 提交并关闭抽屉
async function handleSubmitAndClose() {
  await handleSubmit();
  closeDrawer();
}

// 渲染库存变动趋势图
function renderInventoryChart() {
  if (!inventoryRecords.value.length) return;

  // 准备数据：按日期排序（从旧到新）
  const sortedRecords = [...inventoryRecords.value].reverse();
  const dates = sortedRecords.map((record) => record.operateDate);
  const balances = sortedRecords.map((record) => record.balance);

  renderEcharts({
    grid: {
      bottom: '10%',
      containLabel: true,
      left: '3%',
      right: '4%',
      top: '10%',
    },
    series: [
      {
        areaStyle: {
          color: {
            colorStops: [
              {
                color: 'rgba(24, 144, 255, 0.3)',
                offset: 0,
              },
              {
                color: 'rgba(24, 144, 255, 0.05)',
                offset: 1,
              },
            ],
            type: 'linear',
            x: 0,
            x2: 0,
            y: 0,
            y2: 1,
          },
        },
        data: balances,
        itemStyle: {
          color: '#1890ff',
        },
        lineStyle: {
          width: 2,
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#1890ff',
          width: 1,
        },
        type: 'line',
      },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>库存：${data.value} 台`;
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: dates,
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: {
      axisTick: {
        show: false,
      },
      name: '库存数量',
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
        show: true,
      },
      type: 'value',
    },
  });
}

// 计算库存统计
const inventoryStats = computed(() => {
  if (!inventoryRecords.value.length) {
    return {
      currentStock: deviceInfo.value?.stockQuantity || 0,
      stockInCount: 0,
      stockOutCount: 0,
      totalOperations: 0,
    };
  }

  const stockInCount = inventoryRecords.value.filter(
    (r) => r.operateType === '入库',
  ).length;
  const stockOutCount = inventoryRecords.value.filter(
    (r) => r.operateType === '出库',
  ).length;

  return {
    currentStock: inventoryRecords.value[0]?.balance || 0,
    stockInCount,
    stockOutCount,
    totalOperations: inventoryRecords.value.length,
  };
});

// 初始化数据
loadDeviceInfo();
loadInventoryRecords();
</script>

<template>
  <div class="p-4">
    <!-- 页面头部 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center">
        <Button type="text" @click="handleBack"> ← 返回 </Button>
        <div class="ml-4">
          <h1 class="text-2xl font-bold">设备库存管理</h1>
          <p class="text-gray-500 mt-1">
            {{ deviceInfo?.deviceName || '设备详情' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 设备信息卡片 -->
    <Card class="mb-4" title="设备信息">
      <Descriptions v-if="deviceInfo" :column="4" bordered>
        <Descriptions.Item label="设备编号">
          {{ deviceInfo.deviceCode }}
        </Descriptions.Item>
        <Descriptions.Item label="设备名称">
          {{ deviceInfo.deviceName }}
        </Descriptions.Item>
        <Descriptions.Item label="设备型号">
          {{ deviceInfo.deviceModel }}
        </Descriptions.Item>
        <Descriptions.Item label="当前库存">
          <span class="text-lg font-bold text-blue-600">
            {{ inventoryStats.currentStock }} 台
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <!-- 库存记录卡片 -->
    <Card class="mb-4">
      <template #title>
        <div class="flex justify-between items-center">
          <span>库存记录</span>
          <Space>
            <Button type="primary" @click="openDrawer('入库')">
              入库
            </Button>
            <Button type="primary" @click="openDrawer('出库')">
              出库
            </Button>
          </Space>
        </div>
      </template>
      <Table
        :columns="columns"
        :data-source="inventoryRecords"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        :row-key="(record) => record.id"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operateType'">
            <span
              :class="{
                'text-green-600 font-semibold': record.operateType === '入库',
                'text-red-600 font-semibold': record.operateType === '出库',
                'text-blue-600 font-semibold': record.operateType === '调拨',
              }"
            >
              {{ record.operateType }}
            </span>
          </template>
          <template v-if="column.key === 'quantity'">
            <span
              :class="{
                'text-green-600 font-semibold': record.quantity > 0,
                'text-red-600 font-semibold': record.quantity < 0,
              }"
            >
              {{ record.quantity > 0 ? '+' + record.quantity : record.quantity }}
            </span>
          </template>
          <template v-if="column.key === 'balance'">
            <span class="font-semibold">{{ record.balance }}</span>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 库存变动趋势图 -->
    <Card title="库存变动趋势">
      <EchartsUI ref="chartRef" style="height: 400px" />
    </Card>

    <!-- 库存操作抽屉 -->
    <Drawer
      v-model:open="drawerVisible"
      :title="drawerTitle"
      placement="right"
      :width="500"
      @close="closeDrawer"
    >
      <Form
        ref="formRef"
        :model="inventoryForm"
        :rules="rules"
        layout="vertical"
      >
        <Form.Item label="操作类型" name="operateType">
          <Select
            v-model:value="inventoryForm.operateType"
            placeholder="请选择"
            disabled
          >
            <Select.Option value="入库">入库</Select.Option>
            <Select.Option value="出库">出库</Select.Option>
            <Select.Option value="调拨">调拨</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="操作数量" name="quantity">
          <InputNumber
            v-model:value="inventoryForm.quantity"
            :min="1"
            placeholder="请输入数量"
            style="width: 100%"
          />
        </Form.Item>
        
        <Form.Item label="操作日期" name="operateDate">
          <DatePicker
            :value="dayjs(inventoryForm.operateDate)"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            style="width: 100%"
            @change="handleDateChange"
          />
        </Form.Item>
        
        <Form.Item label="来源/去向" name="source">
          <Input
            v-model:value="inventoryForm.source"
            placeholder="请输入来源或去向"
          />
        </Form.Item>
        
        <Form.Item
          label="关联项目"
          name="project"
          :rules="
            inventoryForm.operateType === '出库'
              ? [{ required: true, message: '出库时必须填写关联项目' }]
              : []
          "
        >
          <Input
            v-model:value="inventoryForm.project"
            placeholder="出库时必填"
          />
        </Form.Item>
        
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="inventoryForm.remark"
            placeholder="请输入备注"
            :rows="3"
          />
        </Form.Item>

        <Form.Item>
          <Space style="width: 100%; justify-content: flex-end">
            <Button @click="closeDrawer"> 取消 </Button>
            <Button type="primary" @click="handleSubmitAndClose"> 提交 </Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  </div>
</template>

<style scoped>
:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}
</style>

