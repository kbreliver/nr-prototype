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
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
// @ts-expect-error - Icon组件类型定义
import { Icon } from '@iconify/vue';
import type { LegalEntity } from './types';
import { DataSource, LegalEntityType } from './types';
import {
  countCustomers,
  generateEntityCode,
  getDataSourceInfo,
  getEntityTypeInfo,
  getLegalEntityTypeMap,
} from './utils';
import { getMockTopLevelEntities } from './mock';

defineOptions({
  name: 'LegalEntities',
});

const router = useRouter();

// 组织类型映射
const entityTypeMap = getLegalEntityTypeMap();

// 行业选项（Mock数据，后续从数据字典获取）
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
  '科技制造',
  '科技研发',
  '高科技',
  '互联网',
  '其他',
];

// 搜索表单
const searchForm = reactive({
  entityName: '',
  creditCode: '',
});

// 根节点列表数据
const rootEntities = ref<LegalEntity[]>(getMockTopLevelEntities());

// 选中的行
const selectedRowKeys = ref<number[]>([]);

// 过滤后的数据
const filteredData = computed(() => {
  let data = rootEntities.value;
  
  if (searchForm.entityName) {
    data = data.filter(entity => entity.entityName.includes(searchForm.entityName));
  }
  
  if (searchForm.creditCode) {
    data = data.filter(entity => entity.creditCode && entity.creditCode.includes(searchForm.creditCode));
  }
  
  return data;
});

// 搜索
function handleSearch() {
  // 搜索逻辑已在computed中处理
}

// 重置
function handleReset() {
  searchForm.entityName = '';
  searchForm.creditCode = '';
}

// 行选择
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

// 批量删除
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的法人组织');
    return;
  }
  
  Modal.confirm({
    title: '批量删除确认',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个法人组织吗？删除后不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      // TODO: 调用批量删除API
      message.success(`已删除 ${selectedRowKeys.value.length} 个法人组织`);
      selectedRowKeys.value = [];
      // 刷新列表
      rootEntities.value = getMockTopLevelEntities();
    },
  });
}

// 导出
function handleExport() {
  message.info('导出功能将在后续版本中推出，敬请期待');
}

// 表格列定义
const columns: TableColumnsType = [
  {
    title: '组织编号',
    dataIndex: 'entityCode',
    key: 'entityCode',
    width: 160,
    align: 'center',
    customRender: ({ record }) => {
      return h('a', { 
        onClick: () => handleManage(record),
        class: 'text-primary cursor-pointer hover:underline'
      }, record.entityCode);
    },
  },
  {
    title: '组织名称',
    dataIndex: 'entityName',
    key: 'entityName',
    width: 250,
    align: 'center',
    customRender: ({ record }) => {
      return h('div', { class: 'flex items-center gap-2 justify-center' }, [
        h(Icon, { 
          icon: getEntityTypeInfo(record.entityType).icon,
          class: 'text-xl flex-shrink-0',
          style: { color: `var(--ant-${getEntityTypeInfo(record.entityType).color}-6)` },
        }),
        h('span', { class: 'font-medium text-left' }, record.entityName),
      ]);
    },
  },
  {
    title: '统一社会信用代码',
    dataIndex: 'creditCode',
    key: 'creditCode',
    width: 180,
    align: 'center',
    customRender: ({ text }) => text || '-',
  },
  {
    title: '法定代表人',
    dataIndex: 'legalRepresentative',
    key: 'legalRepresentative',
    width: 120,
    align: 'center',
    customRender: ({ text }) => text || '-',
  },
  {
    title: '注册资本',
    dataIndex: 'registeredCapital',
    key: 'registeredCapital',
    width: 120,
    align: 'right',
    customRender: ({ text }) => text || '-',
  },
  {
    title: '下属组织',
    dataIndex: 'childrenCount',
    key: 'childrenCount',
    width: 100,
    align: 'center',
    customRender: ({ text }) => `${text || 0}个`,
  },
  {
    title: '客户数量',
    dataIndex: 'customerCount',
    key: 'customerCount',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      const count = countCustomers(record);
      return h('span', { class: count > 0 ? 'text-primary font-medium' : '' }, `${count}个`);
    },
  },
  {
    title: '数据来源',
    dataIndex: 'dataSource',
    key: 'dataSource',
    width: 100,
    align: 'center',
    customRender: ({ text }) => {
      const info = getDataSourceInfo(text);
      return h(Tag, { color: info.color }, () => info.label);
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    align: 'left',
    customRender: ({ record }) => {
      return h(Space, {}, () => [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleManage(record),
        }, () => '管理'),
        h(Popconfirm, {
          title: '确定要删除该组织吗？',
          onConfirm: () => handleDelete(record),
        }, () => h(Button, {
          type: 'link',
          danger: true,
          size: 'small',
        }, () => '删除')),
      ]);
    },
  },
];

// 管理集团（进入集团管理页面）
function handleManage(entity: LegalEntity) {
  router.push({
    name: 'LegalEntityManage',
    params: { id: entity.id },
  });
}

// 查看详情
function handleView(entity: LegalEntity) {
  router.push({
    name: 'LegalEntityDetail',
    params: { id: entity.id },
  });
}

// 编辑
function handleEdit(entity: LegalEntity) {
  modalMode.value = 'edit';
  modalTitle.value = `编辑组织：${entity.entityName}`;
  
  Object.assign(formData, {
    id: entity.id,
    entityName: entity.entityName,
    entityShortName: entity.entityShortName,
    entityType: entity.entityType,
    creditCode: entity.creditCode,
    legalRepresentative: entity.legalRepresentative,
    registeredCapital: entity.registeredCapital,
    establishDate: entity.establishDate,
    address: entity.address,
    industry: entity.industry,
    businessScope: entity.businessScope,
    contactPhone: entity.contactPhone,
    remark: entity.remark,
  });
  
  modalVisible.value = true;
}

// 删除
function handleDelete(entity: LegalEntity) {
  if (entity.childrenCount && entity.childrenCount > 0) {
    message.error('该组织有下属组织，无法删除');
    return;
  }
  
  if (entity.customerCount && entity.customerCount > 0) {
    message.error('该组织有关联客户，无法删除');
    return;
  }
  
  message.success(`组织"${entity.entityName}"已删除`);
  console.log('删除组织：', entity);
}

// 新建组织
function handleCreate() {
  modalMode.value = 'create';
  modalTitle.value = '新建组织';
  
  Object.assign(formData, {
    entityName: '',
    entityShortName: '',
    entityType: LegalEntityType.GroupHeadquarters,
    creditCode: '',
    legalRepresentative: '',
    registeredCapital: '',
    establishDate: '',
    address: '',
    industry: '',
    businessScope: '',
    contactPhone: '',
    remark: '',
  });
  
  modalVisible.value = true;
}

// ==================== 新建/编辑弹框 ====================

const modalVisible = ref(false);
const modalTitle = ref('新建组织');
const modalMode = ref<'create' | 'edit'>('create');
const formRef = ref<FormInstance>();
const formData = reactive<Partial<LegalEntity>>({
  entityName: '',
  entityShortName: '',
  entityType: LegalEntityType.GroupHeadquarters,
  creditCode: '',
  legalRepresentative: '',
  registeredCapital: '',
  establishDate: '',
  address: '',
  industry: '',
  businessScope: '',
  contactPhone: '',
  remark: '',
});

const formRules: any = {
  entityName: [
    { required: true, message: '请输入组织名称' },
    { max: 100, message: '组织名称不能超过100个字符' },
  ],
  entityType: [
    { required: true, message: '请选择组织类型' },
  ],
  creditCode: [
    { len: 18, message: '统一社会信用代码应为18位', trigger: 'blur' },
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '统一社会信用代码格式不正确', trigger: 'blur' },
  ],
};

// 保存
async function handleSave() {
  try {
    await formRef.value?.validate();
    
    if (modalMode.value === 'create') {
      const newEntity: LegalEntity = {
        ...formData as LegalEntity,
        id: Date.now(),
        entityCode: generateEntityCode(),
        entityLevel: 1,
        entityType: formData.entityType || LegalEntityType.GroupHeadquarters,
        isCustomer: false,
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 0,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
      };
      
      message.success('组织创建成功');
      console.log('新建组织：', newEntity);
    } else {
      message.success('组织更新成功');
      console.log('更新组织：', formData);
    }
    
    modalVisible.value = false;
  } catch (error) {
    console.error('表单验证失败：', error);
  }
}
</script>

<template>
  <div class="legal-entities-page">
    <Card>
      <!-- 标题区：页面标题（左侧）+ 主要操作按钮（右侧） -->
      <template #title>
        <div class="page-header">
          <span class="page-title">法人组织管理</span>
          <Space>
            <Button type="primary" @click="handleCreate">
              <template #icon>
                <PlusOutlined />
              </template>
              新建根组织
            </Button>
            <Button
              danger
              :disabled="selectedRowKeys.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </Button>
            <Button
              :disabled="selectedRowKeys.length === 0"
              @click="handleExport"
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
          <Form.Item label="组织名称">
            <Input
              v-model:value="searchForm.entityName"
              placeholder="请输入组织名称"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
            />
          </Form.Item>
          <Form.Item label="信用代码">
            <Input
              v-model:value="searchForm.creditCode"
              placeholder="请输入统一社会信用代码"
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

      <!-- 数据表格区：高度自适应，内容区域滚动 -->
      <div class="table-section">
        <Table
          :columns="columns"
          :data-source="filteredData"
          :pagination="false"
          :row-key="(record) => record.id!"
          :row-selection="rowSelection"
          :scroll="{ x: 1400, y: 'calc(100vh - 420px)' }"
        >
          <template #emptyText>
            <div class="text-center py-8">
              <Icon icon="lucide:inbox" class="text-6xl text-gray-300 mb-2" />
              <p class="text-gray-400">暂组织数据</p>
              <Button type="primary" @click="handleCreate" class="mt-2">
                <Icon icon="lucide:plus" class="mr-1" />
                新建根组织
              </Button>
            </div>
          </template>
        </Table>
      </div>
    </Card>

    <!-- 新建/编辑弹框 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="800"
      @ok="handleSave"
    >
      <Form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        class="mt-4"
      >
        <Form.Item label="组织名称" name="entityName">
          <Input v-model:value="formData.entityName" placeholder="请输入组织名称" />
        </Form.Item>
        
        <Form.Item label="组织简称" name="entityShortName">
          <Input v-model:value="formData.entityShortName" placeholder="请输入组织简称" />
        </Form.Item>
        
        <Form.Item label="组织类型" name="entityType">
          <Select v-model:value="formData.entityType" placeholder="请选择组织类型">
            <Select.Option v-for="item in entityTypeMap" :key="item.value" :value="item.value">
              {{ item.label }}
            </Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="统一社会信用代码" name="creditCode">
          <Input v-model:value="formData.creditCode" placeholder="请输入18位统一社会信用代码" :maxlength="18" />
        </Form.Item>
        
        <Form.Item label="法定代表人" name="legalRepresentative">
          <Input v-model:value="formData.legalRepresentative" placeholder="请输入法定代表人" />
        </Form.Item>
        
        <Form.Item label="注册资本" name="registeredCapital">
          <Input v-model:value="formData.registeredCapital" placeholder="如：5000万元" />
        </Form.Item>
        
        <Form.Item label="成立日期" name="establishDate">
          <Input v-model:value="formData.establishDate" placeholder="YYYY-MM-DD" />
        </Form.Item>
        
        <Form.Item label="注册地址" name="address">
          <Input v-model:value="formData.address" placeholder="请输入注册地址" />
        </Form.Item>
        
        <Form.Item label="所属行业" name="industry">
          <Select
            v-model:value="formData.industry"
            placeholder="请选择所属行业"
            allow-clear
            show-search
          >
            <Select.Option v-for="industry in industryOptions" :key="industry" :value="industry">
              {{ industry }}
            </Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="联系电话" name="contactPhone">
          <Input v-model:value="formData.contactPhone" placeholder="请输入联系电话" />
        </Form.Item>
        
        <Form.Item label="经营范围" name="businessScope">
          <Input.TextArea
            v-model:value="formData.businessScope"
            placeholder="请输入经营范围"
            :rows="3"
          />
        </Form.Item>
        
        <Form.Item label="备注" name="remark">
          <Input.TextArea
            v-model:value="formData.remark"
            placeholder="请输入备注"
            :rows="2"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.legal-entities-page {
  padding: 16px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.legal-entities-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.legal-entities-page :deep(.ant-card-body) {
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
</style>
