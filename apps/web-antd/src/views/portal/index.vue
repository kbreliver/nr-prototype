<script lang="ts" setup>
import Announcements from './components/Announcements.vue';
import CommonApps from './components/CommonApps.vue';
import CompanyNews from './components/CompanyNews.vue';
import KnowledgeBase from './components/KnowledgeBase.vue';
import MessageCenter from './components/MessageCenter.vue';
import PortalHeader from './components/PortalHeader.vue';
import QuickNav from './components/QuickNav.vue';
import TodoCenter from './components/TodoCenter.vue';
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-100">
    <PortalHeader />

    <div
      class="mt-14 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-2 xl:px-12 2xl:px-20"
    >
      <div
        class="grid min-h-full flex-1 grid-cols-1 gap-2 lg:min-h-0 lg:grid-cols-[280px_minmax(0,1fr)_340px] lg:grid-rows-[4fr_6fr] xl:grid-cols-[320px_minmax(0,1fr)_360px] xl:grid-rows-[4fr_6fr]"
      >
        <!-- 第一行：常用应用、待办中心与中间栏公司要闻底部对齐 -->
        <div class="flex min-h-0 min-w-0 flex-col">
          <CommonApps class="min-h-0 flex-1" />
        </div>
        <div class="flex min-h-0 min-w-0 flex-col">
          <CompanyNews class="min-h-0 flex-1" />
        </div>
        <div class="flex min-h-0 min-w-0 flex-col">
          <TodoCenter class="min-h-0 flex-1" />
        </div>

        <!-- 第二行：快捷导航、消息中心与中间栏（公告+知识库）底部对齐 -->
        <div class="flex min-h-0 min-w-0 flex-col">
          <QuickNav class="min-h-0 flex-1" />
        </div>
        <div class="flex min-h-0 min-w-0 flex-col gap-4">
          <Announcements class="min-h-0 flex-[2]" />
          <KnowledgeBase class="min-h-0 flex-1" />
        </div>
        <div class="flex min-h-0 min-w-0 flex-col">
          <MessageCenter class="min-h-0 flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>
