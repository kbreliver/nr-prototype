/**
 * 项目实施模块 - Mock数据
 */

import dayjs, { Dayjs } from 'dayjs';

import {
  ApprovalStatus,
  HardwareDeliveryStage,
  ProjectStatus,
  SoftwareDeliveryType,
  TaskStatus,
  TaskType,
  TemplateStatus,
  TemplateType,
} from './types';
import type {
  DeliveryTask,
  ErrorRecord,
  HardwareDeliveryTask,
  ImplementationTemplate,
  ModuleConfig,
  ModuleNode,
  ModuleUsage,
  MonitorData,
  Project,
  ProjectApproval,
  ProjectLog,
  ProjectTask,
  SoftwareDeliveryTask,
} from './types';

// ==================== 项目数据 ====================

/** Mock项目列表 */
export const mockProjects: Project[] = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  const statuses = Object.values(ProjectStatus);
  const status = statuses[i % statuses.length];
  const progress = status === ProjectStatus.COMPLETED ? 100 : Math.floor(Math.random() * 100);
  
  return {
    id,
    code: `PRJ-2024${String(id).padStart(4, '0')}`,
    name: `${['智慧工厂', '数字化转型', '信息化升级', 'ERP系统', 'MES系统'][i % 5]}项目${id}`,
    orderId: Math.floor(id / 2) + 1,
    orderCode: `ORD-2024${String(Math.floor(id / 2) + 1).padStart(4, '0')}`,
    orderName: `订单${Math.floor(id / 2) + 1}`,
    customerId: Math.floor(id / 5) + 1,
    customerName: `${['华润集团', '中国移动', '宝钢集团', '中石化', '国家电网'][Math.floor(i / 5) % 5]}`,
    status,
    progress,
    managerId: (i % 5) + 1,
    managerName: `项目经理${(i % 5) + 1}`,
    description: `这是${['智慧工厂', '数字化转型', '信息化升级', 'ERP系统', 'MES系统'][i % 5]}项目${id}的详细描述`,
    plannedStartDate: dayjs().subtract(i * 2, 'day').format('YYYY-MM-DD'),
    plannedEndDate: dayjs().add(90 - i, 'day').format('YYYY-MM-DD'),
    actualStartDate: status !== ProjectStatus.PENDING_START ? dayjs().subtract(i * 2, 'day').format('YYYY-MM-DD') : undefined,
    actualEndDate: status === ProjectStatus.COMPLETED ? dayjs().subtract(i, 'day').format('YYYY-MM-DD') : undefined,
    createdAt: dayjs().subtract(i * 3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(i, 'hour').format('YYYY-MM-DD HH:mm:ss'),
  };
});

/** 根据ID获取项目 */
export function getProjectById(id: number): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

/** 获取项目列表 */
export function getProjects(query: any = {}): {
  list: Project[];
  total: number;
} {
  let list = [...mockProjects];

  // 关键字搜索
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.code.toLowerCase().includes(keyword),
    );
  }

  // 状态筛选
  if (query.status && query.status.length > 0) {
    list = list.filter((p) => query.status.includes(p.status));
  }

  // 负责人筛选
  if (query.managerId && query.managerId.length > 0) {
    list = list.filter((p) => query.managerId.includes(p.managerId));
  }

  // 订单筛选
  if (query.orderId) {
    list = list.filter((p) => p.orderId === query.orderId);
  }

  // 客户筛选
  if (query.customerId) {
    list = list.filter((p) => p.customerId === query.customerId);
  }

  // 日期范围筛选
  if (query.startDate) {
    list = list.filter((p) => dayjs(p.createdAt).isAfter(dayjs(query.startDate)));
  }
  if (query.endDate) {
    list = list.filter((p) => dayjs(p.createdAt).isBefore(dayjs(query.endDate)));
  }

  const total = list.length;

  // 排序
  if (query.sortField && query.sortOrder) {
    list.sort((a, b) => {
      const aVal = a[query.sortField];
      const bVal = b[query.sortField];
      if (query.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  // 分页
  const page = query.page || 1;
  const pageSize = query.pageSize || 20;
  list = list.slice((page - 1) * pageSize, page * pageSize);

  return { list, total };
}

// ==================== 项目任务数据 ====================

/** Mock项目任务列表 */
export function getProjectTasks(projectId: number): ProjectTask[] {
  const baseId = projectId * 100;
  const today = dayjs().startOf('day');
  let currentId = baseId + 1;

  type ChildSpec = {
    name: string;
    startOffset: number;
    duration: number;
    status: TaskStatus;
    progress: number;
    assigneeId: number;
    assigneeName?: string;
    description: string;
    isMilestone?: boolean;
  };

  const createChildTask = (spec: ChildSpec, parentId: number): ProjectTask => {
    const id = currentId++;
    const start = today.add(spec.startOffset, 'day');
    const end = start.add(spec.duration - 1, 'day');

    return {
      id,
      projectId,
      name: spec.name,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      duration: spec.duration,
      progress: spec.progress,
      status: spec.status,
      assigneeId: spec.assigneeId,
      assigneeName: spec.assigneeName || `实施人员${spec.assigneeId}`,
      description: spec.description,
      isMilestone: spec.isMilestone || false,
      parentId,
    };
  };

  const hardwareParentId = currentId++;
  const hardwareChildrenSpecs: ChildSpec[] = [
    {
      name: '硬件发货',
      startOffset: 0,
      duration: 2,
      status: TaskStatus.COMPLETED,
      progress: 100,
      assigneeId: 1,
      description: '完成硬件设备的打包与出库。',
    },
    {
      name: '到货验收',
      startOffset: 2,
      duration: 1,
      status: TaskStatus.COMPLETED,
      progress: 100,
      assigneeId: 2,
      description: '设备到场后进行验收，确认型号与数量。',
      isMilestone: true,
    },
    {
      name: '安装调试',
      startOffset: 3,
      duration: 5,
      status: TaskStatus.IN_PROGRESS,
      progress: 45,
      assigneeId: 3,
      description: '安装设备并完成基础联调及系统联通。',
    },
    {
      name: '客户验收',
      startOffset: 8,
      duration: 1,
      status: TaskStatus.PENDING,
      progress: 0,
      assigneeId: 4,
      description: '客户现场确认硬件交付质量与性能。',
      isMilestone: true,
    },
  ];

  const hardwareChildren = hardwareChildrenSpecs.map((spec) =>
    createChildTask(spec, hardwareParentId),
  );

  const softwareParentId = currentId++;
  const softwareChildrenSpecs: ChildSpec[] = [
    {
      name: '账户开通',
      startOffset: 0,
      duration: 2,
      status: TaskStatus.COMPLETED,
      progress: 100,
      assigneeId: 2,
      description: '为项目相关人员开通系统账户并确认权限。',
    },
    {
      name: '模块配置',
      startOffset: 3,
      duration: 4,
      status: TaskStatus.IN_PROGRESS,
      progress: 35,
      assigneeId: 5,
      description: '根据实施方案配置标准模块与接入系统。',
    },
  ];

  const softwareChildren = softwareChildrenSpecs.map((spec) =>
    createChildTask(spec, softwareParentId),
  );

  const buildParentTask = (
    id: number,
    name: string,
    assigneeId: number,
    description: string,
    children: ProjectTask[],
  ): ProjectTask => {
    const startDates = children.map((child) => dayjs(child.startDate));
    const endDates = children.map((child) => dayjs(child.endDate));
    const start = startDates.reduce((min, current) =>
      current.isBefore(min) ? current : min,
    );
    const end = endDates.reduce((max, current) =>
      current.isAfter(max) ? current : max,
    );
    const duration = end.diff(start, 'day') + 1;
    const progress = Math.round(
      children.reduce((sum, child) => sum + child.progress, 0) / children.length,
    );
    const status = children.every((child) => child.status === TaskStatus.COMPLETED)
      ? TaskStatus.COMPLETED
      : children.some((child) => child.status === TaskStatus.IN_PROGRESS)
      ? TaskStatus.IN_PROGRESS
      : TaskStatus.PENDING;

    return {
      id,
      projectId,
      name,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      duration,
      progress,
      status,
      assigneeId,
      assigneeName: `实施人员${assigneeId}`,
      description,
      isParent: true,
    };
  };

  const hardwareParent = buildParentTask(
    hardwareParentId,
    '硬件交付',
    1,
    '硬件交付任务，包含发货、验收、安装和客户确认。',
    hardwareChildren,
  );

  const softwareParent = buildParentTask(
    softwareParentId,
    '软件交付',
    2,
    '软件交付任务，涵盖账户开通与模块配置。',
    softwareChildren,
  );

  return [
    hardwareParent,
    ...hardwareChildren,
    softwareParent,
    ...softwareChildren,
  ];
}

// ==================== 交付任务数据 ====================

/** Mock交付任务列表 */
export const mockDeliveryTasks: DeliveryTask[] = mockProjects.flatMap((project, index) => {
  const baseId = project.id * 10;
  const plannedStart = dayjs(project.plannedStartDate || dayjs().format('YYYY-MM-DD'));
  const hardwareStatusOptions = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];
  const softwareStatusOptions = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];
  const hardwareStatus = hardwareStatusOptions[index % hardwareStatusOptions.length];
  const softwareStatus = softwareStatusOptions[(index + 1) % softwareStatusOptions.length];

  const hardwarePlannedStart = plannedStart.add(1, 'day');
  const softwarePlannedStart = plannedStart.add(2, 'day');

  const hardwareStageStatusMap: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.PENDING]: [
      TaskStatus.PENDING,
      TaskStatus.PENDING,
      TaskStatus.PENDING,
      TaskStatus.PENDING,
    ],
    [TaskStatus.IN_PROGRESS]: [
      TaskStatus.COMPLETED,
      TaskStatus.COMPLETED,
      TaskStatus.IN_PROGRESS,
      TaskStatus.PENDING,
    ],
    [TaskStatus.COMPLETED]: [
      TaskStatus.COMPLETED,
      TaskStatus.COMPLETED,
      TaskStatus.COMPLETED,
      TaskStatus.COMPLETED,
    ],
  };

  const softwareStageStatusMap: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.PENDING]: [TaskStatus.PENDING, TaskStatus.PENDING],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS],
    [TaskStatus.COMPLETED]: [TaskStatus.COMPLETED, TaskStatus.COMPLETED],
  };

  const hardwareStageSpecs = [
    {
      name: '硬件发货',
      stage: HardwareDeliveryStage.SHIPMENT,
      startOffset: 0,
      duration: 2,
      description: '完成硬件设备的打包与出库。',
    },
    {
      name: '到货验收（里程碑）',
      stage: HardwareDeliveryStage.RECEIPT,
      startOffset: 2,
      duration: 1,
      description: '设备到场后进行验收，确认型号与数量，属于里程碑节点。',
    },
    {
      name: '安装调试',
      stage: HardwareDeliveryStage.INSTALLATION,
      startOffset: 3,
      duration: 5,
      description: '安装设备并完成基础联调及系统联通。',
    },
    {
      name: '客户验收（里程碑）',
      stage: HardwareDeliveryStage.CONFIRMATION,
      startOffset: 8,
      duration: 1,
      description: '客户现场确认硬件交付质量与性能，属于里程碑节点。',
    },
  ];

  const softwareTaskSpecs = [
    {
      name: '账户开通',
      startOffset: 0,
      duration: 2,
      deliveryType: SoftwareDeliveryType.ACCOUNT_SETUP,
      description: '为项目相关人员开通系统账户并确认权限。',
    },
    {
      name: '模块配置',
      startOffset: 3,
      duration: 4,
      deliveryType: SoftwareDeliveryType.MODULE_ENABLE,
      description: '根据实施方案配置标准模块与接入系统。',
    },
  ];

  const hardwareStatuses =
    hardwareStageStatusMap[hardwareStatus] || hardwareStageStatusMap[TaskStatus.PENDING];
  const softwareStatuses =
    softwareStageStatusMap[softwareStatus] || softwareStageStatusMap[TaskStatus.PENDING];

  const hardwareProgressByStatus = (status: TaskStatus) =>
    status === TaskStatus.COMPLETED ? 100 : status === TaskStatus.IN_PROGRESS ? 55 : 10;
  const softwareProgressByStatus = (status: TaskStatus) =>
    status === TaskStatus.COMPLETED ? 100 : status === TaskStatus.IN_PROGRESS ? 45 : 15;

  const getHardwareStageDetail = (
    stage: HardwareDeliveryStage,
    start: Dayjs,
    status: TaskStatus,
    sequence: number,
  ) => {
    switch (stage) {
      case HardwareDeliveryStage.SHIPMENT:
        return {
          shipmentDate: start.format('YYYY-MM-DD'),
          logistics: '顺丰速运',
          trackingNumber: `SF${(project.id * 100 + sequence).toString().padStart(6, '0')}`,
        };
      case HardwareDeliveryStage.RECEIPT:
        return {
          receiptDate: start.format('YYYY-MM-DD'),
          result: status === TaskStatus.COMPLETED ? 'qualified' : '待验收',
          inspector: `验收人员${project.id % 3 + 1}`,
        };
      case HardwareDeliveryStage.INSTALLATION:
        return {
          installationDate: start.format('YYYY-MM-DD'),
          location: '客户现场A区',
        };
      case HardwareDeliveryStage.CONFIRMATION:
        return {
          confirmationDate: start.format('YYYY-MM-DD'),
          notes: '客户确认验收内容与质量。',
        };
      default:
        return undefined;
    }
  };

  const hardwareTasks: HardwareDeliveryTask[] = hardwareStageSpecs.map((spec, specIndex) => {
    const status = hardwareStatuses[specIndex];
    const start = hardwarePlannedStart.add(spec.startOffset, 'day');
    const end = start.add(spec.duration - 1, 'day');
    const operatorId = ((project.id + specIndex) % 5) + 1;

    return {
      id: baseId + specIndex + 1,
      projectId: project.id,
      projectName: project.name,
      name: spec.name,
      type: TaskType.HARDWARE,
      status,
      progress: hardwareProgressByStatus(status),
      plannedStartDate: start.format('YYYY-MM-DD'),
      plannedEndDate: end.format('YYYY-MM-DD'),
      actualStartDate: status === TaskStatus.PENDING ? undefined : start.format('YYYY-MM-DD'),
      actualEndDate: status === TaskStatus.COMPLETED ? end.format('YYYY-MM-DD') : undefined,
      assigneeId: operatorId,
      assigneeName: `实施人员${operatorId}`,
      description: spec.description,
      createdAt: dayjs().subtract(project.id % 7 + specIndex + 1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().subtract(project.id % 4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      stages: [
        {
          stage: spec.stage,
          status,
          completedAt:
            status === TaskStatus.COMPLETED ? end.format('YYYY-MM-DD HH:mm:ss') : undefined,
          operatorId,
          operatorName: `实施人员${operatorId}`,
          data: getHardwareStageDetail(spec.stage, start, status, specIndex),
        },
      ],
    };
  });

  const softwareTasks: SoftwareDeliveryTask[] = softwareTaskSpecs.map((spec, specIndex) => {
    const status = softwareStatuses[specIndex];
    const start = softwarePlannedStart.add(spec.startOffset, 'day');
    const end = start.add(spec.duration - 1, 'day');
    const assigneeId = ((project.id + specIndex + 2) % 5) + 1;

    return {
      id: baseId + hardwareStageSpecs.length + specIndex + 1,
      projectId: project.id,
      projectName: project.name,
      name: spec.name,
      type: TaskType.SOFTWARE,
      status,
      progress: softwareProgressByStatus(status),
      plannedStartDate: start.format('YYYY-MM-DD'),
      plannedEndDate: end.format('YYYY-MM-DD'),
      actualStartDate: status === TaskStatus.PENDING ? undefined : start.format('YYYY-MM-DD'),
      actualEndDate: status === TaskStatus.COMPLETED ? end.format('YYYY-MM-DD') : undefined,
      assigneeId,
      assigneeName: `实施人员${assigneeId}`,
      description: spec.description,
      createdAt: dayjs().subtract(project.id % 6 + specIndex + 2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().subtract(project.id % 5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      deliveryType: spec.deliveryType,
      accountInfo: {
        url: 'https://demo.erp.sino.com',
        username: `user${project.id}`,
        password: '******',
        notes: '请使用授权账号登录系统，首次登录需要强制修改密码。',
      },
      moduleConfig: getMockModuleConfig(project.id),
    };
  });

  return [...hardwareTasks, ...softwareTasks];
});

/** 获取交付任务列表 */
export function getDeliveryTasks(query: any = {}): {
  list: DeliveryTask[];
  total: number;
} {
  let list = [...mockDeliveryTasks];

  // 项目筛选
  if (query.projectId) {
    list = list.filter((t) => t.projectId === query.projectId);
  }

  // 类型筛选
  if (query.type) {
    list = list.filter((t) => t.type === query.type);
  }

  // 状态筛选
  if (query.status && query.status.length > 0) {
    list = list.filter((t) => query.status.includes(t.status));
  }

  // 负责人筛选
  if (query.assigneeId && query.assigneeId.length > 0) {
    list = list.filter((t) => query.assigneeId.includes(t.assigneeId));
  }

  // 关键字搜索
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    list = list.filter((t) => t.name.toLowerCase().includes(keyword));
  }

  const total = list.length;

  // 分页
  const page = query.page || 1;
  const pageSize = query.pageSize || 20;
  list = list.slice((page - 1) * pageSize, page * pageSize);

  return { list, total };
}

/** 根据ID获取交付任务 */
export function getDeliveryTaskById(id: number): SoftwareDeliveryTask | HardwareDeliveryTask | undefined {
  const task = mockDeliveryTasks.find((t) => t.id === id);
  if (!task) return undefined;

  if (task.type === TaskType.SOFTWARE) {
    return task as SoftwareDeliveryTask;
  }

  if (task.type === TaskType.HARDWARE) {
    return task as HardwareDeliveryTask;
  }

  return undefined;
}

// ==================== 模块配置数据 ====================

/** Mock模块树 */
function getMockModuleTree(): ModuleNode[] {
  return [
    {
      id: 'm1',
      name: '生产管理',
      path: '/production',
      enabled: true,
      enabledTime: dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
      operatorId: 1,
      operatorName: '操作员1',
      children: [
        {
          id: 'm1-1',
          name: '生产计划',
          path: '/production/plan',
          enabled: true,
          enabledTime: dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
          operatorId: 1,
          operatorName: '操作员1',
        },
        {
          id: 'm1-2',
          name: '生产执行',
          path: '/production/execution',
          enabled: true,
          enabledTime: dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
          operatorId: 1,
          operatorName: '操作员1',
        },
        {
          id: 'm1-3',
          name: '质量检测',
          path: '/production/quality',
          enabled: false,
        },
      ],
    },
    {
      id: 'm2',
      name: '库存管理',
      path: '/inventory',
      enabled: true,
      enabledTime: dayjs().subtract(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
      operatorId: 1,
      operatorName: '操作员1',
      children: [
        {
          id: 'm2-1',
          name: '入库管理',
          path: '/inventory/inbound',
          enabled: true,
          enabledTime: dayjs().subtract(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
          operatorId: 1,
          operatorName: '操作员1',
        },
        {
          id: 'm2-2',
          name: '出库管理',
          path: '/inventory/outbound',
          enabled: true,
          enabledTime: dayjs().subtract(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
          operatorId: 1,
          operatorName: '操作员1',
        },
        {
          id: 'm2-3',
          name: '库存盘点',
          path: '/inventory/stocktaking',
          enabled: false,
        },
      ],
    },
    {
      id: 'm3',
      name: '销售管理',
      path: '/sales',
      enabled: false,
      children: [
        {
          id: 'm3-1',
          name: '订单管理',
          path: '/sales/order',
          enabled: false,
        },
        {
          id: 'm3-2',
          name: '客户管理',
          path: '/sales/customer',
          enabled: false,
        },
      ],
    },
  ];
}

/** Mock模块配置 */
function getMockModuleConfig(projectId: number): ModuleConfig[] {
  return [
    {
      id: 1,
      productId: 1,
      productName: 'MES系统',
      moduleTree: getMockModuleTree(),
    },
    {
      id: 2,
      productId: 2,
      productName: 'WMS系统',
      moduleTree: getMockModuleTree(),
    },
  ];
}

// ==================== 审批记录数据 ====================

/** Mock审批记录 */
export function getProjectApprovals(projectId: number): ProjectApproval[] {
  return [
    {
      id: projectId * 10 + 1,
      projectId,
      node: '项目立项',
      approverId: 1,
      approverName: '部门经理',
      status: ApprovalStatus.APPROVED,
      opinion: '同意立项',
      approvedAt: dayjs().subtract(15, 'day').format('YYYY-MM-DD HH:mm:ss'),
      createdAt: dayjs().subtract(16, 'day').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: projectId * 10 + 2,
      projectId,
      node: '实施方案审批',
      approverId: 2,
      approverName: '技术总监',
      status: ApprovalStatus.APPROVED,
      opinion: '方案可行',
      approvedAt: dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss'),
      createdAt: dayjs().subtract(11, 'day').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: projectId * 10 + 3,
      projectId,
      node: '项目变更',
      approverId: 1,
      approverName: '部门经理',
      status: ApprovalStatus.IN_PROGRESS,
      createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
    },
  ];
}

// ==================== 监控数据 ====================

/** Mock监控数据 */
export function getMonitorData(projectId: number, days: number = 30): MonitorData[] {
  return Array.from({ length: days }, (_, i) => ({
    projectId,
    date: dayjs().subtract(days - i - 1, 'day').format('YYYY-MM-DD'),
    pv: Math.floor(Math.random() * 1000) + 500,
    uv: Math.floor(Math.random() * 200) + 100,
    onlineUsers: Math.floor(Math.random() * 50) + 10,
    errorCount: Math.floor(Math.random() * 5),
  }));
}

/** Mock模块使用情况 */
export function getModuleUsage(projectId: number): ModuleUsage[] {
  const modules = getMockModuleTree();
  const flatModules: ModuleUsage[] = [];

  function traverse(nodes: ModuleNode[]) {
    for (const node of nodes) {
      if (node.enabled) {
        flatModules.push({
          moduleId: node.id,
          moduleName: node.name,
          usageCount: Math.floor(Math.random() * 500) + 50,
          usageRate: Math.random() * 100,
          lastUsedAt: dayjs().subtract(Math.floor(Math.random() * 7), 'day').format('YYYY-MM-DD HH:mm:ss'),
          status: Math.random() > 0.2 ? 'active' : 'inactive',
        });
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(modules);
  return flatModules;
}

/** Mock异常记录 */
export function getErrorRecords(projectId: number): ErrorRecord[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: projectId * 100 + i + 1,
    projectId,
    moduleId: `m${(i % 3) + 1}`,
    moduleName: ['生产管理', '库存管理', '销售管理'][i % 3],
    errorType: ['系统异常', '数据异常', '接口异常', '性能异常'][i % 4],
    errorMessage: `异常信息${i + 1}: ${['连接超时', '数据格式错误', '权限不足', '资源不足'][i % 4]}`,
    status: ['pending', 'processing', 'resolved'][i % 3] as any,
    solution: i % 3 === 2 ? '已修复相关问题' : undefined,
    handlerId: i % 3 > 0 ? (i % 5) + 1 : undefined,
    handlerName: i % 3 > 0 ? `实施人员${(i % 5) + 1}` : undefined,
    occurredAt: dayjs().subtract(i, 'day').format('YYYY-MM-DD HH:mm:ss'),
    resolvedAt: i % 3 === 2 ? dayjs().subtract(i - 1, 'day').format('YYYY-MM-DD HH:mm:ss') : undefined,
  }));
}

// ==================== 实施方案模板数据 ====================

/** Mock实施方案模板列表 */
export const mockTemplates: ImplementationTemplate[] = Array.from({ length: 20 }, (_, i) => {
  const id = i + 1;
  const types = Object.values(TemplateType);
  const type = types[i % types.length];
  const status = i % 5 === 0 ? TemplateStatus.DISABLED : TemplateStatus.ENABLED;
  const taskCount = Math.floor(Math.random() * 15) + 5;

  return {
    id,
    code: `TPL-${String(id).padStart(4, '0')}`,
    name: `${type === TemplateType.STANDARD ? '标准' : type === TemplateType.FAST ? '快速' : '定制'}实施方案${id}`,
    type,
    status,
    description: `${type === TemplateType.STANDARD ? '标准' : type === TemplateType.FAST ? '快速' : '定制'}实施方案${id}的详细描述`,
    tasks: Array.from({ length: taskCount }, (_, j) => ({
      id: id * 100 + j + 1,
      templateId: id,
      name: `任务${j + 1}: ${['需求调研', '方案设计', '开发实施', '测试验证', '培训交付', '上线支持'][j % 6]}`,
      order: j + 1,
      plannedDays: Math.floor(Math.random() * 10) + 3,
      roleId: (j % 5) + 1,
      roleName: `角色${(j % 5) + 1}`,
      dependencies: j > 0 ? [id * 100 + j] : undefined,
      description: `任务${j + 1}的详细描述`,
    })),
    taskCount,
    createdAt: dayjs().subtract(i * 10, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(i, 'day').format('YYYY-MM-DD HH:mm:ss'),
  };
});

/** 获取实施方案模板列表 */
export function getTemplates(query: any = {}): {
  list: ImplementationTemplate[];
  total: number;
} {
  let list = [...mockTemplates];

  // 关键字搜索
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(keyword) ||
        t.code.toLowerCase().includes(keyword),
    );
  }

  // 类型筛选
  if (query.type && query.type.length > 0) {
    list = list.filter((t) => query.type.includes(t.type));
  }

  // 状态筛选
  if (query.status && query.status.length > 0) {
    list = list.filter((t) => query.status.includes(t.status));
  }

  const total = list.length;

  // 分页
  const page = query.page || 1;
  const pageSize = query.pageSize || 20;
  list = list.slice((page - 1) * pageSize, page * pageSize);

  return { list, total };
}

/** 根据ID获取实施方案模板 */
export function getTemplateById(id: number): ImplementationTemplate | undefined {
  return mockTemplates.find((t) => t.id === id);
}

// ==================== Mock API函数 ====================

/** 延迟函数 */
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mock创建项目 */
export async function mockCreateProject(data: any): Promise<Project> {
  await delay();
  const id = mockProjects.length + 1;
  const project: Project = {
    id,
    code: `PRJ-2024${String(id).padStart(4, '0')}`,
    name: data.name,
    orderId: data.orderId,
    orderCode: `ORD-2024${String(data.orderId).padStart(4, '0')}`,
    orderName: `订单${data.orderId}`,
    customerId: 1,
    customerName: '测试客户',
    status: ProjectStatus.PENDING_START,
    progress: 0,
    managerId: data.managerId,
    managerName: `项目经理${data.managerId}`,
    description: data.description,
    plannedStartDate: data.plannedStartDate,
    plannedEndDate: data.plannedEndDate,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };
  mockProjects.unshift(project);
  return project;
}

/** Mock更新项目 */
export async function mockUpdateProject(id: number, data: any): Promise<Project> {
  await delay();
  const index = mockProjects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('项目不存在');
  mockProjects[index] = { ...mockProjects[index], ...data, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') };
  return mockProjects[index];
}

/** Mock删除项目 */
export async function mockDeleteProject(id: number): Promise<void> {
  await delay();
  const index = mockProjects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('项目不存在');
  mockProjects.splice(index, 1);
}

/** Mock启动项目 */
export async function mockStartProject(projectId: number): Promise<void> {
  await delay();
  const project = getProjectById(projectId);
  if (!project) throw new Error('项目不存在');
  project.status = ProjectStatus.IN_IMPLEMENTATION;
  project.actualStartDate = dayjs().format('YYYY-MM-DD');
}

/** Mock完成实施 */
export async function mockCompleteImplementation(projectId: number): Promise<void> {
  await delay();
  const project = getProjectById(projectId);
  if (!project) throw new Error('项目不存在');
  project.status = ProjectStatus.IN_OPERATION;
  project.progress = 100;
}

/** Mock结项 */
export async function mockCompleteProject(projectId: number): Promise<void> {
  await delay();
  const project = getProjectById(projectId);
  if (!project) throw new Error('项目不存在');
  project.status = ProjectStatus.COMPLETED;
  project.progress = 100;
  project.actualEndDate = dayjs().format('YYYY-MM-DD');
}

/** Mock暂停项目 */
export async function mockSuspendProject(projectId: number): Promise<void> {
  await delay();
  const project = getProjectById(projectId);
  if (!project) throw new Error('项目不存在');
  // 记录暂停前的状态（在实际应用中应该保存到数据库）
  (project as any).previousStatus = project.status;
  project.status = ProjectStatus.PAUSED;
}

/** Mock恢复项目 */
export async function mockResumeProject(projectId: number, previousStatus: ProjectStatus): Promise<void> {
  await delay();
  const project = getProjectById(projectId);
  if (!project) throw new Error('项目不存在');
  // 根据暂停前的状态恢复到对应状态
  if (previousStatus === ProjectStatus.IN_IMPLEMENTATION) {
    project.status = ProjectStatus.IN_IMPLEMENTATION;
  } else if (previousStatus === ProjectStatus.IN_OPERATION) {
    project.status = ProjectStatus.IN_OPERATION;
  } else {
    project.status = ProjectStatus.PENDING_START;
  }
}

/** Mock取消项目 */
export async function mockCancelProject(projectId: number): Promise<void> {
  await delay();
  const project = getProjectById(projectId);
  if (!project) throw new Error('项目不存在');
  project.status = ProjectStatus.CANCELLED;
}

/** Mock创建任务 */
export async function mockCreateTask(projectId: number, data: any): Promise<ProjectTask> {
  await delay();
  const tasks = getProjectTasks(projectId);
  
  // 验证：如果设置了parentId，检查父任务是否存在，以及父任务是否已经是子任务
  if (data.parentId) {
    const parentTask = tasks.find((t) => t.id === data.parentId);
    if (!parentTask) {
      throw new Error('父任务不存在');
    }
    if (parentTask.parentId) {
      throw new Error('不支持三层任务结构，子任务不能再有子任务');
    }
  }
  
  const id = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : projectId * 100 + 1;
  const task: ProjectTask = {
    id,
    projectId,
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    duration: dayjs(data.endDate).diff(dayjs(data.startDate), 'day') + 1,
    progress: 0,
    status: TaskStatus.PENDING,
    assigneeId: data.assigneeId,
    assigneeName: `实施人员${data.assigneeId}`,
    dependencies: data.dependencies,
    description: data.description,
    isMilestone: data.isMilestone || false,
    parentId: data.parentId,
  };
  
  // 如果是子任务，更新父任务的属性
  if (data.parentId) {
    // 这里应该更新父任务，但在mock中我们只是返回新任务
    // 实际应用中应该在服务端处理父任务更新
  }
  
  return task;
}

/** Mock删除任务 */
export async function mockDeleteTask(projectId: number, taskId: number): Promise<void> {
  await delay();
  const tasks = getProjectTasks(projectId);
  const task = tasks.find((t) => t.id === taskId);
  
  if (!task) {
    throw new Error('任务不存在');
  }
  
  // 检查是否是父任务，如果是，递归删除所有子任务
  const childTasks = tasks.filter((t) => t.parentId === taskId);
  if (childTasks.length > 0) {
    // 递归删除所有子任务
    for (const childTask of childTasks) {
      await mockDeleteTask(projectId, childTask.id);
    }
  }
  
  // 模拟删除操作
  // 在实际应用中，这里应该调用API删除任务
  return;
}

/** Mock更新任务状态 */
export async function mockUpdateTaskStatus(taskId: number, status: TaskStatus): Promise<void> {
  await delay();
  // 模拟更新任务状态
}

/** Mock启用模块 */
export async function mockEnableModule(moduleId: string, enabled: boolean): Promise<void> {
  await delay();
  // 模拟启用/禁用模块
}

/** Mock更新硬件交付环节 */
export async function mockUpdateHardwareStage(taskId: number, stage: HardwareDeliveryStage, data: any): Promise<void> {
  await delay();
  // 模拟更新硬件交付环节
}

/** Mock创建实施方案 */
export async function mockCreateTemplate(data: any): Promise<ImplementationTemplate> {
  await delay();
  const id = mockTemplates.length + 1;
  const template: ImplementationTemplate = {
    id,
    code: `TPL-${String(id).padStart(4, '0')}`,
    name: data.name,
    type: data.type,
    status: TemplateStatus.ENABLED,
    description: data.description,
    tasks: [],
    taskCount: 0,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };
  mockTemplates.unshift(template);
  return template;
}

/** Mock更新实施方案 */
export async function mockUpdateTemplate(id: number, data: any): Promise<ImplementationTemplate> {
  await delay();
  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('方案不存在');
  mockTemplates[index] = { ...mockTemplates[index], ...data, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') };
  return mockTemplates[index];
}

/** Mock删除实施方案 */
export async function mockDeleteTemplate(id: number): Promise<void> {
  await delay();
  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('方案不存在');
  mockTemplates.splice(index, 1);
}

/** Mock引用实施方案 */
export async function mockApplyTemplate(projectId: number, templateId: number): Promise<ProjectTask[]> {
  await delay();
  const template = getTemplateById(templateId);
  if (!template) throw new Error('方案不存在');

  // 将方案任务转换为项目任务
  const tasks: ProjectTask[] = template.tasks.map((t, i) => ({
    id: projectId * 100 + i + 1,
    projectId,
    name: t.name,
    startDate: dayjs().add(i * 3, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(i * 3 + t.plannedDays, 'day').format('YYYY-MM-DD'),
    duration: t.plannedDays,
    progress: 0,
    status: TaskStatus.PENDING,
    assigneeId: 1,
    assigneeName: '实施人员1',
    dependencies: t.dependencies,
    description: t.description,
    isMilestone: false,
  }));

  return tasks;
}

// ==================== 项目日志数据 ====================

/** Mock项目日志 */
export function getProjectLogs(projectId: number): ProjectLog[] {
  // 固定日志
  const logs: ProjectLog[] = [
    {
      id: projectId * 100 + 1,
      projectId,
      time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      user: '项目经理1',
      operation: '创建项目',
      description: '创建了新项目，关联订单：订单1',
    },
    {
      id: projectId * 100 + 2,
      projectId,
      time: dayjs().subtract(20, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      user: '项目经理1',
      operation: '提交审批',
      description: '提交了项目立项审批',
    },
    {
      id: projectId * 100 + 3,
      projectId,
      time: dayjs().subtract(18, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      user: '系统管理员',
      operation: '审批通过',
      description: 'OA系统自动同步：立项审批已通过',
    },
    {
      id: projectId * 100 + 4,
      projectId,
      time: dayjs().subtract(10, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      user: '项目经理1',
      operation: '创建任务',
      description: '创建了任务：需求调研',
    },
    {
      id: projectId * 100 + 5,
      projectId,
      time: dayjs().subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      user: '实施人员1',
      operation: '更新进度',
      description: '更新任务"需求调研"进度为 50%',
    },
    {
      id: projectId * 100 + 6,
      projectId,
      time: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      user: '项目经理1',
      operation: '修改项目',
      description: '修改了项目描述信息',
    },
  ];

  // 按时间倒序
  return logs.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());
}
