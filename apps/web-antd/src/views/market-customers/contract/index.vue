<script lang="ts" setup>
import { computed, h, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
} from 'ant-design-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';
import {
  ExportOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import type { Contract, ContractSearchForm } from './types';
import { ApprovalStatus, ContractStatus } from './types';
import {
  canSubmitApproval,
  formatAmountWan,
  getContractStatusMap,
  isContractDeletable,
  isContractEditable,
} from './utils';
import { mockContractList, getApprovalRecordsByContractId } from './mock';

defineOptions({
  name: 'ContractList',
});

const router = useRouter();

// 合同状态映射
const contractStatusMap = getContractStatusMap();

// 审批流程抽屉
const approvalDrawerVisible = ref(false);
const currentApprovalNodes = ref<Array<{
  nodeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'waiting';
  approver?: string;
  approvalTime?: string;
  comment?: string;
}>>([]);

// 搜索表单
const searchForm = reactive<ContractSearchForm>({
  keyword: '',
  customerName: undefined,
  contractStatus: undefined,
  approvalStatus: undefined,
  signDateRange: undefined,
  responsiblePerson: undefined,
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
const dataSource = ref<Contract[]>([]);

// 表格列定义
const columns: TableColumnsType<Contract> = [
  {
    title: '合同编号',
    dataIndex: 'contractCode',
    key: 'contractCode',
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
    title: '合同名称',
    dataIndex: 'contractName',
    key: 'contractName',
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
    title: '合同金额(万)',
    dataIndex: 'contractAmount',
    key: 'contractAmount',
    width: 130,
    align: 'right',
    sorter: true,
    customRender: ({ record }) => formatAmountWan(record.contractAmount),
  },
  {
    title: '签订日期',
    dataIndex: 'signDate',
    key: 'signDate',
    width: 120,
    align: 'center',
    sorter: true,
  },
  {
    title: '合同状态',
    dataIndex: 'contractStatus',
    key: 'contractStatus',
    width: 100,
    align: 'center',
    sorter: true,
    customRender: ({ record }) => {
      const statusInfo = contractStatusMap[record.contractStatus];
      return h(Tag, { color: statusInfo.color }, () => statusInfo.text);
    },
  },
  {
    title: '回款率',
    dataIndex: 'paymentRate',
    key: 'paymentRate',
    width: 120,
    align: 'center',
    sorter: true,
    customRender: ({ record }) => {
      return h(Progress, {
        percent: record.paymentRate,
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
      ];

      if (isContractEditable(record.contractStatus)) {
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

      if (canSubmitApproval(record.contractStatus, record.approvalStatus)) {
        buttons.push(
          h(
            Button,
            {
              type: 'link',
              size: 'small',
              onClick: () => handleSubmitApproval(record),
            },
            () => '提交审批'
          )
        );
      }

      // 审批中状态显示审批流程按钮
      if (record.contractStatus === ContractStatus.Approving) {
        buttons.push(
          h(
            Button,
            {
              type: 'link',
              size: 'small',
              onClick: () => handleViewApproval(record),
            },
            () => '审批流程'
          )
        );
      }

      if (isContractDeletable(record.contractStatus, record.orderCount || 0)) {
        buttons.push(
          h(
            Popconfirm,
            {
              title: '确定要删除这个合同吗？',
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
    let filteredData = [...mockContractList];
    
    // 关键字搜索（合同名称或编号）
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.contractName.toLowerCase().includes(keyword) ||
          item.contractCode.toLowerCase().includes(keyword)
      );
    }
    
    // 客户名称筛选
    if (searchForm.customerName) {
      filteredData = filteredData.filter((item) =>
        item.customerName.includes(searchForm.customerName!)
      );
    }
    
    // 合同状态筛选
    if (searchForm.contractStatus !== undefined) {
      filteredData = filteredData.filter(
        (item) => item.contractStatus === searchForm.contractStatus
      );
    }
    
    // 负责人筛选
    if (searchForm.responsiblePerson) {
      filteredData = filteredData.filter((item) =>
        item.responsiblePerson.includes(searchForm.responsiblePerson!)
      );
    }
    
    // 签订日期范围筛选
    if (searchForm.signDateRange && searchForm.signDateRange.length === 2) {
      const [startDate, endDate] = searchForm.signDateRange;
      filteredData = filteredData.filter((item) => {
        return item.signDate >= startDate && item.signDate <= endDate;
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
  searchForm.contractStatus = undefined;
  searchForm.signDateRange = undefined;
  searchForm.responsiblePerson = undefined;
  pagination.current = 1;
  loadData();
}

// 查看详情
function handleView(record: Contract) {
  router.push({
    path: '/market-customers/contract/detail',
    query: { id: record.id, mode: 'view' },
  });
}

// 编辑
function handleEdit(record: Contract) {
  router.push({
    path: '/market-customers/contract/detail',
    query: { id: record.id, mode: 'edit' },
  });
}

// 新建合同
function handleCreate() {
  router.push('/market-customers/contract/edit');
}

// 提交审批
function handleSubmitApproval(record: Contract) {
  Modal.confirm({
    title: '提交审批',
    content: `确定要提交合同"${record.contractName}"到OA系统审批吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // 模拟提交审批
      message.success('审批提交成功');
      loadData();
    },
  });
}

// 删除
function handleDelete(_record: Contract) {
  // 模拟删除
  message.success('删除成功');
  loadData();
}

// 查看审批流程
function handleViewApproval(record: Contract) {
  // 获取审批记录
  const approvalRecords = getApprovalRecordsByContractId(record.id!);
  
  // 定义完整的审批流程节点（根据实际业务调整）
  const allNodes = [
    { nodeName: '提交审批', sortOrder: 1 },
    { nodeName: '部门经理审批', sortOrder: 2 },
    { nodeName: '财务审批', sortOrder: 3 },
    { nodeName: '法务审批', sortOrder: 4 },
    { nodeName: '总经理审批', sortOrder: 5 },
  ];
  
  // 构建审批流程节点
  const nodes = allNodes.map(node => {
    const record = approvalRecords.find(r => r.approvalNode === node.nodeName);
    
    if (!record) {
      // 未审批的节点
      return {
        nodeName: node.nodeName,
        status: 'waiting' as const,
      };
    }
    
    // 根据审批状态设置节点状态
    let status: 'pending' | 'approved' | 'rejected' | 'waiting';
    if (record.approvalStatus === ApprovalStatus.Approved) {
      status = 'approved';
    } else if (record.approvalStatus === ApprovalStatus.Rejected) {
      status = 'rejected';
    } else if (record.approvalStatus === ApprovalStatus.Approving) {
      status = 'pending';
    } else {
      status = 'waiting';
    }
    
    return {
      nodeName: node.nodeName,
      status,
      approver: record.approver,
      approvalTime: record.approvalTime,
      comment: record.approvalOpinion,
    };
  });
  
  // 如果合同正在审批中，设置当前待审批节点
  if (record.contractStatus === ContractStatus.Approving) {
    const approvedCount = approvalRecords.filter(
      r => r.approvalStatus === ApprovalStatus.Approved
    ).length;
    if (approvedCount < nodes.length && nodes[approvedCount]) {
      nodes[approvedCount].status = 'pending';
    }
  }
  
  currentApprovalNodes.value = nodes;
  approvalDrawerVisible.value = true;
}

// 批量导出
function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要导出的合同');
    return;
  }
  message.success(`导出 ${selectedRowKeys.value.length} 条合同数据`);
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
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

// 初始化加载数据
loadData();
</script>

<template>
  <div class="contract-list-page">
    <Card>
      <!-- 标题区：页面标题（左侧）+ 主要操作按钮（右侧） -->
      <template #title>
        <div class="page-header">
          <span class="page-title">合同管理</span>
          <Space>
            <Button type="primary" @click="handleCreate">
              <template #icon>
                <PlusOutlined />
              </template>
              新建合同
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
            placeholder="合同名称或编号"
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
        <Form.Item label="合同状态">
          <Select
            v-model:value="searchForm.contractStatus"
            placeholder="请选择"
            allow-clear
            style="width: 120px"
          >
            <Select.Option :value="ContractStatus.Draft">草稿</Select.Option>
            <Select.Option :value="ContractStatus.Approving">审批中</Select.Option>
            <Select.Option :value="ContractStatus.Signed">已签订</Select.Option>
            <Select.Option :value="ContractStatus.Completed">已完成</Select.Option>
            <Select.Option :value="ContractStatus.Terminated">已终止</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="签订日期">
          <DatePicker.RangePicker
            v-model:value="searchForm.signDateRange"
            format="YYYY-MM-DD"
            style="width: 240px"
          />
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

    <!-- 审批流程抽屉 -->
    <Drawer
      v-model:open="approvalDrawerVisible"
      title="审批流程"
      :width="600"
      placement="right"
    >
      <Timeline>
        <Timeline.Item
          v-for="(node, index) in currentApprovalNodes"
          :key="index"
          :color="node.status === 'approved' ? 'green' : node.status === 'rejected' ? 'red' : node.status === 'pending' ? 'blue' : 'gray'"
        >
          <div class="mb-2">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-bold text-base">{{ node.nodeName }}</span>
              <Tag v-if="node.status === 'approved'" color="success">已通过</Tag>
              <Tag v-else-if="node.status === 'rejected'" color="error">已驳回</Tag>
              <Tag v-else-if="node.status === 'pending'" color="processing">待审批</Tag>
              <Tag v-else color="default">未审批</Tag>
            </div>
            <div v-if="node.approver || node.approvalTime" class="text-sm">
              <div v-if="node.approver" class="text-gray-600 mb-1">
                <span class="text-gray-500">审批人：</span>
                <span>{{ node.approver }}</span>
              </div>
              <div v-if="node.approvalTime" class="text-gray-500 mb-1">
                审批时间：{{ node.approvalTime }}
              </div>
              <div v-if="node.comment" class="text-gray-600">
                <span class="text-gray-500">审批意见：</span>
                <span>{{ node.comment }}</span>
              </div>
            </div>
          </div>
        </Timeline.Item>
      </Timeline>
    </Drawer>
  </div>
</template>

<style scoped>
.contract-list-page {
  padding: 16px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contract-list-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contract-list-page :deep(.ant-card-body) {
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
