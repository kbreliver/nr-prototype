<script lang="ts" setup>
import { computed, h, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Progress,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';
import type { Order, OrderSearchForm } from './types';
import { OrderStatus } from './types';
import {
  formatAmountWan,
  getOrderStatusMap,
  isOrderEditable,
} from './utils';
import { mockOrderList } from './mock';

defineOptions({
  name: 'OrderList',
});

const router = useRouter();

// 订单状态映射
const orderStatusMap = getOrderStatusMap();

// 搜索表单
const searchForm = reactive<OrderSearchForm>({
  keyword: '',
  customerName: undefined,
  orderStatus: undefined,
  contractCode: undefined,
  responsiblePerson: undefined,
  createDateRange: undefined,
});

// 表格加载状态
const loading = ref(false);

// 选中的行
const selectedRowKeys = ref<number[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  total: 0,
  pageSizeOptions: ['10', '20', '50', '100'],
});

// 数据源
const dataSource = ref<Order[]>([]);

// 表格列定义
const columns: TableColumnsType<Order> = [
  {
    title: '订单编号',
    dataIndex: 'orderCode',
    key: 'orderCode',
    width: 160,
    align: 'center',
    sorter: true,
    customCell: (record) => ({
      style: { cursor: 'pointer' },
      onClick: () => handleView(record),
    }),
    customRender: ({ text }) => h('a', { style: { color: '#1890ff' } }, text),
  },
  {
    title: '订单名称',
    dataIndex: 'orderName',
    key: 'orderName',
    width: 250,
    align: 'center',
    sorter: true,
    ellipsis: true,
  },
  {
    title: '客户名称',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 180,
    align: 'center',
    sorter: true,
    ellipsis: true,
  },
  {
    title: '关联合同',
    dataIndex: 'contractCode',
    key: 'contractCode',
    width: 160,
    align: 'center',
    sorter: true,
    customCell: (record) => ({
      style: { cursor: 'pointer' },
      onClick: () => handleViewContract(record.contractId),
    }),
    customRender: ({ text }) => h('a', { style: { color: '#1890ff' } }, text),
  },
  {
    title: '订单金额(万)',
    dataIndex: 'orderAmount',
    key: 'orderAmount',
    width: 130,
    align: 'right',
    sorter: true,
    customRender: ({ record }) => formatAmountWan(record.orderAmount),
  },
  {
    title: '创建日期',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 120,
    align: 'center',
    sorter: true,
    customRender: ({ record }) => record.createTime?.split(' ')[0] || '-',
  },
  {
    title: '订单状态',
    dataIndex: 'orderStatus',
    key: 'orderStatus',
    width: 100,
    align: 'center',
    sorter: true,
    customRender: ({ record }) => {
      const statusInfo = orderStatusMap[record.orderStatus];
      return h(Tag, { color: statusInfo.color }, () => statusInfo.text);
    },
  },
  {
    title: '执行进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 120,
    align: 'right',
    sorter: true,
    customRender: ({ record }) => {
      return h(Progress, {
        percent: record.progress,
        size: 'small',
        format: (percent?: number) => `${percent}%`,
      });
    },
  },
  {
    title: '负责人',
    dataIndex: 'responsiblePerson',
    key: 'responsiblePerson',
    width: 100,
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    align: 'left',
    fixed: 'right',
    customRender: ({ record }) => {
      const buttons = [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleView(record),
        }, () => [h(EyeOutlined), ' 查看']),
        isOrderEditable(record.orderStatus) && h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEdit(record),
        }, () => [h(EditOutlined), ' 编辑']),
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleUpdateStatus(),
        }, () => [h(SyncOutlined), ' 更新状态']),
      ].filter(Boolean);
      
      return h(Space, { size: 'small' }, () => buttons);
    },
  },
];

// 加载数据
function loadData() {
  loading.value = true;
  
  setTimeout(() => {
    let filteredData = [...mockOrderList];
    
    // 关键字搜索
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.orderName.toLowerCase().includes(keyword) ||
          item.orderCode.toLowerCase().includes(keyword)
      );
    }
    
    // 客户名称筛选
    if (searchForm.customerName) {
      filteredData = filteredData.filter((item) =>
        item.customerName.includes(searchForm.customerName!)
      );
    }
    
    // 订单状态筛选
    if (searchForm.orderStatus !== undefined) {
      filteredData = filteredData.filter(
        (item) => item.orderStatus === searchForm.orderStatus
      );
    }
    
    // 合同编号筛选
    if (searchForm.contractCode) {
      filteredData = filteredData.filter((item) =>
        item.contractCode.includes(searchForm.contractCode!)
      );
    }
    
    // 负责人筛选
    if (searchForm.responsiblePerson) {
      filteredData = filteredData.filter((item) =>
        item.responsiblePerson.includes(searchForm.responsiblePerson!)
      );
    }
    
    // 创建日期范围筛选
    if (searchForm.createDateRange && searchForm.createDateRange.length === 2) {
      const [startDate, endDate] = searchForm.createDateRange;
      filteredData = filteredData.filter((item) => {
        const createDate = item.createTime?.split(' ')[0] || '';
        return createDate >= startDate && createDate <= endDate;
      });
    }
    
    pagination.total = filteredData.length;
    
    // 分页
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    dataSource.value = filteredData.slice(start, end);
    
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
  searchForm.keyword = '';
  searchForm.customerName = undefined;
  searchForm.orderStatus = undefined;
  searchForm.contractCode = undefined;
  searchForm.responsiblePerson = undefined;
  searchForm.createDateRange = undefined;
  pagination.current = 1;
  loadData();
}

// 查看详情
function handleView(record: Order) {
  router.push({
    path: '/market-customers/order/detail',
    query: { id: record.id },
  });
}

// 查看合同
function handleViewContract(contractId: number) {
  router.push({
    path: '/market-customers/contract/detail',
    query: { id: contractId },
  });
}

// 编辑
function handleEdit(record: Order) {
  router.push({
    path: '/market-customers/order/edit',
    query: { id: record.id },
  });
}

// 新建订单
function handleCreate() {
  router.push('/market-customers/order/edit');
}

// 更新状态
function handleUpdateStatus() {
  message.info('更新订单状态功能开发中');
}

// 批量导出
function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要导出的订单');
    return;
  }
  message.success(`导出 ${selectedRowKeys.value.length} 条订单数据`);
}

// 表格变化处理
const handleTableChange: TableProps['onChange'] = (pag) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 20;
  loadData();
};

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: any[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

// 初始化加载数据
loadData();
</script>

<template>
  <div class="order-list-page">
    <Card>
      <!-- 标题区：页面标题（左侧）+ 主要操作按钮（右侧） -->
      <template #title>
        <div class="page-header">
          <span class="page-title">订单管理</span>
          <Space>
            <Button type="primary" @click="handleCreate">
              <template #icon>
                <PlusOutlined />
              </template>
              新建订单
            </Button>
            <Button
              :disabled="selectedRowKeys.length === 0"
              @click="handleBatchExport"
            >
              <template #icon>
                <ExportOutlined />
              </template>
              批量导出
            </Button>
          </Space>
        </div>
      </template>

      <!-- 搜索筛选区：横向排列，自动换行，搜索和重置按钮右对齐 -->
      <div class="search-section">
        <Form layout="inline" :model="searchForm">
          <Form.Item label="关键字">
            <Input
              v-model:value="searchForm.keyword"
              placeholder="订单名称或编号"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
            />
          </Form.Item>
          <Form.Item label="客户名称">
            <Input
              v-model:value="searchForm.customerName"
              placeholder="请输入客户名称"
              allow-clear
              style="width: 160px"
              @pressEnter="handleSearch"
            />
          </Form.Item>
          <Form.Item label="订单状态">
            <Select
              v-model:value="searchForm.orderStatus"
              placeholder="请选择"
              allow-clear
              style="width: 120px"
            >
              <Select.Option :value="OrderStatus.NotStarted">待开始</Select.Option>
              <Select.Option :value="OrderStatus.InProgress">执行中</Select.Option>
              <Select.Option :value="OrderStatus.Paused">已暂停</Select.Option>
              <Select.Option :value="OrderStatus.Completed">已完成</Select.Option>
              <Select.Option :value="OrderStatus.Cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="负责人">
            <Input
              v-model:value="searchForm.responsiblePerson"
              placeholder="请输入负责人"
              allow-clear
              style="width: 120px"
              @pressEnter="handleSearch"
            />
          </Form.Item>
          <Form.Item label="关联合同">
            <Input
              v-model:value="searchForm.contractCode"
              placeholder="请输入合同编号"
              allow-clear
              style="width: 160px"
              @pressEnter="handleSearch"
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker
              v-model:value="searchForm.createDateRange"
              format="YYYY-MM-DD"
              style="width: 240px"
            />
          </Form.Item>
          <Form.Item class="search-actions">
            <Space>
              <Button type="primary" @click="handleSearch">
                <template #icon>
                  <SearchOutlined />
                </template>
                搜索
              </Button>
              <Button @click="handleReset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <!-- 数据表格区：高度自适应，内容区域滚动 -->
      <div class="table-section">
        <Table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          :row-key="(record) => record.id!"
          :row-selection="rowSelection"
          :scroll="{ x: 1500, y: 'calc(100vh - 420px)' }"
          @change="handleTableChange"
        />
      </div>
    </Card>
  </div>
</template>

<style scoped>
.order-list-page {
  padding: 16px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.order-list-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.order-list-page :deep(.ant-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 12px;
}

.search-section :deep(.ant-form-inline) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 0;
}

.search-section :deep(.ant-form-item) {
  margin-bottom: 0;
}

.search-section :deep(.search-actions) {
  margin-left: auto;
}

.table-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-top: -8px;
}

.table-section :deep(.ant-table-wrapper) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-section :deep(.ant-spin-nested-loading) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-section :deep(.ant-spin-container) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-section :deep(.ant-table) {
  flex: 1;
}

.table-section :deep(.ant-table-container) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-section :deep(.ant-table-body) {
  flex: 1;
  overflow-y: auto !important;
}

.table-section :deep(.ant-table-thead > tr > th) {
  text-align: center;
  background: #fafafa;
}

.table-section :deep(.ant-table-cell) {
  padding: 12px 8px;
}

.table-section :deep(.ant-pagination) {
  padding-top: 8px;
  text-align: right;
}
</style>

