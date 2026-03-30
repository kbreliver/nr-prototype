<script lang="ts" setup>
import { computed, h, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Badge,
} from 'ant-design-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';
import {
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue';
import type { DeliveryTask, TaskQuery } from '../shared/types';
import { TaskStatus, TaskType } from '../shared/types';
import {
  getTaskStatusLabel,
  getTaskStatusColor,
  getTaskTypeLabel,
  getTaskTypeColor,
  formatPercent,
} from '../shared/utils';
import { getDeliveryTasks, mockDeliveryTasks } from '../shared/mock';
import { TASK_STATUS_OPTIONS, TASK_TYPE_OPTIONS } from '../shared/constants';
import TaskBoard from '../shared/components/TaskBoard.vue';

defineOptions({
  name: 'TaskExecutionList',
});

const router = useRouter();

// 模拟当前用户
const currentUser = {
  id: 1,
  name: '当前用户',
  role: 'project_manager', // 角色：project_manager, project_director, management
};

// 视图模式
const viewMode = ref<'list' | 'board'>('list');

// 搜索表单
const searchForm = reactive<TaskQuery>({
  projectId: undefined,
  type: undefined,
  status: [TaskStatus.PENDING], // 默认选中待办
  assigneeId: [currentUser.id], // 默认选中当前用户
  startDate: undefined,
  endDate: undefined,
  keyword: '',
  page: 1,
  pageSize: 20,
});

// 状态统计
const statusCounts = reactive({
  all: 0,
  pending: 0,
  in_progress: 0,
  completed: 0,
});

// 计算当前选中的状态（用于徽标高亮）
const currentStatusFilter = computed(() => {
  if (!searchForm.status || searchForm.status.length === 0) return 'all';
  if (searchForm.status.length === 1) return searchForm.status[0];
  return 'mixed'; // 多选时的情况
});

// 更新状态统计
function updateStatusCounts() {
  // 在实际应用中，这里应该调用API获取统计数据
  // 这里使用mock数据计算
  const allTasks = mockDeliveryTasks;
  statusCounts.all = allTasks.length;
  statusCounts.pending = allTasks.filter(t => t.status === TaskStatus.PENDING).length;
  statusCounts.in_progress = allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  statusCounts.completed = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
}

// 点击状态徽标
function handleStatusClick(status: 'all' | TaskStatus) {
  if (status === 'all') {
    searchForm.status = undefined;
  } else {
    searchForm.status = [status];
  }
  handleSearch();
}

// 表格加载状态
const loading = ref(false);

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
const dataSource = ref<DeliveryTask[]>([]);

// 项目选项（Mock数据 - 模拟权限控制）
const projectOptions = computed(() => {
  // 模拟：如果是总监或管理层，显示所有项目；否则显示参与的项目
  // 这里简单模拟，实际应根据 currentUser.role 判断
  const allProjects = [
    { label: '项目1', value: 1 },
    { label: '项目2', value: 2 },
    { label: '项目3', value: 3 },
    { label: '项目4', value: 4 },
    { label: '项目5', value: 5 },
  ];
  
  if (currentUser.role === 'project_director' || currentUser.role === 'management') {
    return allProjects;
  }
  
  // 模拟当前用户参与的项目 (假设参与了项目1, 3, 5)
  return allProjects.filter(p => [1, 3, 5].includes(p.value));
});

// 负责人选项（Mock数据）
const assigneeOptions = ref([
  { label: '当前用户', value: 1 },
  { label: '实施人员2', value: 2 },
  { label: '实施人员3', value: 3 },
  { label: '实施人员4', value: 4 },
  { label: '实施人员5', value: 5 },
]);

// 表格列定义
const columns: TableColumnsType<DeliveryTask> = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    align: 'center',
    ellipsis: true,
    customCell: (record) => ({
      style: { cursor: 'pointer', color: '#1890ff' },
      onClick: () => handleView(record),
    }),
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 200,
    align: 'left',
    ellipsis: true,
  },
  {
    title: '任务类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    align: 'center',
    customRender: ({ record }) => {
      return h(
        Tag,
        { color: getTaskTypeColor(record.type) },
        () => getTaskTypeLabel(record.type)
      );
    },
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      return h(
        Tag,
        { color: getTaskStatusColor(record.status) },
        () => getTaskStatusLabel(record.status)
      );
    },
  },
  {
    title: '负责人',
    dataIndex: 'assigneeName',
    key: 'assigneeName',
    width: 120,
    align: 'center',
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 100,
    align: 'right',
    customRender: ({ record }) => formatPercent(record.progress),
  },
  {
    title: '计划开始',
    dataIndex: 'plannedStartDate',
    key: 'plannedStartDate',
    width: 120,
    align: 'center',
  },
  {
    title: '计划完成',
    dataIndex: 'plannedEndDate',
    key: 'plannedEndDate',
    width: 140,
    align: 'center',
    customRender: ({ record }) => {
      const endDate = dayjs(record.plannedEndDate);
      const today = dayjs();
      const isOverdue = 
        (record.status === TaskStatus.PENDING || record.status === TaskStatus.IN_PROGRESS) &&
        endDate.isBefore(today, 'day');
      
      if (isOverdue) {
        const overdueDays = today.diff(endDate, 'day');
        return h('span', { style: { color: '#ff4d4f' } }, `${record.plannedEndDate} 超期${overdueDays}天`);
      }
      return record.plannedEndDate;
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'left',
    fixed: 'right',
    customRender: ({ record }) => {
      return h(
        Button,
        {
          type: 'link',
          size: 'small',
          onClick: () => handleView(record),
        },
        () => '查看详情'
      );
    },
  },
];

// 加载数据
function loadData() {
  loading.value = true;
  updateStatusCounts(); // 更新统计数据

  setTimeout(() => {
    const query = {
      ...searchForm,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };

    const { list, total } = getDeliveryTasks(query);

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
  searchForm.projectId = undefined;
  searchForm.type = undefined;
  searchForm.status = [TaskStatus.PENDING]; // 重置为默认状态
  searchForm.assigneeId = [currentUser.id]; // 重置为默认负责人
  searchForm.startDate = undefined;
  searchForm.endDate = undefined;
  searchForm.keyword = '';
  pagination.current = 1;
  loadData();
}

// 查看详情
function handleView(record: DeliveryTask) {
  router.push({
    path: '/project-implementation/execution/detail',
    query: { id: record.id },
  });
}

// 切换视图模式
function handleViewModeChange(mode: 'list' | 'board') {
  viewMode.value = mode;
}

// 处理看板任务点击
function handleTaskClick(task: DeliveryTask) {
  handleView(task);
}

// 处理看板任务拖拽
function handleTaskDrop(taskId: number, newStatus: TaskStatus) {
  Modal.confirm({
    title: '确认更新任务状态',
    content: `确定要将任务状态更新为"${getTaskStatusLabel(newStatus)}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // 模拟更新任务状态
      message.success('任务状态更新成功');
      loadData();
    },
  });
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

// 初始化加载数据
loadData();
</script>

<template>
  <div class="task-execution-page">
    <Card>
      <!-- 标题区：页面标题（左侧）+ 视图切换按钮（右侧） -->
      <template #title>
        <div class="page-header">
          <span class="page-title">任务执行</span>
          <Space>
            <Button
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="handleViewModeChange('list')"
            >
              <template #icon>
                <TableOutlined />
              </template>
              列表视图
            </Button>
            <Button
              :type="viewMode === 'board' ? 'primary' : 'default'"
              @click="handleViewModeChange('board')"
            >
              <template #icon>
                <AppstoreOutlined />
              </template>
              看板视图
            </Button>
          </Space>
        </div>
      </template>

      <!-- 搜索筛选区：横向排列，自动换行，搜索和重置按钮右对齐 -->
      <div class="search-section">
        <Form layout="inline" :model="searchForm">
          <Form.Item label="项目">
            <Select
              v-model:value="searchForm.projectId"
              placeholder="请选择"
              allow-clear
              mode="multiple"
              style="width: 240px"
            >
              <Select.Option
                v-for="item in projectOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="任务类型">
            <Select
              v-model:value="searchForm.type"
              placeholder="请选择"
              allow-clear
              style="width: 120px"
            >
              <Select.Option
                v-for="item in TASK_TYPE_OPTIONS"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="负责人">
            <Select
              v-model:value="searchForm.assigneeId"
              placeholder="请选择"
              allow-clear
              mode="multiple"
              style="width: 200px"
            >
              <Select.Option
                v-for="item in assigneeOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
          </Form.Item>
         
          <Form.Item label="关键字">
            <Input
              v-model:value="searchForm.keyword"
              placeholder="任务名称"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
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

      <!-- 状态统计徽标区（列表视图） -->
      <div v-if="viewMode === 'list'" class="status-badges-section">
        <Space size="large">
          <div 
            class="status-badge-item" 
            :class="{ active: currentStatusFilter === 'all' }"
            @click="handleStatusClick('all')"
          >
            <span class="label">全部</span>
            <Badge :count="statusCounts.all" :number-style="{ backgroundColor: '#8c8c8c' }" />
          </div>
          <div 
            class="status-badge-item" 
            :class="{ active: currentStatusFilter === TaskStatus.PENDING }"
            @click="handleStatusClick(TaskStatus.PENDING)"
          >
            <span class="label">待办</span>
            <Badge :count="statusCounts.pending" :number-style="{ backgroundColor: '#faad14' }" />
          </div>
          <div 
            class="status-badge-item" 
            :class="{ active: currentStatusFilter === TaskStatus.IN_PROGRESS }"
            @click="handleStatusClick(TaskStatus.IN_PROGRESS)"
          >
            <span class="label">进行中</span>
            <Badge :count="statusCounts.in_progress" :number-style="{ backgroundColor: '#1890ff' }" />
          </div>
          <div 
            class="status-badge-item" 
            :class="{ active: currentStatusFilter === TaskStatus.COMPLETED }"
            @click="handleStatusClick(TaskStatus.COMPLETED)"
          >
            <span class="label">已完成</span>
            <Badge :count="statusCounts.completed" :number-style="{ backgroundColor: '#52c41a' }" />
          </div>
        </Space>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="table-section">
        <Table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          :row-key="(record) => record.id"
          :scroll="{ x: 1500, y: 'calc(100vh - 420px)' }"
          @change="handleTableChange"
        />
      </div>

      <!-- 看板视图 -->
      <div v-else class="board-section">
        <TaskBoard
          :tasks="dataSource"
          @task-click="handleTaskClick"
          @task-drop="handleTaskDrop"
        />
      </div>
    </Card>
  </div>
</template>

<style scoped>
.task-execution-page {
  padding: 24px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-execution-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-execution-page :deep(.ant-card-body) {
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

.status-badges-section {
  margin-bottom: 16px;
  padding: 0 8px;
}

.status-badge-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.status-badge-item:hover {
  background-color: #f5f5f5;
}

.status-badge-item.active {
  background-color: #e6f7ff;
}

.status-badge-item .label {
  margin-right: 8px;
  font-weight: 500;
  color: #595959;
}

.status-badge-item.active .label {
  color: #1890ff;
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

.board-section {
  flex: 1;
  overflow: hidden;
  margin-top: -8px;
}
</style>
