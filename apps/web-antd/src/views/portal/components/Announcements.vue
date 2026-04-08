<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { UnorderedListOutlined } from '@ant-design/icons-vue';
import { message, Tag, Tooltip } from 'ant-design-vue';

const announcements = ref([
  {
    category: '行政通知',
    id: 1,
    title: '关于2025年节假日放假安排的预通知',
    tag: '紧急',
    tagColor: 'error',
    date: '2023-11-24',
  },
  {
    category: '制度政策',
    id: 2,
    title: '各部门医疗保险报销政策更新说明（2023修订版）',
    date: '2023-11-22',
  },
  {
    category: '系统维护',
    id: 3,
    title: '系统维护通知：本周六ERP云平台迁移升级安排',
    date: '2023-11-20',
  },
  {
    category: '系统维护',
    id: 4,
    title: '系统维护通知：本周六ERP云平台迁移升级安排',
    date: '2023-11-20',
  },
  {
    category: '系统维护',
    id: 5,
    title: '系统维护通知：本周六ERP云平台迁移升级安排',
    date: '2023-11-20',
  },
]);

const ANN_ROW_HEIGHT = 32; // 对应 `h-8`
const ANN_ROW_GAP = 8; // 对应 `gap-2`
const MAX_VISIBLE_ANNOUNCEMENTS = 10;
const announcementsWrapRef = ref<HTMLElement | null>(null);
const visibleAnnouncementCount = ref(5);
const overflowAnnouncementTitleMap = ref<Record<number, boolean>>({});
let announcementsResizeObserver: ResizeObserver | null = null;

function updateVisibleAnnouncementCount() {
  if (!announcementsWrapRef.value) return;
  const h = announcementsWrapRef.value.clientHeight;
  if (h <= 0) return;
  const total = announcements.value.length;
  const per = ANN_ROW_HEIGHT + ANN_ROW_GAP;
  const count = Math.floor((h + ANN_ROW_GAP) / per);
  visibleAnnouncementCount.value = Math.max(
    1,
    Math.min(count, total, MAX_VISIBLE_ANNOUNCEMENTS),
  );
}

function handleAnnouncementTitleMouseEnter(event: MouseEvent, id: number) {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  overflowAnnouncementTitleMap.value = {
    ...overflowAnnouncementTitleMap.value,
    [id]: target.scrollWidth > target.clientWidth,
  };
}

onMounted(() => {
  announcementsResizeObserver = new ResizeObserver(() => {
    updateVisibleAnnouncementCount();
  });
  if (announcementsWrapRef.value) {
    announcementsResizeObserver.observe(announcementsWrapRef.value);
    updateVisibleAnnouncementCount();
  }
});

onBeforeUnmount(() => {
  announcementsResizeObserver?.disconnect();
});

function handleViewAll() {
  message.info('跳转到E10系统的公司要闻列表页面');
}

function handleItemClick(item: (typeof announcements.value)[0]) {
  message.info(`打开公告：${item.title}`);
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-base font-semibold text-gray-800">公告通知</span>
      <Tooltip title="查看全部公告">
        <UnorderedListOutlined
          class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
          @click="handleViewAll"
        />
      </Tooltip>
    </div>

    <div
      ref="announcementsWrapRef"
      class="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
    >
      <div
        v-for="item in announcements.slice(0, visibleAnnouncementCount)"
        :key="item.id"
        class="flex h-8 cursor-pointer items-center justify-between"
        @click="handleItemClick(item)"
      >
        <div class="flex flex-1 items-center gap-2 overflow-hidden">
          <span class="size-1.5 shrink-0 rounded-full bg-blue-500"></span>
          <Tooltip
            :title="
              overflowAnnouncementTitleMap[item.id]
                ? `[${item.category}] ${item.title}`
                : null
            "
          >
            <span
              class="truncate text-sm text-gray-700 hover:text-blue-500"
              @mouseenter="handleAnnouncementTitleMouseEnter($event, item.id)"
            >
              <span class="mr-1 text-gray-500">[{{ item.category }}]</span>
              {{ item.title }}
            </span>
          </Tooltip>
          <Tag v-if="item.tag" :color="item.tagColor" class="shrink-0">
            {{ item.tag }}
          </Tag>
        </div>
        <span class="ml-4 shrink-0 text-xs text-gray-400">{{ item.date }}</span>
      </div>
    </div>
  </div>
</template>
