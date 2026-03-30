<script lang="ts" setup>
import { computed, h, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Textarea,
  Tree,
  TreeSelect,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import type {
  BusinessHistory,
  ContactPerson,
  CustomerProfile,
  CustomerStatistics,
  OrganizationNode,
} from './types';
import {
  BusinessType,
  CustomerLevel,
  CustomerStatus,
  Gender,
} from './types';
import {
  calculatePaymentRate,
  formatCurrency,
  generateCustomerCode,
  getBusinessTypeMap,
  getCustomerLevelMap,
  getCustomerStatusMap,
  getTimeRangeStart,
  maskPhone,
  validateCreditCode,
  validateEmail,
  validatePhone,
} from './utils';
import dayjs from 'dayjs';
// 导入法人组织相关
import type { LegalEntity } from '../legal-entities/types';
import { flattenEntityTree, getEntityTypeInfo } from '../legal-entities/utils';
import { getMockGroupCustomers, getMockLegalEntityById, mockLegalEntityTree } from '../legal-entities/mock';

defineOptions({
  name: 'CustomerArchiveDetail',
});

const route = useRoute();
const router = useRouter();

// 获取客户ID和模式
const customerId = ref(route.params.id ? Number(route.params.id) : null);
const isEditMode = ref(route.query.mode === 'edit');
const activeTab = ref('basic');

// 从URL获取初始参数（新建时）
const initialCustomerName = ref(route.query.customerName as string || '');
const initialCustomerShortName = ref(route.query.customerShortName as string || '');
const initialCreditCode = ref(route.query.creditCode as string || '');

// 映射数据
const customerLevelMap = getCustomerLevelMap();
const customerStatusMap = getCustomerStatusMap();
const businessTypeMap = getBusinessTypeMap();

// 行业选项
const industryOptions = [
  '智能制造', '制造业', '汽车制造', '电子制造', '机械制造', '钢铁', '化工',
  '食品制造', '纺织', '医药', '光电', '精密制造', '物流', '商贸', '金融',
  '教育', '高科技', '互联网', '其他',
];

// 地区选项
const regionOptions = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '武汉', '成都',
  '重庆', '天津', '西安', '郑州', '济南', '青岛', '大连', '沈阳', '长沙',
  '福州', '厦门', '其他',
];

// 员工选项（Mock）
const employeeOptions = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
  { id: 5, name: '周八' },
];

// 表单引用
const basicFormRef = ref<FormInstance>();

// 基本信息表单
const basicForm = reactive<CustomerProfile>({
  customerCode: customerId.value ? '' : generateCustomerCode(),
  customerName: initialCustomerName.value,
  customerShortName: initialCustomerShortName.value,
  creditCode: initialCreditCode.value,
  registeredCapital: '',
  industry: '',
  region: '',
  level: CustomerLevel.Normal,
  status: CustomerStatus.Potential,
  establishDate: '',
  legalRepresentative: '',
  website: '',
  responsiblePerson: '',
  address: '',
  tags: [],
  introduction: '',
  // 法人组织关联
  legalEntityId: undefined as number | undefined,
  legalEntityCode: '',
  legalEntityName: '',
  legalEntityPath: '',
});

// 法人组织相关
const flatLegalEntities = computed(() => flattenEntityTree(mockLegalEntityTree));
const groupCustomers = ref<LegalEntity[]>([]);

// 获取组织类型图标
function getEntityTypeIcon(type: number) {
  const info = getEntityTypeInfo(type);
  return info.icon;
}

// 准备TreeSelect数据 - 只加载第一层
const legalEntityTreeData = computed(() => {
  const convertToTreeSelectData = (entities: LegalEntity[], loadFirstLevelOnly = false): any[] => {
    return entities.map(entity => {
      const hasChildren = entity.children && entity.children.length > 0;
      const node: any = {
        value: entity.id!,
        title: entity.entityName, // 树节点显示：只显示节点自己的名称
        label: entity.entityPath || entity.entityName, // 选中后显示：完整的层级路径
        key: entity.id!,
        entityType: entity.entityType,
        isCustomer: entity.isCustomer,
        isLeaf: !hasChildren, // 标记是否为叶子节点
      };
      
      // 如果不是只加载第一层，且有子节点，则递归加载子节点数据
      if (!loadFirstLevelOnly && hasChildren) {
        node.children = convertToTreeSelectData(entity.children!);
      }
      
      return node;
    });
  };
  // 只加载第一层数据
  return convertToTreeSelectData(mockLegalEntityTree, true);
});

// 从树结构中递归查找实体（保留children）
function findEntityInTree(entities: LegalEntity[], entityId: number): LegalEntity | undefined {
  for (const entity of entities) {
    if (entity.id === entityId) {
      return entity;
    }
    if (entity.children && entity.children.length > 0) {
      const found = findEntityInTree(entity.children, entityId);
      if (found) return found;
    }
  }
  return undefined;
}

// 懒加载子节点
function loadLegalEntityChildren(treeNode: any) {
  return new Promise<void>((resolve) => {
    // 模拟异步加载（可以替换为真实的API调用）
    setTimeout(() => {
      const entityId = treeNode.value;
      // 从树结构中查找，保留完整的children数据
      const entity = findEntityInTree(mockLegalEntityTree, entityId);
      
      if (entity && entity.children && entity.children.length > 0) {
        // 转换子节点数据
        const children = entity.children.map(child => ({
          value: child.id!,
          title: child.entityName,
          label: child.entityPath || child.entityName,
          key: child.id!,
          entityType: child.entityType,
          isCustomer: child.isCustomer,
          isLeaf: !child.children || child.children.length === 0,
        }));
        
        // 更新节点数据（直接修改dataRef）
        treeNode.dataRef.children = children;
      }
      
      resolve();
    }, 100);
  });
}

// 过滤法人组织选项
function filterLegalEntityTreeNode(input: string, treeNode: any) {
  const searchText = input.toLowerCase();
  const title = (treeNode.title || '').toLowerCase();
  const label = (treeNode.label || '').toLowerCase();
  // 支持搜索节点名称或完整路径
  return title.includes(searchText) || label.includes(searchText);
}

// 从树数据中递归查找节点的label
function findNodeLabel(treeData: any[], value: number): string | undefined {
  for (const node of treeData) {
    if (node.value === value) {
      return node.label || node.title;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeLabel(node.children, value);
      if (found) return found;
    }
  }
  return undefined;
}

// 获取选中节点的完整路径
const selectedLegalEntityLabel = computed(() => {
  const entityId = basicForm.legalEntityId;
  if (!entityId) return '';
  
  // 从原始数据查找，确保总能获取到完整路径
  const entity = findEntityInTree(mockLegalEntityTree, entityId);
  if (entity && entity.entityPath) {
    return entity.entityPath;
  }
  
  // 兜底：从树数据中查找
  const labelFromTree = findNodeLabel(legalEntityTreeData.value, entityId);
  if (labelFromTree) {
    return labelFromTree;
  }
  
  return '';
});

// 自定义TreeSelect显示选中值
function displayLegalEntityRender(labels: string[], selectedOptions: any[]) {
  // 优先使用计算属性获取的完整路径
  if (selectedLegalEntityLabel.value) {
    return selectedLegalEntityLabel.value;
  }
  
  // 如果能从selectedOptions获取label
  if (selectedOptions && selectedOptions.length > 0 && selectedOptions[0].label) {
    return selectedOptions[0].label;
  }
  
  // 兜底方案
  return labels.join(' / ');
}

// 法人组织选择变化
function handleLegalEntityChange(entityId: number | undefined) {
  if (!entityId) {
    basicForm.legalEntityCode = '';
    basicForm.legalEntityName = '';
    basicForm.legalEntityPath = '';
    groupCustomers.value = [];
    return;
  }
  
  const entity = getMockLegalEntityById(entityId);
  if (entity) {
    basicForm.legalEntityCode = entity.entityCode;
    basicForm.legalEntityName = entity.entityName;
    basicForm.legalEntityPath = entity.entityPath || '';
    
    // 获取集团内其他客户
    groupCustomers.value = getMockGroupCustomers(entityId).filter(e => e.id !== customerId.value);
    
    // 自动填充部分信息（如果为空）
    if (!basicForm.customerName && entity.entityName) {
      basicForm.customerName = entity.entityName;
    }
    if (!basicForm.creditCode && entity.creditCode) {
      basicForm.creditCode = entity.creditCode;
    }
    if (!basicForm.registeredCapital && entity.registeredCapital) {
      basicForm.registeredCapital = entity.registeredCapital;
    }
    if (!basicForm.legalRepresentative && entity.legalRepresentative) {
      basicForm.legalRepresentative = entity.legalRepresentative;
    }
    if (!basicForm.address && entity.address) {
      basicForm.address = entity.address;
    }
    if (!basicForm.industry && entity.industry) {
      basicForm.industry = entity.industry;
    }
  }
}

// 查看法人组织详情
function handleViewLegalEntity() {
  if (!basicForm.legalEntityId) return;
  
  router.push({
    name: 'LegalEntityDetail',
    params: { id: basicForm.legalEntityId },
  });
}

// 查看集团内其他客户
function handleViewGroupCustomer(customerId: number) {
  router.push({
    name: 'CustomerArchiveDetail',
    params: { id: customerId },
  });
}

// 表单验证规则
const basicFormRules = {
  customerName: [
    { required: true, message: '请输入客户名称' },
    { max: 100, message: '客户名称不能超过100个字符' },
  ],
  creditCode: [
    {
      validator: (_rule: any, value: string) => {
        if (value && !validateCreditCode(value)) {
          return Promise.reject('请输入正确的统一社会信用代码（18位）');
        }
        return Promise.resolve();
      },
    },
  ],
  level: [{ required: true, message: '请选择客户级别' }],
  status: [{ required: true, message: '请选择客户状态' }],
  responsiblePerson: [{ required: true, message: '请选择客户负责人' }],
  website: [
    {
      type: 'url',
      message: '请输入正确的网址格式',
      trigger: 'blur',
    },
  ],
};

// 统计数据
const statistics = ref<CustomerStatistics>({
  opportunityCount: 0,
  solutionCount: 0,
  contractCount: 0,
  projectCount: 0,
  totalAmount: 0,
  paidAmount: 0,
  paymentRate: 0,
});

// ==================== 内部组织相关 ====================
const organizationTree = ref<OrganizationNode[]>([]);
const selectedOrgNode = ref<OrganizationNode | null>(null);
const orgFormRef = ref<FormInstance>();
const orgForm = reactive({
  departmentName: '',
  phone: '',
  function: '',
});
const isAddingOrg = ref(false);
const editingOrgKey = ref<string | null>(null);

// 添加部门
const handleAddDepartment = (parentNode?: OrganizationNode) => {
  isAddingOrg.value = true;
  editingOrgKey.value = null;
  orgForm.departmentName = '';
  orgForm.phone = '';
  orgForm.function = '';
  
  if (parentNode) {
    selectedOrgNode.value = parentNode;
  }
};

// 选择树节点
const handleSelectOrgNode = (selectedKeys: string[], info: any) => {
  if (selectedKeys.length > 0) {
    selectedOrgNode.value = info.node;
    
    // 填充表单
    orgForm.departmentName = selectedOrgNode.value.departmentName;
    orgForm.phone = selectedOrgNode.value.phone || '';
    orgForm.function = selectedOrgNode.value.function || '';
    
    isAddingOrg.value = false;
    editingOrgKey.value = selectedKeys[0];
  }
};

// 保存部门
const handleSaveOrg = async () => {
  try {
    await orgFormRef.value?.validate();
    
    if (isAddingOrg.value) {
      // 添加新部门
      const newNode: OrganizationNode = {
        id: Date.now(),
        key: `${Date.now()}`,
        title: orgForm.departmentName,
        departmentName: orgForm.departmentName,
        parentId: selectedOrgNode.value?.id,
        phone: orgForm.phone,
        function: orgForm.function,
      };
      
      if (selectedOrgNode.value) {
        // 添加到选中节点的子节点
        if (!selectedOrgNode.value.children) {
          selectedOrgNode.value.children = [];
        }
        selectedOrgNode.value.children.push(newNode);
      } else {
        // 添加为根节点
        organizationTree.value.push(newNode);
      }
      
      message.success('部门添加成功');
    } else {
      // 编辑部门
      if (selectedOrgNode.value) {
        selectedOrgNode.value.departmentName = orgForm.departmentName;
        selectedOrgNode.value.title = orgForm.departmentName;
        selectedOrgNode.value.phone = orgForm.phone;
        selectedOrgNode.value.function = orgForm.function;
      }
      message.success('部门信息已保存');
    }
    
    isAddingOrg.value = false;
    editingOrgKey.value = null;
  } catch (error) {
    message.error('请检查表单填写');
  }
};

// 删除部门
const handleDeleteOrg = (node: OrganizationNode) => {
  // 检查是否有关联联系人
  const hasContacts = contactList.value.some(contact => contact.departmentId === node.id);
  if (hasContacts) {
    message.error('该部门有关联联系人，无法删除');
    return;
  }
  
  // 递归删除节点
  const deleteNode = (tree: OrganizationNode[], targetKey: string): boolean => {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].key === targetKey) {
        tree.splice(i, 1);
        return true;
      }
      if (tree[i].children) {
        if (deleteNode(tree[i].children!, targetKey)) {
          return true;
        }
      }
    }
    return false;
  };
  
  deleteNode(organizationTree.value, node.key);
  message.success('部门删除成功');
  
  // 清空表单
  selectedOrgNode.value = null;
  isAddingOrg.value = false;
  editingOrgKey.value = null;
};


// ==================== 联系人相关 ====================
const contactList = ref<ContactPerson[]>([]);
const contactModalVisible = ref(false);
const contactFormRef = ref<FormInstance>();
const contactForm = reactive<ContactPerson>({
  customerId: customerId.value || 0,
  name: '',
  gender: Gender.Male,
  position: '',
  departmentId: undefined,
  departmentName: '',
  mobile: '',
  email: '',
  telephone: '',
  wechat: '',
  isPrimary: false,
  remark: '',
});
const editingContactId = ref<number | null>(null);

const contactFormRules = {
  name: [
    { required: true, message: '请输入联系人姓名' },
    { max: 30, message: '姓名不能超过30个字符' },
  ],
  mobile: [
    {
      validator: (_rule: any, value: string) => {
        if (value && !validatePhone(value)) {
          return Promise.reject('请输入正确的手机号格式');
        }
        return Promise.resolve();
      },
    },
  ],
  email: [
    {
      validator: (_rule: any, value: string) => {
        if (value && !validateEmail(value)) {
          return Promise.reject('请输入正确的邮箱格式');
        }
        return Promise.resolve();
      },
    },
  ],
};

// 获取当前选中部门的联系人列表
const currentDepartmentContacts = computed(() => {
  if (!selectedOrgNode.value) return [];
  return contactList.value.filter(
    contact => contact.departmentId === selectedOrgNode.value!.id
  );
});

// 部门联系人表格列（移除"所属部门"列）
const departmentContactColumns: TableColumnsType<ContactPerson> = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '职位', dataIndex: 'position', key: 'position', width: 120 },
  {
    title: '手机号',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 130,
    customRender: ({ text }) => (text ? maskPhone(text) : '-'),
  },
  {
    title: '主要',
    dataIndex: 'isPrimary',
    key: 'isPrimary',
    width: 60,
    align: 'center',
    customRender: ({ text }) => (text ? h('span', { style: { color: '#faad14', fontSize: '16px' } }, '★') : ''),
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    customRender: ({ record }) => {
      if (!isEditMode.value) return null;
      return h(Space, { size: 'small' }, () => [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEditContact(record),
        }, () => '编辑'),
        h(Popconfirm, {
          title: '确定要删除该联系人吗？',
          onConfirm: () => handleDeleteContact(record.id!),
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

// 添加联系人
const handleAddContact = () => {
  if (!selectedOrgNode.value) {
    message.warning('请先选择一个部门');
    return;
  }
  
  editingContactId.value = null;
  Object.assign(contactForm, {
    customerId: customerId.value || 0,
    name: '',
    gender: Gender.Male,
    position: '',
    departmentId: selectedOrgNode.value.id,
    departmentName: selectedOrgNode.value.departmentName,
    mobile: '',
    email: '',
    telephone: '',
    wechat: '',
    isPrimary: false,
    remark: '',
  });
  contactModalVisible.value = true;
};

// 编辑联系人
const handleEditContact = (record: ContactPerson) => {
  editingContactId.value = record.id!;
  Object.assign(contactForm, record);
  contactModalVisible.value = true;
};

// 保存联系人
const handleSaveContact = async () => {
  try {
    await contactFormRef.value?.validate();
    
    // 确保有部门ID
    if (!contactForm.departmentId) {
      message.error('联系人必须关联部门');
      return;
    }
    
    if (editingContactId.value) {
      // 编辑
      const index = contactList.value.findIndex(c => c.id === editingContactId.value);
      if (index > -1) {
        contactList.value[index] = { ...contactForm };
      }
      message.success('联系人信息已更新');
    } else {
      // 新增
      contactList.value.push({
        ...contactForm,
        id: Date.now(),
        createTime: new Date().toLocaleString('zh-CN'),
      });
      message.success('联系人添加成功');
    }
    
    contactModalVisible.value = false;
  } catch (error) {
    message.error('请检查表单填写');
  }
};

// 删除联系人
const handleDeleteContact = (id: number) => {
  const index = contactList.value.findIndex(c => c.id === id);
  if (index > -1) {
    contactList.value.splice(index, 1);
    message.success('联系人删除成功');
  }
};


// ==================== 业务历史相关 ====================
const businessHistoryList = ref<BusinessHistory[]>([]);
const historyFilter = reactive({
  businessType: undefined as BusinessType | undefined,
  timeRange: '全部',
});

// 时间范围选项
const timeRangeOptions = ['最近一月', '最近三月', '最近半年', '最近一年', '全部'];

// 过滤后的业务历史
const filteredBusinessHistory = computed(() => {
  let result = [...businessHistoryList.value];
  
  // 按业务类型筛选
  if (historyFilter.businessType) {
    result = result.filter(item => item.businessType === historyFilter.businessType);
  }
  
  // 按时间范围筛选
  const startDate = getTimeRangeStart(historyFilter.timeRange);
  if (startDate) {
    result = result.filter(item => new Date(item.businessTime) >= startDate);
  }
  
  // 按时间倒序排列
  return result.sort((a, b) => new Date(b.businessTime).getTime() - new Date(a.businessTime).getTime());
});

// 业务历史表格列
const businessHistoryColumns: TableColumnsType<BusinessHistory> = [
  {
    title: '业务时间',
    dataIndex: 'businessTime',
    key: 'businessTime',
    width: 180,
    customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm'),
  },
  {
    title: '业务类型',
    dataIndex: 'businessType',
    key: 'businessType',
    width: 100,
    customRender: ({ record }) => h(Tag, {
      color: businessTypeMap[record.businessType]?.color,
    }, () => businessTypeMap[record.businessType]?.text),
  },
  {
    title: '业务名称',
    dataIndex: 'businessName',
    key: 'businessName',
    width: 200,
  },
  {
    title: '业务编号',
    dataIndex: 'businessCode',
    key: 'businessCode',
    width: 150,
    customRender: ({ text }) => text || '-',
  },
  {
    title: '业务金额',
    dataIndex: 'businessAmount',
    key: 'businessAmount',
    width: 120,
    align: 'right',
    customRender: ({ text }) => text ? formatCurrency(text) : '-',
  },
  {
    title: '业务状态',
    dataIndex: 'businessStatus',
    key: 'businessStatus',
    width: 100,
    customRender: ({ text }) => text || '-',
  },
  {
    title: '操作人',
    dataIndex: 'operator',
    key: 'operator',
    width: 100,
    customRender: ({ text }) => text || '-',
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right',
    customRender: ({ record }) => {
      if (record.businessType === BusinessType.Created) return null;
      return h(Button, {
        type: 'link',
        size: 'small',
        onClick: () => handleViewBusinessDetail(record),
      }, () => '查看详情');
    },
  },
];

// 跳转到业务详情
const handleViewBusinessDetail = (record: BusinessHistory) => {
  if (record.businessType === BusinessType.Created) {
    return;
  }
  
  // 根据业务类型跳转到对应页面
  const routeMap: Record<BusinessType, string> = {
    [BusinessType.Opportunity]: '/market-customers/opportunities',
    [BusinessType.Solution]: '/product-solutions/customer/detail',
    [BusinessType.Contract]: '/market-customers/contract',
    [BusinessType.Project]: '/project-implementation/ledger',
    [BusinessType.Created]: '',
  };
  
  const path = routeMap[record.businessType];
  if (path && record.businessId) {
    router.push(`${path}/${record.businessId}`);
  }
};

// ==================== 页面操作 ====================

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

// 取消编辑
const handleCancelEdit = () => {
  isEditMode.value = false;
  // 如果是新建模式，返回列表
  if (!customerId.value) {
    handleBack();
  }
};

// 编辑模式切换
const handleEdit = () => {
  isEditMode.value = true;
};

// 删除客户
const handleDelete = () => {
  Modal.confirm({
    title: '确定要删除该客户吗？',
    content: '删除后不可恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // TODO: 调用删除API
      message.success('删除成功');
      router.push('/market-customers/archives');
    },
  });
};

// 返回列表
const handleBack = () => {
  router.push('/market-customers/archives');
};

// 初始化加载数据
const loadData = () => {
  if (customerId.value) {
    // TODO: 从API加载数据
    // 这里使用Mock数据
    // 模拟加载客户基本信息
    const mockCustomer = {
      id: 1,
      customerCode: 'CUS-20240615-001',
      customerName: 'XX科技有限公司',
      customerShortName: 'XX科技',
      creditCode: '91110000MA01234567',
      registeredCapital: '5000万元',
      industry: '智能制造',
      region: '北京',
      level: CustomerLevel.Key,
      status: CustomerStatus.Cooperating,
      establishDate: '2015-03-15',
      legalRepresentative: '张某某',
      website: 'www.xxtech.com',
      responsiblePerson: '张三',
      address: '北京市海淀区中关村软件园XX号楼',
      tags: ['智能制造', '工业互联网', '国企客户', '重点关注'],
      introduction: 'XX科技是一家专注于智能制造领域的高新技术企业，主要从事工业自动化、智能制造系统集成等业务。',
    };
    
    Object.assign(basicForm, mockCustomer);
    
    // 模拟统计数据
    statistics.value = {
      opportunityCount: 5,
      solutionCount: 3,
      contractCount: 2,
      projectCount: 1,
      totalAmount: 2000000,
      paidAmount: 1500000,
      paymentRate: 75,
    };
    
    // 模拟内部组织数据
    organizationTree.value = [
      {
        id: 1,
        key: '1',
        title: 'XX科技有限公司',
        departmentName: 'XX科技有限公司',
        children: [
          {
            id: 2,
            key: '1-1',
            title: '总经办',
            departmentName: '总经办',
            parentId: 1,
            responsiblePerson: '张经理',
            phone: '010-12345678',
            function: '公司综合管理、行政事务',
          },
          {
            id: 3,
            key: '1-2',
            title: '市场部',
            departmentName: '市场部',
            parentId: 1,
            children: [
              { id: 4, key: '1-2-1', title: '销售一部', departmentName: '销售一部', parentId: 3 },
              { id: 5, key: '1-2-2', title: '销售二部', departmentName: '销售二部', parentId: 3 },
            ],
          },
          {
            id: 6,
            key: '1-3',
            title: '技术部',
            departmentName: '技术部',
            parentId: 1,
            children: [
              { id: 7, key: '1-3-1', title: '研发组', departmentName: '研发组', parentId: 6 },
              { id: 8, key: '1-3-2', title: '测试组', departmentName: '测试组', parentId: 6 },
            ],
          },
          { id: 9, key: '1-4', title: '财务部', departmentName: '财务部', parentId: 1 },
        ],
      },
    ];
    
    // 模拟联系人数据
    contactList.value = [
      {
        id: 1,
        customerId: 1,
        name: '张经理',
        gender: Gender.Male,
        position: '总经理',
        departmentId: 2,
        departmentName: '总经办',
        mobile: '13800138000',
        email: 'zhang@xxtech.com',
        telephone: '010-12345678',
        isPrimary: true,
        createTime: '2024-06-15 10:30:00',
      },
      {
        id: 2,
        customerId: 1,
        name: '李部长',
        gender: Gender.Male,
        position: '市场部长',
        departmentId: 3,
        departmentName: '市场部',
        mobile: '13800138001',
        email: 'li@xxtech.com',
        isPrimary: false,
        createTime: '2024-06-16 14:20:00',
      },
      {
        id: 3,
        customerId: 1,
        name: '王主管',
        gender: Gender.Female,
        position: '销售主管',
        departmentId: 4,
        departmentName: '销售一部',
        mobile: '13800138002',
        isPrimary: false,
        createTime: '2024-06-17 09:15:00',
      },
    ];
    
    // 模拟业务历史数据
    businessHistoryList.value = [
      {
        id: 1,
        customerId: 1,
        businessType: BusinessType.Project,
        businessId: 1,
        businessCode: 'PRJ-2024-001',
        businessName: 'XX科技智慧工厂项目',
        businessAmount: 2000000,
        businessStatus: '实施中',
        businessTime: '2024-11-05 09:00:00',
        operator: '张三',
      },
      {
        id: 2,
        customerId: 1,
        businessType: BusinessType.Contract,
        businessId: 1,
        businessCode: 'HT-2024-001',
        businessName: '销售合同',
        businessAmount: 2000000,
        businessStatus: '已签订',
        businessTime: '2024-10-15 14:30:00',
        operator: '张三',
      },
      {
        id: 3,
        customerId: 1,
        businessType: BusinessType.Solution,
        businessId: 1,
        businessCode: 'CS-20241101-001',
        businessName: '智慧工厂整体解决方案',
        businessAmount: 2000000,
        businessStatus: '已发布',
        businessTime: '2024-09-20 10:15:00',
        operator: '张三',
      },
      {
        id: 4,
        customerId: 1,
        businessType: BusinessType.Opportunity,
        businessId: 1,
        businessCode: 'OPP-2024-001',
        businessName: 'XX科技智慧工厂需求',
        businessAmount: 2000000,
        businessStatus: '方案阶段',
        businessTime: '2024-08-10 15:00:00',
        operator: '张三',
      },
      {
        id: 5,
        customerId: 1,
        businessType: BusinessType.Opportunity,
        businessId: 1,
        businessCode: 'OPP-2024-001',
        businessName: 'XX科技智慧工厂需求',
        businessAmount: 2000000,
        businessStatus: '商机创建',
        businessTime: '2024-07-05 11:20:00',
        operator: '张三',
        remark: '客户来源：客户主动咨询',
      },

    ];
  }
};

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    customerId.value = Number(newId);
    isEditMode.value = route.query.mode === 'edit';
    activeTab.value = 'basic';
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
            {{ basicForm.customerName || (customerId ? '客户详情' : '新建客户') }}
          </h1>
          <p class="text-gray-500 mt-1">
            客户编号: {{ basicForm.customerCode }}
            <Tag v-if="customerId && customerLevelMap[basicForm.level]" :color="customerLevelMap[basicForm.level]?.color" class="ml-2">
              {{ customerLevelMap[basicForm.level]?.text }}
            </Tag>
            <Tag v-if="customerId && customerStatusMap[basicForm.status]" :color="customerStatusMap[basicForm.status]?.color" class="ml-2">
              {{ customerStatusMap[basicForm.status]?.text }}
            </Tag>
          </p>
        </div>
      </div>
      <Space>
        <Button
          v-if="!isEditMode && customerId"
          type="primary"
          @click="handleEdit"
        >
          编辑
        </Button>
        <Button
          v-if="!isEditMode && customerId"
          danger
          @click="handleDelete"
        >
          删除
        </Button>
        <Button v-if="isEditMode" @click="handleCancelEdit"> 取消 </Button>
      </Space>
    </div>

    <!-- 业务统计 -->
    <Card v-if="customerId" size="small" class="mb-3">
      <div class="flex">
        <div class="flex-1 text-center px-4 py-2">
          <div class="text-gray-500 mb-2">商机</div>
          <div class="text-2xl font-semibold">{{ statistics.opportunityCount }}<span class="text-sm text-gray-400 ml-1">个</span></div>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 text-center px-4 py-2">
          <div class="text-gray-500 mb-2">方案</div>
          <div class="text-2xl font-semibold">{{ statistics.solutionCount }}<span class="text-sm text-gray-400 ml-1">个</span></div>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 text-center px-4 py-2">
          <div class="text-gray-500 mb-2">合同</div>
          <div class="text-2xl font-semibold">{{ statistics.contractCount }}<span class="text-sm text-gray-400 ml-1">个</span></div>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 text-center px-4 py-2">
          <div class="text-gray-500 mb-2">项目</div>
          <div class="text-2xl font-semibold">{{ statistics.projectCount }}<span class="text-sm text-gray-400 ml-1">个</span></div>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 text-center px-4 py-2">
          <div class="text-gray-500 mb-2">成交额</div>
          <div class="text-2xl font-semibold text-red-600">{{ (statistics.totalAmount / 10000).toFixed(2) }}<span class="text-sm text-gray-400 ml-1">万</span></div>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 text-center px-4 py-2">
          <div class="text-gray-500 mb-2">回款额</div>
          <div class="text-2xl font-semibold text-green-600">{{ ((statistics.paidAmount || 0) / 10000).toFixed(2) }}<span class="text-sm text-gray-400 ml-1">万</span></div>
        </div>
        <div class="border-l border-gray-200"></div>
        <div class="flex-1 text-center px-4 py-2">
          <div class="text-gray-500 mb-2">回款率</div>
          <div class="text-2xl font-semibold">{{ statistics.paymentRate }}%</div>
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
                <!-- 第一行：客户编号 和 关联法人组织 -->
                <Col :span="12">
                  <Form.Item label="客户编号" name="customerCode">
                    <Input v-model:value="basicForm.customerCode" disabled />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="关联法人组织" name="legalEntityId">
                    <div v-if="!isEditMode && basicForm.legalEntityPath" class="flex items-center gap-2">
                      <Tag color="blue" class="text-sm">
                        <Icon icon="lucide:building-2" class="mr-1" />
                        {{ basicForm.legalEntityPath }}
                      </Tag>
                      <Button type="link" size="small" @click="handleViewLegalEntity">
                        查看组织详情
                      </Button>
                      <span v-if="groupCustomers.length > 0" class="text-sm text-gray-500">
                        | 集团内其他客户（{{ groupCustomers.length }}个）：
                        <template v-for="(customer, index) in groupCustomers.slice(0, 3)" :key="customer.id">
                          <Button type="link" size="small" @click="handleViewGroupCustomer(customer.id!)">
                            {{ customer.entityName }}
                          </Button>
                          <span v-if="index < Math.min(groupCustomers.length, 3) - 1">, </span>
                        </template>
                        <Button v-if="groupCustomers.length > 3" type="link" size="small">
                          ...更多
                        </Button>
                      </span>
                    </div>
                    <TreeSelect
                      v-else
                      :key="`tree-select-${basicForm.legalEntityId}`"
                      v-model:value="basicForm.legalEntityId"
                      :tree-data="legalEntityTreeData"
                      :load-data="loadLegalEntityChildren"
                      :field-names="{ label: 'label', value: 'value', children: 'children' }"
                      placeholder="请选择法人组织（可选）"
                      allow-clear
                      show-search
                      :filter-tree-node="filterLegalEntityTreeNode"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      @change="handleLegalEntityChange"
                    >
                      <template #title="node">
                        {{ node.title }}
                      </template>
                    </TreeSelect>
                    <div v-if="selectedLegalEntityLabel && isEditMode" class="text-xs text-gray-500 mt-1">
                      {{ selectedLegalEntityLabel }}
                    </div>
                  </Form.Item>
                </Col>
                
                <!-- 与法人组织一致的字段，按顺序排列 -->
                <Col :span="12">
                  <Form.Item label="客户名称" name="customerName">
                    <Input
                      v-model:value="basicForm.customerName"
                      placeholder="请输入客户名称"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="客户简称" name="customerShortName">
                    <Input
                      v-model:value="basicForm.customerShortName"
                      placeholder="请输入客户简称"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="统一社会信用代码" name="creditCode">
                    <Input
                      v-model:value="basicForm.creditCode"
                      placeholder="请输入统一社会信用代码"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="法定代表人" name="legalRepresentative">
                    <Input
                      v-model:value="basicForm.legalRepresentative"
                      placeholder="请输入法定代表人"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="注册资本" name="registeredCapital">
                    <Input
                      v-model:value="basicForm.registeredCapital"
                      placeholder="请输入注册资本"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="成立日期" name="establishDate">
                    <DatePicker
                      v-model:value="basicForm.establishDate"
                      placeholder="请选择成立日期"
                      style="width: 100%"
                      value-format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="所属行业" name="industry">
                    <Select
                      v-model:value="basicForm.industry"
                      placeholder="请选择行业"
                      allow-clear
                    >
                      <Select.Option v-for="industry in industryOptions" :key="industry" :value="industry">
                        {{ industry }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="公司地址" name="address">
                    <Input
                      v-model:value="basicForm.address"
                      placeholder="请输入公司地址"
                    />
                  </Form.Item>
                </Col>
                
                <!-- 客户特有字段 -->
                <Col :span="12">
                  <Form.Item label="客户地区" name="region">
                    <Select
                      v-model:value="basicForm.region"
                      placeholder="请选择地区"
                      allow-clear
                    >
                      <Select.Option v-for="region in regionOptions" :key="region" :value="region">
                        {{ region }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="企业网站" name="website">
                    <Input
                      v-model:value="basicForm.website"
                      placeholder="请输入企业网站"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="客户级别" name="level">
                    <Select v-model:value="basicForm.level" placeholder="请选择客户级别">
                      <Select.Option :value="CustomerLevel.Key">重点客户</Select.Option>
                      <Select.Option :value="CustomerLevel.Normal">普通客户</Select.Option>
                      <Select.Option :value="CustomerLevel.Potential">潜在客户</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="客户状态" name="status">
                    <Select v-model:value="basicForm.status" placeholder="请选择客户状态">
                      <Select.Option :value="CustomerStatus.Potential">潜在客户</Select.Option>
                      <Select.Option :value="CustomerStatus.Intention">意向客户</Select.Option>
                      <Select.Option :value="CustomerStatus.Cooperating">合作中</Select.Option>
                      <Select.Option :value="CustomerStatus.Lost">已流失</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="客户负责人" name="responsiblePerson">
                    <Select
                      v-model:value="basicForm.responsiblePerson"
                      placeholder="请选择负责人"
                    >
                      <Select.Option v-for="emp in employeeOptions" :key="emp.id" :value="emp.name">
                        {{ emp.name }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="24">
                  <Form.Item label="客户标签" name="tags" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
                    <Select
                      v-model:value="basicForm.tags"
                      mode="tags"
                      placeholder="请输入或选择标签"
                      :options="[
                        { label: '智能制造', value: '智能制造' },
                        { label: '工业互联网', value: '工业互联网' },
                        { label: '国企客户', value: '国企客户' },
                        { label: '重点关注', value: '重点关注' },
                        { label: '大型企业', value: '大型企业' },
                      ]"
                    />
                  </Form.Item>
                </Col>
                <Col :span="24">
                  <Form.Item label="客户简介" name="introduction" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
                    <Textarea
                      v-model:value="basicForm.introduction"
                      placeholder="请输入客户简介"
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
                <Button type="primary" @click="handleSaveBasic">保存</Button>
              </Space>
            </div>
          </Form>
        </Tabs.TabPane>

        <!-- 内部组织及联系人标签页 -->
        <Tabs.TabPane key="organization" tab="内部组织及联系人">

          <div class="flex gap-4" style="height: 600px;">
            <!-- 左侧：内部组织树 -->
            <div style="width: 300px; border: 1px solid #f0f0f0; padding: 16px; overflow-y: auto;">
              <Tree
                v-if="organizationTree.length > 0"
                :tree-data="organizationTree"
                :show-line="true"
                :selectable="true"
                @select="handleSelectOrgNode"
              >
                <template #title="{ title, dataRef }">
                  <div class="flex items-center justify-between group">
                    <span>{{ title }}</span>
                    <Space v-if="isEditMode" size="small" class="opacity-0 group-hover:opacity-100">
                      <Button
                        type="link"
                        size="small"
                        @click.stop="handleAddDepartment(dataRef)"
                      >
                        ⊕
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        @click.stop="handleDeleteOrg(dataRef)"
                      >
                        ✕
                      </Button>
                    </Space>
                  </div>
                </template>
              </Tree>
              <div v-else class="text-center text-gray-400 py-8">
                暂无内部组织数据
              </div>
            </div>

            <!-- 右侧：部门详情 -->
            <div class="flex-1" style="border: 1px solid #f0f0f0; padding: 16px; overflow-y: auto;">
              <div v-if="isAddingOrg || editingOrgKey">
                <!-- 标题和操作按钮 -->
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold m-0">{{ isAddingOrg ? '添加部门' : '部门详情' }}</h3>
                  <Space v-if="isEditMode">
                    <Button size="small" @click="isAddingOrg = false; editingOrgKey = null">取消</Button>
                    <Button type="primary" size="small" @click="handleSaveOrg">保存</Button>
                  </Space>
                </div>
                
                <Form
                  ref="orgFormRef"
                  :model="orgForm"
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 18 }"
                  :disabled="!isEditMode"
                >
                  <Row :gutter="16">
                    <Col :span="12">
                      <Form.Item
                        label="部门名称"
                        name="departmentName"
                        :rules="[{ required: true, message: '请输入部门名称' }]"
                      >
                        <Input v-model:value="orgForm.departmentName" placeholder="请输入部门名称" />
                      </Form.Item>
                    </Col>
                    <Col :span="12">
                      <Form.Item label="部门电话" name="phone">
                        <Input v-model:value="orgForm.phone" placeholder="请输入部门电话" />
                      </Form.Item>
                    </Col>
                    <Col :span="24">
                      <Form.Item label="部门职能" name="function" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
                        <Textarea
                          v-model:value="orgForm.function"
                          placeholder="请输入部门职能"
                          :rows="3"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
                
                <!-- 部门联系人列表 -->
                <Divider>部门联系人</Divider>
                <div class="mb-3">
                  <Button v-if="isEditMode" type="primary" size="small" @click="handleAddContact">
                    + 添加联系人
                  </Button>
                </div>
                <Table
                  :columns="departmentContactColumns"
                  :data-source="currentDepartmentContacts"
                  :pagination="false"
                  :scroll="{ x: 600 }"
                  size="small"
                />
              </div>
              <div v-else class="empty-detail text-center text-gray-400">
                <Icon icon="lucide:mouse-pointer-click" class="text-6xl mb-4" />
                <p class="text-lg">请从左侧选择一个部门</p>
              </div>
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 业务历史标签页 -->
        <Tabs.TabPane key="history" tab="业务历史">
          <div class="mb-4">
            <Space>
              <span>业务类型：</span>
              <Select
                v-model:value="historyFilter.businessType"
                placeholder="全部"
                allow-clear
                style="width: 150px"
              >
                <Select.Option :value="BusinessType.Opportunity">商机</Select.Option>
                <Select.Option :value="BusinessType.Solution">方案</Select.Option>
                <Select.Option :value="BusinessType.Contract">合同</Select.Option>
                <Select.Option :value="BusinessType.Project">项目</Select.Option>
              </Select>
              <span class="ml-4">时间范围：</span>
              <Select
                v-model:value="historyFilter.timeRange"
                style="width: 150px"
              >
                <Select.Option v-for="range in timeRangeOptions" :key="range" :value="range">
                  {{ range }}
                </Select.Option>
              </Select>
            </Space>
          </div>

          <!-- 业务历史表格 -->
          <Table
            :columns="businessHistoryColumns"
            :data-source="filteredBusinessHistory"
            :pagination="{ pageSize: 20 }"
            :scroll="{ x: 1200 }"
          />
        </Tabs.TabPane>
      </Tabs>
    </Card>

    <!-- 添加/编辑联系人弹框 -->
    <Modal
      v-model:open="contactModalVisible"
      :title="editingContactId ? '编辑联系人' : '添加联系人'"
      :width="600"
      @ok="handleSaveContact"
      @cancel="contactModalVisible = false"
    >
      <Form
        ref="contactFormRef"
        :model="contactForm"
        :rules="contactFormRules"
        :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }"
      >
        <Form.Item label="姓名（必填）" name="name">
          <Input v-model:value="contactForm.name" placeholder="请输入联系人姓名" />
        </Form.Item>
        <Form.Item label="性别" name="gender">
          <Radio.Group v-model:value="contactForm.gender">
            <Radio :value="Gender.Male">男</Radio>
            <Radio :value="Gender.Female">女</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="职位" name="position">
          <Input v-model:value="contactForm.position" placeholder="请输入职位" />
        </Form.Item>
        <Form.Item label="手机号" name="mobile">
          <Input v-model:value="contactForm.mobile" placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item label="邮箱" name="email">
          <Input v-model:value="contactForm.email" placeholder="请输入邮箱地址" />
        </Form.Item>
        <Form.Item label="固定电话" name="telephone">
          <Input v-model:value="contactForm.telephone" placeholder="请输入固定电话" />
        </Form.Item>
        <Form.Item label="微信号" name="wechat">
          <Input v-model:value="contactForm.wechat" placeholder="请输入微信号" />
        </Form.Item>
        <Form.Item label="主要联系人" name="isPrimary">
          <label><input type="checkbox" v-model="contactForm.isPrimary" /> 设为主要联系人</label>
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Textarea v-model:value="contactForm.remark" placeholder="请输入备注" :rows="3" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
:deep(.ant-table-cell) {
  padding: 12px 8px;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}
</style>

