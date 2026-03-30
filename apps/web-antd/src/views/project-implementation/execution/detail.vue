<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Descriptions,
  message,
  Space,
  Tag,
} from 'ant-design-vue';
import type { DeliveryTask, HardwareDeliveryTask, SoftwareDeliveryTask } from '../shared/types';
import { TaskType } from '../shared/types';
import {
  getTaskStatusLabel,
  getTaskStatusColor,
  getTaskTypeLabel,
  getTaskTypeColor,
} from '../shared/utils';
import { getDeliveryTaskById } from '../shared/mock';
import SoftwareDelivery from '../shared/components/SoftwareDelivery.vue';
import HardwareDelivery from '../shared/components/HardwareDelivery.vue';

defineOptions({
  name: 'TaskExecutionDetail',
});

const route = useRoute();
const router = useRouter();

const taskId = ref(route.query.id ? Number(route.query.id) : null);
const taskDetail = ref<SoftwareDeliveryTask | HardwareDeliveryTask | undefined>();

// 加载任务详情
function loadTaskDetail() {
  if (!taskId.value) {
    message.error('任务ID无效');
    router.back();
    return;
  }

  const task = getDeliveryTaskById(taskId.value);
  if (!task) {
    message.error('任务不存在');
    router.back();
    return;
  }

  taskDetail.value = task;
}

// 返回
function handleBack() {
  router.back();
}

// 判断任务类型
const isSoftwareTask = computed(() => taskDetail.value?.type === TaskType.SOFTWARE);
const isHardwareTask = computed(() => taskDetail.value?.type === TaskType.HARDWARE);

// 初始化加载数据
loadTaskDetail();
</script>

<template>
  <div class="task-detail-page">
    <Card v-if="taskDetail">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <Button type="text" @click="handleBack">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
          </Button>
          <span class="page-title">任务详情</span>
          <Tag :color="getTaskTypeColor(taskDetail.type)">
            {{ getTaskTypeLabel(taskDetail.type) }}
          </Tag>
          <Tag :color="getTaskStatusColor(taskDetail.status)">
            {{ getTaskStatusLabel(taskDetail.status) }}
          </Tag>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="basic-info-section">
        <Descriptions title="基本信息" :column="2" bordered>
          <Descriptions.Item label="任务名称">
            {{ taskDetail.name }}
          </Descriptions.Item>
          <Descriptions.Item label="所属项目">
            {{ taskDetail.projectName }}
          </Descriptions.Item>
          <Descriptions.Item label="任务类型">
            <Tag :color="getTaskTypeColor(taskDetail.type)">
              {{ getTaskTypeLabel(taskDetail.type) }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="任务状态">
            <Tag :color="getTaskStatusColor(taskDetail.status)">
              {{ getTaskStatusLabel(taskDetail.status) }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="负责人">
            {{ taskDetail.assigneeName }}
          </Descriptions.Item>
          <Descriptions.Item label="任务进度">
            {{ taskDetail.progress }}%
          </Descriptions.Item>
          <Descriptions.Item label="计划开始日期">
            {{ taskDetail.plannedStartDate }}
          </Descriptions.Item>
          <Descriptions.Item label="计划完成日期">
            {{ taskDetail.plannedEndDate }}
          </Descriptions.Item>
          <Descriptions.Item label="实际开始日期">
            {{ taskDetail.actualStartDate || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="实际完成日期">
            {{ taskDetail.actualEndDate || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="任务描述" :span="2">
            {{ taskDetail.description || '-' }}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <!-- 软件交付内容 -->
      <div v-if="isSoftwareTask" class="delivery-content-section">
        <SoftwareDelivery :task="taskDetail as SoftwareDeliveryTask" />
      </div>

      <!-- 硬件交付内容 -->
      <div v-if="isHardwareTask" class="delivery-content-section">
        <HardwareDelivery :task="taskDetail as HardwareDeliveryTask" />
      </div>
    </Card>
  </div>
</template>

<style scoped>
.task-detail-page {
  padding: 24px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-detail-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.task-detail-page :deep(.ant-card-body) {
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

.basic-info-section {
  margin-bottom: 24px;
}

.delivery-content-section {
  margin-top: 24px;
}
</style>

