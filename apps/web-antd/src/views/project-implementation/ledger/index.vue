<script lang="ts" setup>
import { computed, h, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button,
  Card,
  DatePicker,
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
import {
  ExportOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import type { Project, ProjectQuery } from '../shared/types';
import { ProjectStatus } from '../shared/types';
import {
  getProjectStatusLabel,
  getProjectStatusColor,
  formatPercent,
  exportToExcel,
} from '../shared/utils';
import {
  getProjects,
  mockCreateProject,
  mockDeleteProject,
} from '../shared/mock';
import { PROJECT_STATUS_OPTIONS } from '../shared/constants';

defineOptions({
  name: 'ProjectLedgerList',
});

const router = useRouter();

// 搜索表单
const searchForm = reactive<ProjectQuery>({
  keyword: '',
  orderId: undefined,
  status: undefined,
  managerId: undefined,
  customerId: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  pageSize: 20,
});

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined);

// 监听日期范围变化，同步到搜索表单
watch(dateRange, (newValue) => {
  if (newValue) {
    searchForm.startDate = newValue[0];
    searchForm.endDate = newValue[1];
  } else {
    searchForm.startDate = undefined;
    searchForm.endDate = undefined;
  }
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
const dataSource = ref<Project[]>([]);

// 新建项目弹窗
const createModalVisible = ref(false);
const createForm = reactive({
  name: '',
  orderId: undefined as number | undefined,
  managerId: undefined as number | undefined,
});


// 订单选项（Mock数据）
const orderOptions = ref([
  { label: '订单1', value: 1 },
  { label: '订单2', value: 2 },
  { label: '订单3', value: 3 },
  { label: '订单4', value: 4 },
  { label: '订单5', value: 5 },
]);

// 负责人选项（Mock数据）
const managerOptions = ref([
  { label: '项目经理1', value: 1 },
  { label: '项目经理2', value: 2 },
  { label: '项目经理3', value: 3 },
  { label: '项目经理4', value: 4 },
  { label: '项目经理5', value: 5 },
]);

// 客户选项（Mock数据）
const customerOptions = ref([
  { label: '华润集团', value: 1 },
  { label: '中国移动', value: 2 },
  { label: '宝钢集团', value: 3 },
  { label: '中石化', value: 4 },
  { label: '国家电网', value: 5 },
]);

// 表格列定义
const columns: TableColumnsType<Project> = [
  {
    title: '项目编号',
    dataIndex: 'code',
    key: 'code',
    width: 160,
    align: 'center',
    sorter: true,
    customRender: ({ text }) => text,
    customCell: (record) => ({
      style: { cursor: 'pointer', color: '#1890ff' },
      onClick: () => handleView(record),
    }),
  },
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
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
  },
  {
    title: '关联订单',
    dataIndex: 'orderName',
    key: 'orderName',
    width: 150,
    align: 'center',
  },
  {
    title: '项目状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    sorter: true,
    customRender: ({ record }) => {
      return h(
        Tag,
        { color: getProjectStatusColor(record.status) },
        () => getProjectStatusLabel(record.status)
      );
    },
  },
  {
    title: '项目进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 100,
    align: 'right',
    sorter: true,
    customRender: ({ record }) => formatPercent(record.progress),
  },
  {
    title: '项目负责人',
    dataIndex: 'managerName',
    key: 'managerName',
    width: 120,
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    align: 'center',
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    align: 'left',
    fixed: 'right',
    customRender: ({ record }) => {
      const buttons: any[] = [];

      // 列表页只显示编辑和删除按钮，状态流转操作在详情页进行
      // 1. 编辑 (待启动、实施中)
      if ([ProjectStatus.PENDING_START, ProjectStatus.IN_IMPLEMENTATION].includes(record.status)) {
        buttons.push(
          h(
            Button,
            {
              type: 'link',
              size: 'small',
              onClick: () => handleEdit(record),
            },
            () => '编辑'
          )
        );
      }

      // 2. 删除 (待启动)
      if (record.status === ProjectStatus.PENDING_START) {
        buttons.push(
          h(
            Popconfirm,
            {
              title: '确定要删除这个项目吗？',
              okText: '确定',
              cancelText: '取消',
              onConfirm: () => handleDelete(record),
            },
            () =>
              h(
                Button,
                {
                  type: 'link',
                  danger: true,
                  size: 'small',
                },
                () => '删除'
              )
          )
        );
      }

      return h(Space, { size: 'small' }, () => buttons);
    },
  },
];

// 加载数据
function loadData() {
  loading.value = true;

  // 模拟异步加载
  setTimeout(() => {
    const query = {
      ...searchForm,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };

    const { list, total } = getProjects(query);

    dataSource.value = list;
    pagination.total = total;

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
  searchForm.orderId = undefined;
  searchForm.status = undefined;
  searchForm.managerId = undefined;
  searchForm.customerId = undefined;
  searchForm.startDate = undefined;
  searchForm.endDate = undefined;
  dateRange.value = undefined;
  pagination.current = 1;
  loadData();
}

// 查看详情
function handleView(record: Project) {
  router.push({
    path: '/project-implementation/ledger/detail',
    query: { id: record.id, mode: 'view' },
  });
}

// 编辑
function handleEdit(record: Project) {
  router.push({
    path: '/project-implementation/ledger/detail',
    query: { id: record.id, mode: 'edit' },
  });
}

// 新建项目
function handleCreate() {
  createForm.name = '';
  createForm.orderId = undefined;
  createForm.managerId = undefined;
  createModalVisible.value = true;
}

// 提交新建表单
async function handleCreateSubmit() {
  if (!createForm.name) {
    message.error('请输入项目名称');
    return;
  }
  if (!createForm.orderId) {
    message.error('请选择关联订单');
    return;
  }
  if (!createForm.managerId) {
    message.error('请选择项目负责人');
    return;
  }

  try {
    const project = await mockCreateProject(createForm);
    message.success('项目创建成功');
    createModalVisible.value = false;
    // 跳转到详情页编辑模式
    router.push({
      path: '/project-implementation/ledger/detail',
      query: { id: project.id, mode: 'edit' },
    });
  } catch (error) {
    message.error('项目创建失败');
  }
}


// 删除
async function handleDelete(record: Project) {
  try {
    await mockDeleteProject(record.id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    message.error('删除失败');
  }
}

// 批量导出
async function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要导出的项目');
    return;
  }

  const exportData = dataSource.value.filter((item) =>
    selectedRowKeys.value.includes(item.id)
  );

  const exportColumns = [
    { title: '项目编号', dataIndex: 'code', width: 20 },
    { title: '项目名称', dataIndex: 'name', width: 30 },
    { title: '客户名称', dataIndex: 'customerName', width: 25 },
    { title: '关联订单', dataIndex: 'orderName', width: 20 },
    { title: '项目状态', dataIndex: 'status', width: 15 },
    { title: '项目进度', dataIndex: 'progress', width: 15 },
    { title: '项目负责人', dataIndex: 'managerName', width: 15 },
    { title: '创建时间', dataIndex: 'createdAt', width: 25 },
  ];

  await exportToExcel(exportData, exportColumns, '项目台账');
  message.success('导出成功');
}

// 导出全部
async function handleExportAll() {
  const query = { ...searchForm };
  const { list } = getProjects(query);

  const exportColumns = [
    { title: '项目编号', dataIndex: 'code', width: 20 },
    { title: '项目名称', dataIndex: 'name', width: 30 },
    { title: '客户名称', dataIndex: 'customerName', width: 25 },
    { title: '关联订单', dataIndex: 'orderName', width: 20 },
    { title: '项目状态', dataIndex: 'status', width: 15 },
    { title: '项目进度', dataIndex: 'progress', width: 15 },
    { title: '项目负责人', dataIndex: 'managerName', width: 15 },
    { title: '创建时间', dataIndex: 'createdAt', width: 25 },
  ];

  await exportToExcel(list, exportColumns, '项目台账');
  message.success('导出成功');
}

// 表格变化处理
const handleTableChange: TableProps['onChange'] = (pag, _filters, sorter: any) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 20;

  // 处理排序
  if (sorter && sorter.field) {
    searchForm.sortField = sorter.field;
    searchForm.sortOrder = sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : undefined;
  }

  loadData();
};

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

// 初始化加载数据
loadData();
</script>

<template>
  <div class="project-ledger-page">
    <Card>
      <!-- 标题区：页面标题（左侧）+ 主要操作按钮（右侧） -->
      <template #title>
        <div class="page-header">
          <span class="page-title">项目台账</span>
          <Space>
            <Button type="primary" @click="handleCreate">
              <template #icon>
                <PlusOutlined />
              </template>
              新建项目
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
            <Button @click="handleExportAll">
              <template #icon>
                <ExportOutlined />
              </template>
              导出
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
              placeholder="项目名称或编号"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
            />
          </Form.Item>
          <Form.Item label="关联订单">
            <Select
              v-model:value="searchForm.orderId"
              placeholder="请选择"
              allow-clear
              style="width: 160px"
            >
              <Select.Option
                v-for="item in orderOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="项目状态">
            <Select
              v-model:value="searchForm.status"
              placeholder="请选择"
              allow-clear
              mode="multiple"
              style="width: 200px"
            >
              <Select.Option
                v-for="item in PROJECT_STATUS_OPTIONS"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="负责人">
            <Select
              v-model:value="searchForm.managerId"
              placeholder="请选择"
              allow-clear
              mode="multiple"
              style="width: 200px"
            >
              <Select.Option
                v-for="item in managerOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              style="width: 240px"
            />
          </Form.Item>
          <Form.Item label="客户名称">
            <Select
              v-model:value="searchForm.customerId"
              placeholder="请选择"
              allow-clear
              style="width: 160px"
            >
              <Select.Option
                v-for="item in customerOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
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
          :row-key="(record) => record.id"
          :row-selection="rowSelection"
          :scroll="{ x: 1500, y: 'calc(100vh - 420px)' }"
          @change="handleTableChange"
        />
      </div>
    </Card>

    <!-- 新建项目弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="新建项目"
      :width="600"
      @ok="handleCreateSubmit"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <Form.Item label="项目名称" required>
          <Input
            v-model:value="createForm.name"
            placeholder="请输入项目名称"
            allow-clear
          />
        </Form.Item>
        <Form.Item label="关联订单" required>
          <Select
            v-model:value="createForm.orderId"
            placeholder="请选择关联订单"
            allow-clear
          >
            <Select.Option
              v-for="item in orderOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="项目负责人" required>
          <Select
            v-model:value="createForm.managerId"
            placeholder="请选择项目负责人"
            allow-clear
          >
            <Select.Option
              v-for="item in managerOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>

  </div>
</template>

<style scoped>
.project-ledger-page {
  padding: 24px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-ledger-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-ledger-page :deep(.ant-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px;
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
  margin-bottom: 16px;
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
