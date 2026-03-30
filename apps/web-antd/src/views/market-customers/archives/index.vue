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
import type { FormInstance, TableColumnsType, TableProps } from 'ant-design-vue';
import type { CustomerProfile, SearchForm } from './types';
import { CustomerLevel, CustomerStatus } from './types';
import {
  generateCustomerCode,
  getCustomerLevelMap,
  getCustomerStatusMap,
} from './utils';
// 导入法人组织相关
import { getMockLegalEntityById } from '../legal-entities/mock';

defineOptions({
  name: 'CustomerArchives',
});

const router = useRouter();

// 客户级别映射
const customerLevelMap = getCustomerLevelMap();

// 客户状态映射
const customerStatusMap = getCustomerStatusMap();

// 搜索表单
const searchForm = reactive<SearchForm>({
  keyword: '', // 合并客户名称和编号为关键字
  industry: undefined,
  level: undefined,
  status: undefined,
});

// 表格加载状态
const loading = ref(false);

// 选中的行
const selectedRowKeys = ref<number[]>([]);

// 新建客户弹框
const createModalVisible = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive({
  customerName: '',
  customerShortName: '',
  creditCode: '',
});
const createFormRules = {
  customerName: [
    { required: true, message: '请输入客户名称' },
    { max: 100, message: '客户名称不能超过100个字符' },
  ],
  customerShortName: [
    { max: 50, message: '客户简称不能超过50个字符' },
  ],
  creditCode: [
    { len: 18, message: '统一社会信用代码应为18位', trigger: 'blur' },
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '统一社会信用代码格式不正确', trigger: 'blur' },
  ],
};

// 行业选项
const industryOptions = [
  '智能制造',
  '制造业',
  '汽车制造',
  '电子制造',
  '机械制造',
  '钢铁',
  '化工',
  '食品制造',
  '纺织',
  '医药',
  '光电',
  '精密制造',
  '物流',
  '商贸',
  '金融',
  '教育',
  '高科技',
  '互联网',
  '其他',
];

// 地区选项
const regionOptions = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '南京',
  '苏州',
  '武汉',
  '成都',
  '重庆',
  '天津',
  '西安',
  '郑州',
  '济南',
  '青岛',
  '大连',
  '沈阳',
  '长沙',
  '福州',
  '厦门',
  '其他',
];

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

// Mock 数据 - 与客户方案模块保持一致
const mockData: CustomerProfile[] = [
  {
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
    createByName: '张三',
    createTime: '2024-06-15 10:30:00',
    updateByName: '张三',
    updateTime: '2024-11-05 14:20:00',
  },
  {
    id: 2,
    customerCode: 'CUS-20240720-001',
    customerName: 'YY制造集团',
    customerShortName: 'YY集团',
    creditCode: '91310000MA02345678',
    registeredCapital: '10000万元',
    industry: '制造业',
    region: '上海',
    level: CustomerLevel.Key,
    status: CustomerStatus.Cooperating,
    establishDate: '2010-05-20',
    legalRepresentative: '李某某',
    website: 'www.yygroup.com',
    responsiblePerson: '李四',
    address: '上海市浦东新区张江高科技园区XX路XX号',
    tags: ['大型企业', 'MES系统', '长期合作'],
    introduction: 'YY制造集团是一家综合性制造企业，业务涵盖机械制造、电子产品等多个领域。',
    createByName: '李四',
    createTime: '2024-07-20 09:15:00',
    updateByName: '李四',
    updateTime: '2024-11-06 16:30:00',
  },
  {
    id: 3,
    customerCode: 'CUS-20240528-001',
    customerName: 'ZZ集团有限公司',
    customerShortName: 'ZZ集团',
    creditCode: '91440000MA03456789',
    registeredCapital: '20000万元',
    industry: '智能制造',
    region: '广州',
    level: CustomerLevel.Key,
    status: CustomerStatus.Cooperating,
    establishDate: '2008-08-10',
    legalRepresentative: '王某某',
    website: 'www.zzgroup.com',
    responsiblePerson: '王五',
    address: '广州市天河区珠江新城XX大厦',
    tags: ['物联网', '大数据', '上市公司'],
    introduction: 'ZZ集团是一家上市公司，专注于工业物联网平台建设和智能制造解决方案。',
    createByName: '王五',
    createTime: '2024-05-28 14:00:00',
    updateByName: '王五',
    updateTime: '2024-11-03 10:45:00',
  },
  {
    id: 4,
    customerCode: 'CUS-20240703-001',
    customerName: 'AA汽车配件',
    customerShortName: 'AA配件',
    creditCode: '91440000MA04567890',
    registeredCapital: '3000万元',
    industry: '汽车制造',
    region: '深圳',
    level: CustomerLevel.Normal,
    status: CustomerStatus.Intention,
    establishDate: '2018-03-25',
    legalRepresentative: '赵某某',
    website: 'www.aaparts.com',
    responsiblePerson: '赵六',
    address: '深圳市宝安区XX工业园',
    tags: ['汽车配件', '数字化转型'],
    introduction: 'AA汽车配件专业从事汽车零部件生产，正在进行数字化车间改造。',
    createByName: '赵六',
    createTime: '2024-07-03 11:20:00',
    updateByName: '赵六',
    updateTime: '2024-11-04 15:10:00',
  },
  {
    id: 5,
    customerCode: 'CUS-20240630-001',
    customerName: 'BB电子科技',
    customerShortName: 'BB科技',
    creditCode: '91330000MA05678901',
    registeredCapital: '8000万元',
    industry: '电子制造',
    region: '杭州',
    level: CustomerLevel.Normal,
    status: CustomerStatus.Cooperating,
    establishDate: '2012-06-15',
    legalRepresentative: '孙某某',
    website: 'www.bbtech.com',
    responsiblePerson: '孙七',
    address: '杭州市滨江区高新技术开发区XX路',
    tags: ['电子制造', 'ERP', 'MES'],
    introduction: 'BB电子科技从事电子产品研发和制造，已实施ERP和MES系统。',
    createByName: '李四',
    createTime: '2024-06-30 09:00:00',
    updateByName: '李四',
    updateTime: '2024-11-02 11:25:00',
  },
  {
    id: 6,
    customerCode: 'CUS-20240704-001',
    customerName: 'CC重工机械',
    customerShortName: 'CC重工',
    creditCode: '91320000MA06789012',
    registeredCapital: '15000万元',
    industry: '机械制造',
    region: '南京',
    level: CustomerLevel.Key,
    status: CustomerStatus.Cooperating,
    establishDate: '2005-11-20',
    legalRepresentative: '周某某',
    website: 'www.ccheavy.com',
    responsiblePerson: '周八',
    address: '南京市江宁区XX工业园',
    tags: ['重工机械', '设备维护', 'AI应用'],
    introduction: 'CC重工机械是大型机械制造企业，正在部署AI设备预测性维护系统。',
    createByName: '周八',
    createTime: '2024-07-04 13:30:00',
    updateByName: '周八',
    updateTime: '2024-11-05 09:15:00',
  },
  {
    id: 7,
    customerCode: 'CUS-20240625-001',
    customerName: 'DD化工集团',
    customerShortName: 'DD化工',
    creditCode: '91370000MA07890123',
    registeredCapital: '25000万元',
    industry: '化工',
    region: '济南',
    level: CustomerLevel.Key,
    status: CustomerStatus.Cooperating,
    establishDate: '2000-01-10',
    legalRepresentative: '吴某某',
    website: 'www.ddchem.com',
    responsiblePerson: '吴九',
    address: '济南市高新区XX化工园',
    tags: ['化工', '能源管理', '安全生产'],
    introduction: 'DD化工集团是国内知名化工企业，重视生产安全和能源管理。',
    createByName: '吴九',
    createTime: '2024-06-25 10:45:00',
    updateByName: '吴九',
    updateTime: '2024-10-31 14:50:00',
  },
  {
    id: 8,
    customerCode: 'CUS-20241005-001',
    customerName: 'EE食品有限公司',
    customerShortName: 'EE食品',
    creditCode: '91330000MA08901234',
    registeredCapital: '6000万元',
    industry: '食品制造',
    region: '杭州',
    level: CustomerLevel.Normal,
    status: CustomerStatus.Intention,
    establishDate: '2016-09-01',
    legalRepresentative: '郑某某',
    website: 'www.eefood.com',
    responsiblePerson: '张三',
    address: '杭州市余杭区XX食品工业园',
    tags: ['食品安全', '质量追溯'],
    introduction: 'EE食品公司专注食品生产，需要建设产品质量全流程追溯系统。',
    createByName: '张三',
    createTime: '2024-10-05 15:20:00',
    updateByName: '张三',
    updateTime: '2024-11-06 10:30:00',
  },
  {
    id: 9,
    customerCode: 'CUS-20240627-001',
    customerName: 'FF物流科技',
    customerShortName: 'FF物流',
    creditCode: '91440000MA09012345',
    registeredCapital: '12000万元',
    industry: '物流',
    region: '深圳',
    level: CustomerLevel.Key,
    status: CustomerStatus.Cooperating,
    establishDate: '2014-04-15',
    legalRepresentative: '钱某某',
    website: 'www.fflogistics.com',
    responsiblePerson: '钱十',
    address: '深圳市南山区XX物流园',
    tags: ['供应链', '物流信息化', '智能仓储'],
    introduction: 'FF物流科技提供现代化物流服务，正在建设供应链协同管理平台。',
    createByName: '钱十',
    createTime: '2024-06-27 11:00:00',
    updateByName: '钱十',
    updateTime: '2024-11-01 16:40:00',
  },
  {
    id: 10,
    customerCode: 'CUS-20241006-001',
    customerName: 'GG贸易公司',
    customerShortName: 'GG贸易',
    creditCode: '91310000MA10123456',
    registeredCapital: '4000万元',
    industry: '商贸',
    region: '上海',
    level: CustomerLevel.Normal,
    status: CustomerStatus.Cooperating,
    establishDate: '2019-07-20',
    legalRepresentative: '孙某某',
    website: 'www.ggtrade.com',
    responsiblePerson: '李四',
    address: '上海市虹口区XX商务大厦',
    tags: ['贸易', 'WMS系统'],
    introduction: 'GG贸易公司从事进出口贸易，需要智能仓储WMS系统提升效率。',
    createByName: '李四',
    createTime: '2024-10-06 08:50:00',
    updateByName: '李四',
    updateTime: '2024-11-06 14:15:00',
  },
  {
    id: 11,
    customerCode: 'CUS-20240629-001',
    customerName: 'HH精密制造',
    customerShortName: 'HH精密',
    creditCode: '91320000MA11234567',
    registeredCapital: '7000万元',
    industry: '精密制造',
    region: '苏州',
    level: CustomerLevel.Normal,
    status: CustomerStatus.Potential,
    establishDate: '2017-02-28',
    legalRepresentative: '冯某某',
    website: 'www.hhprecision.com',
    responsiblePerson: '冯十一',
    address: '苏州工业园区XX路',
    tags: ['精密制造', '数据采集'],
    introduction: 'HH精密制造从事精密零部件加工，需要生产数据采集分析平台。',
    createByName: '冯十一',
    createTime: '2024-06-29 16:10:00',
    updateByName: '冯十一',
    updateTime: '2024-11-05 11:20:00',
  },
  {
    id: 12,
    customerCode: 'CUS-20240631-001',
    customerName: 'II智能装备',
    customerShortName: 'II装备',
    creditCode: '91440000MA12345678',
    registeredCapital: '18000万元',
    industry: '智能制造',
    region: '深圳',
    level: CustomerLevel.Key,
    status: CustomerStatus.Cooperating,
    establishDate: '2011-09-10',
    legalRepresentative: '陈某某',
    website: 'www.iiequip.com',
    responsiblePerson: '陈十二',
    address: '深圳市龙华区XX智能装备产业园',
    tags: ['智能装备', 'AGV', '自动化'],
    introduction: 'II智能装备专业从事智能装备研发制造，已部署AGV智能搬运系统。',
    createByName: '陈十二',
    createTime: '2024-06-31 09:40:00',
    updateByName: '陈十二',
    updateTime: '2024-11-04 13:55:00',
  },
  {
    id: 13,
    customerCode: 'CUS-20241007-001',
    customerName: 'JJ钢铁集团',
    customerShortName: 'JJ钢铁',
    creditCode: '91130000MA13456789',
    registeredCapital: '50000万元',
    industry: '钢铁',
    region: '天津',
    level: CustomerLevel.Key,
    status: CustomerStatus.Intention,
    establishDate: '1998-05-15',
    legalRepresentative: '褚某某',
    website: 'www.jjsteel.com',
    responsiblePerson: '张三',
    address: '天津市滨海新区XX钢铁园',
    tags: ['钢铁', '设备健康', '大型国企'],
    introduction: 'JJ钢铁集团是大型钢铁企业，关注设备健康状态监测与管理。',
    createByName: '张三',
    createTime: '2024-10-07 10:30:00',
    updateByName: '张三',
    updateTime: '2024-11-07 15:45:00',
  },
  {
    id: 14,
    customerCode: 'CUS-20240626-001',
    customerName: 'KK光电科技',
    customerShortName: 'KK光电',
    creditCode: '91350000MA14567890',
    registeredCapital: '9000万元',
    industry: '光电',
    region: '福州',
    level: CustomerLevel.Normal,
    status: CustomerStatus.Lost,
    establishDate: '2013-10-20',
    legalRepresentative: '卫某某',
    website: 'www.kkoptics.com',
    responsiblePerson: '卫十三',
    address: '福州市马尾区XX光电产业园',
    tags: ['光电', '可视化监控'],
    introduction: 'KK光电科技从事光电产品研发，曾咨询产线可视化监控系统。',
    createByName: '卫十三',
    createTime: '2024-06-26 14:20:00',
    updateByName: '卫十三',
    updateTime: '2024-11-01 09:30:00',
  },
  {
    id: 15,
    customerCode: 'CUS-20241008-001',
    customerName: 'LL纺织集团',
    customerShortName: 'LL纺织',
    creditCode: '91330000MA15678901',
    registeredCapital: '11000万元',
    industry: '纺织',
    region: '杭州',
    level: CustomerLevel.Normal,
    status: CustomerStatus.Cooperating,
    establishDate: '2009-03-08',
    legalRepresentative: '蒋某某',
    website: 'www.lltextile.com',
    responsiblePerson: '蒋十四',
    address: '杭州市萧山区XX纺织工业园',
    tags: ['纺织', '智能排产', '优化算法'],
    introduction: 'LL纺织集团是区域龙头纺织企业，正在实施智能排产调度系统。',
    createByName: '蒋十四',
    createTime: '2024-10-08 09:15:00',
    updateByName: '蒋十四',
    updateTime: '2024-11-08 11:40:00',
  },
];

// 数据源
const dataSource = ref<CustomerProfile[]>([]);

// 表格列定义
const columns: TableColumnsType<CustomerProfile> = [
  {
    title: '客户编号',
    dataIndex: 'customerCode',
    key: 'customerCode',
    width: 160,
    sorter: true,
    customRender: ({ text }) => text,
    customCell: (record) => ({
      style: { cursor: 'pointer', color: '#1890ff' },
      onClick: () => handleView(record),
    }),
  },
  {
    title: '客户名称',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 200,
    ellipsis: true,
  },
  {
    title: '所属集团',
    dataIndex: 'legalEntityId',
    key: 'legalEntityId',
    width: 150,
    ellipsis: true,
    customRender: ({ record }) => {
      if (!record.legalEntityId) return '-';
      const entity = getMockLegalEntityById(record.legalEntityId);
      if (!entity) return '-';
      
      // 找到根组织（集团）
      let root = entity;
      while (root.parentEntityId) {
        const parent = getMockLegalEntityById(root.parentEntityId);
        if (!parent) break;
        root = parent;
      }
      
      return root.entityName;
    },
  },
  {
    title: '所属行业',
    dataIndex: 'industry',
    key: 'industry',
    width: 120,
  },
  {
    title: '客户地区',
    dataIndex: 'region',
    key: 'region',
    width: 100,
  },
  {
    title: '客户级别',
    dataIndex: 'level',
    key: 'level',
    width: 100,
    align: 'center',
    customRender: ({ text }) => {
      const level = customerLevelMap[text as CustomerLevel];
      return level ? h(Tag, { color: level.color }, () => level.text) : text;
    },
  },
  {
    title: '客户状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    customRender: ({ text }) => {
      const status = customerStatusMap[text as CustomerStatus];
      return status ? h(Tag, { color: status.color }, () => status.text) : text;
    },
  },
  {
    title: '负责人',
    dataIndex: 'responsiblePerson',
    key: 'responsiblePerson',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
    customRender: ({ record }) => {
      const actions = [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleView(record),
        }, () => '查看'),
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEdit(record),
        }, () => '编辑'),
      ];

      // 检查是否有业务记录（这里简化处理，实际应该检查数据库）
      const hasBusinessRecords = record.id && record.id <= 12; // 假设前12个客户有业务记录
      
      if (hasBusinessRecords) {
        actions.push(
          h(Popconfirm, {
            title: '该客户已有业务记录，无法删除',
            disabled: true,
          }, () => h(Button, {
            type: 'link',
            danger: true,
            size: 'small',
            disabled: true,
          }, () => '删除'))
        );
      } else {
        actions.push(
          h(Popconfirm, {
            title: `确定要删除客户"${record.customerName}"吗？`,
            onConfirm: () => handleDelete(record.id!),
            okText: '确定',
            cancelText: '取消',
          }, () => h(Button, {
            type: 'link',
            danger: true,
            size: 'small',
          }, () => '删除'))
        );
      }

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
    if (searchForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.customerName.includes(searchForm.keyword!) ||
        item.customerCode.includes(searchForm.keyword!)
      );
    }
    if (searchForm.industry) {
      filteredData = filteredData.filter(item =>
        item.industry === searchForm.industry
      );
    }
    if (searchForm.level) {
      filteredData = filteredData.filter(item =>
        item.level === searchForm.level
      );
    }
    if (searchForm.status) {
      filteredData = filteredData.filter(item =>
        item.status === searchForm.status
      );
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
  searchForm.keyword = '';
  searchForm.industry = undefined;
  searchForm.level = undefined;
  searchForm.status = undefined;
  pagination.current = 1;
  loadData();
};

// 表格变化处理
const handleTableChange: TableProps['onChange'] = (pag, _filters, sorter: any) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 20;
  
  // 处理排序（这里简化处理，实际应该传给后端）
  if (sorter.order) {
    console.log('排序:', sorter.field, sorter.order);
  }
  
  loadData();
};

// 行选择
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

// 新建客户
const handleCreate = () => {
  createModalVisible.value = true;
};

// 确认新建
const handleCreateConfirm = async () => {
  try {
    await createFormRef.value?.validate();
    // 跳转到详情页（编辑模式），携带参数
    router.push({
      path: '/market-customers/archives/detail',
      query: {
        mode: 'edit',
        customerName: createForm.customerName,
        customerShortName: createForm.customerShortName,
        creditCode: createForm.creditCode,
      },
    });
    createModalVisible.value = false;
    createForm.customerName = '';
    createForm.customerShortName = '';
    createForm.creditCode = '';
  } catch (error) {
    message.error('请检查表单填写');
  }
};

// 取消新建
const handleCreateCancel = () => {
  createModalVisible.value = false;
  createForm.customerName = '';
  createForm.customerShortName = '';
  createForm.creditCode = '';
  createFormRef.value?.resetFields();
};

// 查看客户
const handleView = (record: CustomerProfile) => {
  router.push(`/market-customers/archives/detail/${record.id}`);
};

// 编辑客户
const handleEdit = (record: CustomerProfile) => {
  router.push(`/market-customers/archives/detail/${record.id}?mode=edit`);
};

// 删除客户
const handleDelete = (id: number) => {
  // TODO: 调用删除API
  console.log('删除客户ID:', id);
  message.success('删除成功');
  loadData();
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的客户');
    return;
  }
  
  Modal.confirm({
    title: '批量删除确认',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个客户吗？删除后不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // TODO: 调用批量删除API
      message.success(`已删除 ${selectedRowKeys.value.length} 个客户`);
      selectedRowKeys.value = [];
      loadData();
    },
  });
};

// 导出（功能暂未开放）
const handleExport = () => {
  message.info('导出功能将在后续版本中推出，敬请期待');
};

// 初始化加载数据
loadData();
</script>

<template>
  <div class="p-6">
    <Card title="客户档案管理" :bordered="false">
      <!-- 搜索表单 -->
      <div class="mb-4">
        <Form layout="inline">
          <Form.Item label="关键字">
            <Input
              v-model:value="searchForm.keyword"
              placeholder="请输入客户名称或编号"
              allow-clear
              style="width: 250px"
            />
          </Form.Item>
          <Form.Item label="所属行业">
            <Select
              v-model:value="searchForm.industry"
              placeholder="请选择行业"
              allow-clear
              style="width: 150px"
            >
              <Select.Option v-for="industry in industryOptions" :key="industry" :value="industry">
                {{ industry }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="客户级别">
            <Select
              v-model:value="searchForm.level"
              placeholder="请选择级别"
              allow-clear
              style="width: 120px"
            >
              <Select.Option :value="CustomerLevel.Key">重点客户</Select.Option>
              <Select.Option :value="CustomerLevel.Normal">普通客户</Select.Option>
              <Select.Option :value="CustomerLevel.Potential">潜在客户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="客户状态">
            <Select
              v-model:value="searchForm.status"
              placeholder="请选择状态"
              allow-clear
              style="width: 120px"
            >
              <Select.Option :value="CustomerStatus.Potential">潜在客户</Select.Option>
              <Select.Option :value="CustomerStatus.Intention">意向客户</Select.Option>
              <Select.Option :value="CustomerStatus.Cooperating">合作中</Select.Option>
              <Select.Option :value="CustomerStatus.Lost">已流失</Select.Option>
            </Select>
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
          <Button type="primary" @click="handleCreate">+ 新建客户</Button>
          <Button 
            danger 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
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
        :row-key="(record) => record.id"
        :row-selection="rowSelection"
        :scroll="{ x: 1400 }"
        @change="handleTableChange"
      />
    </Card>

    <!-- 新建客户弹框 -->
    <Modal
      v-model:open="createModalVisible"
      title="新建客户档案"
      :width="600"
      @ok="handleCreateConfirm"
      @cancel="handleCreateCancel"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <Form.Item label="客户名称（必填）" name="customerName">
          <Input
            v-model:value="createForm.customerName"
            placeholder="请输入客户名称"
            allow-clear
          />
        </Form.Item>
        <Form.Item label="客户简称" name="customerShortName">
          <Input
            v-model:value="createForm.customerShortName"
            placeholder="请输入客户简称"
            allow-clear
          />
        </Form.Item>
        <Form.Item label="统一社会信用代码" name="creditCode">
          <Input
            v-model:value="createForm.creditCode"
            placeholder="请输入统一社会信用代码"
            allow-clear
          />
        </Form.Item>
      </Form>
      <div class="text-gray-500 text-sm mt-2">
        <p>提示：填写核心字段后创建客户，点击确定后将跳转到详情页继续完善信息。</p>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
:deep(.ant-table-cell) {
  padding: 12px 8px;
}
</style>
