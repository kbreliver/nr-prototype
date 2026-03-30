<script lang="ts" setup>
import { computed, h, reactive, ref } from 'vue';
import type { VNode } from 'vue';
import { useRouter } from 'vue-router';
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Textarea,
  Timeline,
} from 'ant-design-vue';
import type { TableColumnsType, TableProps } from 'ant-design-vue';
import type { ApprovalFlowNode, ApprovalRecord, CustomerSolution, SearchForm } from './types';
import { ApprovalNode, ApprovalResult, SolutionStatus } from './types';
import { formatAmount, formatCurrency, getSolutionStatusMap } from './utils';
import dayjs from 'dayjs';

defineOptions({
  name: 'ApprovalWorkspace',
});

const router = useRouter();

// 活动标签
const activeTab = ref<'pending' | 'approved' | 'all'>('pending');

// 方案状态映射
const solutionStatusMap = getSolutionStatusMap();

// 搜索表单
const searchForm = reactive<SearchForm>({
  solutionName: '',
  customerName: '',
  createTimeRange: undefined,
});

// 表格加载状态
const loading = ref(false);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  total: 0,
});

// Mock 待审批数据
const mockPendingData: CustomerSolution[] = [
  {
    id: 2,
    solutionCode: 'CS-20241102-001',
    solutionName: 'MES生产管理系统方案',
    customerName: 'YY制造集团',
    customerContact: '李总',
    contactPhone: '13900139000',
    solutionType: 1,
    industry: '制造业',
    status: SolutionStatus.Approving,
    description: 'MES系统实施方案，含生产计划、质量管理、设备管理等模块',
    totalAmount: 800000.00,
    createBy: 2,
    createByName: '李四',
    createTime: '2024-11-07 10:15:00',
    updateByName: '李四',
    updateTime: '2024-11-07 14:30:00',
  },
  {
    id: 6,
    solutionCode: 'CS-20241104-001',
    solutionName: '设备预测性维护系统',
    customerName: 'CC重工机械',
    customerContact: '周工',
    contactPhone: '13400134000',
    solutionType: 1,
    industry: '机械制造',
    status: SolutionStatus.Approving,
    description: '基于AI的设备预测性维护系统，降低设备故障率',
    totalAmount: 450000.00,
    createBy: 4,
    createByName: '周七',
    createTime: '2024-11-06 13:30:00',
    updateByName: '周七',
    updateTime: '2024-11-07 09:15:00',
  },
  {
    id: 10,
    solutionCode: 'CS-20241106-001',
    solutionName: '智能仓储管理系统',
    customerName: 'GG贸易公司',
    customerContact: '孙经理',
    contactPhone: '13000130000',
    solutionType: 1,
    industry: '商贸',
    status: SolutionStatus.Approving,
    description: '智能仓储WMS系统，提升仓储效率和准确性',
    totalAmount: 280000.00,
    createBy: 2,
    createByName: '李四',
    createTime: '2024-11-06 08:50:00',
    updateByName: '李四',
    updateTime: '2024-11-07 14:15:00',
  },
  {
    id: 15,
    solutionCode: 'CS-20241108-001',
    solutionName: '智能排产调度系统',
    customerName: 'LL纺织集团',
    customerContact: '蒋总',
    contactPhone: '13555135000',
    solutionType: 1,
    industry: '纺织',
    status: SolutionStatus.Approving,
    description: '基于算法的智能排产系统，优化生产计划',
    totalAmount: 470000.00,
    createBy: 10,
    createByName: '蒋十三',
    createTime: '2024-11-08 09:15:00',
    updateByName: '蒋十三',
    updateTime: '2024-11-08 11:40:00',
  },
];

// Mock 已审批数据
const mockApprovedData: CustomerSolution[] = [
  {
    id: 3,
    solutionCode: 'CS-20241028-002',
    solutionName: '工业物联网解决方案',
    customerName: 'ZZ集团有限公司',
    customerContact: '王主任',
    contactPhone: '13700137000',
    solutionType: 2,
    industry: '智能制造',
    status: SolutionStatus.Published,
    description: '工业物联网平台搭建，包含传感器部署、数据采集、实时监控等',
    totalAmount: 1200000.00,
    createBy: 1,
    createByName: '王五',
    createTime: '2024-10-28 14:00:00',
    updateByName: '王五',
    updateTime: '2024-11-03 10:45:00',
  },
  {
    id: 7,
    solutionCode: 'CS-20241025-001',
    solutionName: '能源管理系统方案',
    customerName: 'DD化工集团',
    customerContact: '吴总',
    contactPhone: '13300133000',
    solutionType: 1,
    industry: '化工',
    status: SolutionStatus.Published,
    description: '能源监控与管理系统，实现能耗分析与优化',
    totalAmount: 380000.00,
    createBy: 5,
    createByName: '吴八',
    createTime: '2024-10-25 10:45:00',
    updateByName: '吴八',
    updateTime: '2024-10-31 14:50:00',
  },
  {
    id: 9,
    solutionCode: 'CS-20241027-001',
    solutionName: '供应链协同管理平台',
    customerName: 'FF物流科技',
    customerContact: '钱总',
    contactPhone: '13100131000',
    solutionType: 2,
    industry: '物流',
    status: SolutionStatus.Published,
    description: '供应链协同平台，整合供应商、生产、物流各环节',
    totalAmount: 1500000.00,
    createBy: 6,
    createByName: '钱九',
    createTime: '2024-10-27 11:00:00',
    updateByName: '钱九',
    updateTime: '2024-11-01 16:40:00',
  },
  {
    id: 5,
    solutionCode: 'CS-20241030-001',
    solutionName: 'ERP+MES一体化方案',
    customerName: 'BB电子科技',
    customerContact: '孙总',
    contactPhone: '13500135000',
    solutionType: 2,
    industry: '电子制造',
    status: SolutionStatus.Rejected,
    description: 'ERP与MES系统一体化解决方案，实现业务全流程管理',
    totalAmount: 950000.00,
    createBy: 2,
    createByName: '李四',
    createTime: '2024-10-30 09:00:00',
    updateByName: '李四',
    updateTime: '2024-11-02 11:25:00',
  },
];

// 所有数据
const mockAllData = [...mockPendingData, ...mockApprovedData];

// 数据源
const dataSource = ref<CustomerSolution[]>([]);

// 待审批数量
const pendingCount = computed(() => mockPendingData.length);

// 表格列定义
const columns: TableColumnsType<CustomerSolution> = [
  {
    title: '方案编号',
    dataIndex: 'solutionCode',
    key: 'solutionCode',
    width: 160,
    customRender: ({ text }) => text,
    customCell: (record) => ({
      style: { cursor: 'pointer', color: '#1890ff' },
      onClick: () => handleView(record),
    }),
  },
  {
    title: '方案名称',
    dataIndex: 'solutionName',
    key: 'solutionName',
    width: 200,
    ellipsis: true,
  },
  {
    title: '客户名称',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 160,
    ellipsis: true,
  },
  {
    title: '总金额（元）',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 120,
    align: 'right',
    customRender: ({ text }) => formatAmount(text),
  },
  {
    title: '提交时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 160,
  },
  {
    title: '方案状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    customRender: ({ text }) => {
      const status = solutionStatusMap[text];
      return status ? h(Tag, { color: status.color }, () => status.text) : text;
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    customRender: ({ record }) => {
      const actions: VNode[] = [];
      
      if (activeTab.value === 'pending') {
        actions.push(
          h(Button, {
            type: 'primary',
            size: 'small',
            onClick: () => handleQuickApproval(record),
          }, () => '审批')
        );
      }
      
      actions.push(
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleView(record),
        }, () => '查看方案')
      );
      
      // 审批中状态显示审批流程按钮
      if (record.status === SolutionStatus.Approving) {
        actions.push(
          h(Button, {
            type: 'link',
            size: 'small',
            onClick: () => handleViewApproval(record),
          }, () => '审批流程')
        );
      }
      
      return h(Space, { size: 'small' }, () => actions);
    },
  },
];

// 快速审批对话框
const quickApprovalVisible = ref(false);
const currentSolution = ref<CustomerSolution | null>(null);
const approvalComment = ref('');

// 审批流程抽屉
const approvalDrawerVisible = ref(false);
const currentApprovalRecords = ref<ApprovalRecord[]>([]);
const currentApprovalNodes = ref<ApprovalFlowNode[]>([]);

// 加载数据
const loadData = () => {
  loading.value = true;
  
  // 模拟API调用延迟
  setTimeout(() => {
    let filteredData: CustomerSolution[] = [];
    
    // 根据活动标签获取数据
    if (activeTab.value === 'pending') {
      filteredData = [...mockPendingData];
    } else if (activeTab.value === 'approved') {
      filteredData = [...mockApprovedData];
    } else {
      filteredData = [...mockAllData];
    }
    
    // 应用搜索条件
    if (searchForm.solutionName) {
      filteredData = filteredData.filter(item =>
        item.solutionName.includes(searchForm.solutionName!)
      );
    }
    if (searchForm.customerName) {
      filteredData = filteredData.filter(item =>
        item.customerName.includes(searchForm.customerName!)
      );
    }
    if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
      const [startDate, endDate] = searchForm.createTimeRange;
      filteredData = filteredData.filter(item => {
        const updateTime = dayjs(item.updateTime);
        return updateTime.isAfter(dayjs(startDate)) && updateTime.isBefore(dayjs(endDate).add(1, 'day'));
      });
    }
    
    pagination.total = filteredData.length;
    
    // 分页
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    dataSource.value = filteredData.slice(start, end);
    
    loading.value = false;
  }, 300);
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

// 重置搜索
const handleReset = () => {
  searchForm.solutionName = '';
  searchForm.customerName = '';
  searchForm.createTimeRange = undefined;
  pagination.current = 1;
  loadData();
};

// 表格变化处理
const handleTableChange: TableProps['onChange'] = (pag) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
  loadData();
};

// 标签切换
const handleTabChange = (key: string | number) => {
  activeTab.value = String(key) as 'pending' | 'approved' | 'all';
  pagination.current = 1;
  loadData();
};

// 查看方案
const handleView = (record: CustomerSolution) => {
  router.push(`/product-solutions/customer/detail/${record.id}`);
};

// 快速审批
const handleQuickApproval = (record: CustomerSolution) => {
  currentSolution.value = record;
  approvalComment.value = '';
  quickApprovalVisible.value = true;
};

// 确认审批
const handleConfirmApproval = (result: 'approve' | 'reject') => {
  if (!approvalComment.value && result === 'reject') {
    message.warning('驳回时必须填写审批意见');
    return;
  }
  
  const action = result === 'approve' ? '通过' : '驳回';
  
  // TODO: 调用API提交审批结果
  message.success(`审批${action}成功`);
  quickApprovalVisible.value = false;
  currentSolution.value = null;
  approvalComment.value = '';
  loadData();
};

// 查看审批流程
const handleViewApproval = (record: CustomerSolution) => {
  console.log('查看审批流程:', record);
  
  // Mock审批记录数据
  currentApprovalRecords.value = [
    {
      id: 1,
      solutionId: record.id,
      approvalNode: 1,
      approvalNodeName: '销售主管',
      approverId: 2,
      approverName: '李四',
      approvalTime: '2024-11-06 10:30:00',
      approvalResult: ApprovalResult.Approved,
      approvalComment: '方案合理，同意提交',
      nodeOrder: 1,
    },
    {
      id: 2,
      solutionId: record.id,
      approvalNode: 2,
      approvalNodeName: '技术总监',
      approverId: 3,
      approverName: '王五',
      approvalTime: '2024-11-06 14:20:00',
      approvalResult: ApprovalResult.Approved,
      approvalComment: '技术方案可行',
      nodeOrder: 2,
    },
  ];
  
  // 构建完整的审批流程节点（包括未审批的节点）
  const nodes: ApprovalFlowNode[] = [
    { nodeId: ApprovalNode.MarketingManager, nodeName: '部门市场负责人', nodeOrder: 1, status: 'waiting' },
    { nodeId: ApprovalNode.BusinessManager, nodeName: '部门商务负责人', nodeOrder: 2, status: 'waiting' },
    { nodeId: ApprovalNode.DepartmentManager, nodeName: '部门经理', nodeOrder: 3, status: 'waiting' },
  ];
  
  // 根据审批记录更新节点状态和详细信息
  currentApprovalRecords.value.forEach(approvalRecord => {
    const node = nodes.find(n => n.nodeId === approvalRecord.approvalNode);
    if (node) {
      node.status = approvalRecord.approvalResult === ApprovalResult.Approved ? 'approved' : 
                    approvalRecord.approvalResult === ApprovalResult.Rejected ? 'rejected' : 'pending';
      node.approver = approvalRecord.approverName;
      node.approvalTime = approvalRecord.approvalTime;
      node.comment = approvalRecord.approvalComment;
    }
  });
  
  // 设置当前待审批节点
  const approvedCount = currentApprovalRecords.value.filter(r => r.approvalResult === ApprovalResult.Approved).length;
  if (approvedCount < nodes.length && record.status === SolutionStatus.Approving && nodes[approvedCount]) {
    nodes[approvedCount].status = 'pending';
  }
  
  currentApprovalNodes.value = nodes;
  approvalDrawerVisible.value = true;
};

// 初始化加载数据
loadData();
</script>

<template>
  <div class="p-6">
    <Card title="方案审批" :bordered="false">
      <!-- 标签页 -->
      <Tabs :active-key="activeTab" @change="handleTabChange">
        <Tabs.TabPane key="pending">
          <template #tab>
            <Badge :count="pendingCount" :offset="[10, 0]">
              待审批方案
            </Badge>
          </template>
        </Tabs.TabPane>
        <Tabs.TabPane key="approved" tab="已审批方案" />
        <Tabs.TabPane key="all" tab="全部方案" />
      </Tabs>

      <!-- 搜索表单 -->
      <div class="mb-4 mt-4">
        <Form layout="inline">
          <Form.Item label="方案名称">
            <Input
              v-model:value="searchForm.solutionName"
              placeholder="请输入方案名称"
              allow-clear
              style="width: 200px"
            />
          </Form.Item>
          <Form.Item label="客户名称">
            <Input
              v-model:value="searchForm.customerName"
              placeholder="请输入客户名称"
              allow-clear
              style="width: 200px"
            />
          </Form.Item>
          <Form.Item label="提交时间">
            <DatePicker.RangePicker
              v-model:value="searchForm.createTimeRange"
              style="width: 240px"
              :placeholder="['开始日期', '结束日期']"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" @click="handleSearch">搜索</Button>
              <Button @click="handleReset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <!-- 数据表格 -->
      <Table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="(record) => record.id"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
      />
    </Card>

    <!-- 快速审批对话框 -->
    <Modal
      v-model:open="quickApprovalVisible"
      title="快速审批"
      width="700px"
      :footer="null"
    >
      <div v-if="currentSolution">
        <!-- 方案摘要信息 -->
        <Card title="方案信息" class="mb-4">
          <div class="space-y-2">
            <div><strong>方案编号：</strong>{{ currentSolution.solutionCode }}</div>
            <div><strong>方案名称：</strong>{{ currentSolution.solutionName }}</div>
            <div><strong>客户名称：</strong>{{ currentSolution.customerName }}</div>
            <div><strong>方案金额：</strong>{{ formatCurrency(currentSolution.totalAmount) }}</div>
            <div><strong>方案说明：</strong>{{ currentSolution.description }}</div>
          </div>
        </Card>

        <!-- 审批意见 -->
        <div class="mb-4">
          <div class="mb-2 font-bold">审批意见：</div>
          <Textarea
            v-model:value="approvalComment"
            placeholder="请输入审批意见（驳回时必填）"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between items-center">
          <!-- 左侧按钮 -->
          <Space size="middle">
            <Button size="large" @click="handleView(currentSolution)">
              查看方案详情
            </Button>
            <Button size="large" @click="handleViewApproval(currentSolution)">
              查看审批流程
            </Button>
          </Space>
          
          <!-- 右侧按钮 -->
          <Space size="middle">
            <Button type="primary" size="large" @click="handleConfirmApproval('approve')">
              通过
            </Button>
            <Button danger size="large" @click="handleConfirmApproval('reject')">
              驳回
            </Button>
            <Button size="large" @click="quickApprovalVisible = false">
              取消
            </Button>
          </Space>
        </div>
      </div>
    </Modal>

    <!-- 审批流程抽屉 -->
    <Drawer
      v-model:open="approvalDrawerVisible"
      title="审批流程"
      :width="600"
      placement="right"
    >
      <Timeline>
        <Timeline.Item
          v-for="node in currentApprovalNodes"
          :key="node.nodeId"
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
:deep(.ant-badge) {
  margin-right: 8px;
}
</style>

