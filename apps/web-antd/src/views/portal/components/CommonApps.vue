<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { useStorage } from '@vueuse/core';
import { openWindow } from '@vben/utils';
import { VueDraggableNext } from 'vue-draggable-next';

import { CheckOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { Input, message, Modal, Tooltip } from 'ant-design-vue';

import {
  PORTAL_APPS,
  type PortalApp,
} from '../constants/portalApps';

const allApps = ref<PortalApp[]>([...PORTAL_APPS]);

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
    .filter((item): item is PortalApp => item !== undefined);
});

const showSettingModal = ref(false);
const modalOrderedNames = ref<string[]>([]);
const appSearchKeyword = ref('');

const appLookup = computed(() => {
  const map: Record<string, PortalApp> = {};
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

function toggleAppSelection(app: PortalApp) {
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

function handleAppClick(app: PortalApp) {
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
