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
  Select,
  Space,
  Table,
  Tag,
  Timeline,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType, TableProps } from 'ant-design-vue';
import type { CustomerSolution, SearchForm, SolutionStatusMap, ApprovalRecord, ApprovalFlowNode } from './types';
import { ApprovalNode, ApprovalResult, SolutionStatus } from './types';
import dayjs from 'dayjs';

defineOptions({
  name: 'CustomerSolutions',
});

const router = useRouter();

// 方案状态映射
const solutionStatusMap: Record<number, SolutionStatusMap> = {
  [SolutionStatus.Draft]: { text: '草稿', color: 'default' },
  [SolutionStatus.Approving]: { text: '审批中', color: 'processing' },
  [SolutionStatus.Published]: { text: '已发布', color: 'success' },
  [SolutionStatus.Rejected]: { text: '已驳回', color: 'error' },
};

// 搜索表单
const searchForm = reactive<SearchForm>({
  solutionName: '',
  customerName: '',
  status: undefined,
  createTimeRange: undefined,
});

// 表格加载状态
const loading = ref(false);

// 选中的行
const selectedRowKeys = ref<number[]>([]);

// 新建方案弹框
const createModalVisible = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive({
  solutionName: '',
  customerName: '',
});
const createFormRules = {
  solutionName: [{ required: true, message: '请输入方案名称' }],
  customerName: [{ required: true, message: '请选择客户' }],
};

// 审批流程抽屉
const approvalDrawerVisible = ref(false);
const currentApprovalRecords = ref<ApprovalRecord[]>([]);
const currentApprovalNodes = ref<ApprovalFlowNode[]>([]);

// Mock客户数据 - 从客户档案模块导入
// 为保持兼容，创建简化的客户数据格式
import { mockCustomerList } from '#/views/market-customers/archives/mock';

const mockCustomers = mockCustomerList.map(customer => ({
  id: customer.id!,
  customerName: customer.customerName,
  contactPerson: customer.responsiblePerson,
  contactPhone: '',
  industry: customer.industry || '',
}));

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  showQuickJumper: false,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  total: 0,
});

// Mock 数据
const mockData: CustomerSolution[] = [
  {
    id: 1,
    solutionCode: 'CS-20241101-001',
    solutionName: '智慧工厂整体解决方案',
    customerName: 'XX科技有限公司',
    customerContact: '张经理',
    contactPhone: '13800138000',
    solutionType: 1,
    industry: '智能制造',
    status: SolutionStatus.Draft,
    description: '为XX科技提供智慧工厂整体解决方案，包括MES系统、设备联网、数据采集分析等功能模块',
    totalAmount: 500000.00,
    createBy: 1,
    createByName: '张三',
    createTime: '2024-11-01 09:30:00',
    updateByName: '张三',
    updateTime: '2024-11-05 14:20:00',
  },
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
    createTime: '2024-11-02 10:15:00',
    updateByName: '李四',
    updateTime: '2024-11-06 16:30:00',
  },
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
    id: 4,
    solutionCode: 'CS-20241103-001',
    solutionName: '数字化车间改造方案',
    customerName: 'AA汽车配件',
    customerContact: '赵经理',
    contactPhone: '13600136000',
    solutionType: 1,
    industry: '汽车制造',
    status: SolutionStatus.Draft,
    description: '车间数字化改造，包括设备升级、系统集成、人员培训',
    totalAmount: 650000.00,
    createBy: 3,
    createByName: '赵六',
    createTime: '2024-11-03 11:20:00',
    updateByName: '赵六',
    updateTime: '2024-11-04 15:10:00',
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
    createTime: '2024-11-04 13:30:00',
    updateByName: '周七',
    updateTime: '2024-11-05 09:15:00',
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
    id: 8,
    solutionCode: 'CS-20241105-001',
    solutionName: '质量追溯系统方案',
    customerName: 'EE食品有限公司',
    customerContact: '郑经理',
    contactPhone: '13200132000',
    solutionType: 1,
    industry: '食品制造',
    status: SolutionStatus.Draft,
    description: '产品质量全流程追溯系统，确保食品安全',
    totalAmount: 320000.00,
    createBy: 1,
    createByName: '张三',
    createTime: '2024-11-05 15:20:00',
    updateByName: '张三',
    updateTime: '2024-11-06 10:30:00',
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
    updateTime: '2024-11-06 14:15:00',
  },
  {
    id: 11,
    solutionCode: 'CS-20241029-001',
    solutionName: '生产数据采集分析平台',
    customerName: 'HH精密制造',
    customerContact: '冯工',
    contactPhone: '13999139000',
    solutionType: 1,
    industry: '精密制造',
    status: SolutionStatus.Draft,
    description: '实时数据采集与分析平台，支持多维度数据分析',
    totalAmount: 420000.00,
    createBy: 7,
    createByName: '冯十',
    createTime: '2024-10-29 16:10:00',
    updateByName: '冯十',
    updateTime: '2024-11-05 11:20:00',
  },
  {
    id: 12,
    solutionCode: 'CS-20241031-002',
    solutionName: 'AGV智能搬运系统',
    customerName: 'II智能装备',
    customerContact: '陈总',
    contactPhone: '13888138000',
    solutionType: 2,
    industry: '智能装备',
    status: SolutionStatus.Published,
    description: 'AGV无人搬运系统，实现车间物流自动化',
    totalAmount: 880000.00,
    createBy: 8,
    createByName: '陈十一',
    createTime: '2024-10-31 09:40:00',
    updateByName: '陈十一',
    updateTime: '2024-11-04 13:55:00',
  },
  {
    id: 13,
    solutionCode: 'CS-20241107-001',
    solutionName: '设备健康管理系统',
    customerName: 'JJ钢铁集团',
    customerContact: '褚经理',
    contactPhone: '13777137000',
    solutionType: 1,
    industry: '钢铁',
    status: SolutionStatus.Draft,
    description: '设备健康状态监测与管理，延长设备使用寿命',
    totalAmount: 550000.00,
    createBy: 1,
    createByName: '张三',
    createTime: '2024-11-07 10:30:00',
    updateByName: '张三',
    updateTime: '2024-11-07 15:45:00',
  },
  {
    id: 14,
    solutionCode: 'CS-20241026-001',
    solutionName: '产线可视化监控系统',
    customerName: 'KK光电科技',
    customerContact: '卫主任',
    contactPhone: '13666136000',
    solutionType: 1,
    industry: '光电',
    status: SolutionStatus.Rejected,
    description: '生产线可视化监控，实时掌握生产状态',
    totalAmount: 360000.00,
    createBy: 9,
    createByName: '卫十二',
    createTime: '2024-10-26 14:20:00',
    updateByName: '卫十二',
    updateTime: '2024-11-01 09:30:00',
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

// 数据源
const dataSource = ref<CustomerSolution[]>([]);

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
    customRender: ({ text }) => {
      return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(text);
    },
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
    title: '创建人',
    dataIndex: 'createByName',
    key: 'createByName',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 240,
    fixed: 'right',
    customRender: ({ record }) => {
      const actions = [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleView(record),
        }, () => '查看'),
      ];

      // 审批中状态显示查看审批流程按钮
      if (record.status === SolutionStatus.Approving) {
        actions.push(
          h(Button, {
            type: 'link',
            size: 'small',
            onClick: () => handleViewApproval(record),
          }, () => '审批流程')
        );
      }

      if (record.status === SolutionStatus.Draft || record.status === SolutionStatus.Rejected) {
        actions.push(
          h(Button, {
            type: 'link',
            size: 'small',
            onClick: () => handleEdit(record),
          }, () => '编辑')
        );
        actions.push(
          h(Popconfirm, {
            title: `确定要删除方案"${record.solutionName}"吗？删除后不可恢复。`,
            onConfirm: () => handleDelete(record.id),
            okText: '确定',
            cancelText: '取消',
          }, () => h(Button, {
            type: 'link',
            danger: true,
            size: 'small',
          }, () => '删除'))
        );
      }

      actions.push(
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleCopy(record),
        }, () => '复制')
      );

      return h(Space, { size: 'small' }, () => actions);
    },
  },
];

// 加载数据
const loadData = () => {
  loading.value = true;
  
  // 模拟API调用延迟
  setTimeout(() => {
    let filteredData = [...mockData];
    
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
    if (searchForm.status) {
      filteredData = filteredData.filter(item =>
        item.status === Number(searchForm.status)
      );
    }
    if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
      const [startDate, endDate] = searchForm.createTimeRange;
      filteredData = filteredData.filter(item => {
        const createTime = dayjs(item.createTime);
        return createTime.isAfter(dayjs(startDate)) && createTime.isBefore(dayjs(endDate).add(1, 'day'));
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
  searchForm.status = undefined;
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

// 行选择
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

// 新建方案
const handleCreate = () => {
  createModalVisible.value = true;
};

// 确认新建
const handleCreateConfirm = async () => {
  try {
    await createFormRef.value?.validate();
    // 跳转到详情页，携带参数
    router.push({
      path: '/product-solutions/customer/detail',
      query: {
        mode: 'edit',
        solutionName: createForm.solutionName,
        customerName: createForm.customerName,
      },
    });
    createModalVisible.value = false;
    createForm.solutionName = '';
    createForm.customerName = '';
  } catch (error) {
    message.error('请检查表单填写');
  }
};

// 取消新建
const handleCreateCancel = () => {
  createModalVisible.value = false;
  createForm.solutionName = '';
  createForm.customerName = '';
  createFormRef.value?.resetFields();
};

// 查看方案
const handleView = (record: CustomerSolution) => {
  router.push(`/product-solutions/customer/detail/${record.id}`);
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

// 编辑方案
const handleEdit = (record: CustomerSolution) => {
  router.push(`/product-solutions/customer/detail/${record.id}?mode=edit`);
};

// 删除方案
const handleDelete = (id: number) => {
  // TODO: 调用删除API deleteCustomerSolution(id)
  console.log('删除方案ID:', id);
  message.success('删除成功');
  loadData();
};

// 复制方案
const handleCopy = (record: CustomerSolution) => {
  // 模拟复制逻辑
  const newSolutionName = `${record.solutionName}（副本）`;
  message.success(`已复制方案：${newSolutionName}`);
  // TODO: 跳转到新方案编辑页
  router.push(`/product-solutions/customer/detail?mode=edit&copy=${record.id}`);
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的方案');
    return;
  }
  
  Modal.confirm({
    title: '批量删除确认',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个方案吗？删除后不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // TODO: 调用批量删除API
      message.success(`已删除 ${selectedRowKeys.value.length} 个方案`);
      selectedRowKeys.value = [];
      loadData();
    },
  });
};

// 导出（功能暂未开放）
const handleExport = () => {
  message.info('导出功能将在后续版本中推出，敬请期待');
  // TODO: v1.1 版本实现导出功能
};

// 初始化加载数据
loadData();
</script>

<template>
  <div class="p-6">
    <Card title="客户方案管理" :bordered="false">
      <!-- 搜索表单 -->
      <div class="mb-4">
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
          <Form.Item label="方案状态">
            <Select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 120px"
            >
              <Select.Option :value="SolutionStatus.Draft">草稿</Select.Option>
              <Select.Option :value="SolutionStatus.Approving">审批中</Select.Option>
              <Select.Option :value="SolutionStatus.Published">已发布</Select.Option>
              <Select.Option :value="SolutionStatus.Rejected">已驳回</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="创建时间">
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

      <!-- 操作按钮 -->
      <div class="mb-4 flex justify-between">
        <Space>
          <Button type="primary" @click="handleCreate">新建方案</Button>
          <Button danger :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
            批量删除
          </Button>
        </Space>
        <Button @click="handleExport" disabled>导出</Button>
      </div>

      <!-- 数据表格 -->
      <Table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        :row-key="(record) => record.id"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
      />
    </Card>

    <!-- 新建方案弹框 -->
    <Modal
      v-model:open="createModalVisible"
      title="新建客户方案"
      :width="600"
      @ok="handleCreateConfirm"
      @cancel="handleCreateCancel"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <Form.Item label="方案名称" name="solutionName">
          <Input
            v-model:value="createForm.solutionName"
            placeholder="请输入方案名称"
            allow-clear
          />
        </Form.Item>
        <Form.Item label="客户名称" name="customerName">
          <Select
            v-model:value="createForm.customerName"
            placeholder="请选择客户"
            allow-clear
          >
            <Select.Option v-for="customer in mockCustomers" :key="customer.id" :value="customer.customerName">
              {{ customer.customerName }}
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
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
:deep(.ant-table-cell) {
  padding: 12px 8px;
}
</style>
