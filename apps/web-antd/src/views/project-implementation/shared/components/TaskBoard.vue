<script lang="ts" setup>
import { computed } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';
import { Card, Tag } from 'ant-design-vue';
import type { DeliveryTask } from '../types';
import { TaskStatus } from '../types';
import {
  getTaskStatusLabel,
  getTaskTypeLabel,
  getTaskTypeColor,
  formatPercent,
} from '../utils';

defineOptions({
  name: 'TaskBoard',
});

const props = defineProps<{
  tasks: DeliveryTask[];
}>();

const emit = defineEmits<{
  taskClick: [task: DeliveryTask];
  taskDrop: [taskId: number, newStatus: TaskStatus];
}>();

// 按状态分组任务
const tasksByStatus = computed(() => {
  const groups = {
    [TaskStatus.PENDING]: [] as DeliveryTask[],
    [TaskStatus.IN_PROGRESS]: [] as DeliveryTask[],
    [TaskStatus.COMPLETED]: [] as DeliveryTask[],
  };

  props.tasks.forEach((task) => {
    if (groups[task.status]) {
      groups[task.status].push(task);
    }
  });

  return groups;
});

// 看板列配置
const columns = [
  { status: TaskStatus.PENDING, title: '待办', color: '#faad14' },
  { status: TaskStatus.IN_PROGRESS, title: '进行中', color: '#1890ff' },
  { status: TaskStatus.COMPLETED, title: '已完成', color: '#52c41a' },
];

// 拖拽选项
const dragOptions = {
  animation: 200,
  group: 'tasks',
  disabled: false,
  ghostClass: 'ghost-card',
};

// 处理拖拽结束
function handleDragEnd(status: TaskStatus) {
  // 由于vue-draggable-next的限制，我们在这里不直接处理
  // 实际的状态更新会在父组件的数据变化时触发
}

// 处理任务移动
function handleTaskMove(event: any, status: TaskStatus) {
  if (event.added) {
    const task = event.added.element as DeliveryTask;
    if (task.status !== status) {
      emit('taskDrop', task.id, status);
    }
  }
}

// 处理任务卡片点击
function handleTaskClick(task: DeliveryTask) {
  emit('taskClick', task);
}
</script>

<template>
  <div class="task-board">
    <div
      v-for="column in columns"
      :key="column.status"
      class="board-column"
    >
      <!-- 列标题 -->
      <div class="column-header" :style="{ borderTopColor: column.color }">
        <div class="column-title">
          <span>{{ column.title }}</span>
          <span class="task-count">{{ tasksByStatus[column.status].length }}</span>
        </div>
      </div>

      <!-- 任务卡片列表 -->
      <VueDraggableNext
        :list="tasksByStatus[column.status]"
        class="column-content"
        v-bind="dragOptions"
        @change="(e) => handleTaskMove(e, column.status)"
      >
        <div
          v-for="task in tasksByStatus[column.status]"
          :key="task.id"
          class="task-card"
          @click="handleTaskClick(task)"
        >
          <Card :bordered="false" size="small">
            <div class="task-card-header">
              <span class="task-name">{{ task.name }}</span>
              <Tag :color="getTaskTypeColor(task.type)">
                {{ getTaskTypeLabel(task.type) }}
              </Tag>
            </div>
            <div class="task-card-body">
              <div class="task-info">
                <span class="label">项目：</span>
                <span class="value">{{ task.projectName }}</span>
              </div>
              <div class="task-info">
                <span class="label">负责人：</span>
                <span class="value">{{ task.assigneeName }}</span>
              </div>
              <div class="task-info">
                <span class="label">进度：</span>
                <span class="value">{{ formatPercent(task.progress) }}</span>
              </div>
              <div class="task-info">
                <span class="label">计划完成：</span>
                <span class="value">{{ task.plannedEndDate }}</span>
              </div>
            </div>
          </Card>
        </div>
      </VueDraggableNext>
    </div>
  </div>
</template>

<style scoped>
.task-board {
  display: flex;
  gap: 16px;
  min-height: 600px;
  padding: 16px;
  overflow-x: auto;
}

.board-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 8px;
}

.column-header {
  padding: 16px;
  background: #fff;
  border-radius: 8px 8px 0 0;
  border-top: 3px solid;
}

.column-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.task-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: #e6f7ff;
  border-radius: 12px;
  color: #1890ff;
  font-size: 14px;
}

.column-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.task-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-card :deep(.ant-card) {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-card :deep(.ant-card-body) {
  padding: 12px;
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-name {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.task-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-info {
  display: flex;
  font-size: 12px;
}

.task-info .label {
  color: #666;
  margin-right: 4px;
}

.task-info .value {
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ghost-card {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

