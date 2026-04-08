<script lang="ts" setup>
import { computed, ref } from 'vue';

import { UnorderedListOutlined } from '@ant-design/icons-vue';
import { Badge, Modal, Tooltip } from 'ant-design-vue';

/** 未读消息统一使用主色圆点，已读为灰色 */
const UNREAD_DOT = '#3b82f6';
const READ_DOT = '#d1d5db';

const messages = ref([
  {
    id: 1,
    title: '报销已审批通过',
    desc: '您的报销单（BX-9021）已通过财务审核，预计3个工作日内到账。',
    time: '1小时前',
    isRead: false,
  },
  {
    id: 2,
    title: '11月工资单已发放',
    desc: '11月份工资明细已发布，请登录人力资源系统查看。',
    time: '昨天',
    isRead: false,
  },
  {
    id: 3,
    title: '项目验收临期提醒',
    desc: '"Zenith"项目即将在明日到达第三阶段截止日期，请及时跟进。',
    time: '11:22',
    isRead: false,
  },
  {
    id: 4,
    title: '全员绩效回顾会议',
    desc: '请准时参加本周五下午4点的绩效总结会议，会议室：302B。',
    time: '11:20',
    isRead: false,
  },
  {
    id: 5,
    title: '新入职员工指引',
    desc: '本月共有12名新员工加入，请行政部门协助办理入职手续。',
    time: '11:18',
    isRead: false,
  },
]);
const showMessageDetailModal = ref(false);
const showAllMessageModal = ref(false);
const currentMessage = ref<(typeof messages.value)[0] | null>(null);
const unreadCount = computed(
  () => messages.value.filter((item) => !item.isRead).length,
);

function handleMessageClick(item: (typeof messages.value)[0]) {
  item.isRead = true;
  currentMessage.value = item;
  showMessageDetailModal.value = true;
}

function handleOpenAllMessages() {
  showAllMessageModal.value = true;
}

function dotColor(isRead: boolean) {
  return isRead ? READ_DOT : UNREAD_DOT;
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-gray-800">消息中心</span>
        <Badge :count="unreadCount" :overflow-count="99" />
      </div>
      <Tooltip title="查看全部消息">
        <UnorderedListOutlined
          class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
          @click="handleOpenAllMessages"
        />
      </Tooltip>
    </div>

    <div class="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <div
        v-for="item in messages"
        :key="item.id"
        class="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
        @click="handleMessageClick(item)"
      >
        <span
          class="mt-2 size-2 shrink-0 rounded-full"
          :style="{ backgroundColor: dotColor(item.isRead) }"
        ></span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between">
            <span
              class="text-sm text-gray-800"
              :class="{ 'font-medium': !item.isRead }"
            >
              {{ item.title }}
            </span>
            <span class="ml-2 shrink-0 text-xs text-gray-400">{{
              item.time
            }}</span>
          </div>
          <p class="mt-0.5 line-clamp-2 text-xs text-gray-400">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <Modal v-model:open="showMessageDetailModal" title="消息详情" :footer="null">
    <div v-if="currentMessage" class="space-y-3">
      <div class="text-base font-semibold text-gray-800">
        {{ currentMessage.title }}
      </div>
      <div class="text-xs text-gray-400">{{ currentMessage.time }}</div>
      <div class="rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600">
        {{ currentMessage.desc }}
      </div>
    </div>
  </Modal>

  <Modal v-model:open="showAllMessageModal" title="全部消息" :footer="null">
    <div class="space-y-2">
      <div
        v-for="item in messages"
        :key="item.id"
        class="flex cursor-pointer gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
        @click="handleMessageClick(item)"
      >
        <span
          class="mt-1.5 size-2 shrink-0 rounded-full"
          :style="{ backgroundColor: dotColor(item.isRead) }"
        ></span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between">
            <span
              class="text-sm text-gray-800"
              :class="{ 'font-medium': !item.isRead }"
            >
              {{ item.title }}
            </span>
            <span class="ml-2 shrink-0 text-xs text-gray-400">{{
              item.time
            }}</span>
          </div>
          <div class="mt-1 line-clamp-2 text-xs text-gray-400">
            {{ item.desc }}
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
