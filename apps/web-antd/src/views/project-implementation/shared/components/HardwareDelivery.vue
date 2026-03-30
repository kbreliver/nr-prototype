<script lang="ts" setup>
import { h, ref } from 'vue';
import { Button, Card, Descriptions, Form, Input, message, Steps, Tag, Upload } from 'ant-design-vue';
import { UploadOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
import type { HardwareDeliveryTask } from '../types';
import { TaskStatus } from '../types';
import { getHardwareStageLabel, getTaskStatusLabel, getTaskStatusColor } from '../utils';

defineOptions({
  name: 'HardwareDelivery',
});

const props = defineProps<{
  task: HardwareDeliveryTask;
}>();

// 计算当前步骤
const currentStep = ref(props.task.stages.findIndex((stage) => stage.status !== TaskStatus.COMPLETED));

// 处理环节操作
function handleStageAction(stage: any) {
  if (stage.status === TaskStatus.COMPLETED) {
    message.info('该环节已完成');
    return;
  }
  message.success(`开始处理"${getHardwareStageLabel(stage.stage)}"环节`);
}
</script>

<template>
  <div class="hardware-delivery">
    <Card title="硬件交付信息" :bordered="false">
      <!-- 交付流程步骤条 -->
      <Steps :current="currentStep < 0 ? task.stages.length : currentStep" style="margin-bottom: 32px">
        <Steps.Step
          v-for="(stage, index) in task.stages"
          :key="stage.stage"
          :title="getHardwareStageLabel(stage.stage)"
          :status="
            stage.status === TaskStatus.COMPLETED
              ? 'finish'
              : stage.status === TaskStatus.IN_PROGRESS
              ? 'process'
              : 'wait'
          "
        >
          <template #description>
            <div v-if="stage.completedAt">
              <div>完成时间：{{ stage.completedAt }}</div>
              <div v-if="stage.operatorName">操作人：{{ stage.operatorName }}</div>
            </div>
          </template>
        </Steps.Step>
      </Steps>

      <!-- 各环节详情 -->
      <div class="stages-detail">
        <Card
          v-for="(stage, index) in task.stages"
          :key="stage.stage"
          size="small"
          :title="getHardwareStageLabel(stage.stage)"
          style="margin-bottom: 16px"
        >
          <template #extra>
            <Tag :color="getTaskStatusColor(stage.status)">
              {{ getTaskStatusLabel(stage.status) }}
            </Tag>
          </template>

          <!-- 已完成的环节 -->
          <div v-if="stage.status === TaskStatus.COMPLETED">
            <Descriptions :column="2" size="small">
              <Descriptions.Item label="完成时间">
                {{ stage.completedAt }}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                {{ stage.operatorName }}
              </Descriptions.Item>
            </Descriptions>

            <!-- 硬件发货特有信息 -->
            <Descriptions v-if="stage.data?.shipmentDate" :column="2" size="small" style="margin-top: 16px">
              <Descriptions.Item label="发货日期">
                {{ stage.data.shipmentDate }}
              </Descriptions.Item>
              <Descriptions.Item label="物流公司">
                {{ stage.data.logistics }}
              </Descriptions.Item>
              <Descriptions.Item label="物流单号" :span="2">
                {{ stage.data.trackingNumber }}
              </Descriptions.Item>
            </Descriptions>

            <!-- 到货验收特有信息 -->
            <Descriptions v-if="stage.data?.receiptDate" :column="2" size="small" style="margin-top: 16px">
              <Descriptions.Item label="到货日期">
                {{ stage.data.receiptDate }}
              </Descriptions.Item>
              <Descriptions.Item label="验收结果">
                <Tag :color="stage.data.result === 'qualified' ? 'success' : 'error'">
                  {{ stage.data.result === 'qualified' ? '合格' : '不合格' }}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="验收人员" :span="2">
                {{ stage.data.inspector }}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <!-- 进行中的环节 -->
          <div v-else-if="stage.status === TaskStatus.IN_PROGRESS">
            <div class="stage-form">
              <p>该环节正在进行中，请完成相关操作并提交。</p>
              <Button type="primary" @click="handleStageAction(stage)">
                提交完成
              </Button>
            </div>
          </div>

          <!-- 待办的环节 -->
          <div v-else>
            <div class="stage-form">
              <p>该环节尚未开始，请等待前置环节完成。</p>
              <Button disabled>开始处理</Button>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.hardware-delivery {
  padding: 0;
}

.stages-detail {
  margin-top: 24px;
}

.stage-form {
  padding: 16px;
  text-align: center;
  background: #fafafa;
  border-radius: 4px;
}

.stage-form p {
  margin-bottom: 16px;
  color: #666;
}
</style>

