<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">{{ $t('page.marketing.framework') }}</h1>
      <p class="text-gray-500 mt-2">框架协议管理页面</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <a-space direction="vertical" :size="16" class="w-full">
        <a-alert
          message="功能开发中"
          description="该页面正在开发中，敬请期待..."
          type="info"
          show-icon
        />
        
        <a-descriptions title="页面信息" bordered>
          <a-descriptions-item label="模块">市场推广</a-descriptions-item>
          <a-descriptions-item label="功能">框架协议</a-descriptions-item>
          <a-descriptions-item label="状态">开发中</a-descriptions-item>
        </a-descriptions>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FrameworkAgreement',
});
</script>


