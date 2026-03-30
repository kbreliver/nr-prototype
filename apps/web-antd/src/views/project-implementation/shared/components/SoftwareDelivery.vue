<script lang="ts" setup>
import { ref } from 'vue';
import { Button, Card, Descriptions, Form, Input, message, Space, Tabs, Tree } from 'ant-design-vue';
import type { SoftwareDeliveryTask, ModuleConfig } from '../types';
import { getSoftwareDeliveryTypeLabel } from '../utils';

defineOptions({
  name: 'SoftwareDelivery',
});

const props = defineProps<{
  task: SoftwareDeliveryTask;
}>();

const activeTab = ref('account');

// 模块启用处理
function handleModuleToggle(checked: boolean, module: any) {
  if (checked) {
    message.success(`模块"${module.name}"已启用`);
  } else {
    message.info(`模块"${module.name}"已禁用`);
  }
}
</script>

<template>
  <div class="software-delivery">
    <Card title="软件交付信息" :bordered="false">
      <Descriptions :column="2" bordered>
        <Descriptions.Item label="交付类型">
          {{ getSoftwareDeliveryTypeLabel(task.deliveryType) }}
        </Descriptions.Item>
      </Descriptions>

      <Tabs v-model:active-key="activeTab" style="margin-top: 24px">
        <!-- 账户信息标签页 -->
        <Tabs.TabPane key="account" tab="账户信息">
          <Descriptions :column="1" bordered>
            <Descriptions.Item label="系统地址">
              <a :href="task.accountInfo?.url" target="_blank">
                {{ task.accountInfo?.url || '-' }}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="用户名">
              {{ task.accountInfo?.username || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="密码">
              {{ task.accountInfo?.password || '-' }}
            </Descriptions.Item>
            <Descriptions.Item label="备注">
              {{ task.accountInfo?.notes || '-' }}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <!-- 模块配置标签页 -->
        <Tabs.TabPane key="modules" tab="模块配置">
          <div
            v-for="config in task.moduleConfig"
            :key="config.id"
            class="module-config-section"
          >
            <Card :title="config.productName" size="small" style="margin-bottom: 16px">
              <Tree
                :tree-data="config.moduleTree"
                :field-names="{ title: 'name', key: 'id' }"
                default-expand-all
              >
                <template #title="{ dataRef }">
                  <div class="module-tree-node">
                    <span>{{ dataRef.name }}</span>
                    <Space>
                      <span v-if="dataRef.enabled" class="module-status enabled">已启用</span>
                      <span v-else class="module-status disabled">未启用</span>
                      <Button
                        size="small"
                        :type="dataRef.enabled ? 'default' : 'primary'"
                        @click="handleModuleToggle(!dataRef.enabled, dataRef)"
                      >
                        {{ dataRef.enabled ? '禁用' : '启用' }}
                      </Button>
                    </Space>
                  </div>
                </template>
              </Tree>
            </Card>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<style scoped>
.software-delivery {
  padding: 0;
}

.module-config-section {
  margin-bottom: 24px;
}

.module-tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 16px;
}

.module-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.module-status.enabled {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.module-status.disabled {
  background: #f5f5f5;
  color: #999;
  border: 1px solid #d9d9d9;
}
</style>

