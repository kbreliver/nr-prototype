<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { UnorderedListOutlined } from '@ant-design/icons-vue';
import { Badge, Modal, Tabs, Tooltip } from 'ant-design-vue';

import { findPortalAppByName } from '../constants/portalApps';

/** 未读消息统一使用主色圆点，已读为灰色 */
const UNREAD_DOT = '#3b82f6';
const READ_DOT = '#d1d5db';

type MessageItem = {
  desc: string;
  id: number;
  isRead: boolean;
  sourceApp: string;
  time: string;
  title: string;
};

const messages = ref<MessageItem[]>([
  {
    id: 1,
    title: '报销已审批通过',
    sourceApp: '财务管理',
    desc: '您的报销单（BX-9021）已通过财务审核，预计3个工作日内到账。',
    time: '1小时前',
    isRead: false,
  },
  {
    id: 2,
    title: '11月工资单已发放',
    sourceApp: '人力系统',
    desc: '11月份工资明细已发布，请登录人力资源系统查看。',
    time: '昨天',
    isRead: false,
  },
  {
    id: 3,
    title: '项目验收临期提醒',
    sourceApp: '项目管理系统',
    desc: '"Zenith"项目即将在明日到达第三阶段截止日期，请及时跟进。',
    time: '11:22',
    isRead: false,
  },
  {
    id: 4,
    title: '全员绩效回顾会议',
    sourceApp: 'OA系统',
    desc: '请准时参加本周五下午4点的绩效总结会议，会议室：302B。',
    time: '11:20',
    isRead: false,
  },
  {
    id: 5,
    title: '新入职员工指引',
    sourceApp: '行政服务系统',
    desc: '本月共有12名新员工加入，请行政部门协助办理入职手续。',
    time: '11:18',
    isRead: false,
  },
  {
    id: 6,
    title: '流程模板更新通知',
    sourceApp: 'OA系统',
    desc: '采购审批流程模板已升级，请按新版模板提交。',
    time: '昨天',
    isRead: true,
  },
  {
    id: 7,
    title: '客户联系人信息变更',
    sourceApp: 'CRM',
    desc: '华北区重点客户联系人已更新，请及时同步。',
    time: '周一',
    isRead: true,
  },
  {
    id: 8,
    title: '月度预算执行提醒',
    sourceApp: '财务管理',
    desc: '请在本周内完成本月预算执行率填报。',
    time: '周一',
    isRead: true,
  },
  {
    id: 9,
    title: '访客审批待确认',
    sourceApp: '行政服务系统',
    desc: '明日上午客户来访，请确认接待安排。',
    time: '09:20',
    isRead: true,
  },
  {
    id: 10,
    title: '考勤异常已修复',
    sourceApp: '考勤系统',
    desc: '您上周三的考勤异常已由管理员更正。',
    time: '09:00',
    isRead: true,
  },
  {
    id: 11,
    title: '项目里程碑达成',
    sourceApp: '项目管理系统',
    desc: 'M3 节点已按期完成，相关文档已归档。',
    time: '08:30',
    isRead: true,
  },
  {
    id: 12,
    title: '薪酬核算已完成',
    sourceApp: '人力系统',
    desc: '本月薪酬核算已完成，进入复核阶段。',
    time: '08:10',
    isRead: true,
  },
  {
    id: 13,
    title: '发票影像归档完成',
    sourceApp: '财务管理',
    desc: '上周发票影像已归档，可前往系统查看。',
    time: '上周五',
    isRead: true,
  },
  {
    id: 14,
    title: 'CRM 线索评分更新',
    sourceApp: 'CRM',
    desc: '本月线索评分规则已调整，注意跟进优先级。',
    time: '上周四',
    isRead: true,
  },
  {
    id: 15,
    title: '门户公告已发布',
    sourceApp: 'OA系统',
    desc: '关于节假日值班安排的公告已发布。',
    time: '上周三',
    isRead: true,
  },
  {
    id: 16,
    title: '流程中心维护通知',
    sourceApp: 'OA系统',
    desc: '本周六 22:00-23:30 系统维护，期间暂停服务。',
    time: '上周二',
    isRead: true,
  },
]);

const showAllMessageModal = ref(false);
const activeSource = ref<string>('all');
const messageTabKey = ref<'read' | 'unread'>('unread');
const readDisplayLimit = ref(10);
const pendingReadIds = ref<number[]>([]);

const unreadCount = computed(
  () => messages.value.filter((item) => !item.isRead).length,
);

const sourceList = computed(() => {
  const bucket: Record<
    string,
    { name: string; readCount: number; totalCount: number; unreadCount: number }
  > = {};
  for (const item of messages.value) {
    if (!bucket[item.sourceApp]) {
      bucket[item.sourceApp] = {
        name: item.sourceApp,
        totalCount: 0,
        unreadCount: 0,
        readCount: 0,
      };
    }
    const current = bucket[item.sourceApp]!;
    current.totalCount += 1;
    if (item.isRead) {
      current.readCount += 1;
    } else {
      current.unreadCount += 1;
    }
  }
  return Object.values(bucket).sort((a, b) => b.totalCount - a.totalCount);
});

const filteredMessages = computed(() => {
  if (activeSource.value === 'all') return messages.value;
  return messages.value.filter((item) => item.sourceApp === activeSource.value);
});

const unreadMessages = computed(() =>
  filteredMessages.value.filter((item) => !item.isRead),
);
const readMessages = computed(() =>
  filteredMessages.value.filter((item) => item.isRead),
);
const pendingUnreadMessages = computed(() =>
  unreadMessages.value.filter((item) => pendingReadIds.value.includes(item.id)),
);
const virtualUnreadCount = computed(
  () => unreadMessages.value.length - pendingUnreadMessages.value.length,
);
const virtualReadCount = computed(
  () => readMessages.value.length + pendingUnreadMessages.value.length,
);
const visibleReadMessages = computed(() =>
  readMessages.value.slice(0, readDisplayLimit.value),
);
const hasMoreRead = computed(
  () => visibleReadMessages.value.length < readMessages.value.length,
);

function handleHomeMessageClick(item: MessageItem) {
  item.isRead = true;
}

function handleUnreadMessageClick(item: MessageItem) {
  if (item.isRead) return;
  if (!pendingReadIds.value.includes(item.id)) {
    pendingReadIds.value = [...pendingReadIds.value, item.id];
  }
}

function commitPendingRead() {
  if (pendingReadIds.value.length === 0) return;
  const pendingSet = new Set(pendingReadIds.value);
  for (const item of messages.value) {
    if (pendingSet.has(item.id)) {
      item.isRead = true;
    }
  }
  pendingReadIds.value = [];
}

function handleOpenAllMessages() {
  showAllMessageModal.value = true;
  activeSource.value = 'all';
  messageTabKey.value = 'unread';
  readDisplayLimit.value = 10;
  pendingReadIds.value = [];
}

function handleSelectSource(sourceApp: string) {
  activeSource.value = sourceApp;
  readDisplayLimit.value = 10;
}

function handleMoreRead() {
  readDisplayLimit.value += 10;
}

watch(messageTabKey, (val, prev) => {
  if (prev !== 'read' && val === 'read') {
    commitPendingRead();
  }
});

function dotColor(isRead: boolean) {
  return isRead ? READ_DOT : UNREAD_DOT;
}

function isPendingRead(item: MessageItem) {
  return pendingReadIds.value.includes(item.id);
}

function dotColorForUnread(item: MessageItem) {
  return isPendingRead(item) ? READ_DOT : UNREAD_DOT;
}

function resolveSourceIcon(sourceApp: string) {
  const app = findPortalAppByName(sourceApp);
  if (app) {
    return {
      bg: app.bg,
      color: app.color,
      icon: app.icon,
      isFallback: false,
      label: sourceApp,
    };
  }
  return {
    bg: '#f3f4f6',
    color: '#6b7280',
    icon: '',
    isFallback: true,
    label: sourceApp.slice(0, 1) || '系',
  };
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-gray-800">我的消息</span>
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
        @click="handleHomeMessageClick(item)"
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
            <span class="ml-2 shrink-0 text-xs text-gray-400"
              >{{ item.sourceApp }} · {{ item.time }}</span
            >
          </div>
          <p class="mt-0.5 line-clamp-2 text-xs text-gray-400">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-model:open="showAllMessageModal"
    title="全部消息"
    :footer="null"
    width="900px"
    :body-style="{ maxHeight: 'min(72vh, 640px)', overflow: 'hidden', paddingTop: '12px' }"
  >
    <div class="flex h-[min(68vh,580px)] gap-3 overflow-hidden">
      <div class="flex w-56 shrink-0 flex-col rounded-lg border border-gray-100">
        <button
          type="button"
          class="flex h-[47px] items-center justify-between border-b border-gray-200 px-3 text-left text-sm transition-colors"
          :class="
            activeSource === 'all'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
          "
          @click="handleSelectSource('all')"
        >
          <span class="font-medium">全部系统</span>
          <Badge :count="messages.length" :overflow-count="99" />
        </button>
        <div class="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          <button
            v-for="source in sourceList"
            :key="source.name"
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors"
            :class="
              activeSource === source.name
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            "
            @click="handleSelectSource(source.name)"
          >
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-md"
              :style="{ backgroundColor: resolveSourceIcon(source.name).bg }"
            >
              <svg
                v-if="!resolveSourceIcon(source.name).isFallback"
                class="size-4"
                :style="{ color: resolveSourceIcon(source.name).color }"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path :d="resolveSourceIcon(source.name).icon" />
              </svg>
              <span
                v-else
                class="text-xs font-semibold"
                :style="{ color: resolveSourceIcon(source.name).color }"
              >
                {{ resolveSourceIcon(source.name).label }}
              </span>
            </div>
            <span class="min-w-0 flex-1 truncate text-xs font-medium">{{
              source.name
            }}</span>
            <Badge :count="source.totalCount" :overflow-count="99" />
          </button>
        </div>
      </div>

      <div class="min-h-0 min-w-0 flex-1">
        <Tabs v-model:activeKey="messageTabKey" class="message-tabs h-full">
          <Tabs.TabPane
            :tab="`未读（${virtualUnreadCount}）`"
            key="unread"
          >
            <div class="h-[min(56vh,500px)] space-y-2 overflow-y-auto pr-1">
              <div
                v-for="item in unreadMessages"
                :key="item.id"
                class="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                @click="handleUnreadMessageClick(item)"
              >
                <span
                  class="mt-1.5 size-2 shrink-0 rounded-full"
                  :style="{ backgroundColor: dotColorForUnread(item) }"
                ></span>
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center justify-between">
                    <span
                      class="text-sm text-gray-800"
                      :class="{ 'font-semibold': !isPendingRead(item) }"
                    >
                      {{ item.title }}
                    </span>
                    <span class="ml-2 shrink-0 text-xs text-gray-400">
                      {{ item.sourceApp }} · {{ item.time }}
                    </span>
                  </div>
                  <div class="mt-1 text-xs leading-relaxed text-gray-600">
                    {{ item.desc }}
                  </div>
                </div>
              </div>
              <div
                v-if="unreadMessages.length === 0"
                class="py-8 text-center text-xs text-gray-400"
              >
                暂无未读消息
              </div>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane :tab="`已读（${virtualReadCount}）`" key="read">
            <div class="h-[min(56vh,500px)] space-y-2 overflow-y-auto pr-1">
              <div
                v-for="item in visibleReadMessages"
                :key="item.id"
                class="cursor-pointer rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
              >
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-sm text-gray-800">{{ item.title }}</span>
                  <span class="ml-2 shrink-0 text-xs text-gray-400"
                    >{{ item.sourceApp }} · {{ item.time }}</span
                  >
                </div>
                <div class="mt-1 text-xs leading-relaxed text-gray-600">
                  {{ item.desc }}
                </div>
              </div>

              <button
                v-if="hasMoreRead"
                type="button"
                class="w-full rounded-md py-2 text-xs text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                @click="handleMoreRead"
              >
                更多消息
              </button>
              <div
                v-else
                class="py-2 text-center text-xs text-gray-400"
              >
                没有更多消息了
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.message-tabs :deep(.ant-tabs-content-holder) {
  height: 100%;
}
.message-tabs :deep(.ant-tabs-nav) {
  margin: 0 0 8px 0;
  min-height: 47px;
  border-bottom: 1px solid #e5e7eb;
}
</style>
