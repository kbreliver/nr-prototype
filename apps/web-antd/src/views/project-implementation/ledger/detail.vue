<script lang="ts" setup>
import { computed, h, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs, { Dayjs } from 'dayjs';
import {
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  TableOutlined,
  BarChartOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Upload,
} from 'ant-design-vue';
import type { FormInstance, TableColumnsType, UploadFile } from 'ant-design-vue';
import type { Project, ProjectTask, TaskForm, ImplementationTemplate, ProjectLog } from '../shared/types';
import { ProjectStatus, TaskStatus } from '../shared/types';
import {
  getProjectStatusLabel,
  getProjectStatusColor,
  getTaskStatusLabel,
  getTaskStatusColor,
  formatPercent,
  buildTaskTree,
  canHaveChildren,
} from '../shared/utils';
import {
  getProjectById,
  mockUpdateProject,
  getProjectTasks,
  mockCreateTask,
  mockDeleteTask,
  mockApplyTemplate,
  getProjectLogs,
  mockStartProject,
  mockSuspendProject,
  mockResumeProject,
  mockCompleteImplementation,
  mockCompleteProject,
  mockCancelProject,
} from '../shared/mock';
import GanttChart from '../shared/components/GanttChart.vue';

defineOptions({
  name: 'ProjectLedgerDetail',
});

const route = useRoute();
const router = useRouter();

const projectId = ref(route.query.id ? Number(route.query.id) : null);
const activeTab = ref('basic');

function parseRouteMode(modeParam: unknown) {
  const value = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  if (value === 'edit' || value === 'view') {
    return value;
  }
  return 'view';
}

const initialMode = parseRouteMode(route.query.mode);
const isEditMode = ref(initialMode === 'edit');
const isViewMode = computed(() => !isEditMode.value);

const projectDetail = ref<Project | null>(null);
const projectTasks = ref<ProjectTask[]>([]);
const projectLogs = ref<ProjectLog[]>([]);
const projectTasksTree = computed(() => buildTaskTree(projectTasks.value));

// 实施计划相关状态
const planViewMode = ref<'gantt' | 'list'>('gantt');
const isGanttFullscreen = ref(false);
const taskDrawerVisible = ref(false);
const taskDrawerMode = ref<'view' | 'edit'>('edit');
const taskFormRef = ref<FormInstance>();
const ganttSelectedTask = ref<ProjectTask | null>(null);

// 判断是否应该使用Modal（全屏模式下使用Modal）
const shouldUseModal = computed(() => isGanttFullscreen.value);
const taskForm = reactive<TaskForm & { parentId?: number }>({
  name: '',
  startDate: '',
  endDate: '',
  assigneeId: 1,
  dependencies: undefined,
  description: '',
  isMilestone: false,
  parentId: undefined,
});

// 引用标准方案弹窗
const templateModalVisible = ref(false);
const templateList = ref<ImplementationTemplate[]>([]);
const selectedTemplateId = ref<number>();

// 状态变更弹窗
const statusChangeModalVisible = ref(false);
const statusChangeType = ref<'start' | 'completeImplementation' | 'suspend' | 'resume' | 'complete' | 'cancel' | null>(null);
const statusChangeFormRef = ref<FormInstance>();
const statusChangeForm = reactive({
  reason: '',
});

// 获取弹窗容器（用于全屏模式）
const getPopupContainer = () => document.body;

// 统计信息
const statistics = computed(() => {
  if (!projectDetail.value) {
    return {
      progress: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      orderName: '-',
      customerName: '-',
    };
  }

  return {
    progress: projectDetail.value.progress,
    totalTasks: 15,
    completedTasks: 5,
    inProgressTasks: 6,
    pendingTasks: 4,
    orderName: projectDetail.value.orderName,
    customerName: projectDetail.value.customerName,
  };
});

// 判断是否可编辑（基于状态和字段类型）
const canEdit = (fieldCategory: 'initiation' | 'execution') => {
  if (!projectDetail.value) return false;
  const status = projectDetail.value.status;

  if (isViewMode.value) return false;

  // 待启动时，立项信息和执行信息都可编辑（除了只读字段）
  if (status === ProjectStatus.PENDING_START) {
    return true;
  }

  // 实施中时，只能编辑执行信息
  if (status === ProjectStatus.IN_IMPLEMENTATION) {
    return fieldCategory === 'execution';
  }

  // 其他状态不可编辑
  return false;
};

// 判断实施计划是否可编辑
const canEditPlan = computed(() => {
  if (!projectDetail.value) return false;
  const status = projectDetail.value.status;
  // 已取消或已完成时，实施计划不可再变动
  return ![ProjectStatus.COMPLETED, ProjectStatus.CANCELLED].includes(status);
});

const formRef = ref<FormInstance>();

const formData = reactive<any>({
  code: '',
  name: '',
  orderId: undefined,
  customerId: undefined,
  status: ProjectStatus.PENDING_START,
  progress: 0,
  managerId: undefined,
  description: '',
  plannedStartDate: null as Dayjs | null,
  plannedEndDate: null as Dayjs | null,
  actualStartDate: null as Dayjs | null,
  actualEndDate: null as Dayjs | null,
  reportFileList: [] as UploadFile[],
  executionNote: '', // 执行备注
});

// 订单选项（Mock数据）
const orderOptions = ref([
  { label: '订单1', value: 1 },
  { label: '订单2', value: 2 },
  { label: '订单3', value: 3 },
  { label: '订单4', value: 4 },
  { label: '订单5', value: 5 },
]);

// 负责人选项（Mock数据）
const managerOptions = ref([
  { label: '项目经理1', value: 1 },
  { label: '项目经理2', value: 2 },
  { label: '项目经理3', value: 3 },
  { label: '项目经理4', value: 4 },
  { label: '项目经理5', value: 5 },
]);

// 实施人员选项（Mock数据）
const assigneeOptions = ref([
  { label: '实施人员1', value: 1 },
  { label: '实施人员2', value: 2 },
  { label: '实施人员3', value: 3 },
  { label: '实施人员4', value: 4 },
  { label: '实施人员5', value: 5 },
]);

// 客户选项（Mock数据）
const customerOptions = ref([
  { label: '华润集团', value: 1 },
  { label: '中国移动', value: 2 },
  { label: '宝钢集团', value: 3 },
  { label: '中石化', value: 4 },
  { label: '国家电网', value: 5 },
]);

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入项目名称' },
    { max: 100, message: '项目名称不能超过100个字符' },
  ],
  orderId: [{ required: true, message: '请选择关联订单' }],
  managerId: [{ required: true, message: '请选择项目负责人' }],
};

// 任务列表表格列
const taskColumns: TableColumnsType<ProjectTask> = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    align: 'left',
    ellipsis: true,
  },
  {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 120,
    align: 'center',
  },
  {
    title: '结束日期',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 120,
    align: 'center',
  },
  {
    title: '持续天数',
    dataIndex: 'duration',
    key: 'duration',
    width: 100,
    align: 'center',
  },
  {
    title: '负责人',
    dataIndex: 'assigneeName',
    key: 'assigneeName',
    width: 120,
    align: 'center',
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 100,
    align: 'right',
    customRender: ({ record }) => formatPercent(record.progress),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
    customRender: ({ record }) => {
      return h(
        Tag,
        { color: getTaskStatusColor(record.status) },
        () => getTaskStatusLabel(record.status)
      );
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    align: 'left',
    fixed: 'right',
    customRender: ({ record }) => {
      const buttons: any[] = [];
      
      // 添加子任务按钮（仅对可以作为父任务的任务显示）
      if (canHaveChildren(record, projectTasks.value)) {
        buttons.push(
          h(
            Button,
            {
              type: 'primary',
              size: 'small',
              onClick: () => handleAddSubTask(record),
            },
            () => '添加子任务'
          )
        );
      }
      
      buttons.push(
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            onClick: () => handleEditTask(record),
          },
          () => '编辑'
        ),
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            danger: true,
            onClick: () => handleDeleteTask(record),
          },
          () => '删除'
        )
      );
      return h(Space, { size: 'small' }, () => buttons);
    },
  },
];

// 任务表单验证规则
const taskFormRules = {
  name: [
    { required: true, message: '请输入任务名称' },
    { max: 100, message: '任务名称不能超过100个字符' },
  ],
  startDate: [{ required: true, message: '请选择开始日期' }],
  endDate: [{ required: true, message: '请选择结束日期' }],
  assigneeId: [{ required: true, message: '请选择负责人' }],
};


// 项目日志表格列
const logColumns: TableColumnsType<ProjectLog> = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 180,
    align: 'center',
  },
  {
    title: '用户',
    dataIndex: 'user',
    key: 'user',
    width: 120,
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 150,
    align: 'center',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    align: 'left',
    ellipsis: true,
  },
];

// 加载项目详情
function loadProjectDetail() {
  if (!projectId.value) return;

  const project = getProjectById(projectId.value);
  if (!project) {
    message.error('项目不存在');
    router.back();
    return;
  }

  projectDetail.value = project;

  // 填充表单数据
  formData.code = project.code;
  formData.name = project.name;
  formData.orderId = project.orderId;
  formData.customerId = project.customerId;
  formData.status = project.status;
  formData.progress = project.progress;
  formData.managerId = project.managerId;
  formData.description = project.description || '';
  formData.plannedStartDate = project.plannedStartDate ? dayjs(project.plannedStartDate) : null;
  formData.plannedEndDate = project.plannedEndDate ? dayjs(project.plannedEndDate) : null;
  formData.actualStartDate = project.actualStartDate ? dayjs(project.actualStartDate) : null;
  formData.actualEndDate = project.actualEndDate ? dayjs(project.actualEndDate) : null;
}

// 加载任务列表
function loadProjectTasks() {
  if (!projectId.value) return;
  projectTasks.value = getProjectTasks(projectId.value);
}


// 加载项目日志
function loadProjectLogs() {
  if (!projectId.value) return;
  projectLogs.value = getProjectLogs(projectId.value);
}

// 切换视图模式
function handleViewModeChange(mode: 'gantt' | 'list') {
  planViewMode.value = mode;
}

// 添加任务
function handleAddTask() {
  taskForm.name = '';
  taskForm.startDate = '';
  taskForm.endDate = '';
  taskForm.assigneeId = 1;
  taskForm.dependencies = undefined;
  taskForm.description = '';
  taskForm.isMilestone = false;
  
  // 根据选中的任务设置父任务（仅在甘特图模式下生效）
  // 无论是全屏还是非全屏模式，都使用相同的逻辑
  if (planViewMode.value === 'gantt' && ganttSelectedTask.value) {
    if (ganttSelectedTask.value.parentId) {
      // 如果选中的是子任务，则父任务默认选中该子任务的父任务
      taskForm.parentId = ganttSelectedTask.value.parentId;
      console.log('选中的是子任务，设置父任务为该子任务的父任务:', ganttSelectedTask.value.parentId);
    } else {
      // 如果选中的是父任务，则父任务默认选中该父任务
      taskForm.parentId = ganttSelectedTask.value.id;
      console.log('选中的是父任务，设置父任务:', ganttSelectedTask.value.id);
    }
  } else {
    // 如果不在甘特图模式，或者没有选中任务，父任务为空
    taskForm.parentId = undefined;
    console.log('不在甘特图模式或未选中任务，父任务为空');
  }
  
  console.log('当前视图模式:', planViewMode.value);
  console.log('当前选中的任务:', ganttSelectedTask.value);
  console.log('任务表单父任务ID:', taskForm.parentId);
  
  taskDrawerMode.value = 'edit';
  taskDrawerVisible.value = true;
}

// 添加子任务
function handleAddSubTask(parentTask: ProjectTask) {
  taskForm.name = '';
  taskForm.startDate = '';
  taskForm.endDate = '';
  taskForm.assigneeId = parentTask.assigneeId; // 默认使用父任务的负责人
  taskForm.dependencies = undefined;
  taskForm.description = '';
  taskForm.isMilestone = false;
  taskForm.parentId = parentTask.id; // 设置父任务ID
  taskDrawerMode.value = 'edit';
  taskDrawerVisible.value = true;
}

// 编辑任务
function handleEditTask(task: ProjectTask) {
  taskForm.name = task.name;
  // 将字符串日期转换为 dayjs 对象
  taskForm.startDate = task.startDate ? dayjs(task.startDate) : '';
  taskForm.endDate = task.endDate ? dayjs(task.endDate) : '';
  taskForm.assigneeId = task.assigneeId;
  taskForm.dependencies = task.dependencies;
  taskForm.description = task.description || '';
  taskForm.isMilestone = task.isMilestone || false;
  taskForm.parentId = task.parentId;
  // 根据是否可编辑决定模式
  taskDrawerMode.value = canEditPlan.value ? 'edit' : 'view';
  taskDrawerVisible.value = true;
}

// 查看/编辑任务（用于甘特图双击）
function handleTaskClick(task: ProjectTask) {
  handleEditTask(task);
}

// 处理甘特图全屏状态变化
function handleGanttFullscreenChange(fullscreen: boolean) {
  isGanttFullscreen.value = fullscreen;
}

// 处理甘特图任务选中事件
function handleGanttTaskSelected(task: ProjectTask | null) {
  console.log('甘特图任务选中:', task);
  ganttSelectedTask.value = task;
}

// 处理甘特图添加任务按钮点击
function handleGanttAddTaskClick() {
  handleAddTask();
}

// 处理甘特图添加子任务按钮点击
function handleGanttAddSubTaskClick(task: ProjectTask) {
  handleAddSubTask(task);
}

// 删除任务
function handleDeleteTask(task: ProjectTask) {
  // 检查是否是父任务
  const childTasks = projectTasks.value.filter((t) => t.parentId === task.id);
  const childCount = childTasks.length;
  
  const content = childCount > 0
    ? `该任务包含${childCount}个子任务，删除后子任务也会被删除。确定要删除任务"${task.name}"吗？`
    : `确定要删除任务"${task.name}"吗？`;
  
  Modal.confirm({
    title: '删除任务',
    content,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    zIndex: 10001,
    onOk: async () => {
      try {
        if (!projectId.value) return;
        
        // 如果是父任务，先删除所有子任务
        if (childCount > 0) {
          for (const childTask of childTasks) {
            // 在实际应用中，这里应该调用API删除子任务
            await mockDeleteTask(projectId.value, childTask.id);
          }
        }
        
        // 删除当前任务
        // 在实际应用中，这里应该调用API删除任务
        await mockDeleteTask(projectId.value, task.id);
        
        // 如果删除的是当前选中的任务，清空选中状态
        if (ganttSelectedTask.value && ganttSelectedTask.value.id === task.id) {
          ganttSelectedTask.value = null;
        }
        
        message.success('删除成功');
        loadProjectTasks();
      } catch (error: any) {
        message.error(error.message || '删除失败');
      }
    },
  });
}

// 提交任务表单
async function handleTaskSubmit() {
  try {
    await taskFormRef.value?.validate();

    if (!projectId.value) return;

    // 验证：如果设置了parentId，检查父任务是否已经是子任务
    if (taskForm.parentId) {
      const parentTask = projectTasks.value.find((t) => t.id === taskForm.parentId);
      if (parentTask && parentTask.parentId) {
        message.error('不支持三层任务结构，子任务不能再有子任务');
        return;
      }
    }

    // 格式化日期为字符串
    const formattedTask = {
      ...taskForm,
      startDate: taskForm.startDate ? (typeof taskForm.startDate === 'string' ? taskForm.startDate : dayjs(taskForm.startDate).format('YYYY-MM-DD')) : '',
      endDate: taskForm.endDate ? (typeof taskForm.endDate === 'string' ? taskForm.endDate : dayjs(taskForm.endDate).format('YYYY-MM-DD')) : '',
    };

    await mockCreateTask(projectId.value, formattedTask);
    
    // 重新加载任务列表
    loadProjectTasks();
    
    // 如果是子任务，更新父任务的属性
    if (taskForm.parentId) {
      const updatedTasks = getProjectTasks(projectId.value);
      const parentTask = updatedTasks.find((t) => t.id === taskForm.parentId);
      if (parentTask) {
        // 在实际应用中，这里应该调用API更新父任务
        // const updatedParent = updateParentTaskProperties(parentTask, updatedTasks);
        // await mockUpdateTask(projectId.value, updatedParent);
      }
    }
    
    message.success('任务保存成功');
    taskDrawerVisible.value = false;
  } catch (error: any) {
    if (error.errorFields) {
      message.error('请检查表单填写是否正确');
    } else if (error.message) {
      message.error(error.message);
    } else {
      message.error('任务保存失败');
    }
  }
}

// 确认引用方案
async function handleTemplateConfirm() {
  if (!selectedTemplateId.value) {
    message.error('请选择方案');
    return;
  }

  if (!projectId.value) return;

  try {
    const tasks = await mockApplyTemplate(projectId.value, selectedTemplateId.value);
    message.success(`成功引用方案，创建了${tasks.length}个任务`);
    templateModalVisible.value = false;
    loadProjectTasks();
  } catch (error) {
    message.error('引用方案失败');
  }
}

// 返回
function handleBack() {
  router.back();
}

// 编辑
function handleEdit() {
  isEditMode.value = true;
}

// 取消编辑
function handleCancel() {
  isEditMode.value = false;
  loadProjectDetail();
}

// 保存
async function handleSave() {
  if (!projectId.value) return;

  try {
    await formRef.value?.validate();

    const updateData = {
      name: formData.name,
      orderId: formData.orderId,
      customerId: formData.customerId,
      status: formData.status,
      managerId: formData.managerId,
      description: formData.description,
      plannedStartDate: formData.plannedStartDate ? formData.plannedStartDate.format('YYYY-MM-DD') : undefined,
      plannedEndDate: formData.plannedEndDate ? formData.plannedEndDate.format('YYYY-MM-DD') : undefined,
      actualStartDate: formData.actualStartDate ? formData.actualStartDate.format('YYYY-MM-DD') : undefined,
      actualEndDate: formData.actualEndDate ? formData.actualEndDate.format('YYYY-MM-DD') : undefined,
    };

    await mockUpdateProject(projectId.value, updateData);
    message.success('保存成功');
    isEditMode.value = false;
    loadProjectDetail();
  } catch (error: any) {
    if (error.errorFields) {
      message.error('请检查表单填写是否正确');
    } else {
      message.error('保存失败');
    }
  }
}


// 删除
function handleDelete() {
  Modal.confirm({
    title: '删除项目',
    content: `确定要删除项目"${projectDetail.value?.name}"吗？删除后不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      message.success('删除成功');
      router.back();
    },
  });
}

// 启动项目
function handleStart() {
  if (!projectId.value || !projectDetail.value) return;
  
  // 校验项目基本信息完整性
  if (!projectDetail.value.name || !projectDetail.value.managerId || !projectDetail.value.plannedStartDate) {
    message.warning('请先完善项目基本信息（项目名称、负责人、计划开始日期）');
    return;
  }
  
  statusChangeType.value = 'start';
  statusChangeForm.reason = '';
  statusChangeModalVisible.value = true;
}

// 确认状态变更
async function handleStatusChangeConfirm() {
  if (!projectId.value || !projectDetail.value || !statusChangeType.value) return;
  
  try {
    // 根据不同的状态变更类型进行校验和执行
    switch (statusChangeType.value) {
      case 'start':
        // 启动项目：校验基本信息完整性
        if (!projectDetail.value.name || !projectDetail.value.managerId || !projectDetail.value.plannedStartDate) {
          message.warning('请先完善项目基本信息（项目名称、负责人、计划开始日期）');
          return;
        }
        await mockStartProject(projectId.value);
        message.success('项目已启动');
        break;
        
      case 'completeImplementation':
        // 完成实施：校验所有实施任务已完成，项目进度达到100%
        const tasks = getProjectTasks(projectId.value);
        const allTasksCompleted = tasks.length === 0 || tasks.every(task => task.status === TaskStatus.COMPLETED);
        if (!allTasksCompleted) {
          message.warning('请先完成所有实施任务');
          return;
        }
        if (projectDetail.value.progress < 100) {
          message.warning('项目进度需达到100%才能完成实施');
          return;
        }
        await mockCompleteImplementation(projectId.value);
        message.success('项目实施已完成，已进入运行阶段');
        break;
        
      case 'suspend':
        // 暂停项目：需要填写暂停原因
        if (!statusChangeForm.reason.trim()) {
          message.warning('请填写暂停原因');
          return;
        }
        await mockSuspendProject(projectId.value);
        message.success('项目已暂停');
        break;
        
      case 'resume':
        // 恢复项目：可选填写恢复说明
        const previousStatus = (projectDetail.value as any).previousStatus || ProjectStatus.IN_IMPLEMENTATION;
        await mockResumeProject(projectId.value, previousStatus);
        message.success('项目已恢复');
        break;
        
      case 'complete':
        // 结项：可选填写结项说明
        await mockCompleteProject(projectId.value);
        message.success('项目已结项');
        break;
        
      case 'cancel':
        // 取消项目：需要填写取消原因
        if (!statusChangeForm.reason.trim()) {
          message.warning('请填写取消原因');
          return;
        }
        await mockCancelProject(projectId.value);
        message.success('项目已取消');
        break;
    }
    
    statusChangeModalVisible.value = false;
    loadProjectDetail();
  } catch (error: any) {
    message.error(error.message || '操作失败');
  }
}

// 完成实施
function handleCompleteImplementation() {
  if (!projectId.value || !projectDetail.value) return;
  
  statusChangeType.value = 'completeImplementation';
  statusChangeForm.reason = '';
  statusChangeModalVisible.value = true;
}

// 暂停项目
function handleSuspend() {
  if (!projectId.value || !projectDetail.value) return;
  
  statusChangeType.value = 'suspend';
  statusChangeForm.reason = '';
  statusChangeModalVisible.value = true;
}

// 恢复项目
function handleResume() {
  if (!projectId.value || !projectDetail.value) return;
  
  statusChangeType.value = 'resume';
  statusChangeForm.reason = '';
  statusChangeModalVisible.value = true;
}

// 结项
function handleComplete() {
  if (!projectId.value || !projectDetail.value) return;
  
  statusChangeType.value = 'complete';
  statusChangeForm.reason = '';
  statusChangeModalVisible.value = true;
}

// 取消项目
function handleCancelProject() {
  if (!projectId.value || !projectDetail.value) return;
  
  statusChangeType.value = 'cancel';
  statusChangeForm.reason = '';
  statusChangeModalVisible.value = true;
}

// 获取状态变更弹窗标题
function getStatusChangeModalTitle(): string {
  const titles: Record<string, string> = {
    start: '启动项目',
    completeImplementation: '完成实施',
    suspend: '暂停项目',
    resume: '恢复项目',
    complete: '项目结项',
    cancel: '取消项目',
  };
  return statusChangeType.value ? titles[statusChangeType.value] || '' : '';
}

// 获取状态变更弹窗内容
function getStatusChangeModalContent(): string {
  if (!projectDetail.value || !statusChangeType.value) return '';
  
  const contents: Record<string, string> = {
    start: `确定要启动项目"${projectDetail.value.name}"吗？`,
    completeImplementation: `确定要完成项目"${projectDetail.value.name}"的实施吗？`,
    suspend: `确定要暂停项目"${projectDetail.value.name}"吗？`,
    resume: `确定要恢复项目"${projectDetail.value.name}"吗？`,
    complete: `确定要结项项目"${projectDetail.value.name}"吗？`,
    cancel: `确定要取消项目"${projectDetail.value.name}"吗？`,
  };
  return contents[statusChangeType.value] || '';
}

// 取消状态变更
function handleStatusChangeCancel() {
  statusChangeModalVisible.value = false;
  statusChangeType.value = null;
  statusChangeForm.reason = '';
}

// 标签页切换
function handleTabChange(key: string | number) {
  activeTab.value = String(key);
  if (key === 'plan') {
    loadProjectTasks();
  } else if (key === 'log') {
    loadProjectLogs();
  }
}

// 初始化加载数据
loadProjectDetail();
</script>

<template>
  <div class="project-detail-page">
    <div class="p-4">
      <!-- 页面头部 -->
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center">
          <Button type="text" @click="handleBack"> ← 返回 </Button>
          <div class="ml-4">
            <h1 class="text-2xl font-bold">
              {{ formData.name || '项目详情' }}
            </h1>
            <p class="text-gray-500 mt-1 flex items-center flex-wrap gap-2">
              <span>项目编号: {{ formData.code || '-' }}</span>
              <span>客户名称: {{ statistics.customerName || '-' }}</span>
              <Tag :color="getProjectStatusColor(formData.status)">
                {{ getProjectStatusLabel(formData.status) }}
              </Tag>
            </p>
          </div>
        </div>
        <Space>
          <template v-if="isViewMode">
            <Button
              v-if="[ProjectStatus.PENDING_START, ProjectStatus.IN_IMPLEMENTATION].includes(formData.status)"
              @click="handleEdit"
            >
              <template #icon>
                <EditOutlined />
              </template>
              编辑
            </Button>
            <!-- 状态流转按钮 -->
            <Button
              v-if="formData.status === ProjectStatus.PENDING_START"
              type="primary"
              @click="handleStart"
            >
              启动
            </Button>
            <Button
              v-if="formData.status === ProjectStatus.IN_IMPLEMENTATION"
              type="primary"
              @click="handleCompleteImplementation"
            >
              完成实施
            </Button>
            <Button
              v-if="[ProjectStatus.IN_IMPLEMENTATION, ProjectStatus.IN_OPERATION].includes(formData.status)"
              @click="handleSuspend"
            >
              暂停项目
            </Button>
            <Button
              v-if="formData.status === ProjectStatus.PAUSED"
              @click="handleResume"
            >
              恢复
            </Button>
            <Button
              v-if="formData.status === ProjectStatus.IN_OPERATION"
              type="primary"
              @click="handleComplete"
            >
              结项
            </Button>
            <Button
              v-if="[ProjectStatus.PENDING_START, ProjectStatus.IN_IMPLEMENTATION, ProjectStatus.IN_OPERATION, ProjectStatus.PAUSED].includes(formData.status)"
              danger
              @click="handleCancelProject"
            >
              取消项目
            </Button>
            <Button
              v-if="formData.status === ProjectStatus.PENDING_START"
              danger
              @click="handleDelete"
            >
              删除
            </Button>
          </template>
          <template v-else>
            <Button @click="handleCancel">取消</Button>
            <Button type="primary" @click="handleSave">
              <template #icon>
                <SaveOutlined />
              </template>
              保存
            </Button>
          </template>
        </Space>
      </div>

      <!-- 统计信息卡片 -->
      <Card v-if="projectDetail" size="small" class="mb-3">
        <div class="flex flex-wrap">
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">项目进度</div>
            <div class="text-2xl font-semibold text-blue-600">
              {{ statistics.progress }}
              <span class="text-sm text-gray-400 ml-1">%</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">任务总数</div>
            <div class="text-2xl font-semibold">
              {{ statistics.totalTasks }}
              <span class="text-sm text-gray-400 ml-1">个</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">已完成</div>
            <div class="text-2xl font-semibold text-green-600">
              {{ statistics.completedTasks }}
              <span class="text-sm text-gray-400 ml-1">个</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">进行中</div>
            <div class="text-2xl font-semibold text-blue-600">
              {{ statistics.inProgressTasks }}
              <span class="text-sm text-gray-400 ml-1">个</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">待办</div>
            <div class="text-2xl font-semibold text-orange-500">
              {{ statistics.pendingTasks }}
              <span class="text-sm text-gray-400 ml-1">个</span>
            </div>
          </div>
          <div class="border-l border-gray-200 hidden md:block"></div>
          <div class="flex-1 min-w-[160px] text-center px-4 py-2">
            <div class="text-gray-500 mb-2">关联订单</div>
            <div class="text-2xl font-semibold">
              {{ statistics.orderName }}
            </div>
          </div>
        </div>
      </Card>

      <!-- 标签页 -->
      <Card>
        <Tabs v-model:active-key="activeTab" @change="handleTabChange">
          <!-- 基本信息标签页 -->
          <Tabs.TabPane key="basic" tab="基本信息">
            <div class="tab-content">
            <Form
              ref="formRef"
              :model="formData"
              :rules="formRules"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 16 }"
            >
              <!-- 立项信息 -->
              <div class="section-title mb-4 font-bold text-lg border-l-4 border-blue-500 pl-2">立项信息</div>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="项目编号">
                    <Input v-model:value="formData.code" disabled placeholder="自动生成" />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="项目名称" name="name">
                    <Input
                      v-model:value="formData.name"
                      :disabled="!canEdit('initiation')"
                      placeholder="请输入项目名称"
                      allow-clear
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="关联订单" name="orderId">
                    <Select
                      v-model:value="formData.orderId"
                      :disabled="!canEdit('initiation')"
                      placeholder="请选择关联订单"
                      allow-clear
                    >
                      <Select.Option
                        v-for="item in orderOptions"
                        :key="item.value"
                        :value="item.value"
                      >
                        {{ item.label }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="客户名称">
                    <Select
                      v-model:value="formData.customerId"
                      :disabled="true"
                      placeholder="自动填充"
                    >
                      <Select.Option
                        v-for="item in customerOptions"
                        :key="item.value"
                        :value="item.value"
                      >
                        {{ item.label }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="项目负责人" name="managerId">
                    <Select
                      v-model:value="formData.managerId"
                      :disabled="!canEdit('initiation')"
                      placeholder="请选择项目负责人"
                      allow-clear
                    >
                      <Select.Option
                        v-for="item in managerOptions"
                        :key="item.value"
                        :value="item.value"
                      >
                        {{ item.label }}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="立项报告">
                    <Upload
                      v-model:file-list="formData.reportFileList"
                      :disabled="!canEdit('initiation')"
                      :max-count="1"
                    >
                      <Button :disabled="!canEdit('initiation')">
                        <UploadOutlined />
                        上传附件
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="计划开始日期">
                    <DatePicker
                      v-model:value="formData.plannedStartDate"
                      :disabled="!canEdit('initiation')"
                      format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="计划完成日期">
                    <DatePicker
                      v-model:value="formData.plannedEndDate"
                      :disabled="!canEdit('initiation')"
                      format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="24">
                  <Form.Item label="项目描述" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                    <Input.TextArea
                      v-model:value="formData.description"
                      :disabled="!canEdit('initiation')"
                      :rows="4"
                      placeholder="请输入项目描述"
                      allow-clear
                    />
                  </Form.Item>
                </Col>
              </Row>

              <!-- 执行信息 -->
              <div class="section-title mb-4 mt-4 font-bold text-lg border-l-4 border-green-500 pl-2">执行信息</div>
              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="项目状态">
                    <Select
                      v-model:value="formData.status"
                      disabled
                      placeholder="请选择项目状态"
                    >
                      <Select.Option :value="ProjectStatus.PENDING_START">
                        待启动
                      </Select.Option>
                      <Select.Option :value="ProjectStatus.IN_IMPLEMENTATION">
                        实施中
                      </Select.Option>
                      <Select.Option :value="ProjectStatus.IN_OPERATION">
                        运行中
                      </Select.Option>
                      <Select.Option :value="ProjectStatus.PAUSED">
                        已暂停
                      </Select.Option>
                      <Select.Option :value="ProjectStatus.COMPLETED">
                        已结项
                      </Select.Option>
                      <Select.Option :value="ProjectStatus.CANCELLED">
                        已取消
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="项目进度">
                    <Input
                      v-model:value="formData.progress"
                      :disabled="!canEdit('execution')"
                      suffix="%"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="12">
                  <Form.Item label="实际开始日期">
                    <DatePicker
                      v-model:value="formData.actualStartDate"
                      :disabled="!canEdit('execution')"
                      format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
                <Col :span="12">
                  <Form.Item label="实际完成日期">
                    <DatePicker
                      v-model:value="formData.actualEndDate"
                      :disabled="!canEdit('execution')"
                      format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row :gutter="24">
                <Col :span="24">
                  <Form.Item label="执行备注" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                    <Input.TextArea
                      v-model:value="formData.executionNote"
                      :disabled="!canEdit('execution')"
                      :rows="4"
                      placeholder="请输入执行备注"
                      allow-clear
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Tabs.TabPane>

        <!-- 实施计划标签页 -->
        <Tabs.TabPane key="plan" tab="计划跟进">
          <div class="tab-content">
            <!-- 操作栏 -->
            <div class="plan-toolbar">
              <Space>
                <Button type="primary" @click="handleAddTask">
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  添加任务
                </Button>
                <!-- 
                <Button @click="handleApplyTemplate">
                  <template #icon>
                    <FileTextOutlined />
                  </template>
                  引用标准方案
                </Button>
                <Button>
                  <template #icon>
                    <FileExcelOutlined />
                  </template>
                  导出Excel
                </Button>
                -->
              </Space>
              <Space>
                <Button
                  :type="planViewMode === 'gantt' ? 'primary' : 'default'"
                  @click="handleViewModeChange('gantt')"
                >
                  <template #icon>
                    <BarChartOutlined />
                  </template>
                  甘特图
                </Button>
                <Button
                  :type="planViewMode === 'list' ? 'primary' : 'default'"
                  @click="handleViewModeChange('list')"
                >
                  <template #icon>
                    <TableOutlined />
                  </template>
                  列表视图
                </Button>
              </Space>
            </div>

            <!-- 甘特图视图 -->
            <div v-if="planViewMode === 'gantt'" class="gantt-view">
              <GanttChart 
                :tasks="projectTasks" 
                @task-clicked="handleTaskClick"
                @fullscreen-changed="handleGanttFullscreenChange"
                @task-selected="handleGanttTaskSelected"
                @add-task-clicked="handleGanttAddTaskClick"
                @add-sub-task-clicked="handleGanttAddSubTaskClick"
                @delete-task-clicked="handleDeleteTask"
              />
            </div>

            <!-- 列表视图 -->
            <div v-else class="list-view">
              <Table
                :columns="taskColumns"
                :data-source="projectTasksTree"
                :pagination="false"
                :row-key="(record) => record.id"
                :scroll="{ x: 1200 }"
                :default-expand-all-rows="false"
                :children-column-name="'children'"
              />
            </div>
          </div>
        </Tabs.TabPane>


        <!-- 项目日志标签页 -->
        <Tabs.TabPane key="log" tab="项目日志">
          <div class="tab-content">
            <Table
              :columns="logColumns"
              :data-source="projectLogs"
              :pagination="false"
              :row-key="(record) => record.id"
            />
          </div>
        </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>

    <!-- 任务详情抽屉（非全屏模式） -->
    <Drawer
      v-if="!shouldUseModal"
      v-model:open="taskDrawerVisible"
      :title="taskDrawerMode === 'edit' ? '编辑任务' : '任务详情'"
      :width="600"
      :footer-style="{ textAlign: 'right' }"
      :z-index="10000"
      :get-container="getPopupContainer"
    >
      <Form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        :disabled="taskDrawerMode === 'view'"
      >
        <Form.Item label="任务名称" name="name">
          <Input
            v-model:value="taskForm.name"
            placeholder="请输入任务名称"
            allow-clear
          />
        </Form.Item>
        <!-- 父任务选择（始终显示，允许选择或清空） -->
        <Form.Item label="父任务">
          <Select
            v-model:value="taskForm.parentId"
            placeholder="选择父任务（可选，留空则为顶层任务）"
            allow-clear
            :get-popup-container="(trigger: any) => trigger.parentElement"
          >
            <Select.Option
              v-for="task in projectTasks.filter(t => !t.parentId && canHaveChildren(t, projectTasks))"
              :key="task.id"
              :value="task.id"
            >
              {{ task.name }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="开始日期" name="startDate">
          <DatePicker
            v-model:value="taskForm.startDate"
            format="YYYY-MM-DD"
            style="width: 100%"
            :get-popup-container="(trigger: any) => trigger.parentElement"
          />
        </Form.Item>
        <Form.Item label="结束日期" name="endDate">
          <DatePicker
            v-model:value="taskForm.endDate"
            format="YYYY-MM-DD"
            style="width: 100%"
            :get-popup-container="(trigger: any) => trigger.parentElement"
          />
        </Form.Item>
        <Form.Item label="负责人" name="assigneeId">
          <Select
            v-model:value="taskForm.assigneeId"
            placeholder="请选择负责人"
            :get-popup-container="(trigger: any) => trigger.parentElement"
          >
            <Select.Option
              v-for="item in assigneeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="任务描述">
          <Input.TextArea
            v-model:value="taskForm.description"
            :rows="4"
            placeholder="请输入任务描述"
            allow-clear
          />
        </Form.Item>
        <Form.Item label="设为里程碑">
          <Checkbox v-model:checked="taskForm.isMilestone">
            
          </Checkbox>
        </Form.Item>
      </Form>

      <template #footer>
        <Space>
          <Button @click="taskDrawerVisible = false">
            {{ taskDrawerMode === 'view' ? '关闭' : '取消' }}
          </Button>
          <Button v-if="taskDrawerMode === 'edit'" type="primary" @click="handleTaskSubmit">
            保存
          </Button>
        </Space>
      </template>
    </Drawer>

    <!-- 任务详情弹框（全屏模式） -->
    <Modal
      v-if="shouldUseModal"
      v-model:open="taskDrawerVisible"
      :title="taskDrawerMode === 'edit' ? '编辑任务' : '任务详情'"
      :width="700"
      :z-index="10000"
      :get-container="getPopupContainer"
    >
      <Form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        :disabled="taskDrawerMode === 'view'"
      >
        <Form.Item label="任务名称" name="name">
          <Input
            v-model:value="taskForm.name"
            placeholder="请输入任务名称"
            allow-clear
          />
        </Form.Item>
        <!-- 父任务选择（始终显示，允许选择或清空） -->
        <Form.Item label="父任务">
          <Select
            v-model:value="taskForm.parentId"
            placeholder="选择父任务（可选，留空则为顶层任务）"
            allow-clear
            :get-popup-container="(trigger: any) => trigger.parentElement"
          >
            <Select.Option
              v-for="task in projectTasks.filter(t => !t.parentId && canHaveChildren(t, projectTasks))"
              :key="task.id"
              :value="task.id"
            >
              {{ task.name }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="开始日期" name="startDate">
          <DatePicker
            v-model:value="taskForm.startDate"
            format="YYYY-MM-DD"
            style="width: 100%"
            :get-popup-container="(trigger: any) => trigger.parentElement"
          />
        </Form.Item>
        <Form.Item label="结束日期" name="endDate">
          <DatePicker
            v-model:value="taskForm.endDate"
            format="YYYY-MM-DD"
            style="width: 100%"
            :get-popup-container="(trigger: any) => trigger.parentElement"
          />
        </Form.Item>
        <Form.Item label="负责人" name="assigneeId">
          <Select
            v-model:value="taskForm.assigneeId"
            placeholder="请选择负责人"
            :get-popup-container="(trigger: any) => trigger.parentElement"
          >
            <Select.Option
              v-for="item in assigneeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="任务描述">
          <Input.TextArea
            v-model:value="taskForm.description"
            :rows="4"
            placeholder="请输入任务描述"
            allow-clear
          />
        </Form.Item>
        <Form.Item label="设为里程碑">
          <Checkbox v-model:checked="taskForm.isMilestone">
            
          </Checkbox>
        </Form.Item>
      </Form>

      <template #footer>
        <Space>
          <Button @click="taskDrawerVisible = false">
            {{ taskDrawerMode === 'view' ? '关闭' : '取消' }}
          </Button>
          <Button v-if="taskDrawerMode === 'edit'" type="primary" @click="handleTaskSubmit">
            保存
          </Button>
        </Space>
      </template>
    </Modal>

    <!-- 引用方案弹窗 -->
    <Modal
      v-model:open="templateModalVisible"
      title="选择标准实施方案"
      :width="800"
      :z-index="10000"
      :get-container="getPopupContainer"
      @ok="handleTemplateConfirm"
    >
      <Table
        :columns="[
          { title: '方案名称', dataIndex: 'name', key: 'name', width: 250 },
          { title: '方案类型', dataIndex: 'type', key: 'type', width: 120 },
          { title: '任务数', dataIndex: 'taskCount', key: 'taskCount', width: 100, align: 'right' },
          { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
        ]"
        :data-source="templateList"
        :pagination="false"
        :row-key="(record) => record.id"
        :row-selection="{
          type: 'radio',
          selectedRowKeys: selectedTemplateId ? [selectedTemplateId] : [],
          onChange: (keys) => { selectedTemplateId = keys[0] as number; },
        }"
      />
    </Modal>

    <!-- 状态变更弹窗 -->
    <Modal
      v-model:open="statusChangeModalVisible"
      :title="getStatusChangeModalTitle()"
      :width="600"
      :z-index="10000"
      :get-container="getPopupContainer"
      @ok="handleStatusChangeConfirm"
      @cancel="handleStatusChangeCancel"
    >
      <div v-if="getStatusChangeModalContent()" class="mb-4">
        {{ getStatusChangeModalContent() }}
      </div>
      <Form
        ref="statusChangeFormRef"
        :model="statusChangeForm"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <Form.Item
          v-if="statusChangeType === 'suspend' || statusChangeType === 'cancel'"
          label="原因说明"
          name="reason"
          :rules="[{ required: true, message: '请填写原因说明' }]"
        >
          <Input.TextArea
            v-model:value="statusChangeForm.reason"
            :rows="4"
            placeholder="请填写原因说明"
            allow-clear
          />
        </Form.Item>
        <Form.Item
          v-if="statusChangeType === 'resume' || statusChangeType === 'complete'"
          label="说明"
          name="reason"
        >
          <Input.TextArea
            v-model:value="statusChangeForm.reason"
            :rows="4"
            placeholder="可选填写说明"
            allow-clear
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.project-detail-page {
  height: calc(100vh - 90px);
  overflow-y: auto;
}

.project-detail-page :deep(.ant-card-body) {
  padding-top: 5px;
}

.tab-content {
  padding: 12px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.project-detail-page :deep(.ant-table-thead > tr > th) {
  text-align: center;
  background: #fafafa;
}

.project-detail-page :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.plan-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.gantt-view {
  margin-top: 5px;
}

.list-view {
  margin-top: 16px;
}

.list-view :deep(.ant-table-thead > tr > th) {
  text-align: center;
  background: #fafafa;
}
</style>
