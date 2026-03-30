<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Tree,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';

defineOptions({
  name: 'SoftwareProductDetail',
});

const route = useRoute();
const router = useRouter();

// 获取产品ID
const productId = ref(route.params.id || '');
const isEdit = ref(route.query.mode === 'edit');
const activeTab = ref('basic');

// 产品基本信息表单
const formRef = ref<FormInstance>();
const basicForm = reactive({
  competitiveEdge: '',
  currentVersion: '',
  databaseTypes: [] as string[],
  demoUrl: '',
  deployModes: [] as string[],
  devLanguages: [] as string[],
  licenseTypes: [] as string[],
  marketPosition: '',
  productCategory: '',
  productCode: '',
  productIcon: '',
  productIntro: '',
  productLine: '',
  productManager: undefined,
  productName: '',
  productShortName: '',
  productStatus: 2,
  remark: '',
  tags: [] as string[],
  techArchitecture: '',
  techManager: undefined,
  websiteUrl: '',
  authorizationPrice: [] as { type: string; price: number; unit: string }[],
});

// 表单验证规则
const rules = {
  productCategory: [{ message: '请选择产品分类', required: true }],
  productCode: [
    { message: '请输入产品编码', required: true },
    {
      message: '产品编码格式：PRD-XXX',
      pattern: /^PRD-[A-Z0-9]{3,20}$/,
    },
  ],
  productManager: [{ message: '请选择产品负责人', required: true }],
  productName: [{ message: '请输入产品名称', required: true }],
  productStatus: [{ message: '请选择产品状态', required: true }],
  techManager: [{ message: '请选择技术负责人', required: true }],
};

// 模块树数据结构定义（兼容 Tree 组件）
interface ModuleNode {
  key: string;
  title: string;
  type: string;
  isRequired?: boolean;
  description?: string;
  children?: ModuleNode[];
  // Tree 组件需要的字段
  slots?: { title?: string };
}

// 模块树数据
const moduleTreeData = ref<ModuleNode[]>([
  {
    children: [
      {
        description: '用户登录、注册、密码找回等',
        key: '1-1',
        title: '用户认证',
        type: 'submodule',
        isRequired: true,
      },
      {
        description: '角色管理、权限分配',
        key: '1-2',
        title: '权限管理',
        type: 'submodule',
        isRequired: true,
      },
      {
        description: '用户信息维护、账号管理',
        key: '1-3',
        title: '用户管理',
        type: 'submodule',
        isRequired: true,
      },
    ],
    description: '系统基础功能模块，包含用户、权限等',
    isRequired: true,
    key: '1',
    title: '系统管理',
    type: 'module',
  },
  {
    children: [
      {
        description: '产品信息录入、编辑、查询',
        key: '2-1',
        title: '产品管理',
        type: 'submodule',
        isRequired: true,
      },
      {
        description: '库存查询、库存预警、出入库管理',
        key: '2-2',
        title: '库存管理',
        type: 'submodule',
        isRequired: true,
      },
      {
        description: '订单创建、审核、发货跟踪',
        key: '2-3',
        title: '订单管理',
        type: 'submodule',
        isRequired: true,
      },
    ],
    description: '核心业务功能模块',
    isRequired: true,
    key: '2',
    title: '业务管理',
    type: 'module',
  },
  {
    children: [
      {
        description: '数据统计报表、图表展示',
        key: '3-1',
        title: '数据报表',
        type: 'submodule',
        isRequired: false,
      },
      {
        description: '系统日志记录与查询',
        key: '3-2',
        title: '日志管理',
        type: 'submodule',
        isRequired: false,
      },
    ],
    description: '系统辅助功能模块',
    isRequired: false,
    key: '3',
    title: '系统工具',
    type: 'module',
  },
]);

// 模块类型配置
const moduleTypeConfig: Record<string, { text: string; color: string }> = {
  function: { color: '#52c41a', text: '功能' },
  module: { color: '#1890ff', text: '模块' },
  submodule: { color: '#1890ff', text: '子模块' },
};

// 当前选中的节点
const selectedNodeKey = ref<string | null>('1');
const selectedKeys = ref<string[]>(['1']);
const expandedKeys = ref<string[]>(['1', '2', '3']);

// 右侧编辑表单
const detailForm = reactive({
  description: '',
  isRequired: false,
  title: '',
  type: 'module',
});

// 模块弹窗相关
const moduleModalVisible = ref(false);
const moduleModalMode = ref<'add' | 'edit' | 'copy'>('add');
const currentParentKey = ref<string | null>(null);
const moduleForm = reactive({
  description: '',
  isRequired: false,
  title: '',
  type: 'module',
});


// 使用记录数据
const usageList = ref([
  {
    authType: '永久授权',
    authUsers: 50,
    customer: '北京科技有限公司',
    deployTime: '2024-05-10',
    id: 1,
    project: 'OMS实施项目',
    runStatus: '运行中',
    version: 'v2.0.5',
  },
  {
    authType: '订阅授权',
    authUsers: 100,
    customer: '上海实业集团',
    deployTime: '2024-06-15',
    id: 2,
    project: 'ERP集成项目',
    runStatus: '运行中',
    version: 'v2.1.0',
  },
  {
    authType: '永久授权',
    authUsers: 30,
    customer: '深圳智能科技',
    deployTime: '2024-03-20',
    id: 3,
    project: '数字化转型项目',
    runStatus: '已停用',
    version: 'v1.8.0',
  },
]);

// 使用记录表格列
const usageColumns: TableColumnsType = [
  { dataIndex: 'customer', title: '客户名称', width: 180 },
  { dataIndex: 'project', title: '项目名称', width: 180 },
  { dataIndex: 'version', title: '使用版本', width: 100 },
  { dataIndex: 'authType', title: '授权方式', width: 120 },
  { dataIndex: 'authUsers', title: '授权数量', width: 100 },
  { dataIndex: 'deployTime', title: '部署时间', width: 120 },
  {
    dataIndex: 'runStatus',
    key: 'runStatus',
    title: '运行状态',
    width: 100,
  }
];

// 功能列表表格列
const functionColumns: TableColumnsType = [
  { 
    dataIndex: 'title', 
    key: 'title',
    title: '功能名称', 
    width: 200,
  },
  { 
    dataIndex: 'description', 
    key: 'description',
    title: '功能描述',
    ellipsis: true,
  },
  {
    align: 'center',
    fixed: 'right',
    key: 'actions',
    title: '操作',
    width: 120,
  },
];

// 返回列表
function handleBack() {
  router.back();
}

// 切换编辑模式
function toggleEdit() {
  isEdit.value = !isEdit.value;
}

// 保存
async function handleSave() {
  try {
    await formRef.value?.validate();
    message.success('保存成功');
    isEdit.value = false;
  } catch {
    message.error('请填写必填项');
  }
}

// 删除产品
function handleDeleteProduct() {
  router.push('/product-solutions/software');
  message.success('删除成功');
}

// 添加根模块
function handleAddModule() {
  moduleModalMode.value = 'add';
  currentParentKey.value = null;
  moduleForm.title = '';
  moduleForm.type = 'package';
  moduleForm.isRequired = false;
  moduleForm.description = '';
  moduleModalVisible.value = true;
}

// 添加子模块
function handleAddSubModule(parentNode: ModuleNode) {
  moduleModalMode.value = 'add';
  currentParentKey.value = parentNode.key;
  moduleForm.title = '';
  // 默认添加子模块
  moduleForm.type = 'submodule';
  moduleForm.isRequired = false;
  moduleForm.description = '';
  moduleModalVisible.value = true;
}

// 编辑模块（包括功能节点）
function handleEditModule(node: ModuleNode) {
  moduleModalMode.value = 'edit';
  currentParentKey.value = node.key;
  moduleForm.title = node.title;
  moduleForm.type = node.type;
  moduleForm.isRequired = node.isRequired || false;
  moduleForm.description = node.description || '';
  moduleModalVisible.value = true;
}

// 编辑功能节点
function handleEditFunction(func: ModuleNode) {
  handleEditModule(func);
}

// 删除模块
function handleDeleteModule(node: ModuleNode) {
  // 如果是功能节点，只确认删除功能，不提及子模块
  if (node.type === 'function') {
    Modal.confirm({
      cancelText: '取消',
      content: `确定要删除功能"${node.title}"吗？`,
      okText: '确定',
      okType: 'danger',
      onOk() {
        deleteNodeFromTree(moduleTreeData.value, node.key);
        message.success('删除成功');
      },
      title: '确认删除',
    });
    return;
  }
  
  // 如果是模块/子模块，需要确认删除，并提示会删除子模块
  Modal.confirm({
    cancelText: '取消',
    content: `确定要删除模块"${node.title}"吗？删除后子模块将一并删除。`,
    okText: '确定',
    okType: 'danger',
    onOk() {
      deleteNodeFromTree(moduleTreeData.value, node.key);
      message.success('删除成功');
    },
    title: '确认删除',
  });
}

// 复制模块
function handleCopyModule(node: ModuleNode) {
  const copiedNode = JSON.parse(JSON.stringify(node));
  copiedNode.key = `${node.key}-copy-${Date.now()}`;
  copiedNode.title = `${node.title}（副本）`;
  
  // 递归更新子节点key
  function updateChildKeys(children: ModuleNode[], parentKey: string) {
    if (!children) return;
    children.forEach((child, index) => {
      child.key = `${parentKey}-${index + 1}`;
      if (child.children) {
        updateChildKeys(child.children, child.key);
      }
    });
  }
  
  if (copiedNode.children) {
    updateChildKeys(copiedNode.children, copiedNode.key);
  }
  
  moduleTreeData.value.push(copiedNode);
  message.success('复制成功');
}

// 从树中删除节点
function deleteNodeFromTree(tree: ModuleNode[], key: string): boolean {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (!node) continue;
    
    if (node.key === key) {
      tree.splice(i, 1);
      return true;
    }
    if (node.children && node.children.length > 0) {
      if (deleteNodeFromTree(node.children, key)) {
        return true;
      }
    }
  }
  return false;
}

// 在树中查找节点
function findNodeInTree(tree: ModuleNode[], key: string): ModuleNode | null {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findNodeInTree(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

// 更新树中的节点
function updateNodeInTree(tree: ModuleNode[], key: string, updates: Partial<ModuleNode>): boolean {
  for (const node of tree) {
    if (node.key === key) {
      Object.assign(node, updates);
      return true;
    }
    if (node.children) {
      if (updateNodeInTree(node.children, key, updates)) {
        return true;
      }
    }
  }
  return false;
}

// 保存模块
function handleSaveModule() {
  if (!moduleForm.title.trim()) {
    message.error('请输入模块名称');
    return;
  }

  if (moduleModalMode.value === 'add') {
    const newNode: ModuleNode = {
      description: moduleForm.description,
      isRequired: moduleForm.isRequired,
      key: `${Date.now()}`,
      title: moduleForm.title,
      type: moduleForm.type,
    };

    if (currentParentKey.value) {
      // 添加子模块
      const parentNode = findNodeInTree(moduleTreeData.value, currentParentKey.value);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        const childrenLength = parentNode.children?.length || 0;
        newNode.key = `${currentParentKey.value}-${childrenLength + 1}`;
        parentNode.children.push(newNode);
      }
    } else {
      // 添加根模块
      newNode.key = `${moduleTreeData.value.length + 1}`;
      moduleTreeData.value.push(newNode);
    }
    message.success('添加成功');
  } else if (moduleModalMode.value === 'edit') {
    // 编辑模块
    updateNodeInTree(moduleTreeData.value, currentParentKey.value!, {
      description: moduleForm.description,
      isRequired: moduleForm.isRequired,
      title: moduleForm.title,
      type: moduleForm.type,
    });
    message.success('修改成功');
  }

  moduleModalVisible.value = false;
}

// 取消模块编辑
function handleCancelModule() {
  moduleModalVisible.value = false;
}

// 获取选中的节点
function getSelectedNode(): ModuleNode | null {
  if (!selectedNodeKey.value) return null;
  return findNodeInTree(moduleTreeData.value, selectedNodeKey.value);
}

// 选择节点
function selectNode(keys: (string | number)[]) {
  if (keys.length > 0) {
    const key = String(keys[0]);
    selectedNodeKey.value = key;
    selectedKeys.value = [key];
    // 同步右侧表单数据
    const node = getSelectedNode();
    if (node) {
      detailForm.title = node.title;
      detailForm.type = node.type;
      detailForm.isRequired = node.isRequired || false;
      detailForm.description = node.description || '';
    }
  }
}

// Tree 展开/收起
function handleExpand(keys: (string | number)[]) {
  expandedKeys.value = keys.map(k => String(k));
}

// 拖拽处理
function handleDrop(info: any) {
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropNode = info.node;
  const dragNode = info.dragNode;
  const dropPos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

  // 规则：模块不能拖动到子模块下
  if (dragNode.type === 'module' && dropNode.type === 'submodule') {
    message.warning('模块不能拖动到子模块下');
    return;
  }

  // 不允许拖拽到自己的子节点
  const loop = (data: ModuleNode[], key: string, callback: (item: ModuleNode, index: number, arr: ModuleNode[]) => void) => {
    data.forEach((item, index, arr) => {
      if (item.key === key) {
        return callback(item, index, arr);
      }
      if (item.children) {
        return loop(item.children, key, callback);
      }
    });
  };

  const data = [...moduleTreeData.value];
  let dragObj: ModuleNode | undefined;

  // 找到拖拽的节点并从原位置删除
  loop(data, dragKey, (item, index, arr) => {
    arr.splice(index, 1);
    dragObj = item;
  });

  if (!dragObj) return;

  if (!info.dropToGap) {
    // 拖拽到节点内部 - 再次检查规则
    if (dragObj.type === 'module' && dropNode.type === 'submodule') {
      message.warning('模块不能拖动到子模块下');
      return;
    }
    loop(data, dropKey, (item) => {
      item.children = item.children || [];
      item.children.unshift(dragObj!);
    });
  } else if (
    (info.node.children || []).length > 0 &&
    info.node.expanded &&
    dropPosition === 1
  ) {
    // 拖拽到展开节点的第一个位置 - 再次检查规则
    if (dragObj.type === 'module' && dropNode.type === 'submodule') {
      message.warning('模块不能拖动到子模块下');
      return;
    }
    loop(data, dropKey, (item) => {
      item.children = item.children || [];
      item.children.unshift(dragObj!);
    });
  } else {
    // 拖拽到节点前后
    let ar: ModuleNode[] = [];
    let i = 0;
    loop(data, dropKey, (_item, index, arr) => {
      ar = arr;
      i = index;
    });
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj);
    } else {
      ar.splice(i + 1, 0, dragObj);
    }
  }

  moduleTreeData.value = data;
  message.success('拖拽成功');
}

// 过滤树数据，移除功能类型节点
const filteredTreeData = computed(() => {
  function filterNodes(nodes: ModuleNode[]): ModuleNode[] {
    return nodes
      .filter(node => node.type !== 'function')
      .map(node => ({
        ...node,
        children: node.children ? filterNodes(node.children) : undefined,
      }));
  }
  return filterNodes(moduleTreeData.value);
});

// 保存右侧详情编辑
function handleSaveDetail() {
  if (!selectedNodeKey.value) return;
  
  updateNodeInTree(moduleTreeData.value, selectedNodeKey.value, {
    description: detailForm.description,
    isRequired: detailForm.isRequired,
    title: detailForm.title,
    type: detailForm.type,
  });
  message.success('保存成功');
}

// 添加功能节点
function handleAddFunctionNode() {
  if (!selectedNodeKey.value) return;
  
  moduleModalMode.value = 'add';
  currentParentKey.value = selectedNodeKey.value;
  moduleForm.title = '';
  moduleForm.type = 'function';
  moduleForm.isRequired = false;
  moduleForm.description = '';
  moduleModalVisible.value = true;
}

// 查看使用详情
function handleViewUsage(record: any) {
  message.info(`查看使用详情：${record.customer}`);
}

// 初始化数据（模拟从服务器加载）
if (productId.value) {
  // 这里应该从服务器加载产品数据
  basicForm.productCode = 'PRD-001';
  basicForm.productName = 'OMS运营管理系统';
  basicForm.productShortName = 'OMS';
  basicForm.productCategory = '管理系统';
  basicForm.productStatus = 2;
  basicForm.techArchitecture = 'B/S';
  basicForm.devLanguages = ['Java', 'Vue'];
  basicForm.databaseTypes = ['MySQL'];
  basicForm.deployModes = ['云端部署'];
  basicForm.productIntro = '一站式运营管理解决方案';
  basicForm.marketPosition = '面向中大型企业的运营管理系统';
  basicForm.competitiveEdge = '功能全面、操作简单、性能优越';
  basicForm.currentVersion = 'v2.1.0';
  basicForm.licenseTypes = ['订阅模式'];
  basicForm.authorizationPrice = [
    { type: '订阅模式', price: 10000, unit: '元/月' }
  ];
}

// 初始化右侧详情表单
const initNode = getSelectedNode();
if (initNode) {
  detailForm.title = initNode.title;
  detailForm.type = initNode.type;
  detailForm.isRequired = initNode.isRequired || false;
  detailForm.description = initNode.description || '';
}
</script>

<template>
  <div class="p-4">
    <!-- 页面头部 -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center">
        <Button
          type="text"
          @click="handleBack"
        >
          ← 返回
        </Button>
        <div class="ml-4">
          <h1 class="text-2xl font-bold">
            {{ basicForm.productName || '产品详情' }}
          </h1>
          <p class="text-gray-500 mt-1">
            产品编码: {{ basicForm.productCode }}
          </p>
        </div>
      </div>
      <Space>
        <Button
          v-if="!isEdit"
          type="primary"
          @click="toggleEdit"
        >
          编辑
        </Button>
        <Button
          v-if="isEdit"
          type="primary"
          @click="handleSave"
        >
          保存
        </Button>
        <Button v-if="isEdit" @click="toggleEdit"> 取消 </Button>
        <Popconfirm
          title="确定删除该产品吗？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleDeleteProduct"
        >
          <Button danger> 删除 </Button>
        </Popconfirm>
      </Space>
    </div>

    <!-- 标签页内容 -->
    <Card>
      <Tabs v-model:activeKey="activeTab">
        <!-- 基本信息 -->
        <Tabs.TabPane key="basic" tab="基本信息" force-render>
          <Form
            ref="formRef"
            :model="basicForm"
            :rules="rules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :disabled="!isEdit"
          >
            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">基础信息</h3>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="产品编码" name="productCode">
                    <Input v-model:value="basicForm.productCode" placeholder="PRD-XXX" />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="产品名称" name="productName">
                    <Input v-model:value="basicForm.productName" placeholder="请输入产品名称" />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="产品简称" name="productShortName">
                    <Input v-model:value="basicForm.productShortName" placeholder="请输入产品简称" />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="产品分类" name="productCategory">
                    <Select v-model:value="basicForm.productCategory" placeholder="请选择">
                      <Select.Option value="管理系统">管理系统</Select.Option>
                      <Select.Option value="协同办公">协同办公</Select.Option>
                      <Select.Option value="数据分析">数据分析</Select.Option>
                      <Select.Option value="工具软件">工具软件</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="产品状态" name="productStatus">
                    <Select v-model:value="basicForm.productStatus" placeholder="请选择">
                      <Select.Option :value="1">在研</Select.Option>
                      <Select.Option :value="2">在售</Select.Option>
                      <Select.Option :value="3">停售</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="当前版本" name="currentVersion">
                    <Input v-model:value="basicForm.currentVersion" placeholder="如：v1.0.0" />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="产品简介" name="productIntro">
                    <Input.TextArea
                      v-model:value="basicForm.productIntro"
                      placeholder="请输入产品简介"
                      :rows="3"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">技术信息</h3>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="技术架构" name="techArchitecture">
                    <Select v-model:value="basicForm.techArchitecture" placeholder="请选择">
                      <Select.Option value="B/S">B/S架构</Select.Option>
                      <Select.Option value="C/S">C/S架构</Select.Option>
                      <Select.Option value="混合">混合架构</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="开发语言" name="devLanguages">
                    <Select
                      v-model:value="basicForm.devLanguages"
                      mode="multiple"
                      placeholder="请选择"
                    >
                      <Select.Option value="Java">Java</Select.Option>
                      <Select.Option value="Python">Python</Select.Option>
                      <Select.Option value="Vue">Vue</Select.Option>
                      <Select.Option value="React">React</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="数据库类型" name="databaseTypes">
                    <Select
                      v-model:value="basicForm.databaseTypes"
                      mode="multiple"
                      placeholder="请选择"
                    >
                      <Select.Option value="MySQL">MySQL</Select.Option>
                      <Select.Option value="Oracle">Oracle</Select.Option>
                      <Select.Option value="PostgreSQL">PostgreSQL</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="部署方式" name="deployModes">
                    <Select
                      v-model:value="basicForm.deployModes"
                      mode="multiple"
                      placeholder="请选择"
                    >
                      <Select.Option value="本地部署">本地部署</Select.Option>
                      <Select.Option value="云端部署">云端部署</Select.Option>
                      <Select.Option value="混合部署">混合部署</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-3">商务信息</h3>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="产品负责人" name="productManager">
                    <Select v-model:value="basicForm.productManager" placeholder="请选择">
                      <Select.Option value="1">张三</Select.Option>
                      <Select.Option value="2">李四</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="技术负责人" name="techManager">
                    <Select v-model:value="basicForm.techManager" placeholder="请选择">
                      <Select.Option value="1">王五</Select.Option>
                      <Select.Option value="2">赵六</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="授权方式" name="licenseTypes">
                    <Select
                      v-model:value="basicForm.licenseTypes"
                      mode="multiple"
                      placeholder="请选择"
                      @change="() => {
                        // 当授权方式改变时，同步更新价格配置
                        const newPrices = basicForm.licenseTypes.map(type => {
                          const existing = basicForm.authorizationPrice.find(p => p.type === type);
                          // 根据类型设置默认单位
                          let defaultUnit = '';
                          if (type === '订阅模式') defaultUnit = '元/月';
                          else if (type === '永久授权') defaultUnit = '元/套';
                          
                          return existing || { type, price: 0, unit: defaultUnit };
                        });
                        basicForm.authorizationPrice = newPrices;
                      }"
                    >
                      <Select.Option value="订阅模式">订阅模式</Select.Option>
                      <Select.Option value="永久授权">永久授权</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="24" style="padding-left: 75px;">
                  <Form.Item 
                    label="授权价格配置" 
                    name="authorizationPrice"
                    v-if="basicForm.licenseTypes && basicForm.licenseTypes.length > 0"
                    :label-col="{ span: 0 }" 
                    :wrapper-col="{ span: 24 }"
                  >
                    <Table
                      :columns="[
                        { title: '授权类型', dataIndex: 'type', width: 150 },
                        { title: '价格', dataIndex: 'price', width: 150 },
                        { title: '单位', dataIndex: 'unit', width: 150 },
                      ]"
                      :data-source="basicForm.authorizationPrice"
                      :pagination="false"
                      size="small"
                      bordered
                    >
                      <template #bodyCell="{ column, record }">
                        <template v-if="column.dataIndex === 'price'">
                          <Input 
                            v-if="isEdit" 
                            v-model:value="record.price" 
                            prefix="¥" 
                            placeholder="请输入价格"
                            style="width: 100%"
                          />
                          <span v-else>¥ {{ record.price }}</span>
                        </template>
                        <template v-if="column.dataIndex === 'unit'">
                          <span>{{ record.unit }}</span>
                        </template>
                      </template>
                    </Table>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="市场定位" name="marketPosition">
                    <Input.TextArea
                      v-model:value="basicForm.marketPosition"
                      placeholder="请输入市场定位"
                      :rows="3"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="竞争优势" name="competitiveEdge">
                    <Input.TextArea
                      v-model:value="basicForm.competitiveEdge"
                      placeholder="请输入竞争优势"
                      :rows="3"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        </Tabs.TabPane>

        <!-- 模块结构 -->
        <Tabs.TabPane key="modules" tab="模块结构">
          <div class="module-structure-container">
            <!-- 左侧：树形结构 -->
            <div class="module-tree-panel">
              <div class="panel-header">
                <h3 class="panel-title">模块树</h3>
                <Button 
                  v-if="isEdit" 
                  type="primary" 
                  size="small"
                  @click="handleAddModule"
                >
                  添加根模块
                </Button>
              </div>
              <div class="module-tree-content">
                <Tree
                  :tree-data="filteredTreeData"
                  :selected-keys="selectedKeys"
                  :expanded-keys="expandedKeys"
                  :show-line="false"
                  :draggable="isEdit"
                  @select="selectNode"
                  @expand="handleExpand"
                  @drop="handleDrop"
                >
                  <template #title="node">
                    <div class="custom-tree-node">
                      <div class="node-content">
                        <Tag color="blue" class="node-type-tag">
                          {{ moduleTypeConfig[node.type]?.text }}
                        </Tag>
                        <span class="node-title-text">{{ node.title }}</span>
                        <!-- <span v-if="node.description" class="node-desc-text">{{ node.description }}</span> -->
                      </div>
                      
                      <!-- 操作按钮 -->
                      <div v-if="isEdit" class="tree-node-actions">
                        <Tooltip title="添加子节点">
                          <Button 
                            type="text" 
                            size="small" 
                            @click.stop="handleAddSubModule(node)"
                          >
                            <span class="action-icon add-icon">＋</span>
                          </Button>
                        </Tooltip>
                        <Tooltip title="复制">
                          <Button 
                            type="text" 
                            size="small" 
                            @click.stop="handleCopyModule(node)"
                          >
                            <span class="action-icon copy-icon">⎘</span>
                          </Button>
                        </Tooltip>
                        <Tooltip title="删除">
                          <Button 
                            type="text" 
                            size="small" 
                            danger
                            @click.stop="handleDeleteModule(node)"
                          >
                            <span class="action-icon delete-icon">✕</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </template>
                </Tree>
              </div>
            </div>

            <!-- 右侧：节点详情和功能列表 -->
            <div class="module-detail-panel">
              <Tabs>
                <!-- 节点信息标签页 -->
                <Tabs.TabPane key="info" tab="模块信息">
                  <div class="detail-section">
                    <div class="section-header">
                      <h3 class="section-title">基本信息</h3>
                      <Button 
                        v-if="isEdit && getSelectedNode()" 
                        type="primary" 
                        size="small"
                        @click="handleSaveDetail"
                      >
                        保存
                      </Button>
                    </div>
                    <div v-if="getSelectedNode()" class="node-info">
                      <Form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                        <Form.Item label="名称">
                          <Input 
                            v-if="isEdit" 
                            v-model:value="detailForm.title" 
                            placeholder="请输入名称" 
                          />
                          <span v-else class="info-value">{{ getSelectedNode()?.title }}</span>
                        </Form.Item>
                        <Form.Item label="类型">
                          <Select 
                            v-if="isEdit" 
                            v-model:value="detailForm.type" 
                            placeholder="请选择类型"
                            style="width: 100%"
                          >
                            <Select.Option value="module">模块</Select.Option>
                            <Select.Option value="submodule">子模块</Select.Option>
                          </Select>
                          <Tag v-else :color="moduleTypeConfig[getSelectedNode()?.type || '']?.color">
                            {{ moduleTypeConfig[getSelectedNode()?.type || '']?.text }}
                          </Tag>
                        </Form.Item>
                        <Form.Item label="是否必选">
                          <Switch 
                            v-if="isEdit" 
                            v-model:checked="detailForm.isRequired" 
                          />
                          <Tag v-else :color="getSelectedNode()?.isRequired ? 'red' : 'default'">
                            {{ getSelectedNode()?.isRequired ? '必选' : '可选' }}
                          </Tag>
                        </Form.Item>
                        <Form.Item label="描述">
                          <Input.TextArea 
                            v-if="isEdit" 
                            v-model:value="detailForm.description" 
                            placeholder="请输入描述"
                            :rows="4"
                          />
                          <span v-else class="info-value">{{ getSelectedNode()?.description || '-' }}</span>
                        </Form.Item>
                      </Form>
                    </div>
                    <div v-else class="empty-state">
                      请在左侧选择一个节点
                    </div>
                  </div>
                </Tabs.TabPane>

                <!-- 功能列表标签页 -->
                <Tabs.TabPane key="functions" tab="功能列表">
                  <div class="detail-section">
                    <div class="section-header">
                      <h3 class="section-title">功能列表</h3>
                      <Button 
                        v-if="isEdit && getSelectedNode()" 
                        type="primary" 
                        size="small"
                        @click="handleAddFunctionNode"
                      >
                        添加功能
                      </Button>
                    </div>
                    <div v-if="getSelectedNode()">
                      <Table
                        :columns="functionColumns"
                        :data-source="getSelectedNode()?.children?.filter(c => c.type === 'function') || []"
                        :pagination="false"
                        :row-key="(record) => record.key"
                        size="middle"
                        :locale="{ emptyText: '暂无功能' }"
                      >
                        <template #bodyCell="{ column, record }">
                          <template v-if="column.key === 'actions' && isEdit">
                            <Space>
                              <Button type="link" size="small" @click="handleEditFunction(record as ModuleNode)">编辑</Button>
                              <Button type="link" size="small" danger @click="handleDeleteModule(record as ModuleNode)">删除</Button>
                            </Space>
                          </template>
                        </template>
                      </Table>
                    </div>
                    <div v-else class="empty-state">
                      请在左侧选择一个节点
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 其他信息 -->
        <Tabs.TabPane key="other" tab="其他信息">
          <Form
            :model="basicForm"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            :disabled="!isEdit"
          >
            <Row :gutter="24">
              <Col :span="12">
                <Form.Item label="官网地址" name="websiteUrl">
                  <Input v-model:value="basicForm.websiteUrl" placeholder="请输入官网地址" />
                </Form.Item>
              </Col>
              <Col :span="12">
                <Form.Item label="演示地址" name="demoUrl">
                  <Input v-model:value="basicForm.demoUrl" placeholder="请输入演示地址" />
                </Form.Item>
              </Col>
              <Col :span="12">
                <Form.Item label="标签" name="tags">
                  <Select
                    v-model:value="basicForm.tags"
                    mode="tags"
                    placeholder="请输入标签，按Enter添加"
                  />
                </Form.Item>
              </Col>
              <Col :span="12">
                <Form.Item label="备注说明" name="remark">
                  <Input.TextArea
                    v-model:value="basicForm.remark"
                    placeholder="请输入备注说明"
                    :rows="4"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Tabs.TabPane>

        <!-- 使用记录 -->
        <Tabs.TabPane key="usage" tab="使用记录">
          <h3 class="text-lg font-semibold mb-3">产品使用记录</h3>
          <Table
            :columns="usageColumns"
            :data-source="usageList"
            :pagination="{ pageSize: 10 }"
            :row-key="(record) => record.id"
            :scroll="{ x: 1000 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'runStatus'">
                <Tag :color="record.runStatus === '运行中' ? 'success' : 'default'">
                  {{ record.runStatus }}
                </Tag>
              </template>
            </template>
          </Table>
        </Tabs.TabPane>
      </Tabs>
    </Card>

    <!-- 模块编辑弹窗 -->
    <Modal
      v-model:open="moduleModalVisible"
      :title="moduleForm.type === 'function' ? (moduleModalMode === 'add' ? '添加功能' : '编辑功能') : (moduleModalMode === 'add' ? '添加模块' : '编辑模块')"
      @ok="handleSaveModule"
      @cancel="handleCancelModule"
      width="600px"
    >
      <Form
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        class="mt-4"
      >
        <Form.Item :label="moduleForm.type === 'function' ? '功能名称' : '模块名称'" required>
          <Input 
            v-model:value="moduleForm.title" 
            :placeholder="moduleForm.type === 'function' ? '请输入功能名称' : '请输入模块名称'" 
          />
        </Form.Item>
        <Form.Item v-if="moduleForm.type !== 'function'" label="模块类型" required>
          <Select v-model:value="moduleForm.type" placeholder="请选择模块类型">
            <Select.Option value="module">模块</Select.Option>
            <Select.Option value="submodule">子模块</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item v-if="moduleForm.type !== 'function'" label="是否必选">
          <Switch v-model:checked="moduleForm.isRequired" />
          <span class="ml-2 text-gray-500">{{ moduleForm.isRequired ? '必选' : '可选' }}</span>
        </Form.Item>
        <Form.Item :label="moduleForm.type === 'function' ? '功能描述' : '模块描述'">
          <Input.TextArea
            v-model:value="moduleForm.description"
            :placeholder="moduleForm.type === 'function' ? '请输入功能描述' : '请输入模块描述'"
            :rows="3"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
/* 模块结构容器 - 左右分栏 */
.module-structure-container {
  display: flex;
  gap: 12px;
  height: 600px;
}

/* 左侧树形面板 */
.module-tree-panel {
  flex: 0 0 25%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.module-tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

/* 右侧详情面板 */
.module-detail-panel {
  flex: 1;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.module-detail-panel :deep(.ant-tabs) {
  height: 100%;
}

.module-detail-panel :deep(.ant-tabs-content) {
  height: calc(100% - 46px);
  overflow-y: auto;
}

.detail-section {
  padding: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 节点信息 */
.node-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-label {
  width: 80px;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  flex: 1;
}

/* 功能列表 */
.function-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.function-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all 0.2s;
}

.function-item:hover {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.function-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.function-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-right: 12px;
}

.function-desc {
  font-size: 13px;
  color: #999;
}

.function-actions {
  display: flex;
  gap: 4px;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* Tree 组件节点自定义样式 */
:deep(.ant-tree) {
  background: transparent;
}

:deep(.ant-tree .ant-tree-treenode) {
  padding: 4px 0;
}

:deep(.ant-tree .ant-tree-node-content-wrapper) {
  flex: 1;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
  min-height: 36px;
  display: flex;
  align-items: center;
}

:deep(.ant-tree .ant-tree-node-content-wrapper:hover) {
  background: #f5f7fa !important;
}

:deep(.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background: #e6f7ff !important;
}

/* 拖拽时的样式 */
:deep(.ant-tree .ant-tree-treenode.drag-over) {
  background: #e6f7ff;
}

:deep(.ant-tree .ant-tree-treenode.drag-over-gap-top) {
  border-top: 2px solid #1890ff;
}

:deep(.ant-tree .ant-tree-treenode.drag-over-gap-bottom) {
  border-bottom: 2px solid #1890ff;
}

:deep(.ant-tree .ant-tree-switcher) {
  width: 20px;
  height: 40px;
  line-height: 40px;
  color: #8c8c8c;
}

:deep(.ant-tree .ant-tree-switcher:hover) {
  color: #262626;
}

/* 自定义节点内容 */
.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  gap: 12px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.node-type-tag {
  font-size: 12px;
  margin: 0;
  flex-shrink: 0;
}

.node-title-text {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
  flex-shrink: 0;
  margin-right: 8px;
}

.node-desc-text {
  font-size: 13px;
  color: #8c8c8c;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* 树节点操作按钮 */
.tree-node-actions {
  display: none;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 2px 4px;
  margin-left: auto;
}

:deep(.ant-tree-node-content-wrapper:hover) .tree-node-actions {
  display: flex;
}

.tree-node-actions .ant-btn {
  padding: 4px 8px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tree-node-actions .ant-btn .action-icon {
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

.tree-node-actions .ant-btn .add-icon {
  color: #1890ff;
  font-weight: 400;
}

.tree-node-actions .ant-btn .copy-icon {
  color: #666;
  font-weight: 400;
}

.tree-node-actions .ant-btn .delete-icon {
  color: #ff4d4f;
  font-weight: 400;
}
</style>

