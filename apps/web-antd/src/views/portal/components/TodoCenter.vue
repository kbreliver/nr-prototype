<script lang="ts" setup>
import { computed, ref } from 'vue';

import { openWindow } from '@vben/utils';

import {
  CarOutlined,
  FileTextOutlined,
  FolderOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons-vue';
import { Badge, message, Modal, Select, Tooltip } from 'ant-design-vue';

const todoCount = ref(5);

const todoItems = ref([
  {
    id: 1,
    title: '报销单待审批',
    desc: '财务部：10月市场活动差旅',
    time: '1小时前',
    icon: FileTextOutlined,
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
  },
  {
    id: 2,
    title: '出差申请待处理',
    desc: '业务部：组约行业峰会',
    time: '2小时前',
    icon: CarOutlined,
    iconColor: '#f97316',
    iconBg: '#fff7ed',
  },
  {
    id: 3,
    title: '合同待归档',
    desc: '采购部：供应商续费二阶段',
    time: '3小时前',
    icon: FolderOutlined,
    iconColor: '#6b7280',
    iconBg: '#f3f4f6',
  },
]);
const showAllTodoModal = ref(false);
const sourceFilter = ref<string>('all');

const sourceOptions = computed(() => {
  const sourceList = [
    ...new Set(todoItems.value.map((item) => item.desc.split('：')[0])),
  ];
  return [
    { label: '全部来源', value: 'all' },
    ...sourceList.map((source) => ({ label: source, value: source })),
  ];
});

const filteredTodoItems = computed(() => {
  if (sourceFilter.value === 'all') {
    return todoItems.value;
  }
  return todoItems.value.filter((item) =>
    item.desc.startsWith(`${sourceFilter.value}：`),
  );
});

function handleTodoClick(item: (typeof todoItems.value)[0]) {
  if (!item.id) return;
  const todoUrl = `https://todo.example.com/detail/${item.id}`;
  openWindow(todoUrl, { target: '_blank' });
}

function handleOpenAllTodo() {
  showAllTodoModal.value = true;
}

function handleTodoAction(item: (typeof todoItems.value)[0]) {
  handleTodoClick(item);
  message.success('已跳转待办处理页');
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-gray-800">待办中心</span>
        <Badge :count="todoCount" :overflow-count="99" />
      </div>
      <Tooltip title="查看全部待办">
        <UnorderedListOutlined
          class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
          @click="handleOpenAllTodo"
        />
      </Tooltip>
    </div>

    <div class="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <div
        v-for="item in todoItems"
        :key="item.id"
        class="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
        @click="handleTodoClick(item)"
      >
        <div
          class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
          :style="{ backgroundColor: item.iconBg }"
        >
          <component
            :is="item.icon"
            class="text-base"
            :style="{ color: item.iconColor }"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-gray-800">{{ item.title }}</div>
          <div class="mt-0.5 truncate text-xs text-gray-400">
            {{ item.desc }}
          </div>
        </div>
        <span class="shrink-0 text-xs text-gray-400">{{ item.time }}</span>
      </div>
    </div>
  </div>

  <Modal v-model:open="showAllTodoModal" title="全部待办工作" :footer="null">
    <div class="mb-4">
      <Select
        v-model:value="sourceFilter"
        class="w-full"
        :options="sourceOptions"
        placeholder="筛选来源系统"
      />
    </div>
    <div class="space-y-2">
      <div
        v-for="item in filteredTodoItems"
        :key="item.id"
        class="flex items-center justify-between rounded-lg border border-gray-100 p-3"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-gray-800">
            {{ item.title }}
          </div>
          <div class="mt-1 truncate text-xs text-gray-400">{{ item.desc }}</div>
        </div>
        <button
          class="ml-3 shrink-0 cursor-pointer text-xs text-blue-500 hover:text-blue-600"
          @click="handleTodoAction(item)"
        >
          去处理
        </button>
      </div>
    </div>
  </Modal>
</template>
