<script lang="ts" setup>
import { computed, h, reactive, ref } from 'vue';
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
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue';
import type { ImplementationTemplate, TemplateQuery } from '../shared/types';
import { TemplateType, TemplateStatus } from '../shared/types';
import {
  getTemplateTypeLabel,
  getTemplateTypeColor,
  getTemplateStatusLabel,
  getTemplateStatusColor,
} from '../shared/utils';
import { getTemplates, mockCreateTemplate, mockDeleteTemplate } from '../shared/mock';
import { TEMPLATE_TYPE_OPTIONS, TEMPLATE_STATUS_OPTIONS } from '../shared/constants';

defineOptions({
  name: 'ImplementationTemplatesList',
});

const router = useRouter();

// 搜索表单
const searchForm = reactive<TemplateQuery>({
  keyword: '',
  type: undefined,
  status: undefined,
  page: 1,
  pageSize: 20,
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
const dataSource = ref<ImplementationTemplate[]>([]);

// 新建方案弹窗
const createModalVisible = ref(false);
const createForm = reactive({
  name: '',
  type: TemplateType.STANDARD,
  description: '',
});

// 表格列定义
const columns: TableColumnsType<ImplementationTemplate> = [
  {
    title: '方案编号',
    dataIndex: 'code',
    key: 'code',
    width: 150,
    align: 'center',
    sorter: true,
    customRender: ({ text }) => text,
    customCell: (record) => ({
      style: { cursor: 'pointer', color: '#1890ff' },
      onClick: () => handleView(record),
    }),
  },
  {
    title: '方案名称',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    align: 'center',
    sorter: true,
    ellipsis: true,
  },
  {
    title: '方案类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    align: 'center',
    sorter: true,
    customRender: ({ record }) => {
      return h(
        Tag,
        { color: getTemplateTypeColor(record.type) },
        () => getTemplateTypeLabel(record.type)
      );
    },
  },
  {
    title: '方案状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    sorter: true,
    customRender: ({ record }) => {
      return h(
        Tag,
        { color: getTemplateStatusColor(record.status) },
        () => getTemplateStatusLabel(record.status)
      );
    },
  },
  {
    title: '任务数',
    dataIndex: 'taskCount',
    key: 'taskCount',
    width: 100,
    align: 'right',
    sorter: true,
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
      const buttons = [
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            onClick: () => handleView(record),
          },
          () => '查看'
        ),
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            onClick: () => handleEdit(record),
          },
          () => '编辑'
        ),
      ];

      if (record.status === TemplateStatus.DISABLED) {
        buttons.push(
          h(
            Popconfirm,
            {
              title: '确定要删除这个方案吗？',
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

  setTimeout(() => {
    const query = {
      ...searchForm,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };

    const { list, total } = getTemplates(query);

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
  searchForm.type = undefined;
  searchForm.status = undefined;
  pagination.current = 1;
  loadData();
}

// 查看详情
function handleView(record: ImplementationTemplate) {
  router.push({
    path: '/project-implementation/templates/detail',
    query: { id: record.id, mode: 'view' },
  });
}

// 编辑
function handleEdit(record: ImplementationTemplate) {
  router.push({
    path: '/project-implementation/templates/detail',
    query: { id: record.id, mode: 'edit' },
  });
}

// 新建方案
function handleCreate() {
  createForm.name = '';
  createForm.type = TemplateType.STANDARD;
  createForm.description = '';
  createModalVisible.value = true;
}

// 提交新建表单
async function handleCreateSubmit() {
  if (!createForm.name) {
    message.error('请输入方案名称');
    return;
  }

  try {
    const template = await mockCreateTemplate(createForm);
    message.success('方案创建成功');
    createModalVisible.value = false;
    router.push({
      path: '/project-implementation/templates/detail',
      query: { id: template.id, mode: 'edit' },
    });
  } catch (error) {
    message.error('方案创建失败');
  }
}

// 删除
async function handleDelete(record: ImplementationTemplate) {
  try {
    await mockDeleteTemplate(record.id);
    message.success('删除成功');
    loadData();
  } catch (error) {
    message.error('删除失败');
  }
}

// 表格变化处理
const handleTableChange: TableProps['onChange'] = (pag, _filters, sorter: any) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 20;

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
  <div class="templates-page">
    <Card>
      <!-- 标题区 -->
      <template #title>
        <div class="page-header">
          <span class="page-title">标准实施方案</span>
          <Space>
            <Button type="primary" @click="handleCreate">
              <template #icon>
                <PlusOutlined />
              </template>
              新建方案
            </Button>
          </Space>
        </div>
      </template>

      <!-- 搜索筛选区 -->
      <div class="search-section">
        <Form layout="inline" :model="searchForm">
          <Form.Item label="关键字">
            <Input
              v-model:value="searchForm.keyword"
              placeholder="方案名称或编号"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
            />
          </Form.Item>
          <Form.Item label="方案类型">
            <Select
              v-model:value="searchForm.type"
              placeholder="请选择"
              allow-clear
              mode="multiple"
              style="width: 200px"
            >
              <Select.Option
                v-for="item in TEMPLATE_TYPE_OPTIONS"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="方案状态">
            <Select
              v-model:value="searchForm.status"
              placeholder="请选择"
              allow-clear
              mode="multiple"
              style="width: 200px"
            >
              <Select.Option
                v-for="item in TEMPLATE_STATUS_OPTIONS"
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

      <!-- 数据表格区 -->
      <div class="table-section">
        <Table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          :row-key="(record) => record.id"
          :row-selection="rowSelection"
          :scroll="{ x: 1200, y: 'calc(100vh - 420px)' }"
          @change="handleTableChange"
        />
      </div>
    </Card>

    <!-- 新建方案弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="新建方案"
      :width="600"
      @ok="handleCreateSubmit"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <Form.Item label="方案名称" required>
          <Input
            v-model:value="createForm.name"
            placeholder="请输入方案名称"
            allow-clear
          />
        </Form.Item>
        <Form.Item label="方案类型" required>
          <Select
            v-model:value="createForm.type"
            placeholder="请选择方案类型"
          >
            <Select.Option
              v-for="item in TEMPLATE_TYPE_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="方案描述">
          <Input.TextArea
            v-model:value="createForm.description"
            :rows="4"
            placeholder="请输入方案描述"
            allow-clear
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.templates-page {
  padding: 24px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.templates-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.templates-page :deep(.ant-card-body) {
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

