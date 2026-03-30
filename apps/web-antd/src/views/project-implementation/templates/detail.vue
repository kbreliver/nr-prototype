<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType } from 'ant-design-vue';
import type { ImplementationTemplate } from '../shared/types';
import { TemplateStatus } from '../shared/types';
import {
  getTemplateTypeLabel,
  getTemplateTypeColor,
  getTemplateStatusLabel,
  getTemplateStatusColor,
} from '../shared/utils';
import { getTemplateById, mockUpdateTemplate } from '../shared/mock';

defineOptions({
  name: 'TemplateDetail',
});

const route = useRoute();
const router = useRouter();

const templateId = ref(route.query.id ? Number(route.query.id) : null);

function parseRouteMode(modeParam: unknown) {
  const value = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  if (value === 'edit' || value === 'view') {
    return value;
  }
  return 'view';
}

const initialMode = parseRouteMode(route.query.mode);
const isEditMode = ref(initialMode === 'edit');
const isViewMode = computed(() => !isEditMode.value);

const templateDetail = ref<ImplementationTemplate | null>(null);

const formRef = ref<FormInstance>();
const formData = ref<any>({
  name: '',
  type: '',
  status: TemplateStatus.ENABLED,
  description: '',
  tasks: [],
});

// 任务列表表格列
const taskColumns: TableColumnsType<any> = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    align: 'center',
  },
  {
    title: '顺序',
    dataIndex: 'order',
    key: 'order',
    width: 80,
    align: 'center',
  },
  {
    title: '计划天数',
    dataIndex: 'plannedDays',
    key: 'plannedDays',
    width: 100,
    align: 'right',
  },
  {
    title: '负责角色',
    dataIndex: 'roleName',
    key: 'roleName',
    width: 120,
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'left',
    customRender: ({ record }) => {
      if (isEditMode.value) {
        return h(
          Button,
          {
            type: 'link',
            size: 'small',
            danger: true,
          },
          () => '删除'
        );
      }
      return '-';
    },
  },
];

// 加载方案详情
function loadTemplateDetail() {
  if (!templateId.value) return;

  const template = getTemplateById(templateId.value);
  if (!template) {
    message.error('方案不存在');
    router.back();
    return;
  }

  templateDetail.value = template;
  formData.value = {
    name: template.name,
    type: template.type,
    status: template.status,
    description: template.description,
    tasks: [...template.tasks],
  };
}

// 返回
function handleBack() {
  router.back();
}

// 编辑
function handleEdit() {
  isEditMode.value = true;
}

// 取消编辑
function handleCancel() {
  isEditMode.value = false;
  loadTemplateDetail();
}

// 保存
async function handleSave() {
  if (!templateId.value) return;

  try {
    await formRef.value?.validate();

    await mockUpdateTemplate(templateId.value, {
      name: formData.value.name,
      type: formData.value.type,
      status: formData.value.status,
      description: formData.value.description,
      tasks: formData.value.tasks,
    });

    message.success('保存成功');
    isEditMode.value = false;
    loadTemplateDetail();
  } catch (error: any) {
    if (error.errorFields) {
      message.error('请检查表单填写是否正确');
    } else {
      message.error('保存失败');
    }
  }
}

// 初始化加载数据
loadTemplateDetail();
</script>

<template>
  <div class="template-detail-page">
    <Card v-if="templateDetail">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <Button type="text" @click="handleBack">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
          </Button>
          <span class="page-title">方案详情</span>
          <span class="template-code">{{ templateDetail.code }}</span>
          <Tag :color="getTemplateTypeColor(templateDetail.type)">
            {{ getTemplateTypeLabel(templateDetail.type) }}
          </Tag>
          <Tag :color="getTemplateStatusColor(templateDetail.status)">
            {{ getTemplateStatusLabel(templateDetail.status) }}
          </Tag>
        </div>
        <div class="header-right">
          <Space>
            <template v-if="isViewMode">
              <Button @click="handleEdit">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </Button>
            </template>
            <template v-else>
              <Button @click="handleCancel">取消</Button>
              <Button type="primary" @click="handleSave">
                <template #icon>
                  <SaveOutlined />
                </template>
                保存
              </Button>
            </template>
          </Space>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="basic-info-section">
        <Form
          ref="formRef"
          :model="formData"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
        >
          <Row :gutter="24">
            <Col :span="12">
              <Form.Item label="方案编号">
                <Input :value="templateDetail.code" disabled />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="方案名称" name="name" :rules="[{ required: true, message: '请输入方案名称' }]">
                <Input
                  v-model:value="formData.name"
                  :disabled="isViewMode"
                  placeholder="请输入方案名称"
                  allow-clear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row :gutter="24">
            <Col :span="12">
              <Form.Item label="方案类型">
                <Select
                  v-model:value="formData.type"
                  :disabled="true"
                  placeholder="方案类型创建后不可修改"
                >
                  <Select.Option value="standard">标准型</Select.Option>
                  <Select.Option value="fast">快速型</Select.Option>
                  <Select.Option value="custom">定制型</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="方案状态">
                <Select
                  v-model:value="formData.status"
                  :disabled="isViewMode"
                  placeholder="请选择方案状态"
                >
                  <Select.Option value="enabled">启用</Select.Option>
                  <Select.Option value="disabled">停用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row :gutter="24">
            <Col :span="24">
              <Form.Item label="方案描述" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                <Input.TextArea
                  v-model:value="formData.description"
                  :disabled="isViewMode"
                  :rows="4"
                  placeholder="请输入方案描述"
                  allow-clear
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      <!-- 标准任务列表 -->
      <div class="tasks-section">
        <Card title="标准任务列表" :bordered="false">
          <template #extra>
            <Button v-if="isEditMode" type="primary" size="small">
              <template #icon>
                <PlusOutlined />
              </template>
              添加任务
            </Button>
          </template>
          <Table
            :columns="taskColumns"
            :data-source="formData.tasks"
            :pagination="false"
            :row-key="(record) => record.id"
          />
        </Card>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.template-detail-page {
  padding: 24px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.template-detail-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.template-detail-page :deep(.ant-card-body) {
  flex: 1;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #000;
}

.template-code {
  font-size: 14px;
  color: #666;
}

.basic-info-section {
  margin-bottom: 24px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
}

.tasks-section {
  margin-top: 24px;
}

.template-detail-page :deep(.ant-table-thead > tr > th) {
  text-align: center;
  background: #fafafa;
}

.template-detail-page :deep(.ant-form-item) {
  margin-bottom: 20px;
}
</style>

