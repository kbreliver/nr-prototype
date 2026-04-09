<script lang="ts" setup>
import { computed, ref } from 'vue';

import { openWindow } from '@vben/utils';

import { ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons-vue';
import {
  Badge,
  message,
  Modal,
  Select,
  Tabs,
  Tooltip,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import {
  findPortalAppByName,
  PORTAL_APPS,
  type PortalApp,
} from '../constants/portalApps';

dayjs.extend(isoWeek);

type TodoTask = {
  id: number;
  title: string;
  sourceApp: string;
  description: string;
  issuedAt: string;
  handleUrl: string;
};

type DoneTask = {
  id: number;
  title: string;
  sourceApp: string;
  description: string;
  issuedAt: string;
  completedAt: string;
  handleUrl: string;
};

function getAppMeta(sourceApp: string): PortalApp {
  return findPortalAppByName(sourceApp) ?? PORTAL_APPS[0]!;
}

function formatRelativeTime(iso: string): string {
  const d = dayjs(iso);
  const now = dayjs();
  const minutes = now.diff(d, 'minute');
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = now.diff(d, 'hour');
  if (hours < 24) return `${hours}小时前`;
  const days = now.diff(d, 'day');
  if (days < 7) return `${days}天前`;
  return d.format('MM-DD HH:mm');
}

function formatDateTime(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD HH:mm');
}

function createPendingTodos(base: Dayjs): TodoTask[] {
  return [
    {
      id: 1,
      title: '报销单待审批',
      sourceApp: '财务管理',
      description: '10月市场活动差旅费用报销，请尽快审批。',
      issuedAt: base.subtract(1, 'hour').toISOString(),
      handleUrl: 'https://finance.example.com/todo/1',
    },
    {
      id: 2,
      title: '出差申请待处理',
      sourceApp: 'OA系统',
      description: '纽约行业峰会出差行程与预算申请。',
      issuedAt: base.subtract(2, 'hour').toISOString(),
      handleUrl: 'https://oa.example.com/todo/2',
    },
    {
      id: 3,
      title: '合同待归档',
      sourceApp: 'ERP系统',
      description: '供应商续费二阶段合同扫描件归档。',
      issuedAt: base.subtract(3, 'hour').toISOString(),
      handleUrl: 'https://erp.example.com/todo/3',
    },
    {
      id: 4,
      title: '客户拜访记录补录',
      sourceApp: 'CRM',
      description: '华东区重点客户一季度拜访纪要。',
      issuedAt: base.subtract(1, 'day').toISOString(),
      handleUrl: 'https://crm.example.com/todo/4',
    },
    {
      id: 5,
      title: '补卡申请待审批',
      sourceApp: '考勤系统',
      description: '3月28日忘打卡说明与证明附件。',
      issuedAt: base.subtract(2, 'day').toISOString(),
      handleUrl: 'https://attendance.example.com/todo/5',
    },
  ];
}

function createDoneItems(base: Dayjs): DoneTask[] {
  return [
    {
      id: 101,
      title: '用章申请已通过',
      sourceApp: 'OA系统',
      description: '市场部活动用章申请。',
      issuedAt: base.subtract(5, 'day').toISOString(),
      completedAt: base.subtract(1, 'day').toISOString(),
      handleUrl: 'https://oa.example.com/done/101',
    },
    {
      id: 102,
      title: '报价单已确认',
      sourceApp: 'CRM',
      description: '战略客户年度框架协议报价。',
      issuedAt: base.subtract(6, 'day').toISOString(),
      completedAt: base.subtract(2, 'day').toISOString(),
      handleUrl: 'https://crm.example.com/done/102',
    },
    {
      id: 103,
      title: '采购订单已签收',
      sourceApp: 'ERP系统',
      description: '办公耗材季度集中采购。',
      issuedAt: base.subtract(4, 'day').toISOString(),
      completedAt: base.subtract(3, 'hour').toISOString(),
      handleUrl: 'https://erp.example.com/done/103',
    },
    {
      id: 104,
      title: '周报已提交',
      sourceApp: 'OA系统',
      description: '研发中心第14周工作周报。',
      issuedAt: base.subtract(10, 'day').toISOString(),
      completedAt: base.subtract(8, 'day').toISOString(),
      handleUrl: 'https://oa.example.com/done/104',
    },
    {
      id: 105,
      title: '邮件列表已同步',
      sourceApp: '企业邮箱',
      description: '外部联系人分组整理。',
      issuedAt: base.subtract(12, 'day').toISOString(),
      completedAt: base.subtract(5, 'day').toISOString(),
      handleUrl: 'https://mail.example.com/done/105',
    },
    {
      id: 106,
      title: '上月对账已完成',
      sourceApp: '财务管理',
      description: '子公司往来科目对账。',
      issuedAt: base.subtract(35, 'day').toISOString(),
      completedAt: base.subtract(32, 'day').toISOString(),
      handleUrl: 'https://finance.example.com/done/106',
    },
  ];
}

const pendingTodos = ref<TodoTask[]>(createPendingTodos(dayjs()));
const doneItems = ref<DoneTask[]>(createDoneItems(dayjs()));

const todoRefreshing = ref(false);

function handleRefreshTodoData() {
  if (todoRefreshing.value) return;
  todoRefreshing.value = true;
  const base = dayjs();
  pendingTodos.value = createPendingTodos(base);
  doneItems.value = createDoneItems(base);
  todoRefreshing.value = false;
  message.success('已刷新');
}

const todoCount = computed(() => pendingTodos.value.length);

const weeklyDoneCount = computed(() => {
  const n = dayjs();
  return doneItems.value.filter((item) => {
    const d = dayjs(item.completedAt);
    return d.isoWeek() === n.isoWeek() && d.isoWeekYear() === n.isoWeekYear();
  }).length;
});

const monthlyDoneCount = computed(() => {
  const n = dayjs();
  return doneItems.value.filter((item) => {
    const d = dayjs(item.completedAt);
    return d.year() === n.year() && d.month() === n.month();
  }).length;
});

const showAllTodoModal = ref(false);
const sourceFilter = ref<string>('all');

const sourceOptions = computed(() => {
  const names = new Set<string>();
  for (const item of pendingTodos.value) {
    names.add(item.sourceApp);
  }
  for (const item of doneItems.value) {
    names.add(item.sourceApp);
  }
  const sorted = [...names].sort();
  return [
    { label: '全部来源', value: 'all' },
    ...sorted.map((name) => ({ label: name, value: name })),
  ];
});

const filteredPendingTodos = computed(() => {
  if (sourceFilter.value === 'all') {
    return pendingTodos.value;
  }
  return pendingTodos.value.filter(
    (item) => item.sourceApp === sourceFilter.value,
  );
});

const filteredDoneItems = computed(() => {
  if (sourceFilter.value === 'all') {
    return doneItems.value;
  }
  return doneItems.value.filter(
    (item) => item.sourceApp === sourceFilter.value,
  );
});

function handleOpenUrl(url: string) {
  if (!url) return;
  openWindow(url, { target: '_blank' });
}

function handleTodoClick(item: TodoTask) {
  handleOpenUrl(item.handleUrl);
}

function handleDoneClick(item: DoneTask) {
  handleOpenUrl(item.handleUrl);
}

function handleOpenAllTodo() {
  showAllTodoModal.value = true;
}

function handleTodoAction(item: TodoTask) {
  handleTodoClick(item);
  message.success('已跳转待办处理页');
}

function handleDoneAction(item: DoneTask) {
  handleDoneClick(item);
  message.success('已跳转详情页');
}

const homeListItems = computed(() => pendingTodos.value.slice(0, 5));
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-gray-800">我的待办</span>
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
        v-for="item in homeListItems"
        :key="item.id"
        class="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
        @click="handleTodoClick(item)"
      >
        <div
          class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
          :style="{ backgroundColor: getAppMeta(item.sourceApp).bg }"
        >
          <svg
            class="size-[18px]"
            :style="{ color: getAppMeta(item.sourceApp).color }"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path :d="getAppMeta(item.sourceApp).icon" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-gray-800">{{ item.title }}</div>
          <div class="mt-0.5 truncate text-xs text-gray-400">
            {{ item.sourceApp }} · {{ item.description }}
          </div>
        </div>
        <span class="shrink-0 text-xs text-gray-400">{{
          formatRelativeTime(item.issuedAt)
        }}</span>
      </div>
    </div>
  </div>

  <Modal
    v-model:open="showAllTodoModal"
    title="我的工作"
    :footer="null"
    width="800px"
    :body-style="{ maxHeight: 'min(72vh, 640px)', paddingTop: '12px' }"
  >
    <div class="flex max-h-[min(68vh,600px)] flex-col gap-3">
      <div class="grid shrink-0 grid-cols-3 gap-3">
        <div
          class="flex h-14 items-center justify-between rounded-lg bg-blue-50 px-3"
        >
          <span class="text-sm font-medium text-blue-700">待办任务数</span>
          <span class="text-3xl font-semibold leading-none text-blue-600">{{
            todoCount
          }}</span>
        </div>
        <div
          class="flex h-14 items-center justify-between rounded-lg bg-emerald-50 px-3"
        >
          <span class="text-sm font-medium text-emerald-700">本周已办</span>
          <span class="text-3xl font-semibold leading-none text-emerald-600">{{
            weeklyDoneCount
          }}</span>
        </div>
        <div
          class="flex h-14 items-center justify-between rounded-lg bg-purple-50 px-3"
        >
          <span class="text-sm font-medium text-purple-700">本月已办</span>
          <span class="text-3xl font-semibold leading-none text-purple-600">{{
            monthlyDoneCount
          }}</span>
        </div>
      </div>

      <div class="shrink-0">
        <Select
          v-model:value="sourceFilter"
          class="w-full"
          :options="sourceOptions"
          placeholder="按来源应用筛选"
        />
      </div>

      <Tabs class="todo-work-tabs min-h-0 flex-1 overflow-hidden">
        <template #tabBarExtraContent>
          <Tooltip title="刷新待办与已办">
            <ReloadOutlined
              class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
              :spin="todoRefreshing"
              @click="handleRefreshTodoData"
            />
          </Tooltip>
        </template>
        <Tabs.TabPane key="pending" tab="待办">
          <div class="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1">
            <div
              v-for="item in filteredPendingTodos"
              :key="item.id"
              class="flex gap-3 rounded-lg border border-gray-100 p-3"
            >
              <div
                class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg"
                :style="{ backgroundColor: getAppMeta(item.sourceApp).bg }"
              >
                <svg
                  class="size-5"
                  :style="{ color: getAppMeta(item.sourceApp).color }"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path :d="getAppMeta(item.sourceApp).icon" />
                </svg>
              </div>
              <div class="min-w-0 flex-1 space-y-1">
                <div class="text-sm font-medium text-gray-800">
                  {{ item.title }}
                </div>
                <div class="text-xs leading-relaxed text-gray-600">
                  {{ item.sourceApp }} · {{ item.description }}
                </div>
                <div class="text-xs text-gray-400">
                  下发：{{ formatDateTime(item.issuedAt) }}
                </div>
              </div>
              <button
                type="button"
                class="ml-1 shrink-0 self-start cursor-pointer text-xs text-blue-500 hover:text-blue-600"
                @click="handleTodoAction(item)"
              >
                去处理
              </button>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane key="done" tab="已办">
          <div class="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1">
            <div
              v-for="item in filteredDoneItems"
              :key="item.id"
              class="flex gap-3 rounded-lg border border-gray-100 p-3"
            >
              <div
                class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg"
                :style="{ backgroundColor: getAppMeta(item.sourceApp).bg }"
              >
                <svg
                  class="size-5"
                  :style="{ color: getAppMeta(item.sourceApp).color }"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path :d="getAppMeta(item.sourceApp).icon" />
                </svg>
              </div>
              <div class="min-w-0 flex-1 space-y-1">
                <div class="text-sm font-medium text-gray-800">
                  {{ item.title }}
                </div>
                <div class="text-xs leading-relaxed text-gray-600">
                  {{ item.sourceApp }} · {{ item.description }}
                </div>
                <div class="text-xs text-gray-400">
                  下发：{{ formatDateTime(item.issuedAt) }} | 完成：{{
                    formatDateTime(item.completedAt)
                  }}
                </div>
              </div>
              <button
                type="button"
                class="ml-1 shrink-0 self-start cursor-pointer text-xs text-gray-500 hover:text-blue-600"
                @click="handleDoneAction(item)"
              >
                查看详情
              </button>
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </Modal>
</template>

<style scoped>
.todo-work-tabs :deep(.ant-tabs-tabpane) {
  outline: none;
}
</style>
