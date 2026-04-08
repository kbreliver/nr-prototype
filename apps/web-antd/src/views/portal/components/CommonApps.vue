<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { useStorage } from '@vueuse/core';
import { openWindow } from '@vben/utils';
import { VueDraggableNext } from 'vue-draggable-next';

import { CheckOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { Input, message, Modal, Tooltip } from 'ant-design-vue';

type AppItem = {
  bg: string;
  color: string;
  icon: string;
  name: string;
  url: string;
};

const allApps = ref<AppItem[]>([
  {
    name: 'OA系统',
    icon: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z',
    color: '#3b82f6',
    bg: '#eff6ff',
    url: 'https://oa.example.com',
  },
  {
    name: 'CRM',
    icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    color: '#f97316',
    bg: '#fff7ed',
    url: 'https://crm.example.com',
  },
  {
    name: 'ERP系统',
    icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    color: '#22c55e',
    bg: '#f0fdf4',
    url: 'https://erp.example.com',
  },
  {
    name: '考勤系统',
    icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
    color: '#ef4444',
    bg: '#fef2f2',
    url: 'https://attendance.example.com',
  },
  {
    name: '企业邮箱',
    icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
    color: '#3b82f6',
    bg: '#eff6ff',
    url: 'https://mail.example.com',
  },
  {
    name: '财务管理',
    icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
    color: '#a855f7',
    bg: '#faf5ff',
    url: 'https://finance.example.com',
  },
]);

const APP_LIMIT = 8;

function defaultOrder() {
  return allApps.value.map((a) => a.name);
}

const persistedOrder = useStorage<string[]>(
  'portal-common-apps-order',
  defaultOrder(),
  localStorage,
);

function normalizeOrderedNames(names: string[]): string[] {
  const valid = new Set(allApps.value.map((a) => a.name));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    if (!valid.has(n) || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= APP_LIMIT) break;
  }
  if (out.length === 0) {
    return defaultOrder().slice(0, APP_LIMIT);
  }
  return out;
}

const visibleApps = computed(() => {
  const order = normalizeOrderedNames(persistedOrder.value);
  return order
    .map((name) => allApps.value.find((a) => a.name === name))
    .filter((item): item is AppItem => item !== undefined);
});

const showSettingModal = ref(false);
const modalOrderedNames = ref<string[]>([]);
const appSearchKeyword = ref('');

const appLookup = computed(() => {
  const map: Record<string, AppItem> = {};
  for (const a of allApps.value) {
    map[a.name] = a;
  }
  return map;
});

function matchesSearch(name: string, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;
  return name.toLowerCase().includes(normalizedKeyword);
}

const filteredApps = computed(() =>
  allApps.value.filter((app) => matchesSearch(app.name, appSearchKeyword.value)),
);

function isAppSelected(name: string) {
  return modalOrderedNames.value.includes(name);
}

function toggleAppSelection(app: AppItem) {
  const idx = modalOrderedNames.value.indexOf(app.name);
  if (idx >= 0) {
    modalOrderedNames.value = modalOrderedNames.value.filter((n) => n !== app.name);
  } else {
    if (modalOrderedNames.value.length >= APP_LIMIT) {
      message.warning(`常用应用最多选择 ${APP_LIMIT} 个`);
      return;
    }
    modalOrderedNames.value = [...modalOrderedNames.value, app.name];
  }
}

function removeSelectedApp(name: string) {
  modalOrderedNames.value = modalOrderedNames.value.filter((n) => n !== name);
}

onMounted(() => {
  const n = normalizeOrderedNames(persistedOrder.value);
  if (JSON.stringify(n) !== JSON.stringify(persistedOrder.value)) {
    persistedOrder.value = n;
  }
});

function handleAppClick(app: AppItem) {
  if (app.url) {
    openWindow(app.url, { target: '_blank' });
  }
}

function handleOpenSettings() {
  modalOrderedNames.value = [...normalizeOrderedNames(persistedOrder.value)];
  appSearchKeyword.value = '';
  showSettingModal.value = true;
}

function handleSaveSettings() {
  if (modalOrderedNames.value.length > APP_LIMIT) {
    message.warning(`常用应用最多选择 ${APP_LIMIT} 个`);
    return Promise.reject(new Error('limit'));
  }
  persistedOrder.value = normalizeOrderedNames(modalOrderedNames.value);
  showSettingModal.value = false;
  message.success('常用应用已更新');
}

const dragOptions = {
  animation: 200,
  ghostClass: 'common-apps-sort-ghost',
};
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <span class="text-base font-semibold text-gray-800">常用应用</span>
      <Tooltip title="管理常用应用">
        <SettingOutlined
          class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
          @click="handleOpenSettings"
        />
      </Tooltip>
    </div>
    <div
      class="grid min-h-0 flex-1 auto-rows-min grid-cols-3 content-start gap-4"
    >
      <div
        v-for="app in visibleApps"
        :key="app.name"
        class="flex cursor-pointer flex-col items-center gap-2"
        @click="handleAppClick(app)"
      >
        <div
          class="flex size-12 items-center justify-center rounded-xl"
          :style="{ backgroundColor: app.bg }"
        >
          <svg
            class="size-6"
            :style="{ color: app.color }"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path :d="app.icon" />
          </svg>
        </div>
        <span class="text-xs text-gray-600">{{ app.name }}</span>
      </div>
    </div>
  </div>

  <Modal
    v-model:open="showSettingModal"
    title="常用应用设置"
    ok-text="保存"
    cancel-text="取消"
    width="760px"
    @ok="handleSaveSettings"
  >
    <div class="flex min-h-[360px] gap-4">
      <div class="min-w-0 flex-1">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div class="text-sm text-gray-600">选择要显示的应用：</div>
          <Input
            v-model:value="appSearchKeyword"
            allow-clear
            class="w-44 shrink-0"
            placeholder="检索应用"
          />
        </div>
        <p
          v-if="appSearchKeyword.trim() && filteredApps.length === 0"
          class="mb-3 rounded-lg bg-gray-50 py-4 text-center text-sm text-gray-500"
        >
          未找到匹配应用
        </p>
        <div
          class="grid max-h-[320px] grid-cols-3 auto-rows-min content-start gap-4 overflow-y-auto px-1 py-1"
        >
          <div
            v-for="app in filteredApps"
            :key="app.name"
            class="relative flex cursor-pointer flex-col items-center gap-2 rounded-lg p-1 transition-shadow"
            :class="
              isAppSelected(app.name)
                ? 'ring-2 ring-blue-500 ring-offset-1'
                : 'hover:bg-gray-50'
            "
            @click="toggleAppSelection(app)"
          >
            <CheckOutlined
              v-if="isAppSelected(app.name)"
              class="absolute right-1 top-0 z-10 text-sm text-blue-500"
            />
            <div
              class="flex size-12 items-center justify-center rounded-xl"
              :style="{ backgroundColor: app.bg }"
            >
              <svg
                class="size-6"
                :style="{ color: app.color }"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path :d="app.icon" />
              </svg>
            </div>
            <span class="text-center text-xs text-gray-600">{{ app.name }}</span>
          </div>
        </div>
      </div>

      <div class="min-w-0 flex-1 border-l border-gray-100 pl-4">
        <div class="mb-3 flex h-8 items-center text-sm font-medium text-gray-800">
          已选应用排序（拖拽图标调整顺序）
        </div>
        <p
          v-if="modalOrderedNames.length === 0"
          class="rounded-lg bg-gray-50 py-6 text-center text-sm text-gray-500"
        >
          请先在左侧选择要显示的应用
        </p>
        <VueDraggableNext
          v-else
          v-model:list="modalOrderedNames"
          v-bind="dragOptions"
          class="grid max-h-[320px] grid-cols-3 auto-rows-min content-start gap-4 overflow-y-auto px-1 py-1"
        >
          <div
            v-for="name in modalOrderedNames"
            :key="name"
            class="relative flex cursor-move flex-col items-center gap-2 select-none"
          >
            <button
              type="button"
              class="absolute right-0 top-0 z-10 flex size-5 items-center justify-center rounded-full text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              @click.stop="removeSelectedApp(name)"
            >
              x
            </button>
            <template v-if="appLookup[name]">
              <div
                class="flex size-12 items-center justify-center rounded-xl"
                :style="{ backgroundColor: appLookup[name].bg }"
              >
                <svg
                  class="size-6"
                  :style="{ color: appLookup[name].color }"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path :d="appLookup[name].icon" />
                </svg>
              </div>
              <span class="text-center text-xs text-gray-600">{{
                appLookup[name].name
              }}</span>
            </template>
          </div>
        </VueDraggableNext>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.common-apps-sort-ghost {
  opacity: 0.55;
}
</style>
