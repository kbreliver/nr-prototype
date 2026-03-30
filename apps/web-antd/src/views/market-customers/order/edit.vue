<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'OrderEdit',
});

const route = useRoute();
const router = useRouter();

// 获取订单ID（编辑模式）
const orderId = route.query.id ? Number(route.query.id) : null;
// 获取合同ID（从合同创建订单）
const contractIdFromQuery = route.query.contractId ? Number(route.query.contractId) : null;

// 重定向到详情页面的编辑模式
onMounted(() => {
  if (orderId) {
    // 编辑模式：重定向到详情页面，带 edit 模式参数
    router.replace({
      path: '/market-customers/order/detail',
      query: {
        id: orderId,
        mode: 'edit',
      },
    });
  } else if (contractIdFromQuery) {
    // 从合同创建订单：重定向到详情页面（新建模式，但这里应该跳转到新建页面）
    // 由于当前没有新建页面，暂时跳转到列表页
    router.replace({
      path: '/market-customers/order',
      query: {
        contractId: contractIdFromQuery,
      },
    });
  } else {
    // 没有参数，跳转到列表页
    router.replace('/market-customers/order');
  }
});
</script>

<template>
  <div class="p-4">
    <div class="text-center py-8">
      <p class="text-gray-500">正在跳转...</p>
    </div>
  </div>
</template>
