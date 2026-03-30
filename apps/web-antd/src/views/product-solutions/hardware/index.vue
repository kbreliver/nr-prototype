<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';
import type { HardwareDevice, SearchForm } from './types';
import { DeviceStatus } from './types';

defineOptions({
  name: 'HardwareEquipmentLibrary',
});

const router = useRouter();

// 设备状态映射
const deviceStatusMap: Record<number, { text: string; color: string }> = {
  1: { text: '启用', color: 'success' },
  2: { text: '停用', color: 'default' },
};

// 搜索表单
const searchForm = reactive<SearchForm>({
  deviceCode: '',
  deviceName: '',
  deviceCategory: '',
  status: undefined,
});

// 表格加载状态
const loading = ref(false);

// 选中的行
const selectedRowKeys = ref<number[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  total: 0,
});

// Mock 数据
const mockData: HardwareDevice[] = [
  {
    brand: '品牌A',
    createTime: '2024-01-15 10:30:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024001',
    deviceModel: 'TS-100',
    deviceName: '温度传感器',
    id: 1,
    status: DeviceStatus.Enabled,
    stockQuantity: 50,
    unitPrice: 500.0,
    updateTime: '2024-11-05 14:20:00',
    usageCount: 15,
  },
  {
    brand: '品牌B',
    createTime: '2024-01-20 09:15:00',
    deviceCategory: '网关',
    deviceCode: 'HD-2024002',
    deviceModel: 'GW-200',
    deviceName: '工业网关',
    id: 2,
    status: DeviceStatus.Enabled,
    stockQuantity: 20,
    unitPrice: 2000.0,
    updateTime: '2024-10-28 16:45:00',
    usageCount: 8,
  },
  {
    brand: '品牌C',
    createTime: '2024-02-10 11:20:00',
    deviceCategory: '服务器',
    deviceCode: 'HD-2024003',
    deviceModel: 'SR-300',
    deviceName: '工业服务器',
    id: 3,
    status: DeviceStatus.Disabled,
    stockQuantity: 10,
    unitPrice: 8000.0,
    updateTime: '2024-10-25 10:15:00',
    usageCount: 5,
  },
  {
    brand: '品牌D',
    createTime: '2024-02-15 14:30:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024004',
    deviceModel: 'HS-150',
    deviceName: '湿度传感器',
    id: 4,
    status: DeviceStatus.Enabled,
    stockQuantity: 35,
    unitPrice: 450.0,
    updateTime: '2024-11-02 09:30:00',
    usageCount: 12,
  },
  {
    brand: '品牌E',
    createTime: '2024-03-01 08:45:00',
    deviceCategory: 'PLC',
    deviceCode: 'HD-2024005',
    deviceModel: 'PLC-500',
    deviceName: '可编程控制器',
    id: 5,
    status: DeviceStatus.Enabled,
    stockQuantity: 15,
    unitPrice: 3500.0,
    updateTime: '2024-10-30 11:20:00',
    usageCount: 6,
  },
  {
    brand: '品牌F',
    createTime: '2024-03-15 10:00:00',
    deviceCategory: '摄像头',
    deviceCode: 'HD-2024006',
    deviceModel: 'CAM-400',
    deviceName: '工业摄像头',
    id: 6,
    status: DeviceStatus.Enabled,
    stockQuantity: 25,
    unitPrice: 1200.0,
    updateTime: '2024-09-20 15:30:00',
    usageCount: 10,
  },
  {
    brand: '品牌G',
    createTime: '2024-04-01 13:15:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024007',
    deviceModel: 'PS-250',
    deviceName: '压力传感器',
    id: 7,
    status: DeviceStatus.Enabled,
    stockQuantity: 40,
    unitPrice: 600.0,
    updateTime: '2024-11-05 16:40:00',
    usageCount: 18,
  },
  {
    brand: '品牌H',
    createTime: '2024-04-20 09:30:00',
    deviceCategory: '显示器',
    deviceCode: 'HD-2024008',
    deviceModel: 'MON-700',
    deviceName: '工业显示器',
    id: 8,
    status: DeviceStatus.Enabled,
    stockQuantity: 18,
    unitPrice: 1500.0,
    updateTime: '2024-06-15 10:00:00',
    usageCount: 7,
  },
  {
    brand: '品牌I',
    createTime: '2024-05-10 15:20:00',
    deviceCategory: '交换机',
    deviceCode: 'HD-2024009',
    deviceModel: 'SW-800',
    deviceName: '工业交换机',
    id: 9,
    status: DeviceStatus.Enabled,
    stockQuantity: 12,
    unitPrice: 2500.0,
    updateTime: '2024-11-03 14:10:00',
    usageCount: 9,
  },
  {
    brand: '品牌J',
    createTime: '2024-06-01 11:45:00',
    deviceCategory: '传感器',
    deviceCode: 'HD-2024010',
    deviceModel: 'VS-350',
    deviceName: '振动传感器',
    id: 10,
    status: DeviceStatus.Enabled,
    stockQuantity: 30,
    unitPrice: 800.0,
    updateTime: '2024-11-04 09:25:00',
    usageCount: 11,
  },
];

// 表格数据
const dataSource = ref<HardwareDevice[]>([]);

// 表格列配置
const columns: TableColumnsType<HardwareDevice> = [
  {
    dataIndex: 'deviceCode',
    key: 'deviceCode',
    sorter: true,
    title: '设备编号',
    width: 140,
    customCell: (record) => ({
      style: { cursor: 'pointer', color: '#1890ff' },
      onClick: () => handleView(record),
    }),
  },
  {
    dataIndex: 'deviceName',
    key: 'deviceName',
    title: '设备名称',
    width: 180,
  },
  {
    dataIndex: 'deviceModel',
    key: 'deviceModel',
    title: '型号',
    width: 120,
  },
  {
    dataIndex: 'deviceCategory',
    key: 'deviceCategory',
    sorter: true,
    title: '类别',
    width: 120,
  },
  {
    dataIndex: 'brand',
    key: 'brand',
    title: '品牌',
    width: 120,
  },
  {
    align: 'right',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    sorter: true,
    title: '单价（元）',
    width: 120,
  },
  {
    align: 'center',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
    sorter: true,
    title: '库存',
    width: 100,
  },
  {
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    title: '状态',
    width: 100,
  },
  {
    dataIndex: 'updateTime',
    key: 'updateTime',
    sorter: true,
    title: '更新时间',
    width: 160,
  },
  {
    align: 'center',
    fixed: 'right',
    key: 'action',
    title: '操作',
    width: 220,
  },
];

// 初始化数据
function loadData() {
  loading.value = true;
  setTimeout(() => {
    dataSource.value = mockData;
    pagination.total = mockData.length;
    loading.value = false;
  }, 300);
}

// 搜索
function handleSearch() {
  pagination.current = 1;
  loadData();
}

// 重置
function handleReset() {
  searchForm.deviceCode = '';
  searchForm.deviceName = '';
  searchForm.deviceCategory = '';
  searchForm.status = undefined;
  handleSearch();
}

// 表格选择
const rowSelection = computed(() => ({
  onChange: (selectedKeys: (string | number)[]) => {
    selectedRowKeys.value = selectedKeys as number[];
  },
  selectedRowKeys: selectedRowKeys.value,
}));

// 分页、排序、筛选变化时触发
const handleTableChange: TableProps['onChange'] = (pag, filters, sorter) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
  loadData();
};

// 查看详情
function handleView(record: HardwareDevice) {
  router.push(`/product-solutions/hardware/detail/${record.id}`);
}

// 编辑
function handleEdit(record: HardwareDevice) {
  router.push(`/product-solutions/hardware/detail/${record.id}?mode=edit`);
}

// 库存管理
function handleInventory(record: HardwareDevice) {
  router.push(`/product-solutions/hardware/inventory/${record.id}`);
}

// 删除
function handleDelete(record: HardwareDevice) {
  Modal.confirm({
    cancelText: '取消',
    content: `确定要删除设备"${record.deviceName}"吗？`,
    okText: '确定',
    okType: 'danger',
    onOk() {
      message.success('删除成功');
      loadData();
    },
    title: '确认删除',
  });
}

// 批量删除
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的设备');
    return;
  }
  Modal.confirm({
    cancelText: '取消',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个设备吗？`,
    okText: '确定',
    okType: 'danger',
    onOk() {
      message.success('批量删除成功');
      selectedRowKeys.value = [];
      loadData();
    },
    title: '确认批量删除',
  });
}

// 新建设备
function handleCreate() {
  router.push('/product-solutions/hardware/detail?mode=edit');
}

// 导出
function handleExport() {
  message.success('导出成功');
}

// 页面加载时初始化数据
loadData();
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- 搜索筛选区 -->
    <Card class="m-4 mb-3 flex-none">
      <Form layout="inline" :model="searchForm">
        <div class="w-full">
          <div class="flex flex-wrap gap-4">
            <Form.Item label="设备编号" class="!mb-0">
              <Input
                v-model:value="searchForm.deviceCode"
                placeholder="请输入设备编号"
                allow-clear
                style="width: 200px"
              />
            </Form.Item>
            <Form.Item label="设备名称" class="!mb-0">
              <Input
                v-model:value="searchForm.deviceName"
                placeholder="请输入设备名称"
                allow-clear
                style="width: 200px"
              />
            </Form.Item>
            <Form.Item label="设备类别" class="!mb-0">
              <Select
                v-model:value="searchForm.deviceCategory"
                placeholder="请选择"
                allow-clear
                style="width: 150px"
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
            <Form.Item label="状态" class="!mb-0">
              <Select
                v-model:value="searchForm.status"
                placeholder="请选择"
                allow-clear
                style="width: 150px"
              >
                <Select.Option value="1">启用</Select.Option>
                <Select.Option value="2">停用</Select.Option>
              </Select>
            </Form.Item>

            <!-- 操作按钮 -->
            <div class="flex-1 flex justify-end items-center gap-2">
              <Button type="primary" @click="handleSearch"> 查询 </Button>
              <Button @click="handleReset"> 重置 </Button>
            </div>
          </div>
        </div>
      </Form>
    </Card>

    <!-- 操作栏和数据表格 -->
    <Card class="mx-4 mb-4 flex-1 flex flex-col overflow-hidden">
      <!-- 操作按钮 -->
      <div class="mb-3 flex justify-between flex-none">
        <Space>
          <Button type="primary" @click="handleCreate"> 新增设备 </Button>
          <Button
            danger
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </Button>
        </Space>
        <Button @click="handleExport"> 导出 </Button>
      </div>

      <!-- 数据表格 -->
      <Table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="(record) => record.id"
        :row-selection="rowSelection"
        :scroll="{ x: 1500 }"
        class="flex-1"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <Tag :color="deviceStatusMap[record.status]?.color">
              {{ deviceStatusMap[record.status]?.text }}
            </Tag>
          </template>
          <template v-if="column.key === 'unitPrice'">
            ¥{{ record.unitPrice.toFixed(2) }}
          </template>
          <template v-if="column.key === 'action'">
            <Space>
              <Button
                type="link"
                size="small"
                @click="handleView(record as HardwareDevice)"
                >查看</Button
              >
              <Button
                type="link"
                size="small"
                @click="handleEdit(record as HardwareDevice)"
                >编辑</Button
              >
              <Button
                type="link"
                size="small"
                @click="handleInventory(record as HardwareDevice)"
                >库存管理</Button
              >
              <Popconfirm
                title="确定删除吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record as HardwareDevice)"
              >
                <Button type="link" size="small" danger>删除</Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 0;
}

/* 确保表格自适应高度 */
:deep(.ant-card-body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.ant-table-wrapper) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.ant-spin-nested-loading) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.ant-spin-container) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.ant-table) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.ant-table-container) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.ant-table-body) {
  flex: 1;
  overflow: auto !important;
}
</style>
