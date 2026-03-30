<script lang="ts" setup>
import { computed } from 'vue';
import { Steps, Tag } from 'ant-design-vue';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons-vue';
import type { ContractApproval } from '../types';
import { ApprovalStatus } from '../types';

interface Props {
  records: ContractApproval[];
}

const props = defineProps<Props>();

// 获取步骤状态
function getStepStatus(status: ApprovalStatus): 'wait' | 'process' | 'finish' | 'error' {
  switch (status) {
    case ApprovalStatus.Approved:
      return 'finish';
    case ApprovalStatus.Approving:
      return 'process';
    case ApprovalStatus.Rejected:
      return 'error';
    default:
      return 'wait';
  }
}

// 获取步骤图标
function getStepIcon(status: ApprovalStatus) {
  switch (status) {
    case ApprovalStatus.Approved:
      return CheckCircleOutlined;
    case ApprovalStatus.Approving:
      return LoadingOutlined;
    case ApprovalStatus.Rejected:
      return CloseCircleOutlined;
    default:
      return ClockCircleOutlined;
  }
}

// 获取状态颜色
function getStatusColor(status: ApprovalStatus): string {
  switch (status) {
    case ApprovalStatus.Approved:
      return 'success';
    case ApprovalStatus.Approving:
      return 'processing';
    case ApprovalStatus.Rejected:
      return 'error';
    default:
      return 'default';
  }
}

// 获取状态文本
function getStatusText(status: ApprovalStatus): string {
  switch (status) {
    case ApprovalStatus.Approved:
      return '已通过';
    case ApprovalStatus.Approving:
      return '审批中';
    case ApprovalStatus.Rejected:
      return '已驳回';
    default:
      return '待审批';
  }
}

// 当前活动步骤
const currentStep = computed(() => {
  const approvingIndex = props.records.findIndex(
    (r) => r.approvalStatus === ApprovalStatus.Approving
  );
  
  if (approvingIndex >= 0) {
    return approvingIndex;
  }
  
  const rejectedIndex = props.records.findIndex(
    (r) => r.approvalStatus === ApprovalStatus.Rejected
  );
  
  if (rejectedIndex >= 0) {
    return rejectedIndex;
  }
  
  // 全部通过，返回最后一步
  return props.records.length - 1;
});
</script>

<template>
  <div class="approval-timeline">
    <Steps
      :current="currentStep"
      direction="vertical"
      :items="records.map((record) => ({
        title: record.approvalNode,
        description: `
          <div class='step-content'>
            <div class='approver'>审批人：${record.approver}</div>
            ${record.approvalTime ? `<div class='time'>审批时间：${record.approvalTime}</div>` : ''}
            ${record.approvalOpinion ? `<div class='opinion'>审批意见：${record.approvalOpinion}</div>` : ''}
          </div>
        `,
        status: getStepStatus(record.approvalStatus),
        icon: getStepIcon(record.approvalStatus),
      }))"
    />
  </div>
</template>

<style scoped>
.approval-timeline {
  padding: 24px;
}

:deep(.ant-steps-item-title) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.step-content) {
  margin-top: 8px;
  color: #666;
}

:deep(.step-content .approver) {
  margin-bottom: 4px;
}

:deep(.step-content .time) {
  margin-bottom: 4px;
  font-size: 12px;
  color: #999;
}

:deep(.step-content .opinion) {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
}
</style>
