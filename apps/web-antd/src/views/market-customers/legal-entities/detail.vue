<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Tree,
} from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import type { LegalEntity } from './types';
import {
  buildEntityPath,
  countCustomers,
  findEntityById,
  getDataSourceInfo,
  getEntityTypeInfo,
} from './utils';
import { getMockGroupCustomers, getMockLegalEntityById, mockLegalEntityTree } from './mock';

defineOptions({
  name: 'LegalEntityDetail',
});

const route = useRoute();
const router = useRouter();

// 获取组织ID
const entityId = computed(() => Number(route.params.id));

// 加载组织数据
const entity = ref<LegalEntity | null>(null);
const loading = ref(false);

function loadEntityData() {
  loading.value = true;
  
  // 从Mock数据中获取
  const mockEntity = getMockLegalEntityById(entityId.value);
  if (mockEntity) {
    entity.value = mockEntity;
  } else {
    message.error('组织不存在');
    router.back();
  }
  
  loading.value = false;
}

// 初始加载
loadEntityData();

// 当前标签页
const activeTab = ref('basic');

// 组织类型信息
const entityTypeInfo = computed(() => {
  return entity.value ? getEntityTypeInfo(entity.value.entityType) : null;
});

// 数据来源信息
const dataSourceInfo = computed(() => {
  return entity.value ? getDataSourceInfo(entity.value.dataSource) : null;
});

// 返回
function handleBack() {
  router.back();
}

// 编辑
function handleEdit() {
  message.info('编辑功能开发中...');
}

// 从第三方更新
function handleUpdateFromThirdParty() {
  if (!entity.value?.creditCode) {
    message.warning('该组织没有统一社会信用代码，无法从第三方更新');
    return;
  }
  
  message.info('从第三方更新数据功能开发中...');
}

// ==================== 组织层级 ====================

// 获取完整的组织树（用于展示层级关系）
const organizationTree = computed(() => {
  if (!entity.value) return [];
  
  // 找到根组织
  let root = entity.value;
  const allEntities = [entity.value];
  
  while (root.parentEntityId) {
    const parent = getMockLegalEntityById(root.parentEntityId);
    if (!parent) break;
    allEntities.unshift(parent);
    root = parent;
  }
  
  return mockLegalEntityTree.filter(e => e.id === root.id);
});

// 构建组织路径面包屑
const pathBreadcrumb = computed(() => {
  if (!entity.value) return [];
  
  const path = entity.value.entityPath?.split(' > ') || [];
  return path;
});

// ==================== 关联客户 ====================

// 集团下的所有客户
const groupCustomers = computed(() => {
  if (!entity.value) return [];
  return getMockGroupCustomers(entity.value.id!).filter(e => e.id !== entity.value!.id);
});

// 客户列表表格列
const customerColumns: TableColumnsType = [
  {
    title: '组织名称',
    dataIndex: 'entityName',
    key: 'entityName',
  },
  {
    title: '组织层级',
    dataIndex: 'entityLevel',
    key: 'entityLevel',
    width: 100,
    customRender: ({ text }) => `第${text}级`,
  },
  {
    title: '客户编号',
    dataIndex: 'customerCode',
    key: 'customerCode',
    width: 180,
  },
  {
    title: '组织类型',
    dataIndex: 'entityType',
    key: 'entityType',
    width: 120,
    customRender: ({ text }) => {
      const info = getEntityTypeInfo(text);
      return h(Tag, { color: info.color }, () => info.label);
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ record }) => {
      return h(
        Button,
        {
          type: 'link',
          size: 'small',
          onClick: () => handleViewCustomer(record),
        },
        () => '查看客户',
      );
    },
  },
];

// 查看客户
function handleViewCustomer(entity: LegalEntity) {
  if (!entity.customerId) return;
  
  router.push({
    name: 'CustomerArchiveDetail',
    params: { id: entity.customerId },
  });
}

// 创建客户
function handleCreateCustomer() {
  if (!entity.value) return;
  
  if (entity.value.isCustomer) {
    message.warning('该组织已关联客户');
    return;
  }
  
  router.push({
    name: 'CustomerArchives',
    query: {
      action: 'create',
      legalEntityId: entity.value.id,
      legalEntityName: entity.value.entityName,
      creditCode: entity.value.creditCode,
    },
  });
}

// 查看当前组织的客户
function handleViewCurrentCustomer() {
  if (!entity.value?.customerId) return;
  
  router.push({
    name: 'CustomerArchiveDetail',
    params: { id: entity.value.customerId },
  });
}
</script>

<template>
  <div class="legal-entity-detail-page">
    <Card :bordered="false" :loading="loading">
      <!-- 头部 -->
      <div class="detail-header mb-6">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <Button type="text" size="small" @click="handleBack">
                <Icon icon="lucide:arrow-left" class="text-lg" />
              </Button>
              <h1 class="text-2xl font-medium m-0">{{ entity?.entityName }}</h1>
            </div>
            
            <div class="flex items-center gap-2 ml-9">
              <span class="text-gray-500">{{ entity?.entityCode }}</span>
              <Divider type="vertical" />
              <Tag v-if="entityTypeInfo" :color="entityTypeInfo.color">
                <Icon :icon="entityTypeInfo.icon" class="mr-1" />
                {{ entityTypeInfo.label }}
              </Tag>
              <Tag v-if="entity?.isCustomer" color="success">
                <Icon icon="lucide:check-circle" class="mr-1" />
                客户✓
              </Tag>
              <Tag v-if="dataSourceInfo" :color="dataSourceInfo.color">
                {{ dataSourceInfo.label }}
              </Tag>
            </div>
          </div>
          
          <Space>
            <Button @click="handleEdit">
              <Icon icon="lucide:edit" class="mr-1" />
              编辑
            </Button>
            <Button @click="handleUpdateFromThirdParty">
              <Icon icon="lucide:refresh-cw" class="mr-1" />
              从第三方更新
            </Button>
          </Space>
        </div>
      </div>

      <!-- 标签页 -->
      <Tabs v-model:active-key="activeTab">
        <!-- 基本信息 -->
        <Tabs.TabPane key="basic" tab="基本信息">
          <Descriptions bordered :column="2">
            <Descriptions.Item label="组织名称">
              {{ entity?.entityName }}
            </Descriptions.Item>
            
            <Descriptions.Item label="组织简称">
              {{ entity?.entityShortName || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item label="组织编号">
              {{ entity?.entityCode }}
            </Descriptions.Item>
            
            <Descriptions.Item label="组织类型">
              <Tag v-if="entityTypeInfo" :color="entityTypeInfo.color">
                <Icon :icon="entityTypeInfo.icon" class="mr-1" />
                {{ entityTypeInfo.label }}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="统一社会信用代码" :span="2">
              {{ entity?.creditCode || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item label="法定代表人">
              {{ entity?.legalRepresentative || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item label="注册资本">
              {{ entity?.registeredCapital || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item label="成立日期">
              {{ entity?.establishDate || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item label="所属行业">
              {{ entity?.industry || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item label="联系电话" :span="2">
              {{ entity?.contactPhone || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item label="注册地址" :span="2">
              {{ entity?.address || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item v-if="entity?.businessScope" label="经营范围" :span="2">
              {{ entity.businessScope }}
            </Descriptions.Item>
            
            <Descriptions.Item label="数据来源">
              <Tag v-if="dataSourceInfo" :color="dataSourceInfo.color">
                {{ dataSourceInfo.label }}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="创建时间">
              {{ entity?.createTime || '-' }}
            </Descriptions.Item>
            
            <Descriptions.Item v-if="entity?.remark" label="备注" :span="2">
              {{ entity.remark }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 组织层级 -->
        <Tabs.TabPane key="hierarchy" tab="组织层级">
          <div class="hierarchy-content">
            <!-- 路径导航 -->
            <Card size="small" class="mb-4">
              <div class="flex items-center">
                <span class="text-gray-500 mr-2">组织路径：</span>
                <div class="flex items-center gap-2">
                  <template v-for="(item, index) in pathBreadcrumb" :key="index">
                    <span :class="index === pathBreadcrumb.length - 1 ? 'text-primary font-medium' : 'text-gray-600'">
                      {{ item }}
                    </span>
                    <Icon v-if="index < pathBreadcrumb.length - 1" icon="lucide:chevron-right" class="text-gray-400" />
                  </template>
                </div>
              </div>
              
              <Divider class="my-3" />
              
              <Row :gutter="16">
                <Col :span="8">
                  <div class="stat-item">
                    <div class="label">组织层级</div>
                    <div class="value">第{{ entity?.entityLevel }}级</div>
                  </div>
                </Col>
                <Col :span="8">
                  <div class="stat-item">
                    <div class="label">下属组织</div>
                    <div class="value">{{ entity?.childrenCount || 0 }}个</div>
                  </div>
                </Col>
                <Col :span="8">
                  <div class="stat-item">
                    <div class="label">客户数量</div>
                    <div class="value text-primary">{{ entity?.customerCount || 0 }}个</div>
                  </div>
                </Col>
              </Row>
            </Card>

            <!-- 组织树 -->
            <Card size="small" title="完整组织架构">
              <Tree
                v-if="organizationTree.length > 0"
                :tree-data="organizationTree"
                :default-expand-all="true"
                :show-line="{ showLeafIcon: false }"
                :selectable="false"
              >
                <template #title="{ entityName, isCustomer, entityType, id }">
                  <div class="flex items-center gap-2">
                    <Icon
                      :icon="getEntityTypeInfo(entityType).icon"
                      class="text-lg"
                      :style="{ color: `var(--ant-${getEntityTypeInfo(entityType).color}-6)` }"
                    />
                    <span :class="{ 'text-primary font-medium': id === entity?.id }">
                      {{ entityName }}
                      <span v-if="id === entity?.id" class="text-xs text-gray-500 ml-1">(当前)</span>
                    </span>
                    <Tag v-if="isCustomer" color="success" size="small">客户✓</Tag>
                  </div>
                </template>
              </Tree>
            </Card>
          </div>
        </Tabs.TabPane>

        <!-- 关联客户 -->
        <Tabs.TabPane key="customer" tab="关联客户">
          <div class="customer-content">
            <!-- 当前组织的客户状态 -->
            <Card size="small" class="mb-4">
              <div v-if="entity?.isCustomer" class="bg-green-50 p-4 rounded">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center">
                    <Icon icon="lucide:check-circle" class="text-green-600 text-2xl mr-3" />
                    <div>
                      <div class="text-lg font-medium text-green-700">该组织已关联客户档案</div>
                      <div class="text-sm text-gray-600 mt-1">
                        客户编号：<span class="font-mono">{{ entity.customerCode }}</span>
                      </div>
                    </div>
                  </div>
                  <Button type="primary" @click="handleViewCurrentCustomer">
                    <Icon icon="lucide:external-link" class="mr-1" />
                    查看客户档案
                  </Button>
                </div>
              </div>
              
              <div v-else class="bg-gray-50 p-4 rounded">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Icon icon="lucide:alert-circle" class="text-gray-400 text-2xl mr-3" />
                    <div>
                      <div class="text-lg font-medium text-gray-600">该组织尚未创建客户档案</div>
                      <div class="text-sm text-gray-500 mt-1">
                        可以基于该法人组织创建客户档案，系统将自动关联基础信息
                      </div>
                    </div>
                  </div>
                  <Button type="primary" @click="handleCreateCustomer">
                    <Icon icon="lucide:plus" class="mr-1" />
                    创建客户档案
                  </Button>
                </div>
              </div>
            </Card>

            <!-- 集团客户列表 -->
            <Card size="small" :title="`集团客户列表（${groupCustomers.length}个）`">
              <Table
                v-if="groupCustomers.length > 0"
                :columns="customerColumns"
                :data-source="groupCustomers"
                :pagination="false"
                :row-key="(record) => record.id!"
              />
              
              <div v-else class="text-center text-gray-400 py-8">
                <Icon icon="lucide:inbox" class="text-4xl mb-2" />
                <p>该集团下暂无其他客户</p>
              </div>
            </Card>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<style scoped>
.legal-entity-detail-page {
  padding: 16px;
}

.detail-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.stat-item .value {
  color: #333;
  font-size: 20px;
  font-weight: 500;
}

:deep(.ant-tree .ant-tree-node-content-wrapper) {
  flex: 1;
}
</style>

