<script lang="ts" setup>
import { computed, h, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Textarea,
  Timeline,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType, TableProps } from 'ant-design-vue';
import type {
  ApprovalFlowNode,
  ApprovalRecord,
  CustomerInfo,
  CustomerSolution,
  HardwareConfigItem,
  HardwareDevice,
  QuotationDetailItem,
  ServiceConfigItem,
  ServiceItem,
  SoftwareConfigItem,
  SoftwareProduct,
  SolutionForm,
  SolutionQuotation,
  SolutionStatistics,
} from './types';
import {
  ApprovalNode,
  ApprovalResult,
  SolutionStatus,
  SolutionType,
} from './types';
import {
  calculateDiscountAmount,
  calculateSubtotal,
  calculateTotalAmount,
  convertAmountToChinese,
  formatAmount,
  formatCurrency,
  generateSolutionCode,
  getSolutionStatusMap,
  validatePhone,
} from './utils';

import HardwareSelectorModal from './components/HardwareSelectorModal.vue';

defineOptions({
  name: 'CustomerSolutionDetail',
});

const route = useRoute();
const router = useRouter();

// 获取方案ID和模式
const solutionId = ref(route.params.id ? Number(route.params.id) : null);
const isEditMode = ref(route.query.mode === 'edit');
const isCopyMode = ref(!!route.query.copy);
const activeTab = ref('basic');
const configTab = ref('software'); // 方案配置子页签

// 从URL获取初始参数（新建时）
const initialSolutionName = ref(route.query.solutionName as string || '');
const initialCustomerName = ref(route.query.customerName as string || '');

// Mock数据（与列表页保持一致）
const mockSolutions: CustomerSolution[] = [
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
    description: '基于AI的设备预测性维护解决方案，降低停机时间',
    totalAmount: 720000.00,
    createBy: 3,
    createByName: '赵六',
    createTime: '2024-11-04 13:45:00',
    updateByName: '赵六',
    updateTime: '2024-11-07 09:20:00',
  },
];

// 方案状态映射
const solutionStatusMap = getSolutionStatusMap();

// 表单引用
const basicFormRef = ref<FormInstance>();

// Mock客户数据 - 从客户档案模块导入
import { mockCustomerList } from '#/views/market-customers/archives/mock';

const mockCustomers: CustomerInfo[] = mockCustomerList.map(customer => ({
  id: customer.id!,
  customerName: customer.customerName,
  contactPerson: customer.responsiblePerson,
  contactPhone: '',
  industry: customer.industry || '',
}));

// 基本信息表单
const basicForm = reactive<SolutionForm>({
  solutionCode: generateSolutionCode(),
  solutionName: initialSolutionName.value,
  customerName: initialCustomerName.value,
  customerContact: '',
  contactPhone: '',
  solutionType: SolutionType.Standard,
  industry: '',
  description: '',
});

// 如果是新建且有客户名称，自动填充客户信息
if (!solutionId.value && initialCustomerName.value) {
  const customer = mockCustomers.find(c => c.customerName === initialCustomerName.value);
  if (customer) {
    basicForm.customerContact = customer.contactPerson;
    basicForm.contactPhone = customer.contactPhone;
    basicForm.industry = customer.industry;
  }
}

// 表单验证规则
const basicFormRules = {
  solutionName: [
    { required: true, message: '请输入方案名称' },
    { max: 100, message: '方案名称不能超过100个字符' },
  ],
  customerName: [
    { required: true, message: '请选择客户名称' },
  ],
  contactPhone: [
    {
      validator: (_rule: any, value: string) => {
        if (value && !validatePhone(value)) {
          return Promise.reject('请输入正确的手机号格式');
        }
        return Promise.resolve();
      },
    },
  ],
  solutionType: [
    { required: true, message: '请选择方案类型' },
  ],
};

// 方案配置
const softwareList = ref<SoftwareConfigItem[]>([]);
const hardwareList = ref<HardwareConfigItem[]>([]);
const serviceList = ref<ServiceConfigItem[]>([]);

// 方案配置选中项
const selectedSoftwareRows = ref<SoftwareConfigItem[]>([]);
const selectedHardwareRows = ref<HardwareConfigItem[]>([]);
const selectedServiceRows = ref<ServiceConfigItem[]>([]);

// 软件配置表格行选择配置
const softwareRowSelection = computed<TableProps['rowSelection']>(() => {
  if (!isEditMode.value) return undefined;
  return {
    onChange: (_keys: any[], rows: any[]) => {
      selectedSoftwareRows.value = rows as SoftwareConfigItem[];
    },
  };
});

// 硬件配置表格行选择配置
const hardwareRowSelection = computed<TableProps['rowSelection']>(() => {
  if (!isEditMode.value) return undefined;
  return {
    onChange: (_keys: any[], rows: any[]) => {
      selectedHardwareRows.value = rows as HardwareConfigItem[];
    },
  };
});

// 服务配置表格行选择配置
const serviceRowSelection = computed<TableProps['rowSelection']>(() => {
  if (!isEditMode.value) return undefined;
  return {
    onChange: (_keys: any[], rows: any[]) => {
      selectedServiceRows.value = rows as ServiceConfigItem[];
    },
  };
});

// 批量删除配置项
const handleBatchDelete = (type: 'software' | 'hardware' | 'service') => {
  if (type === 'software') {
    if (selectedSoftwareRows.value.length === 0) return;
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedSoftwareRows.value.length} 个软件产品吗？`,
      onOk: () => {
        softwareList.value = softwareList.value.filter(item => !selectedSoftwareRows.value.includes(item));
        selectedSoftwareRows.value = [];
        message.success('删除成功');
      },
    });
  } else if (type === 'hardware') {
    if (selectedHardwareRows.value.length === 0) return;
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedHardwareRows.value.length} 个硬件设备吗？`,
      onOk: () => {
        hardwareList.value = hardwareList.value.filter(item => !selectedHardwareRows.value.includes(item));
        selectedHardwareRows.value = [];
        message.success('删除成功');
      },
    });
  } else if (type === 'service') {
    if (selectedServiceRows.value.length === 0) return;
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedServiceRows.value.length} 个服务项目吗？`,
      onOk: () => {
        serviceList.value = serviceList.value.filter(item => !selectedServiceRows.value.includes(item));
        selectedServiceRows.value = [];
        message.success('删除成功');
      },
    });
  }
};

// 报价信息
const quotation = reactive<SolutionQuotation>({
  solutionId: solutionId.value || 0,
  softwareAmount: 0,
  hardwareAmount: 0,
  serviceAmount: 0,
  subtotalAmount: 0,
  discountRate: 100,
  discountAmount: 0,
  additionalFee: 0,
  totalAmount: 0,
  totalAmountChinese: '',
  validityDate: undefined,
  quotationNote: '',
});

// 审批记录
const approvalRecords = ref<ApprovalRecord[]>([]);

// 当前方案状态
const currentStatus = ref<SolutionStatus>(SolutionStatus.Draft);

// 对话框显示状态
const softwareDialogVisible = ref(false);
const hardwareDialogVisible = ref(false);
const hardwareSelectorVisible = ref(false);
const serviceDialogVisible = ref(false);
const editingItem = ref<any>(null);
const editingType = ref<'software' | 'hardware' | 'service' | null>(null);

// Mock软件产品数据
const mockSoftwareProducts: SoftwareProduct[] = [
  { id: 1, productCode: 'PRD-001', productName: 'OMS运营管理系统', currentVersion: 'v2.1.0', licenseTypes: ['永久授权', '订阅模式'], unitPrice: 80000 },
  { id: 2, productCode: 'PRD-002', productName: 'ERP企业资源计划', currentVersion: 'v3.0.5', licenseTypes: ['订阅模式', '按量计费'], unitPrice: 120000 },
  { id: 3, productCode: 'PRD-003', productName: 'CRM客户关系管理', currentVersion: 'v1.5.2', licenseTypes: ['永久授权'], unitPrice: 50000 },
  { id: 4, productCode: 'PRD-005', productName: 'OA协同办公系统', currentVersion: 'v2.3.1', licenseTypes: ['订阅模式', '按量计费'], unitPrice: 500 },
  { id: 5, productCode: 'PRD-008', productName: 'MES生产执行系统', currentVersion: 'v4.0.0', licenseTypes: ['永久授权', '订阅模式'], unitPrice: 150000 },
];

// Mock硬件设备数据
const mockHardwareDevices: HardwareDevice[] = [
  { id: 1, deviceCode: 'HD-2024001', deviceName: '温度传感器', deviceModel: 'TS-100', unitPrice: 500 },
  { id: 2, deviceCode: 'HD-2024002', deviceName: '工业网关', deviceModel: 'GW-200', unitPrice: 2000 },
  { id: 3, deviceCode: 'HD-2024003', deviceName: '工业服务器', deviceModel: 'SR-300', unitPrice: 8000 },
  { id: 4, deviceCode: 'HD-2024004', deviceName: '湿度传感器', deviceModel: 'HS-150', unitPrice: 450 },
  { id: 5, deviceCode: 'HD-2024005', deviceName: '可编程控制器', deviceModel: 'PLC-500', unitPrice: 3500 },
  { id: 6, deviceCode: 'HD-2024006', deviceName: '工业摄像头', deviceModel: 'CAM-400', unitPrice: 1200 },
];

// Mock服务项目数据
const mockServices: ServiceItem[] = [
  { id: 1, serviceCode: 'SV-001', serviceName: '系统实施服务', serviceType: '一次性', unitPrice: 50000 },
  { id: 2, serviceCode: 'SV-002', serviceName: '年度运维服务', serviceType: '年度', unitPrice: 20000 },
  { id: 3, serviceCode: 'SV-003', serviceName: '技术培训服务', serviceType: '按次', unitPrice: 5000 },
  { id: 4, serviceCode: 'SV-004', serviceName: '定制开发服务', serviceType: '按天', unitPrice: 2000 },
  { id: 5, serviceCode: 'SV-005', serviceName: '系统集成服务', serviceType: '一次性', unitPrice: 80000 },
  { id: 6, serviceCode: 'SV-006', serviceName: '数据迁移服务', serviceType: '一次性', unitPrice: 30000 },
  { id: 7, serviceCode: 'SV-007', serviceName: '安全审计服务', serviceType: '年度', unitPrice: 15000 },
  { id: 8, serviceCode: 'SV-008', serviceName: '性能优化服务', serviceType: '按次', unitPrice: 10000 },
];

// 统计信息
const statistics = computed<SolutionStatistics>(() => ({
  softwareCount: softwareList.value.length,
  hardwareCount: hardwareList.value.length,
  serviceCount: serviceList.value.length,
  totalAmount: quotation.totalAmount,
}));

// 软件配置表格列
const softwareColumns: TableColumnsType<SoftwareConfigItem> = [
  { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 200 },
  { title: '版本', dataIndex: 'productVersion', key: 'productVersion', width: 120 },
  { title: '授权方式', dataIndex: 'licenseType', key: 'licenseType', width: 120 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
  { title: '单价（元）', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', customRender: ({ text }) => formatAmount(text) },
  { title: '小计（元）', dataIndex: 'subtotal', key: 'subtotal', width: 120, align: 'right', customRender: ({ text }) => formatAmount(text) },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    customRender: ({ record, index }) => {
      if (!isEditMode.value) return null;
      return h(Space, { size: 'small' }, () => [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEditConfig('software', record, index),
        }, () => '编辑'),
        h(Popconfirm, {
          title: '确定要删除该配置项吗？',
          onConfirm: () => handleDeleteConfig('software', index),
          okText: '确定',
          cancelText: '取消',
        }, () => h(Button, {
          type: 'link',
          danger: true,
          size: 'small',
        }, () => '删除')),
      ]);
    },
  },
];

// 硬件配置表格列
const hardwareColumns: TableColumnsType<HardwareConfigItem> = [
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 200 },
  { title: '型号', dataIndex: 'deviceModel', key: 'deviceModel', width: 120 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
  { title: '单价（元）', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', customRender: ({ text }) => formatAmount(text) },
  { title: '小计（元）', dataIndex: 'subtotal', key: 'subtotal', width: 120, align: 'right', customRender: ({ text }) => formatAmount(text) },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    customRender: ({ record, index }) => {
      if (!isEditMode.value) return null;
      return h(Space, { size: 'small' }, () => [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEditConfig('hardware', record, index),
        }, () => '编辑'),
        h(Popconfirm, {
          title: '确定要删除该配置项吗？',
          onConfirm: () => handleDeleteConfig('hardware', index),
          okText: '确定',
          cancelText: '取消',
        }, () => h(Button, {
          type: 'link',
          danger: true,
          size: 'small',
        }, () => '删除')),
      ]);
    },
  },
];

// 服务配置表格列
const serviceColumns: TableColumnsType<ServiceConfigItem> = [
  { title: '服务名称', dataIndex: 'serviceName', key: 'serviceName', width: 200 },
  { title: '服务类型', dataIndex: 'serviceType', key: 'serviceType', width: 120 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
  { title: '单价（元）', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', customRender: ({ text }) => formatAmount(text) },
  { title: '小计（元）', dataIndex: 'subtotal', key: 'subtotal', width: 120, align: 'right', customRender: ({ text }) => formatAmount(text) },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    customRender: ({ record, index }) => {
      if (!isEditMode.value) return null;
      return h(Space, { size: 'small' }, () => [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEditConfig('service', record, index),
        }, () => '编辑'),
        h(Popconfirm, {
          title: '确定要删除该配置项吗？',
          onConfirm: () => handleDeleteConfig('service', index),
          okText: '确定',
          cancelText: '取消',
        }, () => h(Button, {
          type: 'link',
          danger: true,
          size: 'small',
        }, () => '删除')),
      ]);
    },
  },
];

// 报价明细表格
const quotationDetails = computed<QuotationDetailItem[]>(() => {
  const details: QuotationDetailItem[] = [];
  let index = 1;
  
  softwareList.value.forEach(item => {
    const discountRate = item.discountRate || 100;
    const discountedPrice = item.unitPrice * (discountRate / 100);
    details.push({
      index: index++,
      type: '软件',
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountRate: discountRate,
      discountedPrice,
      subtotal: discountedPrice * item.quantity,
    });
  });
  
  hardwareList.value.forEach(item => {
    const discountRate = item.discountRate || 100;
    const discountedPrice = item.unitPrice * (discountRate / 100);
    details.push({
      index: index++,
      type: '硬件',
      name: item.deviceName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountRate: discountRate,
      discountedPrice,
      subtotal: discountedPrice * item.quantity,
    });
  });
  
  serviceList.value.forEach(item => {
    const discountRate = item.discountRate || 100;
    const discountedPrice = item.unitPrice * (discountRate / 100);
    details.push({
      index: index++,
      type: '服务',
      name: item.serviceName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountRate: discountRate,
      discountedPrice,
      subtotal: discountedPrice * item.quantity,
    });
  });
  
  return details;
});

// 处理报价明细折扣率变更
const handleDetailDiscountChange = (detail: QuotationDetailItem, discountRate: number | null) => {
  // 根据明细类型找到对应的配置项并更新折扣率
  let targetList: any[] = [];
  let nameField = '';
  
  if (detail.type === '软件') {
    targetList = softwareList.value;
    nameField = 'productName';
  } else if (detail.type === '硬件') {
    targetList = hardwareList.value;
    nameField = 'deviceName';
  } else if (detail.type === '服务') {
    targetList = serviceList.value;
    nameField = 'serviceName';
  }
  
  const item = targetList.find(i => i[nameField] === detail.name);
  if (item) {
    const rate = discountRate || 100;
    item.discountRate = rate;
    item.discountedPrice = item.unitPrice * (rate / 100);
    item.subtotal = item.discountedPrice * item.quantity;
  }
};

// 报价明细表格列
const quotationDetailColumns: TableColumnsType<QuotationDetailItem> = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center' },
  { title: '名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' },
  { title: '单价（元）', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, align: 'right', customRender: ({ text }) => formatAmount(text) },
  { 
    title: '折扣率', 
    dataIndex: 'discountRate', 
    key: 'discountRate', 
    width: 120, 
    align: 'center',
    customRender: ({ text, record }) => {
      if (!isEditMode.value) {
        return text ? `${text}%` : '100%';
      }
      return h(InputNumber as any, {
        value: text || 100,
        min: 0,
        max: 100,
        precision: 2,
        addonAfter: '%',
        size: 'small',
        style: { width: '100px' },
        onChange: (value: number | null) => handleDetailDiscountChange(record, value),
      });
    }
  },
  { 
    title: '折后单价（元）', 
    dataIndex: 'discountedPrice', 
    key: 'discountedPrice', 
    width: 120, 
    align: 'right', 
    customRender: ({ text, record }) => {
      const price = text || record.unitPrice;
      return formatAmount(price);
    }
  },
  { title: '小计（元）', dataIndex: 'subtotal', key: 'subtotal', width: 120, align: 'right', customRender: ({ text }) => formatAmount(text) },
];

// 已不再需要单独的审批记录表格，已合并到审批流程Timeline中显示
// const approvalRecordColumns: TableColumnsType<ApprovalRecord> = [
//   { title: '审批节点', dataIndex: 'approvalNodeName', key: 'approvalNodeName', width: 120 },
//   { title: '审批人', dataIndex: 'approverName', key: 'approverName', width: 100 },
//   { title: '审批时间', dataIndex: 'approvalTime', key: 'approvalTime', width: 180 },
//   {
//     title: '审批结果',
//     dataIndex: 'approvalResult',
//     key: 'approvalResult',
//     width: 100,
//     customRender: ({ text }) => {
//       const result = approvalResultMap[text];
//       return result ? h(Tag, { color: result.color }, () => result.text) : text;
//     },
//   },
//   { title: '审批意见', dataIndex: 'approvalComment', key: 'approvalComment', ellipsis: true },
// ];

// 审批流程节点
const approvalFlowNodes = computed<ApprovalFlowNode[]>(() => {
  const nodes: ApprovalFlowNode[] = [
    { nodeId: ApprovalNode.MarketingManager, nodeName: '部门市场负责人', nodeOrder: 1, status: 'waiting' },
    { nodeId: ApprovalNode.BusinessManager, nodeName: '部门商务负责人', nodeOrder: 2, status: 'waiting' },
    { nodeId: ApprovalNode.DepartmentManager, nodeName: '部门经理', nodeOrder: 3, status: 'waiting' },
  ];
  
  // 根据审批记录更新节点状态和详细信息
  approvalRecords.value.forEach(record => {
    const node = nodes.find(n => n.nodeId === record.approvalNode);
    if (node) {
      node.status = record.approvalResult === ApprovalResult.Approved ? 'approved' : 
                    record.approvalResult === ApprovalResult.Rejected ? 'rejected' : 'pending';
      node.approver = record.approverName;
      node.approvalTime = record.approvalTime;
      node.comment = record.approvalComment;
    }
  });
  
  // 设置当前待审批节点
  const approvedCount = approvalRecords.value.filter(r => r.approvalResult === ApprovalResult.Approved).length;
  if (approvedCount < nodes.length && currentStatus.value === SolutionStatus.Approving && nodes[approvedCount]) {
    nodes[approvedCount].status = 'pending';
  }
  
  return nodes;
});

// 审批意见
const approvalComment = ref('');

// 当前用户是否为当前节点审批人（Mock）
const isCurrentApprover = ref(false);

// 计算报价金额
const calculateQuotation = () => {
  // 计算各类费用
  quotation.softwareAmount = softwareList.value.reduce((sum, item) => sum + item.subtotal, 0);
  quotation.hardwareAmount = hardwareList.value.reduce((sum, item) => sum + item.subtotal, 0);
  quotation.serviceAmount = serviceList.value.reduce((sum, item) => sum + item.subtotal, 0);
  quotation.subtotalAmount = quotation.softwareAmount + quotation.hardwareAmount + quotation.serviceAmount;
  
  // 计算折扣金额
  quotation.discountAmount = calculateDiscountAmount(quotation.subtotalAmount, quotation.discountRate);
  
  // 计算总价
  quotation.totalAmount = calculateTotalAmount(quotation.subtotalAmount, quotation.discountAmount, quotation.additionalFee);
  
  // 转换为中文大写
  quotation.totalAmountChinese = convertAmountToChinese(quotation.totalAmount);
};

// 监听配置列表变化，自动计算报价
watch([softwareList, hardwareList, serviceList], () => {
  calculateQuotation();
}, { deep: true });

// 监听折扣率和附加费用变化
watch([() => quotation.discountRate, () => quotation.additionalFee], () => {
  calculateQuotation();
});

// 添加软件产品
const handleAddSoftware = () => {
  editingItem.value = null;
  editingType.value = 'software';
  softwareDialogVisible.value = true;
};

// 添加硬件设备
const handleAddHardware = () => {
  editingItem.value = null;
  editingType.value = 'hardware';
  hardwareSelectorVisible.value = true;
};

// 批量添加硬件设备
const handleBatchAddHardware = (devices: HardwareDevice[]) => {
  devices.forEach(device => {
    const item: HardwareConfigItem = {
      deviceId: device.id,
      deviceName: device.deviceName,
      deviceModel: device.deviceModel,
      quantity: 1,
      unitPrice: device.unitPrice,
      subtotal: device.unitPrice,
      configNote: '',
    };
    hardwareList.value.push(item);
  });
  hardwareSelectorVisible.value = false;
  message.success(`成功添加 ${devices.length} 个设备`);
};

// 添加服务项目
const handleAddService = () => {
  editingItem.value = null;
  editingType.value = 'service';
  serviceDialogVisible.value = true;
};

// 选择产品/设备/服务
const selectedProduct = ref<number | undefined>(undefined);
const selectedLicenseType = ref<string>('');
const configQuantity = ref(1);
const configNote = ref('');

// 确认添加配置
const handleConfirmAddConfig = () => {
  if (editingType.value === 'software') {
    const product = mockSoftwareProducts.find(p => p.id === selectedProduct.value);
    if (!product) {
      message.error('请选择软件产品');
      return;
    }
    if (!selectedLicenseType.value) {
      message.error('请选择授权方式');
      return;
    }
    
    const item: SoftwareConfigItem = {
      productId: product.id,
      productName: product.productName,
      productVersion: product.currentVersion,
      licenseType: selectedLicenseType.value,
      quantity: configQuantity.value,
      unitPrice: product.unitPrice,
      subtotal: calculateSubtotal(configQuantity.value, product.unitPrice),
      configNote: configNote.value,
    };
    
    if (editingItem.value !== null) {
      softwareList.value[editingItem.value] = item;
    } else {
      softwareList.value.push(item);
    }
    
    softwareDialogVisible.value = false;
    resetConfigForm();
  } else if (editingType.value === 'hardware') {
    const device = mockHardwareDevices.find(d => d.id === selectedProduct.value);
    if (!device) {
      message.error('请选择硬件设备');
      return;
    }
    
    const item: HardwareConfigItem = {
      deviceId: device.id,
      deviceName: device.deviceName,
      deviceModel: device.deviceModel,
      quantity: configQuantity.value,
      unitPrice: device.unitPrice,
      subtotal: calculateSubtotal(configQuantity.value, device.unitPrice),
      configNote: configNote.value,
    };
    
    if (editingItem.value !== null) {
      hardwareList.value[editingItem.value] = item;
    } else {
      hardwareList.value.push(item);
    }
    
    hardwareDialogVisible.value = false;
    resetConfigForm();
  } else if (editingType.value === 'service') {
    const service = mockServices.find(s => s.id === selectedProduct.value);
    if (!service) {
      message.error('请选择服务项目');
      return;
    }
    
    const item: ServiceConfigItem = {
      serviceId: service.id,
      serviceName: service.serviceName,
      serviceType: service.serviceType,
      quantity: configQuantity.value,
      unitPrice: service.unitPrice,
      subtotal: calculateSubtotal(configQuantity.value, service.unitPrice),
      serviceNote: configNote.value,
    };
    
    if (editingItem.value !== null) {
      serviceList.value[editingItem.value] = item;
    } else {
      serviceList.value.push(item);
    }
    
    serviceDialogVisible.value = false;
    resetConfigForm();
  }
};

// 重置配置表单
const resetConfigForm = () => {
  selectedProduct.value = undefined;
  selectedLicenseType.value = '';
  configQuantity.value = 1;
  configNote.value = '';
  editingItem.value = null;
  editingType.value = null;
};

// 编辑配置项
const handleEditConfig = (type: 'software' | 'hardware' | 'service', record: any, index: number) => {
  editingItem.value = index;
  editingType.value = type;
  
  if (type === 'software') {
    selectedProduct.value = record.productId;
    selectedLicenseType.value = record.licenseType;
    configQuantity.value = record.quantity;
    configNote.value = record.configNote || '';
    softwareDialogVisible.value = true;
  } else if (type === 'hardware') {
    selectedProduct.value = record.deviceId;
    configQuantity.value = record.quantity;
    configNote.value = record.configNote || '';
    hardwareDialogVisible.value = true;
  } else if (type === 'service') {
    selectedProduct.value = record.serviceId;
    configQuantity.value = record.quantity;
    configNote.value = record.serviceNote || '';
    serviceDialogVisible.value = true;
  }
};

// 删除配置项
const handleDeleteConfig = (type: 'software' | 'hardware' | 'service', index: number) => {
  if (type === 'software') {
    softwareList.value.splice(index, 1);
  } else if (type === 'hardware') {
    hardwareList.value.splice(index, 1);
  } else if (type === 'service') {
    serviceList.value.splice(index, 1);
  }
  message.success('删除成功');
};

// 保存基本信息
const handleSaveBasic = async () => {
  try {
    await basicFormRef.value?.validate();
    // TODO: 调用API保存
    message.success('保存成功');
    isEditMode.value = false;
  } catch (error) {
    message.error('请检查表单填写');
  }
};

const handleSaveBasicInfo = handleSaveBasic;

const handleCancelEdit = () => {
  isEditMode.value = false;
  // 如果是新建模式，返回列表
  if (!solutionId.value) {
    handleBack();
  }
};

// 保存报价
const handleSaveQuotation = () => {
  if (!quotation.validityDate) {
    message.warning('请选择报价有效期');
    return;
  }
  if (!quotation.quotationNote) {
    message.warning('请填写报价说明');
    return;
  }
  // TODO: 调用API保存
  message.success('报价保存成功');
};

// 生成报价单
const handleGenerateQuotation = async (format: 'excel' | 'pdf') => {
  try {
    if (format === 'excel') {
      await generateExcelQuotation();
    } else {
      await generatePDFQuotation();
    }
  } catch (error) {
    console.error('导出报价单失败:', error);
    message.error('导出报价单失败，请重试');
  }
};

// 生成Excel报价单（使用ExcelJS支持完整样式）
const generateExcelQuotation = async () => {
  const ExcelJS = (await import('exceljs')).default;
  
  // 创建工作簿和工作表
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('报价单');
  
  // 设置列宽
  worksheet.columns = [
    { width: 8 },   // 序号
    { width: 10 },  // 类型
    { width: 35 },  // 名称
    { width: 10 },  // 数量
    { width: 15 },  // 单价
    { width: 12 },  // 折扣率
    { width: 16 },  // 折后单价
    { width: 15 },  // 小计
  ];
  
  let currentRow = 1;
  
  // 标题行
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const titleRow = worksheet.getRow(currentRow);
  titleRow.getCell(1).value = '客户方案报价单';
  titleRow.getCell(1).font = { bold: true, size: 18, color: { argb: 'FF333333' } };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 30;
  currentRow += 2;
  
  // 方案信息标题
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const infoTitleRow = worksheet.getRow(currentRow);
  infoTitleRow.getCell(1).value = '方案信息';
  infoTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF333333' } };
  infoTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  infoTitleRow.getCell(1).border = {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  };
  currentRow++;
  
  // 方案信息内容
  const infoData = [
    ['方案名称', basicForm.solutionName],
    ['方案编号', basicForm.solutionCode],
    ['客户名称', basicForm.customerName],
    ['创建日期', new Date().toLocaleDateString('zh-CN')],
    ['报价有效期', quotation.validityDate || '-'],
  ];
  
  infoData.forEach(([label, value]) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(2).value = value;
    
    for (let col = 1; col <= 8; col++) {
      const cell = row.getCell(col);
      cell.font = col === 1 ? { bold: true, size: 11 } : { size: 11 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
    }
    currentRow++;
  });
  
  currentRow++;
  
  // 报价明细标题
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const detailTitleRow = worksheet.getRow(currentRow);
  detailTitleRow.getCell(1).value = '报价明细';
  detailTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF333333' } };
  detailTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  currentRow++;
  
  // 明细表头
  const headerRow = worksheet.getRow(currentRow);
  const headers = ['序号', '类型', '名称', '数量', '单价（元）', '折扣率', '折后单价（元）', '小计（元）'];
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF428BCA' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    };
  });
  headerRow.height = 25;
  currentRow++;
  
  // 明细数据
  quotationDetails.value.forEach((item, index) => {
    const row = worksheet.getRow(currentRow);
    const isEven = index % 2 === 0;
    
    row.getCell(1).value = item.index;
    row.getCell(2).value = item.type;
    row.getCell(3).value = item.name;
    row.getCell(4).value = item.quantity;
    row.getCell(5).value = item.unitPrice;
    row.getCell(6).value = item.discountRate ? `${item.discountRate}%` : '-';
    row.getCell(7).value = item.discountedPrice || item.unitPrice;
    row.getCell(8).value = item.subtotal;
    
    for (let col = 1; col <= 8; col++) {
      const cell = row.getCell(col);
      cell.font = { size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF9F9F9' : 'FFFFFFFF' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
      
      // 对齐方式
      if (col === 1 || col === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (col === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
      
      // 数字格式
      if (col === 5 || col === 7 || col === 8) {
        cell.numFmt = '#,##0.00';
      }
    }
    currentRow++;
  });
  
  currentRow++;
  
  // 报价汇总标题
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const summaryTitleRow = worksheet.getRow(currentRow);
  summaryTitleRow.getCell(1).value = '报价汇总';
  summaryTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF333333' } };
  summaryTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  currentRow++;
  
  // 汇总内容
  const summaryData = [
    ['软件产品费用', quotation.softwareAmount],
    ['硬件设备费用', quotation.hardwareAmount],
    ['服务项目费用', quotation.serviceAmount],
    ['小计', quotation.subtotalAmount],
    ['折扣率', `${quotation.discountRate}%`],
    ['折扣金额', quotation.discountAmount],
    ['附加费用', quotation.additionalFee],
    ['总计', quotation.totalAmount],
    ['总计（大写）', quotation.totalAmountChinese],
  ];
  
  summaryData.forEach(([label, value], index) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(2).value = value;
    
    row.getCell(1).font = { bold: true, size: index >= 7 ? 12 : 11 };
    row.getCell(2).font = { bold: index >= 7, size: index >= 7 ? 12 : 11, color: { argb: index >= 7 ? 'FFDC3545' : 'FF000000' } };
    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
    
    if (index === 7) {
      row.getCell(1).border = { top: { style: 'medium', color: { argb: 'FF333333' } } };
      row.getCell(2).border = { top: { style: 'medium', color: { argb: 'FF333333' } } };
    }
    
    // 数字格式
    if (index !== 4 && index !== 8 && typeof value === 'number') {
      row.getCell(2).numFmt = '#,##0.00';
    }
    
    currentRow++;
  });
  
  currentRow++;
  
  // 报价说明
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const noteTitleRow = worksheet.getRow(currentRow);
  noteTitleRow.getCell(1).value = '报价说明';
  noteTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF333333' } };
  noteTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  currentRow++;
  
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const noteRow = worksheet.getRow(currentRow);
  noteRow.getCell(1).value = quotation.quotationNote || '无';
  noteRow.getCell(1).font = { size: 10 };
  noteRow.getCell(1).alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  noteRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
  noteRow.getCell(1).border = {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  };
  noteRow.height = 60;
  
  // 导出文件
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${basicForm.solutionName || '客户方案'}_报价单_${new Date().getTime()}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
  
  message.success('Excel报价单导出成功');
};

// 生成PDF报价单（使用HTML转图片方式支持中文）
const generatePDFQuotation = async () => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;
    
    // 创建一个临时的HTML容器来渲染报价单
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 210mm;
      background: white;
      padding: 20px;
      font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
    `;
    
    // 构建HTML内容
    container.innerHTML = `
      <div style="font-family: 'Microsoft YaHei', 'SimSun', sans-serif;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px; color: #333;">客户方案报价单</h1>
        
        <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 5px; width: 120px; font-weight: bold;">方案名称：</td><td style="padding: 5px;">${basicForm.solutionName}</td></tr>
            <tr><td style="padding: 5px; width: 120px; font-weight: bold;">方案编号：</td><td style="padding: 5px;">${basicForm.solutionCode}</td></tr>
            <tr><td style="padding: 5px; width: 120px; font-weight: bold;">客户名称：</td><td style="padding: 5px;">${basicForm.customerName}</td></tr>
            <tr><td style="padding: 5px; width: 120px; font-weight: bold;">创建日期：</td><td style="padding: 5px;">${new Date().toLocaleDateString('zh-CN')}</td></tr>
            <tr><td style="padding: 5px; width: 120px; font-weight: bold;">报价有效期：</td><td style="padding: 5px;">${quotation.validityDate || '-'}</td></tr>
          </table>
        </div>
        
        <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #333;">报价明细</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #428bca; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">序号</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">类型</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">名称</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">数量</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">单价(元)</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">折扣率</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">折后单价(元)</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px;">小计(元)</th>
            </tr>
          </thead>
          <tbody>
            ${quotationDetails.value.map((item, index) => `
              <tr style="background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 11px;">${item.index}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 11px;">${item.type}</td>
                <td style="border: 1px solid #ddd; padding: 6px; font-size: 11px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 11px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 11px;">${item.unitPrice.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 11px;">${item.discountRate ? item.discountRate + '%' : '-'}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 11px;">${(item.discountedPrice || item.unitPrice).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 11px;">${item.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #333;">报价汇总</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">软件产品费用：</td><td style="padding: 6px; text-align: right;">${quotation.softwareAmount.toFixed(2)} 元</td></tr>
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">硬件设备费用：</td><td style="padding: 6px; text-align: right;">${quotation.hardwareAmount.toFixed(2)} 元</td></tr>
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">服务项目费用：</td><td style="padding: 6px; text-align: right;">${quotation.serviceAmount.toFixed(2)} 元</td></tr>
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">小计：</td><td style="padding: 6px; text-align: right;">${quotation.subtotalAmount.toFixed(2)} 元</td></tr>
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">折扣率：</td><td style="padding: 6px; text-align: right;">${quotation.discountRate}%</td></tr>
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">折扣金额：</td><td style="padding: 6px; text-align: right;">${quotation.discountAmount.toFixed(2)} 元</td></tr>
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">附加费用：</td><td style="padding: 6px; text-align: right;">${quotation.additionalFee.toFixed(2)} 元</td></tr>
          <tr style="border-top: 2px solid #333;"><td style="padding: 10px 6px; width: 150px; font-weight: bold; font-size: 16px;">总计：</td><td style="padding: 10px 6px; text-align: right; font-weight: bold; font-size: 16px; color: #dc3545;">${quotation.totalAmount.toFixed(2)} 元</td></tr>
          <tr><td style="padding: 6px; width: 150px; font-weight: bold;">总计(大写)：</td><td style="padding: 6px; text-align: right; color: #dc3545;">${quotation.totalAmountChinese}</td></tr>
        </table>
        
        ${quotation.quotationNote ? `
          <h3 style="font-size: 16px; margin: 20px 0 10px 0; color: #333;">报价说明</h3>
          <div style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; line-height: 1.6;">
            ${quotation.quotationNote}
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(container);
    
    // 使用html2canvas将HTML转为图片
    const canvas = await html2canvas(container, {
      scale: 2, // 提高清晰度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    // 移除临时容器
    document.body.removeChild(container);
    
    // 创建PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 210; // A4宽度
    const pageHeight = 297; // A4高度
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // 如果内容超过一页，添加更多页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // 保存PDF
    const fileName = `${basicForm.solutionName || '客户方案'}_报价单_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    
    message.success('PDF报价单导出成功');
  } catch (error) {
    console.error('PDF生成失败:', error);
    message.error('PDF生成失败，请重试');
  }
};

// 处理导出菜单点击
const handleExportMenuClick = ({ key }: any) => {
  if (key === 'excel') {
    handleGenerateQuotation('excel');
  } else if (key === 'pdf') {
    handleGenerateQuotation('pdf');
  }
};

// 提交审批
const handleSubmitApproval = () => {
  if (softwareList.value.length === 0 && hardwareList.value.length === 0 && serviceList.value.length === 0) {
    message.warning('请先配置方案内容');
    return;
  }
  if (!quotation.validityDate) {
    message.warning('请先选择报价有效期');
    return;
  }
  if (!quotation.quotationNote) {
    message.warning('请先完成报价信息');
    return;
  }
  
  Modal.confirm({
    title: '提交审批确认',
    content: '确定要提交审批吗？提交后将无法修改。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // TODO: 调用API提交审批
      currentStatus.value = SolutionStatus.Approving;
      message.success('提交审批成功');
    },
  });
};

// 审批操作
const handleApproval = (result: 'approve' | 'reject') => {
  if (!approvalComment.value && result === 'reject') {
    message.warning('驳回时必须填写审批意见');
    return;
  }
  
  const action = result === 'approve' ? '通过' : '驳回';
  Modal.confirm({
    title: `审批确认`,
    content: `确定要${action}该方案吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // TODO: 调用API提交审批结果
      message.success(`审批${action}成功`);
      approvalComment.value = '';
      
      if (result === 'reject') {
        currentStatus.value = SolutionStatus.Rejected;
      }
    },
  });
};

// 返回列表
const handleBack = () => {
  router.push('/product-solutions/customer');
};

// 编辑模式切换
const handleEdit = () => {
  isEditMode.value = true;
};

// 初始化加载数据
const loadData = () => {
  // 重置数据
  softwareList.value = [];
  hardwareList.value = [];
  serviceList.value = [];
  approvalRecords.value = [];
  
  // 重置报价数据
  Object.assign(quotation, {
    softwareAmount: 0,
    hardwareAmount: 0,
    serviceAmount: 0,
    subtotalAmount: 0,
    discountRate: 100,
    discountAmount: 0,
    additionalFee: 0,
    totalAmount: 0,
    totalAmountChinese: '',
    validityDate: undefined,
    quotationNote: '',
  });
  
  if (solutionId.value) {
    // TODO: 从API加载数据
    // 这里使用Mock数据，从mockSolutions中查找对应的方案
    const mockSolution = mockSolutions.find(s => s.id === solutionId.value);
    
    if (mockSolution) {
      if (isCopyMode.value) {
        // 复制模式：生成新编号，名称添加副本标记
        basicForm.solutionCode = generateSolutionCode();
        basicForm.solutionName = `${mockSolution.solutionName}（副本）`;
      } else {
        // 正常查看/编辑模式：使用原方案数据
        basicForm.solutionCode = mockSolution.solutionCode;
        basicForm.solutionName = mockSolution.solutionName;
      }
      basicForm.customerName = mockSolution.customerName;
      basicForm.customerContact = mockSolution.customerContact || '';
      basicForm.contactPhone = mockSolution.contactPhone || '';
      basicForm.solutionType = mockSolution.solutionType;
      basicForm.industry = mockSolution.industry || '';
      basicForm.description = mockSolution.description || '';
      
      currentStatus.value = isCopyMode.value ? SolutionStatus.Draft : mockSolution.status;
    } else {
      // 找不到对应方案时使用默认数据
      basicForm.solutionCode = generateSolutionCode();
      basicForm.solutionName = '新建客户方案';
      basicForm.customerName = '';
      currentStatus.value = SolutionStatus.Draft;
    }
    
    // Mock配置数据
    if (!isCopyMode.value && solutionId.value === 1) {
      // 加载已有配置
    }
    
    // Mock审批记录
    if (currentStatus.value !== SolutionStatus.Draft) {
      approvalRecords.value = [
        {
          id: 1,
          solutionId: solutionId.value,
          approvalNode: ApprovalNode.MarketingManager,
          approvalNodeName: '部门市场负责人',
          approverId: 1,
          approverName: '张三',
          approvalTime: '2024-11-07 10:15:00',
          approvalResult: ApprovalResult.Approved,
          approvalComment: '同意',
          nodeOrder: 1,
        },
      ];
    }
  } else {
    // 新建方案模式
    // 使用initialSolutionName和initialCustomerName（已在basicForm初始化时设置）
    if (!basicForm.solutionName && !initialSolutionName.value) {
      basicForm.solutionName = '新建客户方案';
    }
    currentStatus.value = SolutionStatus.Draft;
  }
};

// 监听路由变化，重新加载数据
watch(() => route.params.id, (newId) => {
  if (newId) {
    solutionId.value = Number(newId);
    isEditMode.value = route.query.mode === 'edit';
    isCopyMode.value = !!route.query.copy;
    activeTab.value = 'basic'; // 重置到基本信息标签页
    configTab.value = 'software'; // 重置配置子页签
    initialSolutionName.value = route.query.solutionName as string || '';
    initialCustomerName.value = route.query.customerName as string || '';
    loadData();
  }
});

loadData();
</script>

<template>
  <div class="p-4">
    <!-- 页面头部 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center">
        <Button type="text" @click="handleBack"> ← 返回 </Button>
        <div class="ml-4">
          <h1 class="text-2xl font-bold">
            {{ basicForm.solutionName || (solutionId ? '客户方案详情' : '新建客户方案') }}
          </h1>
          <p class="text-gray-500 mt-1">
            方案编号: {{ basicForm.solutionCode }}
            <span v-if="basicForm.customerName" class="ml-3">客户: {{ basicForm.customerName }}</span>
            <Tag v-if="solutionId && solutionStatusMap[currentStatus]" :color="solutionStatusMap[currentStatus]?.color" class="ml-2">
              {{ solutionStatusMap[currentStatus]?.text }}
            </Tag>
          </p>
        </div>
      </div>
              <Space>
                <Button
                  v-if="!isEditMode && currentStatus === SolutionStatus.Draft"
                  type="primary"
                  @click="handleEdit"
                >
                  编辑
                </Button>
                <Button v-if="isEditMode" @click="handleCancelEdit"> 取消 </Button>
              </Space>
    </div>

    <!-- 方案统计 -->
    <Card size="small" class="mb-3">
      <div class="flex">
        <div class="flex-1 flex items-center justify-between px-4">
          <span class="text-gray-500 text-2xl">软件产品</span>
          <span class="text-2xl font-semibold">{{ statistics.softwareCount }}<span class="text-sm text-gray-400 ml-1">个</span></span>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 flex items-center justify-between px-4">
          <span class="text-gray-500 text-2xl">硬件设备</span>
          <span class="text-2xl font-semibold">{{ statistics.hardwareCount }}<span class="text-sm text-gray-400 ml-1">台</span></span>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 flex items-center justify-between px-4">
          <span class="text-gray-500 text-2xl">服务项目</span>
          <span class="text-2xl font-semibold">{{ statistics.serviceCount }}<span class="text-sm text-gray-400 ml-1">项</span></span>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 flex items-center justify-between px-4">
          <span class="text-gray-500 text-2xl">总金额</span>
          <span class="text-2xl font-semibold text-red-600">¥{{ statistics.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </Card>

    <!-- 标签页内容 -->
    <Card>
      <Tabs v-model:activeKey="activeTab">
        <!-- 基本信息标签页 -->
        <Tabs.TabPane key="basic" tab="基本信息" force-render>
          <Form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicFormRules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :disabled="!isEditMode"
          >
            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">基本信息</h3>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="方案编号" name="solutionCode">
                    <Input v-model:value="basicForm.solutionCode" disabled />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="方案名称" name="solutionName">
                    <Input
                      v-model:value="basicForm.solutionName"
                      placeholder="请输入方案名称"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="客户联系人" name="customerContact">
                    <Input
                      v-model:value="basicForm.customerContact"
                      placeholder="请输入联系人"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="联系电话" name="contactPhone">
                    <Input
                      v-model:value="basicForm.contactPhone"
                      placeholder="请输入联系电话"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="方案类型" name="solutionType">
                    <Select v-model:value="basicForm.solutionType">
                      <Select.Option :value="SolutionType.Standard">标准方案</Select.Option>
                      <Select.Option :value="SolutionType.Custom">定制方案</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="行业领域" name="industry">
                    <Input
                      v-model:value="basicForm.industry"
                      placeholder="请输入行业领域"
                    />
                  </Form.Item>
                </Col>
                <Col :span="24">
                  <Form.Item label="方案说明" name="description" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
                    <Textarea
                      v-model:value="basicForm.description"
                      placeholder="请输入方案说明"
                      :rows="4"
                      :maxlength="500"
                      show-count
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <!-- 保存/取消按钮 -->
            <div v-if="isEditMode" class="text-right mt-4">
              <Space>
                <Button @click="handleCancelEdit">取消</Button>
                <Button type="primary" @click="handleSaveBasicInfo">保存</Button>
              </Space>
            </div>
          </Form>
        </Tabs.TabPane>

        <!-- 方案配置标签页 -->
        <Tabs.TabPane key="config" tab="方案配置">
          <Tabs v-model:activeKey="configTab" tab-position="left">
            <!-- 软件产品配置 -->
            <Tabs.TabPane key="software" tab="软件产品">
              <div class="mb-4 flex items-center justify-between">
                <div class="text-lg font-bold">软件产品配置</div>
                <Space>
                  <Button 
                    v-if="isEditMode && selectedSoftwareRows.length > 0" 
                    danger
                    @click="handleBatchDelete('software')"
                  >
                    批量删除 ({{ selectedSoftwareRows.length }})
                  </Button>
                  <Button v-if="isEditMode" type="primary" @click="handleAddSoftware">+ 添加软件产品</Button>
                </Space>
              </div>
              <Table
                :columns="softwareColumns"
                :data-source="softwareList"
                :pagination="false"
                :row-selection="softwareRowSelection"
                row-key="productId"
                :scroll="{ x: 1000 }"
              />
            </Tabs.TabPane>

            <!-- 硬件设备配置 -->
            <Tabs.TabPane key="hardware" tab="硬件设备">
              <div class="mb-4 flex items-center justify-between">
                <div class="text-lg font-bold">硬件设备配置</div>
                <Space>
                  <Button 
                    v-if="isEditMode && selectedHardwareRows.length > 0" 
                    danger
                    @click="handleBatchDelete('hardware')"
                  >
                    批量删除 ({{ selectedHardwareRows.length }})
                  </Button>
                  <Button v-if="isEditMode" type="primary" @click="handleAddHardware">+ 添加硬件设备</Button>
                </Space>
              </div>
              <Table
                :columns="hardwareColumns"
                :data-source="hardwareList"
                :pagination="false"
                :row-selection="hardwareRowSelection"
                row-key="deviceId"
                :scroll="{ x: 1000 }"
              />
            </Tabs.TabPane>

            <!-- 服务项目配置 -->
            <Tabs.TabPane key="service" tab="服务项目">
              <div class="mb-4 flex items-center justify-between">
                <div class="text-lg font-bold">服务项目配置</div>
                <Space>
                  <Button 
                    v-if="isEditMode && selectedServiceRows.length > 0" 
                    danger
                    @click="handleBatchDelete('service')"
                  >
                    批量删除 ({{ selectedServiceRows.length }})
                  </Button>
                  <Button v-if="isEditMode" type="primary" @click="handleAddService">+ 添加服务项目</Button>
                </Space>
              </div>
              <Table
                :columns="serviceColumns"
                :data-source="serviceList"
                :pagination="false"
                :row-selection="serviceRowSelection"
                row-key="serviceId"
                :scroll="{ x: 1000 }"
              />
            </Tabs.TabPane>
          </Tabs>
        </Tabs.TabPane>

        <!-- 方案报价标签页 -->
        <Tabs.TabPane key="quotation" tab="方案报价">
          <div class="flex gap-4">
            <!-- 左侧：报价明细 -->
            <div class="flex-1">
              <Card title="报价明细">
                <Table
                  :columns="quotationDetailColumns"
                  :data-source="quotationDetails"
                  :pagination="false"
                  :scroll="{ x: 900, y: 600 }"
                />
              </Card>
            </div>

            <!-- 右侧：报价汇总和报价说明 -->
            <div style="width: 500px;">
              <!-- 报价汇总 -->
              <Card title="报价汇总" class="mb-4">
                <template #extra>
                  <Space size="small">
                    <Button
                      v-if="isEditMode"
                      size="middle"
                      type="primary"
                      @click="handleSaveQuotation"
                    >
                      保存报价
                    </Button>
                    <Button
                      v-if="isEditMode && currentStatus === SolutionStatus.Draft"
                      size="middle"
                      type="primary"
                      danger
                      :disabled="quotation.totalAmount === 0"
                      @click="handleSubmitApproval"
                    >
                      提交审批
                    </Button>
                    <Dropdown>
                      <template #overlay>
                        <Menu @click="handleExportMenuClick">
                          <Menu.Item key="excel">
                            <span>Excel格式</span>
                          </Menu.Item>
                          <Menu.Item key="pdf">
                            <span>PDF格式</span>
                          </Menu.Item>
                        </Menu>
                      </template>
                      <Button size="middle">
                        导出报价单
                        <template #icon>
                          <span class="ml-1">▼</span>
                        </template>
                      </Button>
                    </Dropdown>
                  </Space>
                </template>
                <div class="space-y-4">
                  <Row>
                    <Col :span="14">软件产品费用：</Col>
                    <Col :span="10" class="text-right font-bold">
                      {{ formatCurrency(quotation.softwareAmount) }}
                    </Col>
                  </Row>
                  <Row>
                    <Col :span="14">硬件设备费用：</Col>
                    <Col :span="10" class="text-right font-bold">
                      {{ formatCurrency(quotation.hardwareAmount) }}
                    </Col>
                  </Row>
                  <Row>
                    <Col :span="14">服务项目费用：</Col>
                    <Col :span="10" class="text-right font-bold">
                      {{ formatCurrency(quotation.serviceAmount) }}
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col :span="14">小计：</Col>
                    <Col :span="10" class="text-right text-lg font-bold">
                      {{ formatCurrency(quotation.subtotalAmount) }}
                    </Col>
                  </Row>
                  <Row>
                    <Col :span="10">折扣率：</Col>
                    <Col :span="7">
                      <InputNumber
                        v-model:value="quotation.discountRate"
                        :min="0"
                        :max="100"
                        :precision="2"
                        addon-after="%"
                        size="small"
                        class="w-full"
                        :disabled="!isEditMode"
                      />
                    </Col>
                    <Col :span="7" class="text-right text-red-500">
                      -{{ formatCurrency(quotation.discountAmount) }}
                    </Col>
                  </Row>
                  <Row>
                    <Col :span="10">附加费用：</Col>
                    <Col :span="7">
                      <InputNumber
                        v-model:value="quotation.additionalFee"
                        :precision="2"
                        size="small"
                        class="w-full"
                        :disabled="!isEditMode"
                      />
                    </Col>
                    <Col :span="7" class="text-right text-green-500">
                      +{{ formatCurrency(quotation.additionalFee) }}
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col :span="14" class="text-lg">总计：</Col>
                    <Col :span="10" class="text-right text-xl font-bold text-red-500">
                      {{ formatCurrency(quotation.totalAmount) }}
                    </Col>
                  </Row>
                  <Row>
                    <Col :span="24" class="text-right text-gray-500 text-sm">
                      大写：{{ quotation.totalAmountChinese }}
                    </Col>
                  </Row>
                </div>
              </Card>

              <!-- 报价有效期 -->
              <Card title="报价有效期" class="mb-4">
                <div class="flex items-center gap-2">
                  <DatePicker
                    v-model:value="quotation.validityDate"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择报价有效期"
                    class="flex-1"
                    :disabled="!isEditMode"
                    :disabled-date="(current: any) => current && current < new Date().setHours(0, 0, 0, 0)"
                  />
                  <span v-if="!quotation.validityDate && isEditMode" class="text-red-500 text-sm">*必填</span>
                </div>
                <div v-if="quotation.validityDate" class="mt-2 text-sm text-gray-500">
                  报价有效期至：{{ quotation.validityDate }}
                </div>
              </Card>

              <!-- 报价说明 -->
              <Card title="报价说明">
                <Textarea
                  v-model:value="quotation.quotationNote"
                  placeholder="请输入报价说明，如包含内容、不包含内容等"
                  :rows="6"
                  :maxlength="500"
                  show-count
                  :disabled="!isEditMode"
                />
              </Card>
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 审批记录标签页 -->
        <Tabs.TabPane key="approval" tab="审批记录">
          <div class="max-w-5xl">
            <!-- 审批流程和记录 -->
            <Card title="审批流程" class="mb-6">
              <Timeline>
                <Timeline.Item
                  v-for="node in approvalFlowNodes"
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
            </Card>

            <!-- 审批操作 -->
            <Card v-if="isCurrentApprover && currentStatus === SolutionStatus.Approving" title="审批操作">
              <div class="max-w-2xl">
                <div class="mb-4">
                  <div class="mb-2 font-bold">审批意见：</div>
                  <Textarea
                    v-model:value="approvalComment"
                    placeholder="请输入审批意见"
                    :rows="4"
                    :maxlength="500"
                    show-count
                  />
                </div>
                <div class="text-center">
                  <Space size="large">
                    <Button type="primary" size="large" @click="handleApproval('approve')">
                      通过
                    </Button>
                    <Button danger size="large" @click="handleApproval('reject')">
                      驳回
                    </Button>
                  </Space>
                </div>
              </div>
            </Card>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>

    <!-- 添加软件产品对话框 -->
    <Modal
      v-model:open="softwareDialogVisible"
      title="添加软件产品"
      width="600px"
      @ok="handleConfirmAddConfig"
      @cancel="resetConfigForm"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <Form.Item label="选择产品" required>
          <Select v-model:value="selectedProduct" placeholder="请选择软件产品">
            <Select.Option v-for="product in mockSoftwareProducts" :key="product.id" :value="product.id">
              {{ product.productName }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="授权方式" required>
          <Select v-model:value="selectedLicenseType" placeholder="请选择授权方式">
            <Select.Option
              v-for="type in mockSoftwareProducts.find(p => p.id === selectedProduct)?.licenseTypes || []"
              :key="type"
              :value="type"
            >
              {{ type }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="数量" required>
          <InputNumber v-model:value="configQuantity" :min="1" class="w-full" />
        </Form.Item>
        <Form.Item label="单价">
          <Input
            :value="formatCurrency(mockSoftwareProducts.find(p => p.id === selectedProduct)?.unitPrice || 0)"
            disabled
          />
        </Form.Item>
        <Form.Item label="配置说明">
          <Textarea v-model:value="configNote" :rows="3" placeholder="请输入配置说明" />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 添加硬件设备选择器弹窗 -->
    <HardwareSelectorModal
      v-model:open="hardwareSelectorVisible"
      :selected-ids="hardwareList.map(item => item.deviceId)"
      @select="handleBatchAddHardware"
    />

    <!-- 添加硬件设备对话框 (仅用于编辑) -->
    <Modal
      v-model:open="hardwareDialogVisible"
      title="编辑硬件设备"
      width="600px"
      @ok="handleConfirmAddConfig"
      @cancel="resetConfigForm"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <Form.Item label="选择设备" required>
          <Select v-model:value="selectedProduct" placeholder="请选择硬件设备">
            <Select.Option v-for="device in mockHardwareDevices" :key="device.id" :value="device.id">
              {{ device.deviceName }} ({{ device.deviceModel }})
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="数量" required>
          <InputNumber v-model:value="configQuantity" :min="1" class="w-full" />
        </Form.Item>
        <Form.Item label="单价">
          <Input
            :value="formatCurrency(mockHardwareDevices.find(d => d.id === selectedProduct)?.unitPrice || 0)"
            disabled
          />
        </Form.Item>
        <Form.Item label="配置说明">
          <Textarea v-model:value="configNote" :rows="3" placeholder="请输入配置说明" />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 添加服务项目对话框 -->
    <Modal
      v-model:open="serviceDialogVisible"
      title="添加服务项目"
      width="600px"
      @ok="handleConfirmAddConfig"
      @cancel="resetConfigForm"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <Form.Item label="选择服务" required>
          <Select v-model:value="selectedProduct" placeholder="请选择服务项目">
            <Select.Option v-for="service in mockServices" :key="service.id" :value="service.id">
              {{ service.serviceName }} ({{ service.serviceType }})
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="数量" required>
          <InputNumber v-model:value="configQuantity" :min="1" class="w-full" />
        </Form.Item>
        <Form.Item label="单价">
          <Input
            :value="formatCurrency(mockServices.find(s => s.id === selectedProduct)?.unitPrice || 0)"
            disabled
          />
        </Form.Item>
        <Form.Item label="服务说明">
          <Textarea v-model:value="configNote" :rows="3" placeholder="请输入服务说明" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>


