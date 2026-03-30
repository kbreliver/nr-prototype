<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Tree,
} from 'ant-design-vue';
import type { FormInstance, TreeProps } from 'ant-design-vue';
// @ts-expect-error - Icon组件类型定义
import { Icon } from '@iconify/vue';
import type { LegalEntity } from './types';
import { DataSource, LegalEntityType } from './types';
import {
  buildEntityPath,
  findEntityById,
  flattenEntityTree,
  generateEntityCode,
  getDataSourceInfo,
  getEntityTypeInfo,
  getLegalEntityTypeMap,
  hasCircularReference,
  prepareTreeData,
} from './utils';
import { getMockLegalEntityById, getMockGroupCustomers } from './mock';

defineOptions({
  name: 'LegalEntityManage',
});

// 统一左右两侧高度
const containerHeight = ref('calc(100vh - 280px)'); // 可根据实际情况调整

const route = useRoute();
const router = useRouter();

// 获取集团ID
const groupId = computed(() => Number(route.params.id));

// 当前集团数据
const groupEntity = ref<LegalEntity | null>(null);

// 加载集团数据
function loadGroupData() {
  const entity = getMockLegalEntityById(groupId.value);
  if (entity) {
    groupEntity.value = entity;
  } else {
    message.error('集团不存在');
    router.back();
  }
}

loadGroupData();

// 监听路由变化
watch(
  () => route.params.id,
  () => {
    if (route.params.id) {
      loadGroupData();
    }
  },
);

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

// 树形数据（只显示当前组织）
const treeData = computed(() => {
  if (!groupEntity.value) return [];
  return [groupEntity.value];
});

const expandedKeys = ref<string[]>([String(groupId.value)]);
const selectedKeys = ref<string[]>([]);
const selectedEntity = ref<LegalEntity | null>(null);

// 扁平化的组织列表
const flatEntities = computed(() => flattenEntityTree(treeData.value));

// 准备Tree组件数据
const preparedTreeData = computed(() => prepareTreeData(treeData.value));

// 当前集团下的所有已关联客户
const groupCustomers = computed(() => {
  if (!groupEntity.value) return [];
  return getMockGroupCustomers(groupEntity.value.id);
});

// 树节点选择
const handleTreeSelect: TreeProps['onSelect'] = (keys) => {
  if (keys.length > 0) {
    const entityId = Number(keys[0]);
    const entity = findEntityById(treeData.value, entityId);
    selectedEntity.value = entity;
  }
};

// 树节点展开/收起
const handleTreeExpand: TreeProps['onExpand'] = (keys) => {
  expandedKeys.value = keys as string[];
};

// 返回集团列表
function handleBack() {
  router.push({ name: 'LegalEntities' });
}

// 查看客户详情
function handleViewCustomer(customer: LegalEntity) {
  if (customer.customerId) {
    router.push({
      path: `/market-customers/archives/detail/${customer.customerId}`,
    });
  }
}

// ==================== 新建/编辑组织 ====================

const modalVisible = ref(false);
const modalTitle = ref('新建组织');
const modalMode = ref<'create' | 'edit'>('create');
const formRef = ref<FormInstance>();
const formData = reactive<Partial<LegalEntity>>({
  entityName: '',
  entityShortName: '',
  creditCode: '',
  legalRepresentative: '',
  registeredCapital: '',
  establishDate: '',
  address: '',
  parentEntityId: undefined,
  entityType: LegalEntityType.Subsidiary,
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
  entityShortName: [{ max: 50, message: '组织简称不能超过50个字符' }],
  creditCode: [
    { len: 18, message: '统一社会信用代码应为18位', trigger: 'blur' },
    {
      pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
      message: '统一社会信用代码格式不正确',
      trigger: 'blur',
    },
  ],
  entityType: [{ required: true, message: '请选择组织类型' }],
};

// 添加子组织
function handleAddChild(parentEntity: LegalEntity) {
  modalMode.value = 'create';
  modalTitle.value = `添加子组织（上级：${parentEntity.entityName}）`;

  Object.assign(formData, {
    entityName: '',
    entityShortName: '',
    creditCode: '',
    legalRepresentative: '',
    registeredCapital: '',
    establishDate: '',
    address: '',
    parentEntityId: parentEntity.id,
    entityType: LegalEntityType.Subsidiary,
    industry: parentEntity.industry || '',
    businessScope: '',
    contactPhone: '',
    remark: '',
  });

  modalVisible.value = true;
}

// 编辑组织
function handleEdit(entity: LegalEntity) {
  modalMode.value = 'edit';
  modalTitle.value = `编辑组织：${entity.entityName}`;

  Object.assign(formData, {
    id: entity.id,
    entityName: entity.entityName,
    entityShortName: entity.entityShortName,
    creditCode: entity.creditCode,
    legalRepresentative: entity.legalRepresentative,
    registeredCapital: entity.registeredCapital,
    establishDate: entity.establishDate,
    address: entity.address,
    parentEntityId: entity.parentEntityId,
    entityType: entity.entityType,
    industry: entity.industry,
    businessScope: entity.businessScope,
    contactPhone: entity.contactPhone,
    remark: entity.remark,
  });

  modalVisible.value = true;
}

// 保存组织
async function handleSave() {
  try {
    await formRef.value?.validate();

    // 检查循环引用
    if (formData.id && formData.parentEntityId) {
      if (
        hasCircularReference(
          formData.id,
          formData.parentEntityId,
          flatEntities.value,
        )
      ) {
        message.error('不能将组织设置为自己或自己下级的子组织');
        return;
      }
    }

    if (modalMode.value === 'create') {
      const newEntity: LegalEntity = {
        ...(formData as LegalEntity),
        id: Date.now(),
        entityCode: generateEntityCode(),
        entityLevel: formData.parentEntityId
          ? (flatEntities.value.find((e) => e.id === formData.parentEntityId)
              ?.entityLevel || 0) + 1
          : 1,
        isCustomer: false,
        dataSource: DataSource.Manual,
        childrenCount: 0,
        customerCount: 0,
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
      };

      newEntity.entityPath = buildEntityPath(newEntity, [
        ...flatEntities.value,
        newEntity,
      ]);

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

// 删除组织
function handleDelete(entity: LegalEntity) {
  if (entity.children && entity.children.length > 0) {
    message.error('该组织有下属组织，无法删除');
    return;
  }

  if (entity.isCustomer) {
    message.error('该组织已关联客户，无法删除');
    return;
  }

  message.success(`组织"${entity.entityName}"已删除`);
  console.log('删除组织：', entity);
}

// 从第三方更新数据
function handleUpdateFromThirdParty(entity: LegalEntity) {
  if (!entity.creditCode) {
    message.warning('该组织没有统一社会信用代码，无法从第三方更新');
    return;
  }

  message.info('从第三方更新数据功能开发中...');
  console.log('从第三方更新组织数据：', entity);
}
</script>

<template>
  <div class="legal-entity-manage-page">
    <!-- 页面头部 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button type="text" size="small" @click="handleBack">
          <Icon icon="lucide:arrow-left" class="text-lg" />
        </Button>
        <div>
          <h2 class="m-0 text-xl font-medium">{{ groupEntity?.entityName }}</h2>
          <p class="mt-1 text-sm text-gray-500">
            管理该组织及下属组织的层级结构
          </p>
        </div>
      </div>
    </div>

    <!-- 主内容区域：左右分栏 -->
    <Card :bordered="false">
      <Row :gutter="16">
        <!-- 左侧：组织树 -->
        <Col :span="6">
          <div class="tree-container">
            <div class="tree-header mb-3">
              <div class="flex items-center justify-between">
                <h3 class="m-0 text-base font-medium">组织架构</h3>
                <Button
                  type="primary"
                  size="small"
                  @click="handleAddChild(groupEntity!)"
                >
                  <Icon icon="lucide:plus" class="mr-1" />
                  添加子组织
                </Button>
              </div>
            </div>

            <div
              class="tree-content"
              :style="{ height: containerHeight, overflowY: 'auto' }"
            >
              <Tree
                v-if="preparedTreeData.length > 0"
                v-model:expanded-keys="expandedKeys"
                v-model:selected-keys="selectedKeys"
                :tree-data="preparedTreeData as any"
                :show-line="{ showLeafIcon: false }"
                @select="handleTreeSelect"
                @expand="handleTreeExpand"
              >
                <template #title="{ entityName, isCustomer, entityType }">
                  <div class="flex items-center gap-2">
                    <Icon
                      :icon="getEntityTypeInfo(entityType).icon"
                      class="text-lg"
                      :style="{
                        color: `var(--ant-${getEntityTypeInfo(entityType).color}-6)`,
                      }"
                    />
                    <span>{{ entityName }}</span>
                  </div>
                </template>
              </Tree>
            </div>
          </div>
        </Col>

        <!-- 右侧：组织详情 -->
        <Col :span="18">
          <div v-if="selectedEntity" class="detail-container">
            <div class="detail-header mb-4">
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="m-0 mb-2 text-xl font-medium">
                    {{ selectedEntity.entityName }}
                  </h2>
                  <Space>
                    <Tag
                      :color="
                        getEntityTypeInfo(selectedEntity.entityType).color
                      "
                    >
                      {{ getEntityTypeInfo(selectedEntity.entityType).label }}
                    </Tag>
                    <Tag
                      :color="
                        getDataSourceInfo(selectedEntity.dataSource).color
                      "
                    >
                      {{ getDataSourceInfo(selectedEntity.dataSource).label }}
                    </Tag>
                  </Space>
                </div>

                <Space>
                  <Button size="small" @click="handleEdit(selectedEntity)">
                    <Icon icon="lucide:edit" class="mr-1" />
                    编辑
                  </Button>
                  <Button
                    size="small"
                    @click="handleUpdateFromThirdParty(selectedEntity)"
                  >
                    <Icon icon="lucide:refresh-cw" class="mr-1" />
                    从第三方更新
                  </Button>
                  <Popconfirm
                    title="确定要删除该组织吗？"
                    @confirm="handleDelete(selectedEntity)"
                  >
                    <Button size="small" danger>
                      <Icon icon="lucide:trash-2" class="mr-1" />
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            </div>

            <Divider class="my-4" />

            <div
              class="detail-content"
              :style="{ maxHeight: containerHeight, overflowY: 'auto' }"
            >
              <!-- 基本信息 -->
              <div class="info-section mb-6">
                <h3 class="mb-3 text-base font-medium">基本信息</h3>
                <Row :gutter="[16, 16]">
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">组织编号：</span>
                      <span class="value">{{ selectedEntity.entityCode }}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">组织简称：</span>
                      <span class="value">{{
                        selectedEntity.entityShortName || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">信用代码：</span>
                      <span class="value">{{
                        selectedEntity.creditCode || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">法定代表人：</span>
                      <span class="value">{{
                        selectedEntity.legalRepresentative || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">注册资本：</span>
                      <span class="value">{{
                        selectedEntity.registeredCapital || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">成立日期：</span>
                      <span class="value">{{
                        selectedEntity.establishDate || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col :span="24">
                    <div class="info-item">
                      <span class="label">注册地址：</span>
                      <span class="value">{{
                        selectedEntity.address || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">所属行业：</span>
                      <span class="value">{{
                        selectedEntity.industry || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">联系电话：</span>
                      <span class="value">{{
                        selectedEntity.contactPhone || '-'
                      }}</span>
                    </div>
                  </Col>
                  <Col v-if="selectedEntity.businessScope" :span="24">
                    <div class="info-item">
                      <span class="label">经营范围：</span>
                      <span class="value">{{
                        selectedEntity.businessScope
                      }}</span>
                    </div>
                  </Col>
                </Row>
              </div>

              <Divider />

              <!-- 组织层级 -->
              <div class="info-section mb-6">
                <h3 class="mb-3 text-base font-medium">组织层级</h3>
                <Row :gutter="[16, 16]">
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">组织层级：</span>
                      <span class="value"
                        >第{{ selectedEntity.entityLevel }}级</span
                      >
                    </div>
                  </Col>
                  <Col :span="12">
                    <div class="info-item">
                      <span class="label">下属组织：</span>
                      <span class="value"
                        >{{ selectedEntity.childrenCount || 0 }}个</span
                      >
                    </div>
                  </Col>
                  <Col :span="24">
                    <div class="info-item">
                      <span class="label">组织路径：</span>
                      <span class="value">{{ selectedEntity.entityPath }}</span>
                    </div>
                  </Col>
                  <Col v-if="selectedEntity.parentEntityName" :span="24">
                    <div class="info-item">
                      <span class="label">上级组织：</span>
                      <span class="value">{{
                        selectedEntity.parentEntityName
                      }}</span>
                    </div>
                  </Col>
                </Row>
              </div>

              <Divider />

              <!-- 已关联客户 -->
              <div class="info-section mb-6">
                <h3 class="mb-3 text-base font-medium">已关联客户</h3>
                <Row :gutter="[16, 16]">
                  <Col :span="24">
                    <div class="info-item">
                      <span class="label">关联客户：</span>
                      <div class="value">
                        <template v-if="groupCustomers.length > 0">
                          <div class="customer-item">
                            <a
                              href="javascript:void(0)"
                              class="customer-name text-blue-600 hover:underline"
                              @click="handleViewCustomer(groupCustomers[0])"
                            >
                              {{ groupCustomers[0].entityName }}
                            </a>
                            <span class="customer-code ml-2 text-gray-500"
                              >({{ groupCustomers[0].customerCode }})</span
                            >
                          </div>
                        </template>
                        <span v-else class="text-gray-500">未关联</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>

          <div
            v-else
            class="empty-detail text-center text-gray-400"
            :style="{ height: containerHeight }"
          >
            <Icon icon="lucide:mouse-pointer-click" class="mb-4 text-6xl" />
            <p class="text-lg">请从左侧选择一个组织节点</p>
          </div>
        </Col>
      </Row>
    </Card>

    <!-- 新建/编辑组织弹框 -->
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
          <Input
            v-model:value="formData.entityName"
            placeholder="请输入组织名称"
          />
        </Form.Item>

        <Form.Item label="组织简称" name="entityShortName">
          <Input
            v-model:value="formData.entityShortName"
            placeholder="请输入组织简称"
          />
        </Form.Item>

        <Form.Item label="组织类型" name="entityType">
          <Select
            v-model:value="formData.entityType"
            placeholder="请选择组织类型"
          >
            <Select.Option
              v-for="item in entityTypeMap"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="统一社会信用代码" name="creditCode">
          <Input
            v-model:value="formData.creditCode"
            placeholder="请输入18位统一社会信用代码"
            :maxlength="18"
          />
        </Form.Item>

        <Form.Item label="法定代表人" name="legalRepresentative">
          <Input
            v-model:value="formData.legalRepresentative"
            placeholder="请输入法定代表人"
          />
        </Form.Item>

        <Form.Item label="注册资本" name="registeredCapital">
          <Input
            v-model:value="formData.registeredCapital"
            placeholder="如：5000万元"
          />
        </Form.Item>

        <Form.Item label="成立日期" name="establishDate">
          <Input
            v-model:value="formData.establishDate"
            placeholder="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item label="注册地址" name="address">
          <Input
            v-model:value="formData.address"
            placeholder="请输入注册地址"
          />
        </Form.Item>

        <Form.Item label="所属行业" name="industry">
          <Select
            v-model:value="formData.industry"
            placeholder="请选择所属行业"
            allow-clear
            show-search
          >
            <Select.Option
              v-for="industry in industryOptions"
              :key="industry"
              :value="industry"
            >
              {{ industry }}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="联系电话" name="contactPhone">
          <Input
            v-model:value="formData.contactPhone"
            placeholder="请输入联系电话"
          />
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
.legal-entity-manage-page {
  padding: 16px;
}

.tree-container {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.detail-container {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 24px;
  background: #fff;
}

.info-item {
  display: flex;
  line-height: 1.8;
}

.info-item .label {
  color: #666;
  min-width: 120px;
  flex-shrink: 0;
}

.info-item .value {
  color: #333;
  flex: 1;
}

.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.customer-item {
  display: inline-block;
  margin-right: 16px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.customer-name {
  font-weight: 500;
}

.customer-code {
  font-size: 12px;
}
</style>
