<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { Button, Card, Col, DatePicker, Row, Select, Space, Statistic, Table, Tag, Modal, Form, Input } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import type { ErrorRecord, ModuleUsage, MonitorData } from '../../project-implementation/shared/types';
import { getMonitorData, getModuleUsage, getErrorRecords } from '../../project-implementation/shared/mock';

defineOptions({
  name: 'OperationsMonitoring',
});

// 项目列表（Mock数据）
const projectOptions = ref([
  { label: '智慧工厂项目1', value: 1 },
  { label: '数字化转型项目2', value: 2 },
  { label: '信息化升级项目3', value: 3 },
  { label: 'ERP系统项目4', value: 4 },
  { label: 'MES系统项目5', value: 5 },
]);

// 当前选中的项目
const selectedProject = ref<number>(1);

// 时间区间（默认近30天）
const timeRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().subtract(29, 'day'),
  dayjs(),
]);

// 监控数据
const monitorData = ref<MonitorData[]>([]);
const moduleUsageList = ref<ModuleUsage[]>([]);
const errorRecordList = ref<ErrorRecord[]>([]);

// 异常状态过滤
const errorStatusFilter = ref<('pending' | 'processing' | 'resolved' | 'ignored')[]>(['pending', 'processing']);

// 异常处理弹框
const errorModalVisible = ref(false);
const currentErrorRecord = ref<ErrorRecord | null>(null);
const errorFormRef = ref();
const errorFormData = ref({
  reasonCategory: '',
  reasonDescription: '',
  solution: '',
});

// 原因分类选项
const reasonCategoryOptions = [
  { label: '系统错误', value: 'system_error' },
  { label: '数据异常', value: 'data_error' },
  { label: '性能问题', value: 'performance' },
  { label: '配置错误', value: 'config_error' },
  { label: '其他', value: 'other' },
];

// 统计数据
const statistics = computed(() => {
  const today = monitorData.value[monitorData.value.length - 1];
  const total = monitorData.value.reduce(
    (acc, cur) => ({
      pv: acc.pv + cur.pv,
      uv: acc.uv + cur.uv,
    }),
    { pv: 0, uv: 0 }
  );

  return {
    todayPV: today?.pv || 0,
    todayUV: today?.uv || 0,
    totalPV: total.pv,
    totalUV: total.uv,
    onlineUsers: today?.onlineUsers || 0,
    errorCount: errorRecordList.value.filter((e) => e.status !== 'resolved').length,
  };
});

// 图表实例
let pvChart: echarts.ECharts | null = null;
let moduleChart: echarts.ECharts | null = null;
let errorTrendChart: echarts.ECharts | null = null;
let errorTypeChart: echarts.ECharts | null = null;

// 过滤后的异常记录列表
const filteredErrorRecordList = computed(() => {
  return errorRecordList.value.filter((record) => errorStatusFilter.value.includes(record.status));
});

// 异常状态统计
const errorStatusStats = computed(() => {
  return {
    pending: errorRecordList.value.filter((e) => e.status === 'pending').length,
    processing: errorRecordList.value.filter((e) => e.status === 'processing').length,
    resolved: errorRecordList.value.filter((e) => e.status === 'resolved').length,
    ignored: errorRecordList.value.filter((e) => e.status === 'ignored').length,
  };
});

// 异常趋势数据（按日期统计）
const errorTrendData = computed(() => {
  if (!timeRange.value || errorRecordList.value.length === 0) {
    return { dates: [], series: [] };
  }

  const startDate = timeRange.value[0];
  const endDate = timeRange.value[1];
  const days = endDate.diff(startDate, 'day') + 1;
  
  // 生成日期数组
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(startDate.add(i, 'day').format('YYYY-MM-DD'));
  }

  // 按日期和异常类型统计
  const errorTypeMap: Record<string, Record<string, number>> = {};
  const totalByDate: Record<string, number> = {};
  
  dates.forEach((date) => {
    totalByDate[date] = 0;
    errorTypeMap[date] = {};
  });

  errorRecordList.value.forEach((error) => {
    const errorDate = dayjs(error.occurredAt).format('YYYY-MM-DD');
    if (dates.includes(errorDate)) {
      totalByDate[errorDate] = (totalByDate[errorDate] || 0) + 1;
      if (!errorTypeMap[errorDate]) {
        errorTypeMap[errorDate] = {};
      }
      errorTypeMap[errorDate][error.errorType] = (errorTypeMap[errorDate][error.errorType] || 0) + 1;
    }
  });

  // 获取所有异常类型
  const errorTypes = Array.from(
    new Set(errorRecordList.value.map((e) => e.errorType))
  );

  // 构建系列数据
  const series: any[] = errorTypes.map((type) => ({
    name: type,
    type: 'line',
    smooth: true,
    data: dates.map((date) => (errorTypeMap[date] && errorTypeMap[date][type]) || 0),
  }));

  // 添加总数系列
  series.push({
    name: '异常总数',
    type: 'line',
    smooth: true,
    data: dates.map((date) => totalByDate[date] || 0),
    lineStyle: { width: 2 },
    itemStyle: { color: '#f5222d' },
  });

  return { dates, series };
});

// 异常类型分布数据
const errorTypeDistribution = computed(() => {
  const typeMap: Record<string, number> = {};
  
  errorRecordList.value.forEach((error) => {
    typeMap[error.errorType] = (typeMap[error.errorType] || 0) + 1;
  });

  const total = errorRecordList.value.length;
  
  return {
    total,
    data: Object.entries(typeMap).map(([name, value]) => ({
      name,
      value,
    })),
  };
});

// 异常记录表格列
const errorColumns: TableColumnsType<ErrorRecord> = [
  {
    title: '异常时间',
    dataIndex: 'occurredAt',
    key: 'occurredAt',
    width: 180,
    align: 'center',
  },
  {
    title: '异常模块',
    dataIndex: 'moduleName',
    key: 'moduleName',
    width: 150,
    align: 'left',
  },
  {
    title: '异常类型',
    dataIndex: 'errorType',
    key: 'errorType',
    width: 120,
    align: 'center',
  },
  {
    title: '异常描述',
    dataIndex: 'errorMessage',
    key: 'errorMessage',
    align: 'left',
    ellipsis: true,
  },
  {
    title: '处理状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      const colorMap = {
        pending: 'default',
        processing: 'processing',
        resolved: 'success',
        ignored: 'default',
      };
      const labelMap = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决',
        ignored: '已忽略',
      };
      return h(
        Tag,
        { color: colorMap[record.status] },
        () => labelMap[record.status]
      );
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'left',
    customRender: ({ record }) => {
      if (record.status !== 'resolved' && record.status !== 'ignored') {
        return h(
          Button,
          {
            type: 'link',
            size: 'small',
            onClick: () => handleErrorProcess(record),
          },
          () => '处理'
        );
      }
      return '-';
    },
  },
];

// 加载监控数据
function loadMonitorData() {
  if (!selectedProject.value) return;

  // 计算时间范围天数
  const days = timeRange.value ? timeRange.value[1].diff(timeRange.value[0], 'day') + 1 : 30;
  monitorData.value = getMonitorData(selectedProject.value, days);
  moduleUsageList.value = getModuleUsage(selectedProject.value);
  errorRecordList.value = getErrorRecords(selectedProject.value);

  // 更新图表
  updatePVChart();
  updateModuleChart();
  updateErrorTrendChart();
  updateErrorTypeChart();
}

// 更新PV/UV趋势图
function updatePVChart() {
  if (!pvChart) return;

  const dates = monitorData.value.map((d) => d.date);
  const pvData = monitorData.value.map((d) => d.pv);
  const uvData = monitorData.value.map((d) => d.uv);

  pvChart.setOption({
    title: {
      text: 'PV/UV趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['PV', 'UV'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: [
      {
        type: 'value',
        name: 'PV',
        position: 'left',
        axisLabel: {
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: 'UV',
        position: 'right',
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
    series: [
      {
        name: 'PV',
        type: 'line',
        yAxisIndex: 0,
        data: pvData,
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: 'rgba(24, 144, 255, 0.2)',
        },
      },
      {
        name: 'UV',
        type: 'line',
        yAxisIndex: 1,
        data: uvData,
        smooth: true,
        itemStyle: { color: '#52c41a' },
      },
    ],
  });
}

// 更新模块使用情况图
function updateModuleChart() {
  if (!moduleChart) return;

  // 按使用次数倒序排列，取前10
  const modules = [...moduleUsageList.value]
    .sort((a, b) => a.usageCount - b.usageCount)
    .slice(0, 10);
  const names = modules.map((m) => m.moduleName);
  const counts = modules.map((m) => m.usageCount);

  moduleChart.setOption({
    title: {
      text: '模块使用情况Top10',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: names,
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: counts,
        itemStyle: { color: '#1890ff' },
      },
    ],
  });
}

// 更新异常趋势图
function updateErrorTrendChart() {
  if (!errorTrendChart) return;

  const { dates, series } = errorTrendData.value;

  errorTrendChart.setOption({
    title: {
      text: '异常趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: series.map((s) => s.name),
      top: 30,
      selected: (() => {
        const selected: Record<string, boolean> = {};
        series.forEach((s) => {
          selected[s.name] = s.name === '异常总数';
        });
        return selected;
      })(),
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: '异常数量',
    },
    series: series,
  });
}

// 更新异常类型分布图
function updateErrorTypeChart() {
  if (!errorTypeChart) return;

  const { total, data } = errorTypeDistribution.value;

  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

  errorTypeChart.setOption({
    title: {
      text: '异常类型分布',
      left: 'center',
      top: 10,
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: '异常类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c}\n({d}%)',
          position: 'outside',
        },
        labelLine: {
          show: true,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length],
          },
        })),
      },
      {
        name: '',
        type: 'pie',
        radius: ['0%', '35%'],
        center: ['60%', '50%'],
        label: {
          show: true,
          position: 'center',
          formatter: `异常总数\n{total|${total}}`,
          rich: {
            total: {
              fontSize: 28,
              fontWeight: 'bold',
              color: '#f5222d',
              lineHeight: 30,
            },
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: total,
            itemStyle: {
              color: 'transparent',
            },
          },
        ],
        silent: true,
      },
    ],
  });
}

// 项目切换
function handleProjectChange() {
  loadMonitorData();
}

// 时间范围切换
function handleTimeRangeChange() {
  loadMonitorData();
}

// 刷新数据
function handleRefresh() {
  loadMonitorData();
}

// 处理异常
function handleErrorProcess(record: ErrorRecord) {
  currentErrorRecord.value = record;
  errorFormData.value = {
    reasonCategory: '',
    reasonDescription: '',
    solution: '',
  };
  errorModalVisible.value = true;
}

// 关闭异常处理弹框
function handleErrorModalClose() {
  errorModalVisible.value = false;
  currentErrorRecord.value = null;
  errorFormRef.value?.resetFields();
}

// 开始处理异常
function handleStartProcess() {
  if (!currentErrorRecord.value) return;
  
  errorFormRef.value?.validate().then(() => {
    // 更新异常记录状态为处理中
    const record = errorRecordList.value.find((e) => e.id === currentErrorRecord.value!.id);
    if (record) {
      record.status = 'processing';
      record.solution = errorFormData.value.solution;
      // 这里可以添加API调用保存数据
    }
    message.success('已开始处理异常');
    handleErrorModalClose();
  });
}

// 标记异常为已解决
function handleResolve() {
  if (!currentErrorRecord.value) return;
  
  errorFormRef.value?.validate().then(() => {
    // 更新异常记录状态为已解决
    const record = errorRecordList.value.find((e) => e.id === currentErrorRecord.value!.id);
    if (record) {
      record.status = 'resolved';
      record.solution = errorFormData.value.solution;
      record.resolvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      // 这里可以添加API调用保存数据
    }
    message.success('异常已标记为已解决');
    handleErrorModalClose();
  });
}

// 忽略异常
function handleIgnore() {
  if (!currentErrorRecord.value) return;
  
  // 更新异常记录状态为已忽略
  const record = errorRecordList.value.find((e) => e.id === currentErrorRecord.value!.id);
  if (record) {
    record.status = 'ignored';
    record.solution = '已忽略';
    record.resolvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    // 这里可以添加API调用保存数据
  }
  message.success('异常已忽略');
  handleErrorModalClose();
}

// 切换异常状态过滤
function handleStatusFilterChange(status: 'pending' | 'processing' | 'resolved' | 'ignored') {
  const index = errorStatusFilter.value.indexOf(status);
  if (index > -1) {
    errorStatusFilter.value.splice(index, 1);
  } else {
    errorStatusFilter.value.push(status);
  }
}

// 初始化图表
function initCharts() {
  const pvChartDom = document.getElementById('pvChart');
  const moduleChartDom = document.getElementById('moduleChart');
  const errorTrendChartDom = document.getElementById('errorTrendChart');
  const errorTypeChartDom = document.getElementById('errorTypeChart');

  if (pvChartDom) {
    pvChart = echarts.init(pvChartDom);
  }
  if (moduleChartDom) {
    moduleChart = echarts.init(moduleChartDom);
  }
  if (errorTrendChartDom) {
    errorTrendChart = echarts.init(errorTrendChartDom);
  }
  if (errorTypeChartDom) {
    errorTypeChart = echarts.init(errorTypeChartDom);
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    pvChart?.resize();
    moduleChart?.resize();
    errorTrendChart?.resize();
    errorTypeChart?.resize();
  });
}

// 组件挂载
onMounted(() => {
  initCharts();
  loadMonitorData();
});
</script>

<template>
  <div class="project-monitoring-page">
    <Card>
      <!-- 标题区 -->
      <template #title>
        <div class="page-header">
          <span class="page-title">运维监控</span>
          <Space>
            <Select
              v-model:value="selectedProject"
              style="width: 300px"
              placeholder="请选择项目"
              @change="handleProjectChange"
            >
              <Select.Option
                v-for="item in projectOptions"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </Select.Option>
            </Select>
            <DatePicker.RangePicker
              v-model:value="timeRange"
              style="width: 300px"
              @change="handleTimeRangeChange"
            />
            <Button type="primary" @click="handleRefresh">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </Button>
          </Space>
        </div>
      </template>

      <!-- 统计概览 -->
      <div class="statistics-section">
        <Row :gutter="24">
          <Col :span="4">
            <Card>
              <Statistic
                title="今日PV"
                :value="statistics.todayPV"
                :value-style="{ color: '#1890ff' }"
              />
            </Card>
          </Col>
          <Col :span="4">
            <Card>
              <Statistic
                title="今日UV"
                :value="statistics.todayUV"
                :value-style="{ color: '#52c41a' }"
              />
            </Card>
          </Col>
          <Col :span="4">
            <Card>
              <Statistic
                title="总PV"
                :value="statistics.totalPV"
                :value-style="{ color: '#333' }"
              />
            </Card>
          </Col>
          <Col :span="4">
            <Card>
              <Statistic
                title="总UV"
                :value="statistics.totalUV"
                :value-style="{ color: '#333' }"
              />
            </Card>
          </Col>
          <Col :span="4">
            <Card>
              <Statistic
                title="在线用户"
                :value="statistics.onlineUsers"
                :value-style="{ color: '#faad14' }"
              />
            </Card>
          </Col>
          <Col :span="4">
            <Card>
              <Statistic
                title="待处理异常"
                :value="statistics.errorCount"
                :value-style="{ color: '#f5222d' }"
              />
            </Card>
          </Col>
        </Row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <Row :gutter="24">
          <Col :span="16">
            <Card :bordered="false">
              <div id="pvChart" style="width: 100%; height: 400px"></div>
            </Card>
          </Col>
          <Col :span="8">
            <Card :bordered="false">
              <div id="moduleChart" style="width: 100%; height: 400px"></div>
            </Card>
          </Col>
        </Row>
      </div>

      <!-- 异常统计 -->
      <div class="error-statistics-section">
        <Row :gutter="24">
          <Col :span="16">
            <Card :bordered="false">
              <div id="errorTrendChart" style="width: 100%; height: 400px"></div>
            </Card>
          </Col>
          <Col :span="8">
            <Card :bordered="false">
              <div id="errorTypeChart" style="width: 100%; height: 400px"></div>
            </Card>
          </Col>
        </Row>
      </div>

      <!-- 异常监测 -->
      <div class="error-section">
        <Card :bordered="false">
          <template #title>
            <div class="error-card-title">
              <span>异常监测</span>
              <Space>
                <Tag
                  :color="errorStatusFilter.includes('pending') ? 'orange' : 'default'"
                  style="cursor: pointer; margin: 0"
                  @click="handleStatusFilterChange('pending')"
                >
                  待处理
                  <span class="status-badge" style="background-color: #faad14; margin-left: 4px">
                    {{ errorStatusStats.pending }}
                  </span>
                </Tag>
                <Tag
                  :color="errorStatusFilter.includes('processing') ? 'blue' : 'default'"
                  style="cursor: pointer; margin: 0"
                  @click="handleStatusFilterChange('processing')"
                >
                  处理中
                  <span class="status-badge" style="background-color: #1890ff; margin-left: 4px">
                    {{ errorStatusStats.processing }}
                  </span>
                </Tag>
                <Tag
                  :color="errorStatusFilter.includes('resolved') ? 'green' : 'default'"
                  style="cursor: pointer; margin: 0"
                  @click="handleStatusFilterChange('resolved')"
                >
                  已解决
                  <span class="status-badge" style="background-color: #52c41a; margin-left: 4px">
                    {{ errorStatusStats.resolved }}
                  </span>
                </Tag>
                <Tag
                  :color="errorStatusFilter.includes('ignored') ? 'default' : 'default'"
                  style="cursor: pointer; margin: 0"
                  @click="handleStatusFilterChange('ignored')"
                >
                  已忽略
                  <span class="status-badge" style="background-color: #8c8c8c; margin-left: 4px">
                    {{ errorStatusStats.ignored }}
                  </span>
                </Tag>
              </Space>
            </div>
          </template>
          <Table
            :columns="errorColumns"
            :data-source="filteredErrorRecordList"
            :pagination="{ pageSize: 10 }"
            :row-key="(record) => record.id"
          />
        </Card>
      </div>

      <!-- 异常处理弹框 -->
      <Modal
        v-model:open="errorModalVisible"
        title="异常处理"
        width="600px"
        @cancel="handleErrorModalClose"
      >
        <Form
          ref="errorFormRef"
          :model="errorFormData"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <Form.Item label="异常时间">
            <span>{{ currentErrorRecord?.occurredAt }}</span>
          </Form.Item>
          <Form.Item label="异常模块">
            <span>{{ currentErrorRecord?.moduleName }}</span>
          </Form.Item>
          <Form.Item label="异常类型">
            <span>{{ currentErrorRecord?.errorType }}</span>
          </Form.Item>
          <Form.Item label="异常描述">
            <span>{{ currentErrorRecord?.errorMessage }}</span>
          </Form.Item>
          <Form.Item
            label="原因分类"
            name="reasonCategory"
            :rules="[{ required: true, message: '请选择原因分类' }]"
          >
            <Select v-model:value="errorFormData.reasonCategory" placeholder="请选择原因分类">
              <Select.Option
                v-for="option in reasonCategoryOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="原因说明"
            name="reasonDescription"
            :rules="[{ required: true, message: '请输入原因说明' }]"
          >
            <Input.TextArea
              v-model:value="errorFormData.reasonDescription"
              :rows="4"
              placeholder="请输入原因说明"
            />
          </Form.Item>
          <Form.Item
            label="解决方法"
            name="solution"
            :rules="[{ required: true, message: '请输入解决方法' }]"
          >
            <Input.TextArea
              v-model:value="errorFormData.solution"
              :rows="4"
              placeholder="请输入解决方法"
            />
          </Form.Item>
        </Form>
        <template #footer>
          <Space>
            <Button @click="handleErrorModalClose">取消</Button>
            <Button @click="handleIgnore">忽略</Button>
            <Button type="primary" @click="handleStartProcess">开始处理</Button>
            <Button type="primary" @click="handleResolve">已解决</Button>
          </Space>
        </template>
      </Modal>
    </Card>
  </div>
</template>

<style scoped>
.project-monitoring-page {
  padding: 24px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-monitoring-page :deep(.ant-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-monitoring-page :deep(.ant-card-body) {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.statistics-section {
  margin-bottom: 24px;
}

.charts-section {
  margin-bottom: 24px;
}

.error-statistics-section {
  margin-bottom: 24px;
}

.error-section {
  margin-bottom: 0;
}

.project-monitoring-page :deep(.ant-table-thead > tr > th) {
  text-align: center;
  background: #fafafa;
}

.error-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.status-badge {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  font-weight: 500;
}
</style>
