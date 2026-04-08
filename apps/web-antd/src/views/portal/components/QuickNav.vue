<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { openWindow } from '@vben/utils';
import { VueDraggableNext } from 'vue-draggable-next';

import {
  AuditOutlined,
  CarOutlined,
  CheckOutlined,
  CoffeeOutlined,
  EllipsisOutlined,
  FileDoneOutlined,
  FormOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue';
import { Input, message, Modal, Tooltip } from 'ant-design-vue';

const router = useRouter();

type NavItem = {
  bg: string;
  color: string;
  icon: unknown;
  name: string;
  url: string;
};

const allNavItems = ref<NavItem[]>([
  {
    name: '报销申请',
    icon: AuditOutlined,
    color: '#3b82f6',
    bg: '#eff6ff',
    url: '/reimbursement',
  },
  {
    name: '出差申请',
    icon: CarOutlined,
    color: '#22c55e',
    bg: '#f0fdf4',
    url: '/business-trip',
  },
  {
    name: '请假申请',
    icon: CoffeeOutlined,
    color: '#a855f7',
    bg: '#faf5ff',
    url: '/leave',
  },
  {
    name: '采购申请',
    icon: ShoppingCartOutlined,
    color: '#f97316',
    bg: '#fff7ed',
    url: '/procurement',
  },
  {
    name: '用印申请',
    icon: FileDoneOutlined,
    color: '#ef4444',
    bg: '#fef2f2',
    url: '/seal',
  },
  {
    name: '周报申请',
    icon: FormOutlined,
    color: '#06b6d4',
    bg: '#ecfeff',
    url: '/weekly-report',
  },
  {
    name: '设备报修',
    icon: ToolOutlined,
    color: '#eab308',
    bg: '#fefce8',
    url: '/equipment-repair',
  },
  {
    name: '更多流程',
    icon: EllipsisOutlined,
    color: '#6b7280',
    bg: '#f3f4f6',
    url: '/workflow',
  },
]);
const navItems = ref<NavItem[]>([...allNavItems.value]);
const showSettingModal = ref(false);
const modalOrderedNames = ref<string[]>([]);
const navSearchKeyword = ref('');

const navLookup = computed(() => {
  const map: Record<string, NavItem> = {};
  for (const item of allNavItems.value) {
    map[item.name] = item;
  }
  return map;
});

function matchesSearch(name: string, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;
  return name.toLowerCase().includes(normalizedKeyword);
}

const filteredNavItems = computed(() =>
  allNavItems.value.filter((item) => matchesSearch(item.name, navSearchKeyword.value)),
);

function handleNavClick(item: NavItem) {
  if (item.url?.startsWith('http')) {
    openWindow(item.url, { target: '_blank' });
  } else if (item.url) {
    router.push(item.url);
  }
}

function handleOpenSettings() {
  modalOrderedNames.value = navItems.value.map((item) => item.name);
  navSearchKeyword.value = '';
  showSettingModal.value = true;
}

function handleSaveSettings() {
  navItems.value = modalOrderedNames.value
    .map((name) => navLookup.value[name])
    .filter((item): item is NavItem => item !== undefined);
  showSettingModal.value = false;
  message.success('快捷导航已更新');
}

function isNavSelected(name: string) {
  return modalOrderedNames.value.includes(name);
}

function toggleNavSelection(item: NavItem) {
  const index = modalOrderedNames.value.indexOf(item.name);
  if (index >= 0) {
    modalOrderedNames.value = modalOrderedNames.value.filter(
      (name) => name !== item.name,
    );
    return;
  }
  modalOrderedNames.value = [...modalOrderedNames.value, item.name];
}

function removeSelectedNav(name: string) {
  modalOrderedNames.value = modalOrderedNames.value.filter(
    (selectedName) => selectedName !== name,
  );
}

const dragOptions = {
  animation: 200,
  ghostClass: 'quick-nav-sort-ghost',
};

const navListClass =
  'grid min-h-0 flex-1 auto-rows-min grid-cols-1 content-start gap-2 overflow-y-auto overflow-x-hidden overscroll-contain 2xl:grid-cols-2';
const navItemClass =
  'flex min-w-0 items-center gap-2 rounded-lg p-2 transition-colors';
const navIconClass = 'flex size-9 shrink-0 items-center justify-center rounded-md';
const navTextClass = 'min-w-0 truncate whitespace-nowrap text-sm text-gray-700';
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <span class="text-base font-semibold text-gray-800">快捷导航</span>
      <Tooltip title="管理快捷导航">
        <SettingOutlined
          class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
          @click="handleOpenSettings"
        />
      </Tooltip>
    </div>
    <div :class="navListClass">
      <div
        v-for="item in navItems"
        :key="item.name"
        :class="[navItemClass, 'cursor-pointer hover:bg-gray-50']"
        @click="handleNavClick(item)"
      >
        <div
          :class="navIconClass"
          :style="{ backgroundColor: item.bg }"
        >
          <component
            :is="item.icon"
            class="text-sm"
            :style="{ color: item.color }"
          />
        </div>
        <span :class="navTextClass">{{ item.name }}</span>
      </div>
    </div>
  </div>

  <Modal
    v-model:open="showSettingModal"
    title="快捷导航设置"
    ok-text="保存"
    cancel-text="取消"
    width="760px"
    @ok="handleSaveSettings"
  >
    <div class="flex min-h-[360px] gap-4">
      <div class="min-w-0 flex-1">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div class="text-sm text-gray-600">选择要显示的导航：</div>
          <Input
            v-model:value="navSearchKeyword"
            allow-clear
            class="w-44 shrink-0"
            placeholder="检索导航"
          />
        </div>
        <p
          v-if="navSearchKeyword.trim() && filteredNavItems.length === 0"
          class="mb-3 rounded-lg bg-gray-50 py-4 text-center text-sm text-gray-500"
        >
          未找到匹配导航
        </p>
        <div
          class="grid max-h-[320px] grid-cols-3 auto-rows-min content-start gap-4 overflow-y-auto px-1 py-1"
        >
          <div
            v-for="item in filteredNavItems"
            :key="item.name"
            class="relative flex cursor-pointer flex-col items-center gap-2 rounded-lg p-1 transition-shadow"
            :class="
              isNavSelected(item.name)
                ? 'ring-2 ring-blue-500 ring-offset-1'
                : 'hover:bg-gray-50'
            "
            @click="toggleNavSelection(item)"
          >
            <CheckOutlined
              v-if="isNavSelected(item.name)"
              class="absolute right-1 top-0 z-10 text-sm text-blue-500"
            />
            <div
              class="flex size-12 items-center justify-center rounded-xl"
              :style="{ backgroundColor: item.bg }"
            >
              <component
                :is="item.icon"
                class="text-base"
                :style="{ color: item.color }"
              />
            </div>
            <span class="text-center text-xs text-gray-600">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <div class="min-w-0 flex-1 border-l border-gray-100 pl-4">
        <div class="mb-3 flex h-8 items-center text-sm font-medium text-gray-800">
          已选导航排序（拖拽图标调整顺序）
        </div>
        <p
          v-if="modalOrderedNames.length === 0"
          class="rounded-lg bg-gray-50 py-6 text-center text-sm text-gray-500"
        >
          请先在左侧选择要显示的导航
        </p>
        <VueDraggableNext
          v-else
          v-model:list="modalOrderedNames"
          v-bind="dragOptions"
          class="grid max-h-[320px] grid-cols-1 auto-rows-min content-start gap-2 overflow-y-auto px-1 py-1 2xl:grid-cols-2"
        >
          <div
            v-for="name in modalOrderedNames"
            :key="name"
            :class="[navItemClass, 'relative cursor-move select-none hover:bg-gray-50']"
          >
            <button
              type="button"
              class="absolute right-1 top-1 z-10 flex size-5 items-center justify-center rounded-full text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              @click.stop="removeSelectedNav(name)"
            >
              x
            </button>
            <template v-if="navLookup[name]">
              <div
                :class="navIconClass"
                :style="{ backgroundColor: navLookup[name].bg }"
              >
                <component
                  :is="navLookup[name].icon"
                  class="text-sm"
                  :style="{ color: navLookup[name].color }"
                />
              </div>
              <span :class="navTextClass">{{ navLookup[name].name }}</span>
            </template>
          </div>
        </VueDraggableNext>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.quick-nav-sort-ghost {
  opacity: 0.55;
}
</style>
