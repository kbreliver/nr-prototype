<script lang="ts" setup>
import { reactive, ref, computed } from 'vue';
import { Button, Input, Modal, Table, Tag, message, Select } from 'ant-design-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';
import type { HardwareDevice } from '../types';

defineOptions({
  name: 'HardwareSelectorModal',
});

interface Props {
  open: boolean;
  selectedIds?: number[];
}

interface Emits {
  (e: 'update:open', visible: boolean): void;
  (e: 'select', devices: HardwareDevice[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => [],
});

const emit = defineEmits<Emits>();

// 搜索表单
const searchForm = reactive({
  keyword: '',
  deviceType: undefined as string | undefined,
});

// 选中的设备
const selectedRowKeys = ref<number[]>([]);
const selectedRows = ref<HardwareDevice[]>([]);

// Mock 硬件设备数据 (status: 1-启用, 0-停用)
const mockHardwareDevices: HardwareDevice[] = [
  { id: 1, deviceCode: 'HD-2024001', deviceName: '温度传感器', deviceModel: 'TS-100', brand: 'Sensirion', unitPrice: 500, status: 1, deviceType: '传感器', stock: 100, description: '高精度温度传感器' },
  { id: 2, deviceCode: 'HD-2024002', deviceName: '工业网关', deviceModel: 'GW-200', brand: 'Siemens', unitPrice: 2000, status: 1, deviceType: '网络设备', stock: 50, description: '支持多种工业协议' },
  { id: 3, deviceCode: 'HD-2024003', deviceName: '工业服务器', deviceModel: 'SR-300', brand: 'Dell', unitPrice: 8000, status: 1, deviceType: '计算设备', stock: 20, description: '高性能边缘计算服务器' },
  { id: 4, deviceCode: 'HD-2024004', deviceName: '湿度传感器', deviceModel: 'HS-150', brand: 'Honeywell', unitPrice: 450, status: 1, deviceType: '传感器', stock: 80, description: '数字湿度传感器' },
  { id: 5, deviceCode: 'HD-2024005', deviceName: '可编程控制器', deviceModel: 'PLC-500', brand: 'Mitsubishi', unitPrice: 3500, status: 1, deviceType: '控制器', stock: 30, description: '模块化PLC控制器' },
  { id: 6, deviceCode: 'HD-2024006', deviceName: '工业摄像头', deviceModel: 'CAM-400', brand: 'Hikvision', unitPrice: 1200, status: 1, deviceType: '监控设备', stock: 60, description: '高清工业视觉相机' },
  { id: 7, deviceCode: 'HD-2024007', deviceName: '停用设备A', deviceModel: 'OLD-001', brand: 'Legacy', unitPrice: 100, status: 0, deviceType: '配件', stock: 0, description: '已停产' },
  { id: 8, deviceCode: 'HD-2024008', deviceName: '停用设备B', deviceModel: 'OLD-002', brand: 'Legacy', unitPrice: 200, status: 0, deviceType: '配件', stock: 0, description: '已停产' },
];

// 提取设备类型选项
const deviceTypeOptions = computed(() => {
  const types = new Set(mockHardwareDevices.map(d => d.deviceType).filter(Boolean));
  return Array.from(types).map(type => ({ label: type, value: type }));
});

// 表格列定义
const columns: TableColumnsType<HardwareDevice> = [
  { title: '设备编码', dataIndex: 'deviceCode', width: 120 },
  { title: '设备名称', dataIndex: 'deviceName', width: 150 },
  { title: '设备型号', dataIndex: 'deviceModel', width: 120 },
  { title: '品牌', dataIndex: 'brand', width: 100 },
  { title: '类型', dataIndex: 'deviceType', width: 100 },
  { title: '单价', dataIndex: 'unitPrice', width: 100, align: 'right', customRender: ({ text }) => `¥${text}` },
  { title: '库存', dataIndex: 'stock', width: 80, align: 'right' },
];

// 数据源
const dataSource = ref<HardwareDevice[]>([]);
const loading = ref(false);

// 加载数据
const loadData = () => {
  loading.value = true;
  // 模拟API调用，仅展示已启用的设备
  setTimeout(() => {
    dataSource.value = mockHardwareDevices.filter(item => {
      // 过滤状态为已启用的
      const isEnabled = item.status === 1;
      // 过滤掉已加入方案的设备
      const isNotSelected = !props.selectedIds.includes(item.id);

      // 关键词搜索
      const keyword = searchForm.keyword.trim().toLowerCase();
      const matchKeyword = !keyword || 
        item.deviceName.toLowerCase().includes(keyword) || 
        item.deviceModel.toLowerCase().includes(keyword) ||
        item.deviceCode.toLowerCase().includes(keyword);
      
      // 类型筛选
      const matchType = !searchForm.deviceType || item.deviceType === searchForm.deviceType;

      return isEnabled && isNotSelected && matchKeyword && matchType;
    });
    loading.value = false;
  }, 300);
};

// 搜索
const handleSearch = () => {
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.deviceType = undefined;
  loadData();
};

// 行选择配置
const rowSelection: TableProps['rowSelection'] = {
  preserveSelectedRowKeys: true,
  onChange: (keys) => {
    selectedRowKeys.value = keys as number[];
  },
  getCheckboxProps: (record) => ({
    // 如果需要禁用某些行，可以在这里配置
    disabled: record.status !== 1,
  }),
};

// 确定按钮文字
const okText = computed(() => {
  const count = selectedRowKeys.value.length;
  return count > 0 ? `确定 (${count})` : '确定';
});

// 确定选择
const handleOk = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请至少选择一项设备');
    return;
  }
  
  // 根据选中的 keys 从全量 mock 数据中查找完整的设备对象
  // 即使是搜索过滤后不可见的行，如果被选中了，也应该被提交
  const selectedDevices = mockHardwareDevices.filter(device => 
    selectedRowKeys.value.includes(device.id)
  );
  
  emit('select', selectedDevices);
  handleCancel();
};

// 取消/关闭
const handleCancel = () => {
  emit('update:open', false);
  // 清空选择状态，或者保留？根据需求，这里选择清空
  selectedRowKeys.value = [];
  selectedRows.value = [];
  searchForm.keyword = '';
};

// 监听打开状态，打开时加载数据
import { watch } from 'vue';
watch(() => props.open, (newVal) => {
  if (newVal) {
    loadData();
    // 如果需要回显已选中的，可以在这里处理 selectedRowKeys
    // 目前需求是添加，通常不需要回显已添加的并勾选，除非是编辑模式下的全量选择
  }
});
</script>

<template>
  <Modal
    :open="open"
    title="选择硬件设备"
    width="1000px"
    @ok="handleOk"
    @cancel="handleCancel"
    :maskClosable="false"
    :okText="okText"
  >
    <div class="mb-4 flex gap-2">
      <Select
        v-model:value="searchForm.deviceType"
        placeholder="请选择设备类型"
        allow-clear
        class="w-40"
        :options="deviceTypeOptions"
        @change="handleSearch"
      />
      <Input
        v-model:value="searchForm.keyword"
        placeholder="请输入设备名称/型号/编码"
        allow-clear
        @pressEnter="handleSearch"
        class="w-64"
      />
      <Button type="primary" @click="handleSearch">搜索</Button>
      <Button @click="handleReset">重置</Button>
    </div>

    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :row-selection="{ ...rowSelection, selectedRowKeys }"
      row-key="id"
      :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }"
      size="small"
      :scroll="{ y: 400 }"
    >
    </Table>
  </Modal>
</template>

