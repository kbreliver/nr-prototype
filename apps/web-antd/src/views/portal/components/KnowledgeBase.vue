<script lang="ts" setup>
import { ref } from 'vue';

import { openWindow } from '@vben/utils';

import {
  FolderOpenOutlined,
} from '@ant-design/icons-vue';
import { message, Tooltip } from 'ant-design-vue';

const categories = ref([
  {
    name: '规章制度',
    count: 120,
    unit: '篇文档',
    color: '#3b82f6',
    bg: '#eff6ff',
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    url: 'https://knowledge.example.com/rules',
  },
  {
    name: '操作手册',
    count: 85,
    unit: '篇文档',
    color: '#22c55e',
    bg: '#f0fdf4',
    icon: 'M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zM6 4h5v8l-2.5-1.5L6 12V4z',
    url: 'https://knowledge.example.com/manual',
  },
  {
    name: 'FAQ 问答',
    count: 200,
    unit: '篇文档',
    color: '#f97316',
    bg: '#fff7ed',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    url: 'https://knowledge.example.com/faq',
  },
]);

function handleCategoryClick(category: (typeof categories.value)[0]) {
  openWindow(category.url, { target: '_blank' });
}

function handleViewAll() {
  message.info('跳转到知识库平台页面');
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <span class="text-base font-semibold text-gray-800">知识库</span>
      <Tooltip title="进入知识库">
        <FolderOpenOutlined
          class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
          @click="handleViewAll"
        />
      </Tooltip>
    </div>

    <div
      class="grid min-h-0 flex-1 grid-cols-1 content-start gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3"
    >
      <div
        v-for="category in categories"
        :key="category.name + category.count"
        class="cursor-pointer rounded-lg border border-gray-100 p-3 text-center transition-all hover:shadow-md"
        @click="handleCategoryClick(category)"
      >
        <!-- <div
          class="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg"
          :style="{ backgroundColor: category.bg }"
        >
          <svg
            class="size-5"
            :style="{ color: category.color }"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path :d="category.icon" />
          </svg>
        </div> -->
        <div class="text-sm font-medium text-gray-700">{{ category.name }}</div>
        <div class="mt-1 text-xs text-gray-400">
          {{ category.count }} {{ category.unit }}
        </div>
      </div>
    </div>
  </div>
</template>
