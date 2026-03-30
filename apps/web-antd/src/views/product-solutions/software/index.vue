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
  Tooltip,
} from 'ant-design-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';

defineOptions({
  name: 'SoftwareProductLibrary',
});

const router = useRouter();

// 类型定义
interface SoftwareProduct {
  id: number;
  productCode: string;
  productName: string;
  productCategory: string;
  productStatus: number;
  currentVersion: string;
  licenseTypes: string[];
  moduleCount: number;
  createTime: string;
  updateTime: string;
}

interface SearchForm {
  keyword: string;
  productCategory: string;
  productStatus: string | undefined;
  licenseTypes: string | undefined;
}

// 产品状态枚举
const productStatusMap: Record<number, { text: string; color: string }> = {
  1: { text: '在研', color: 'processing' },
  2: { text: '在售', color: 'success' },
  3: { text: '停售', color: 'warning' },
  4: { text: '已下线', color: 'default' },
};

// 搜索表单
const searchForm = reactive<SearchForm>({
  keyword: '',
  productCategory: '',
  productStatus: undefined,
  licenseTypes: undefined,
});

// 高级搜索展开状态
const expandSearch = ref(false);

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
const mockData: SoftwareProduct[] = [
  {
    createTime: '2024-01-15 10:30:00',
    currentVersion: 'v2.1.0',
    id: 1,
    licenseTypes: ['永久授权', '订阅模式'],
    moduleCount: 12,
    productCategory: '管理系统',
    productCode: 'PRD-001',
    productName: 'OMS运营管理系统',
    productStatus: 2,
    updateTime: '2024-11-01 14:20:00',
  },
  {
    createTime: '2024-02-10 09:15:00',
    currentVersion: 'v3.0.5',
    id: 2,
    licenseTypes: ['订阅模式', '按量计费'],
    moduleCount: 18,
    productCategory: '管理系统',
    productCode: 'PRD-002',
    productName: 'ERP企业资源计划',
    productStatus: 2,
    updateTime: '2024-10-28 16:45:00',
  },
  {
    createTime: '2024-03-05 11:20:00',
    currentVersion: 'v1.5.2',
    id: 3,
    licenseTypes: ['永久授权'],
    moduleCount: 8,
    productCategory: '协同办公',
    productCode: 'PRD-003',
    productName: 'CRM客户关系管理',
    productStatus: 2,
    updateTime: '2024-10-25 10:15:00',
  },
  {
    createTime: '2024-04-12 14:30:00',
    currentVersion: 'v0.8.0',
    id: 4,
    licenseTypes: ['订阅模式'],
    moduleCount: 6,
    productCategory: '数据分析',
    productCode: 'PRD-004',
    productName: 'BI商业智能平台',
    productStatus: 1,
    updateTime: '2024-11-02 09:30:00',
  },
  {
    createTime: '2024-01-20 08:45:00',
    currentVersion: 'v2.3.1',
    id: 5,
    licenseTypes: ['订阅模式', '按量计费'],
    moduleCount: 10,
    productCategory: '协同办公',
    productCode: 'PRD-005',
    productName: 'OA协同办公系统',
    productStatus: 2,
    updateTime: '2024-10-30 11:20:00',
  },
  {
    createTime: '2023-11-15 10:00:00',
    currentVersion: 'v1.2.0',
    id: 6,
    licenseTypes: ['永久授权'],
    moduleCount: 5,
    productCategory: '工具软件',
    productCode: 'PRD-006',
    productName: '项目管理工具',
    productStatus: 3,
    updateTime: '2024-09-20 15:30:00',
  },
  {
    createTime: '2024-05-08 13:15:00',
    currentVersion: 'v0.5.0',
    id: 7,
    licenseTypes: ['订阅模式'],
    moduleCount: 7,
    productCategory: '数据分析',
    productCode: 'PRD-007',
    productName: '大数据分析平台',
    productStatus: 1,
    updateTime: '2024-11-05 16:40:00',
  },
  {
    createTime: '2024-06-01 15:20:00',
    currentVersion: 'v1.8.3',
    id: 9,
    licenseTypes: ['订阅模式', '按量计费'],
    moduleCount: 15,
    productCategory: '管理系统',
    productCode: 'PRD-009',
    productName: 'SCM供应链管理',
    productStatus: 2,
    updateTime: '2024-11-03 14:10:00',
  },
  {
    createTime: '2024-07-10 11:45:00',
    currentVersion: 'v2.0.0',
    id: 10,
    licenseTypes: ['永久授权'],
    moduleCount: 9,
    productCategory: '协同办公',
    productCode: 'PRD-010',
    productName: 'HRM人力资源管理',
    productStatus: 2,
    updateTime: '2024-11-04 09:25:00',
  },
];

// 表格数据
const dataSource = ref<SoftwareProduct[]>([]);

// 表格列配置（按PRD顺序）
const columns: TableColumnsType<SoftwareProduct> = [
  {
    dataIndex: 'productCode',
    key: 'productCode',
    sorter: true,
    title: '产品编码',
    width: 120,
    customCell: (record) => ({
      style: { cursor: 'pointer', color: '#1890ff' },
      onClick: () => handleView(record),
    }),
  },
  {
    dataIndex: 'productName',
    key: 'productName',
    title: '产品名称',
    width: 200,
  },
  {
    dataIndex: 'productCategory',
    key: 'productCategory',
    sorter: true,
    title: '产品分类',
    width: 120,
  },
  {
    dataIndex: 'productStatus',
    key: 'productStatus',
    sorter: true,
    title: '产品状态',
    width: 100,
  },
  {
    dataIndex: 'currentVersion',
    key: 'currentVersion',
    sorter: true,
    title: '当前版本',
    width: 100,
  },
  {
    dataIndex: 'licenseType',
    key: 'licenseType',
    sorter: true,
    title: '授权方式',
    width: 120,
  },
  {
    align: 'center',
    dataIndex: 'moduleCount',
    key: 'moduleCount',
    sorter: true,
    title: '模块数量',
    width: 100,
  },
  {
    dataIndex: 'createTime',
    key: 'createTime',
    sorter: true,
    title: '创建时间',
    width: 150,
  },
  {
    dataIndex: 'updateTime',
    key: 'updateTime',
    sorter: true,
    title: '更新时间',
    width: 150,
  },
  {
    align: 'center',
    fixed: 'right',
    key: 'action',
    title: '操作',
    width: 200,
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
  searchForm.keyword = '';
  searchForm.productCategory = '';
  searchForm.productStatus = undefined;
  searchForm.licenseTypes = undefined;
  handleSearch();
}

// 切换高级搜索
function toggleExpand() {
  expandSearch.value = !expandSearch.value;
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
function handleView(record: SoftwareProduct) {
  router.push(`/product-solutions/software/detail/${record.id}`);
}

// 编辑
function handleEdit(record: SoftwareProduct) {
  router.push(`/product-solutions/software/detail/${record.id}?mode=edit`);
}

// 删除
function handleDelete(record: SoftwareProduct) {
  Modal.confirm({
    cancelText: '取消',
    content: `确定要删除产品"${record.productName}"吗？`,
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
    message.warning('请先选择要删除的产品');
    return;
  }
  Modal.confirm({
    cancelText: '取消',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个产品吗？`,
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

// 新建产品
function handleCreate() {
  router.push('/product-solutions/software/detail?mode=edit');
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
            <Form.Item label="关键字" class="!mb-0">
              <Input
                v-model:value="searchForm.keyword"
                placeholder="产品名称/产品编码"
                allow-clear
                style="width: 200px"
              />
            </Form.Item>
            <Form.Item label="产品分类" class="!mb-0">
              <Select
                v-model:value="searchForm.productCategory"
                placeholder="请选择"
                allow-clear
                style="width: 150px"
              >
                <Select.Option value="管理系统">管理系统</Select.Option>
                <Select.Option value="协同办公">协同办公</Select.Option>
                <Select.Option value="数据分析">数据分析</Select.Option>
                <Select.Option value="工具软件">工具软件</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="产品状态" class="!mb-0">
              <Select
                v-model:value="searchForm.productStatus"
                placeholder="请选择"
                allow-clear
                style="width: 150px"
              >
                <Select.Option value="1">在研</Select.Option>
                <Select.Option value="2">在售</Select.Option>
                <Select.Option value="3">停售</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="授权方式" class="!mb-0">
              <Select
                v-model:value="searchForm.licenseTypes"
                placeholder="请选择"
                allow-clear
                style="width: 150px"
              >
                <Select.Option value="订阅模式">订阅模式</Select.Option>
                <Select.Option value="永久授权">永久授权</Select.Option>
                <Select.Option value="按量计费">按量计费</Select.Option>
              </Select>
            </Form.Item>

            <!-- 操作按钮 -->
            <div class="flex-1 flex justify-end items-center gap-2">
              <Button type="primary" @click="handleSearch">
                查询
              </Button>
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
          <Button
            type="primary"
            @click="handleCreate"
          >
            新建产品
          </Button>
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
        :scroll="{ x: 1400 }"
        class="flex-1"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'productName'">
            <a @click="handleView(record as SoftwareProduct)">{{ record.productName }}</a>
          </template>
          <template v-if="column.key === 'productStatus'">
            <Tag :color="productStatusMap[record.productStatus]?.color">
              {{ productStatusMap[record.productStatus]?.text }}
            </Tag>
          </template>
          <template v-if="column.key === 'licenseType'">
            <Tooltip v-if="record.licenseTypes && record.licenseTypes.length > 0">
              <template #title>
                <div v-for="(type, index) in record.licenseTypes" :key="index">
                  {{ type }}
                </div>
              </template>
              <div class="flex flex-wrap gap-1">
                <Tag color="blue">
                  {{ record.licenseTypes[0] }}
                </Tag>
                <Tag v-if="record.licenseTypes.length > 1" color="blue">
                  +{{ record.licenseTypes.length - 1 }}
                </Tag>
              </div>
            </Tooltip>
          </template>
          <template v-if="column.key === 'action'">
            <Space>
              <Button type="link" size="small" @click="handleView(record as SoftwareProduct)">查看</Button>
              <Button type="link" size="small" @click="handleEdit(record as SoftwareProduct)">编辑</Button>
              <Popconfirm
                title="确定删除吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record as SoftwareProduct)"
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
