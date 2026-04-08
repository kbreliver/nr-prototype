<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import {
  BellOutlined,
  ControlOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { Avatar, Badge, message } from 'ant-design-vue';

const userStore = useUserStore();
const router = useRouter();

// TODO: 接入全局消息 store 后替换为真实未读数
const unreadNotifCount = computed(() => 5);

function handleGoHome() {
  router.push('/');
}

function handleBackendManagement() {
  openWindow('/backend', { target: '_blank' });
}

function handleBellClick() {
  message.info('通知中心建设中');
}

function handleSettingClick() {
  message.info('个人设置建设中');
}
</script>

<template>
  <header
    class="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6 shadow-sm"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex size-8 cursor-pointer items-center justify-center rounded-full bg-blue-500"
        @click="handleGoHome"
      >
        <svg
          class="size-5 text-white"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      </div>
      <span
        class="cursor-pointer text-base font-semibold text-gray-800"
        @click="handleGoHome"
      >
        企业统一门户
      </span>
    </div>

    <div class="flex items-center gap-5">
      <span
        class="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600 hover:text-blue-500"
        @click="handleBackendManagement"
      >
        <ControlOutlined class="text-base" />
        后台管理
      </span>
      <Badge :count="unreadNotifCount" :overflow-count="99" size="small">
        <BellOutlined
          class="cursor-pointer text-lg text-gray-500 hover:text-blue-500"
          @click="handleBellClick"
        />
      </Badge>
      <SettingOutlined
        class="cursor-pointer text-lg text-gray-500 hover:text-blue-500"
        @click="handleSettingClick"
      />
      <div class="flex items-center gap-2">
        <Avatar
          :size="32"
          :src="userStore.userInfo?.avatar"
          class="bg-blue-500"
        >
          <template #icon><UserOutlined /></template>
        </Avatar>
        <div class="flex flex-col leading-tight">
          <span class="text-sm font-medium text-gray-800">
            {{ userStore.userInfo?.realName || '用户' }}
          </span>
          <span class="text-xs text-gray-400">{{ userStore.userInfo?.title || '' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
