<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Upload,
} from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import type { PaymentRecordForm } from '../types';
import { PaymentMethod } from '../types';
import { validatePaymentPlanTotal, wanToAmount } from '../utils';

interface Props {
  visible: boolean;
  record?: any; // 编辑或查看时传入的记录
  mode?: 'add' | 'edit' | 'view'; // 模式：新增、编辑、查看
  contractAmount: number; // 合同金额（元）
  paidAmount: number; // 已回款金额（元）
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submit', data: PaymentRecordForm): void;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'add',
  record: undefined,
});
const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<{
  period: string;
  planDate: Dayjs | null;
  planAmount: number;
  actualDate: Dayjs | null;
  actualAmount?: number;
  paymentMethod?: PaymentMethod;
  voucher?: string;
  voucherName?: string;
  remark?: string;
}>({
  period: '',
  planDate: null,
  planAmount: 0,
  actualDate: null,
  actualAmount: undefined,
  paymentMethod: undefined,
  voucher: undefined,
  voucherName: undefined,
  remark: '',
});

// 表单规则
const formRules = {
  period: [{ required: true, message: '请输入回款期次' }],
  planDate: [{ required: true, message: '请选择计划回款日期' }],
  planAmount: [
    { required: true, message: '请输入计划回款金额' },
    { 
      validator: (_rule: any, value: number) => {
        if (value <= 0) {
          return Promise.reject('计划回款金额必须大于0');
        }
        // 检查计划金额总和是否超过合同金额
        const totalInYuan = wanToAmount(value);
        if (totalInYuan > props.contractAmount) {
          return Promise.reject('计划回款金额不能超过合同金额');
        }
        return Promise.resolve();
      },
    },
  ],
  actualAmount: [
    {
      validator: (_rule: any, value?: number) => {
        if (value === undefined || value === null) {
          return Promise.resolve();
        }
        if (value <= 0) {
          return Promise.reject('实际回款金额必须大于0');
        }
        // 检查实际回款总和是否超过合同金额
        const totalInYuan = wanToAmount(value) + props.paidAmount;
        if (totalInYuan > props.contractAmount) {
          return Promise.reject('实际回款总额不能超过合同金额');
        }
        return Promise.resolve();
      },
    },
  ],
};

// 是否编辑模式
const isEdit = computed(() => !!props.record);

// 抽屉标题
const drawerTitle = computed(() => isEdit.value ? '编辑回款记录' : '添加回款记录');

// 监听visible变化，初始化表单
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.record) {
        // 编辑模式，回填数据
        formData.period = props.record.period || '';
        formData.planDate = props.record.planDate ? dayjs(props.record.planDate) : null;
        formData.planAmount = props.record.planAmount ? props.record.planAmount / 10000 : 0;
        formData.actualDate = props.record.actualDate ? dayjs(props.record.actualDate) : null;
        formData.actualAmount = props.record.actualAmount ? props.record.actualAmount / 10000 : undefined;
        formData.paymentMethod = props.record.paymentMethod;
        formData.voucher = props.record.voucher;
        formData.voucherName = props.record.voucherName;
        formData.remark = props.record.remark || '';
      } else {
        // 新建模式，重置表单
        formData.period = '';
        formData.planDate = null;
        formData.planAmount = 0;
        formData.actualDate = null;
        formData.actualAmount = undefined;
        formData.paymentMethod = undefined;
        formData.voucher = undefined;
        formData.voucherName = undefined;
        formData.remark = '';
        formRef.value?.resetFields();
      }
    }
  }
);

// 确定
async function handleOk() {
  try {
    await formRef.value?.validate();
    
    // 转换日期格式
    const submitData: PaymentRecordForm = {
      period: formData.period,
      planDate: formData.planDate ? formData.planDate.format('YYYY-MM-DD') : '',
      planAmount: formData.planAmount,
      actualDate: formData.actualDate ? formData.actualDate.format('YYYY-MM-DD') : undefined,
      actualAmount: formData.actualAmount,
      paymentMethod: formData.paymentMethod,
      voucher: formData.voucher,
      voucherName: formData.voucherName,
      remark: formData.remark,
    };
    
    emit('submit', submitData);
    handleCancel();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
}

// 取消
function handleCancel() {
  emit('update:visible', false);
  formRef.value?.resetFields();
}

// 文件上传
function handleUpload(info: any) {
  if (info.file.status === 'done') {
    formData.voucher = info.file.response?.url || '/uploads/voucher.pdf';
    formData.voucherName = info.file.name;
    message.success('上传成功');
  } else if (info.file.status === 'error') {
    message.error('上传失败');
  }
}

// 删除凭证
function handleRemoveVoucher() {
  formData.voucher = undefined;
  formData.voucherName = undefined;
}
</script>

<template>
  <Drawer
    :open="visible"
    :title="drawerTitle"
    :width="600"
    placement="right"
    @close="handleCancel"
  >
    <template #extra>
      <Space>
        <Button @click="handleCancel">取消</Button>
        <Button type="primary" @click="handleOk">确定</Button>
      </Space>
    </template>

    <Form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <Form.Item label="回款期次" name="period">
        <Input
          v-model:value="formData.period"
          placeholder="如：首款、进度款、尾款"
          :maxlength="50"
        />
      </Form.Item>

      <Form.Item label="计划回款日期" name="planDate">
        <DatePicker
          v-model:value="formData.planDate"
          format="YYYY-MM-DD"
          style="width: 100%"
        />
      </Form.Item>

      <Form.Item label="计划回款金额(万)" name="planAmount">
        <InputNumber
          v-model:value="formData.planAmount"
          :min="0"
          :precision="2"
          :step="0.01"
          style="width: 100%"
          placeholder="请输入计划回款金额"
        />
      </Form.Item>

      <Form.Item label="实际回款日期" name="actualDate">
        <DatePicker
          v-model:value="formData.actualDate"
          format="YYYY-MM-DD"
          style="width: 100%"
        />
      </Form.Item>

      <Form.Item label="实际回款金额(万)" name="actualAmount">
        <InputNumber
          v-model:value="formData.actualAmount"
          :min="0"
          :precision="2"
          :step="0.01"
          style="width: 100%"
          placeholder="请输入实际回款金额"
        />
      </Form.Item>

      <Form.Item label="回款方式" name="paymentMethod">
        <Select
          v-model:value="formData.paymentMethod"
          placeholder="请选择回款方式"
        >
          <Select.Option :value="PaymentMethod.BankTransfer">银行转账</Select.Option>
          <Select.Option :value="PaymentMethod.Check">支票</Select.Option>
          <Select.Option :value="PaymentMethod.Cash">现金</Select.Option>
          <Select.Option :value="PaymentMethod.Other">其他</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="回款凭证" name="voucher">
        <Upload
          v-if="!formData.voucher"
          :show-upload-list="false"
          action="/api/upload"
          @change="handleUpload"
        >
          <Button>
            <template #icon>
              <UploadOutlined />
            </template>
            点击上传
          </Button>
        </Upload>
        <div v-else class="flex items-center justify-between">
          <span>📄 {{ formData.voucherName }}</span>
          <Button type="link" danger @click="handleRemoveVoucher">删除</Button>
        </div>
      </Form.Item>

      <Form.Item label="备注说明" name="remark">
        <Input.TextArea
          v-model:value="formData.remark"
          :rows="3"
          :maxlength="500"
          placeholder="请输入备注说明"
        />
      </Form.Item>
    </Form>
  </Drawer>
</template>
