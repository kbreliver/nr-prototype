<script lang="ts" setup>
import { onMounted, onBeforeUnmount, onActivated, ref, watch, nextTick } from 'vue';
import { Button, Space } from 'ant-design-vue';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import gantt from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import type { ProjectTask } from '../types';
import { flattenTaskTree, canHaveChildren } from '../utils';

defineOptions({
  name: 'GanttChart',
});

const props = defineProps<{
  tasks: ProjectTask[];
}>();

const emit = defineEmits<{
  taskUpdated: [task: ProjectTask];
  taskAdded: [task: Partial<ProjectTask>];
  taskDeleted: [taskId: number];
  taskClicked: [task: ProjectTask];
  fullscreenChanged: [isFullscreen: boolean];
  taskSelected: [task: ProjectTask | null];
  addTaskClicked: [];
  deleteTaskClicked: [task: ProjectTask];
  addSubTaskClicked: [task: ProjectTask];
}>();

const ganttContainer = ref<HTMLDivElement>();
const ganttWrapper = ref<HTMLDivElement>();
const scaleMode = ref<'day' | 'week' | 'month'>('day');
const isFullscreen = ref(false);
const selectedTask = ref<ProjectTask | null>(null);

// 将任务数据转换为甘特图格式
function convertToGanttFormat(tasks: ProjectTask[]) {
  // 将树形结构转换为扁平列表（如果传入的是树形结构）
  const flatTasks = tasks.some(t => t.children) ? flattenTaskTree(tasks) : tasks;
  
  return {
    data: flatTasks.map((task) => ({
      id: task.id,
      text: task.name,
      start_date: task.startDate,
      duration: task.duration,
      progress: task.progress / 100,
      parent: task.parentId || 0, // 如果有父任务，设置parent为父任务ID，否则为0
      type: task.isMilestone ? 'milestone' : (task.isParent ? 'project' : 'task'), // 父任务使用project类型
      open: task.isParent ? true : undefined, // 父任务默认展开
    })),
    links: [],
  };
}

// 配置不同视图的时间刻度
function configureScale(mode: 'day' | 'week' | 'month') {
  gantt.config.date_format = '%Y-%m-%d';
  
  if (mode === 'day') {
    gantt.config.scale_unit = 'day';
    gantt.config.date_scale = '%d';
    gantt.config.subscales = [
      { unit: 'month', step: 1, date: '%Y年%m月' },
    ];
    gantt.config.step = 1;
  } else if (mode === 'week') {
    gantt.config.scale_unit = 'week';
    gantt.config.date_scale = '第%W周';
    gantt.config.subscales = [
      { unit: 'month', step: 1, date: '%Y年%m月' },
    ];
    gantt.config.step = 1;
  } else if (mode === 'month') {
    gantt.config.scale_unit = 'month';
    gantt.config.date_scale = '%Y年%m月';
    gantt.config.subscales = [
      { unit: 'year', step: 1, date: '%Y年' },
    ];
    gantt.config.step = 1;
  }
}

// 切换视图模式
function handleScaleChange(mode: 'day' | 'week' | 'month') {
  scaleMode.value = mode;
  configureScale(mode);
  gantt.render();
}

// 切换全屏
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  emit('fullscreenChanged', isFullscreen.value);
  // 延迟执行，等待DOM更新后重新渲染甘特图
  setTimeout(() => {
    gantt.render();
  }, 100);
}

// 监听ESC键退出全屏
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false;
    setTimeout(() => {
      gantt.render();
    }, 100);
  }
}

function initGantt() {
  if (!ganttContainer.value) return;

  // 配置时间刻度
  configureScale(scaleMode.value);

  // 配置列
  gantt.config.columns = [
    { name: 'text', label: '任务名称', width: '*', tree: true },
    { name: 'start_date', label: '开始时间', align: 'center', width: 100 },
    { name: 'duration', label: '持续时间(天)', align: 'center', width: 80 },
    { name: 'progress', label: '进度', align: 'center', width: 60, template: (task: any) => `${Math.round(task.progress * 100)}%` },
  ];

  // 配置样式
  gantt.config.readonly = true;
  gantt.config.show_grid = true;
  gantt.config.show_chart = true;
  gantt.config.show_progress = true;
  gantt.config.show_links = false; // 隐藏依赖连线（二期功能）
  gantt.config.drag_links = false; // 禁止拖拽创建依赖（二期功能）
  
  // 配置树形结构支持
  gantt.config.open_tree_initially = true; // 默认展开树形结构
  gantt.config.order_branch = true; // 启用分支排序
  gantt.config.order_branch_free = false; // 不允许自由排序分支
  
  // 启用任务选择功能
  gantt.config.select_task = true; // 允许选择任务

  // 自定义任务条模板，在右侧添加操作按钮
  (gantt as any).templates.task_text = function(_start: any, _end: any, task: any) {
    // 1. 判断选中状态
    let isSelected = false;
    try {
      // 优先使用 dhtmlx 的内部状态判断
      const selectedId = (gantt as any).getState?.()?.selected_task;
      if (selectedId) {
        isSelected = String(selectedId) === String(task.id);
      } else {
        // 降级检查 DOM
        isSelected = document.querySelector(`.gantt_task_line[data-task-id="${task.id}"]`)?.classList.contains('gantt_selected') || false;
      }
    } catch (e) {
      console.warn('Error checking selection status:', e);
    }
    
    // 2. 构建操作按钮HTML
    let actionButtons = '';
    if (isSelected) {
      // 根据 parent 属性判断是否为父任务 (parent 为 0 或空表示根任务)
      const isParent = !task.parent || task.parent === '0' || task.parent === 0;
      
      if (isParent) {
        actionButtons += `<div class="gantt-task-action-btn gantt-task-add-subtask" data-task-id="${task.id}" title="添加子任务" role="button">+</div>`;
      }
      actionButtons += `<div class="gantt-task-action-btn gantt-task-delete" data-task-id="${task.id}" title="删除任务" role="button">×</div>`;
    }
    
    return `<div class="gantt-task-content-wrapper"><span class="gantt-task-text">${task.text}</span>${actionButtons ? `<div class="gantt-task-actions">${actionButtons}</div>` : ''}</div>`;
  };

  // 初始化甘特图
  gantt.init(ganttContainer.value);
  
  // 监听任务条上的操作按钮点击事件
  nextTick(() => {
    if (ganttContainer.value) {
      ganttContainer.value.addEventListener('click', handleTaskActionClick);
    }
  });

  // 监听任务双击事件
  gantt.attachEvent('onTaskDblClick', function(id: any) {
    const task = props.tasks.find(t => t.id === Number(id));
    if (task) {
      emit('taskClicked', task);
    }
    return true;
  });

  // 移除右键菜单删除功能，改用任务条右侧的操作按钮

  // 监听任务点击事件（单击选中）
  gantt.attachEvent('onTaskClick', function(id: any) {
    const taskId = Number(id);
    const flatTasks = props.tasks.some(t => t.children) ? flattenTaskTree(props.tasks) : props.tasks;
    const task = flatTasks.find(t => t.id === taskId);
    
    console.log('甘特图任务点击 - taskId:', taskId, 'task:', task);
    
    if (task) {
      console.log('选中任务:', task, '是否为子任务:', !!task.parentId);
      selectedTask.value = task;
      emit('taskSelected', task);
      // 手动选中任务
      try {
        if ((gantt as any).selectTask) {
          (gantt as any).selectTask(taskId);
        }
        // 选中后刷新任务显示
        setTimeout(() => {
          gantt.refreshTask(taskId); // 仅刷新特定任务，比 render 更高效
        }, 0);
      } catch (e) {
        console.warn('无法选中任务:', e);
      }
    } else {
      console.log('未找到任务，清空选中状态');
      const prevSelected = selectedTask.value;
      selectedTask.value = null;
      emit('taskSelected', null);
      
      // 如果之前有选中的任务，刷新它以移除按钮
      if (prevSelected) {
        setTimeout(() => {
          try {
            gantt.refreshTask(prevSelected.id);
          } catch (e) { 
            gantt.render(); 
          }
        }, 0);
      } else {
        gantt.render();
      }
    }
    return true;
  });

  // 监听任务选中前事件（允许选中子任务，不再阻止）
  gantt.attachEvent('onBeforeTaskSelect', function() {
    // 允许选中所有任务，包括子任务
    return true;
  });

  // 监听任务选中事件（备用）
  gantt.attachEvent('onAfterTaskSelect', function(id: any) {
    const taskId = Number(id);
    const flatTasks = props.tasks.some(t => t.children) ? flattenTaskTree(props.tasks) : props.tasks;
    const task = flatTasks.find(t => t.id === taskId);
    
    console.log('onAfterTaskSelect - taskId:', taskId, 'task:', task);
    
    if (task) {
      const prevSelected = selectedTask.value;
      selectedTask.value = task;
      emit('taskSelected', task);
      
      // 刷新新选中的任务和之前选中的任务（如果有）
      setTimeout(() => {
        gantt.refreshTask(taskId);
        if (prevSelected && prevSelected.id !== taskId) {
           try { gantt.refreshTask(prevSelected.id); } catch(e) {}
        }
      }, 0);
    } else {
      const prevSelected = selectedTask.value;
      selectedTask.value = null;
      emit('taskSelected', null);
      
      if (prevSelected) {
        setTimeout(() => {
          try { gantt.refreshTask(prevSelected.id); } catch(e) { gantt.render(); }
        }, 0);
      }
    }
    return true;
  });

  // 监听点击空白区域，取消选中
  gantt.attachEvent('onEmptyClick', function() {
    console.log('点击空白区域，取消选中');
    const prevSelected = selectedTask.value;
    
    selectedTask.value = null;
    emit('taskSelected', null);
    clearGanttSelection();
    
    // 清空选中后重新渲染之前的任务以隐藏操作按钮
    if (prevSelected) {
      setTimeout(() => {
        try {
          gantt.refreshTask(prevSelected.id);
        } catch (e) {
          gantt.render();
        }
      }, 0);
    } else {
      gantt.render();
    }
    return true;
  });

  // 监听点击事件（备用，处理点击非任务区域）
  gantt.attachEvent('onClick', function(id: any) {
    // 如果点击的不是任务（id为空、0或undefined），取消选中
    if (!id || id === 0 || id === '') {
      console.log('点击非任务区域，取消选中');
      selectedTask.value = null;
      emit('taskSelected', null);
      clearGanttSelection();
    }
    return true;
  });

  // 加载数据
  const ganttData = convertToGanttFormat(props.tasks);
  gantt.parse(ganttData);
}

// 处理任务条操作按钮点击
function handleTaskActionClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  
  // 检查是否点击了操作按钮
  if (target.classList.contains('gantt-task-action-btn')) {
    e.stopPropagation();
    e.preventDefault();
    
    const taskId = Number(target.getAttribute('data-task-id'));
    const flatTasks = props.tasks.some(t => t.children) ? flattenTaskTree(props.tasks) : props.tasks;
    const task = flatTasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    if (target.classList.contains('gantt-task-add-subtask')) {
      // 添加子任务
      emit('addSubTaskClicked', task);
    } else if (target.classList.contains('gantt-task-delete')) {
      // 删除任务
      emit('deleteTaskClicked', task);
    }
  }
}

// 清除甘特图选中状态
function clearGanttSelection() {
  try {
    // 方法1: 尝试使用 clearSelection
    if ((gantt as any).clearSelection) {
      (gantt as any).clearSelection();
      return;
    }
    
    // 方法2: 尝试使用 selectTask(null)
    if ((gantt as any).selectTask) {
      (gantt as any).selectTask(null);
      return;
    }
    
    // 方法3: 手动移除选中样式
    const selectedId = (gantt as any).getSelectedId?.();
    if (selectedId) {
      // 移除任务条的选中样式
      const taskElement = document.querySelector(`.gantt_task[data-id="${selectedId}"]`);
      if (taskElement) {
        taskElement.classList.remove('gantt_selected');
      }
      
      // 移除表格行的选中样式
      const rowElement = document.querySelector(`.gantt_grid_data tr[data-id="${selectedId}"]`);
      if (rowElement) {
        rowElement.classList.remove('gantt_selected');
      }
    }
    
    // 方法4: 移除所有选中样式
    const selectedElements = document.querySelectorAll('.gantt_selected');
    selectedElements.forEach((el) => {
      el.classList.remove('gantt_selected');
    });
  } catch (e) {
    console.warn('清除甘特图选中状态失败:', e);
  }
}

// 处理添加任务按钮点击
function handleAddTask() {
  emit('addTaskClicked');
}

// 监听选中任务变化，重新渲染任务条以显示/隐藏操作按钮
watch(
  () => selectedTask.value,
  () => {
    if (ganttContainer.value) {
      // 重新渲染任务条以更新操作按钮显示
      setTimeout(() => {
        gantt.render();
      }, 50);
    }
  }
);

watch(
  () => props.tasks,
  () => {
    if (ganttContainer.value) {
      // 检查选中的任务是否还存在
      if (selectedTask.value) {
        const flatTasks = props.tasks.some(t => t.children) ? flattenTaskTree(props.tasks) : props.tasks;
        const taskExists = flatTasks.some(t => t.id === selectedTask.value!.id);
        if (!taskExists) {
          selectedTask.value = null;
          emit('taskSelected', null);
        }
      }
      
      gantt.clearAll();
      const ganttData = convertToGanttFormat(props.tasks);
      gantt.parse(ganttData);
      
      // 重新绑定操作按钮点击事件
      nextTick(() => {
        if (ganttContainer.value) {
          ganttContainer.value.removeEventListener('click', handleTaskActionClick);
          ganttContainer.value.addEventListener('click', handleTaskActionClick);
        }
      });
    }
  },
  { deep: true }
);

// 处理甘特图容器点击事件（用于检测点击空白区域）
function handleGanttContainerClick(e: MouseEvent) {
  // 检查点击的目标是否是操作按钮，如果是则不处理
  const target = e.target as HTMLElement;
  if (target.classList.contains('gantt-task-action-btn')) {
    return;
  }
  
  // 检查点击的目标是否是任务条或任务相关的元素
  const isTaskBar = target.closest('.gantt_task') || 
                    target.closest('.gantt_task_line') ||
                    target.closest('.gantt_task_content') ||
                    target.closest('.gantt_task_progress');
  
  // 检查是否点击的是表格中的任务行
  const gridRow = target.closest('.gantt_grid_data tr[data-id]');
  
  // 如果点击的不是任务条或任务行，且当前有选中的任务，则取消选中
  if (!isTaskBar && !gridRow && selectedTask.value) {
    console.log('点击甘特图容器空白区域，取消选中');
    const prevSelected = selectedTask.value;
    selectedTask.value = null;
    emit('taskSelected', null);
    clearGanttSelection();
    
    if (prevSelected) {
       setTimeout(() => {
         try { (gantt as any).refreshTask(prevSelected.id); } catch(e) { (gantt as any).render(); }
       }, 0);
    }
  }
}

onMounted(() => {
  initGantt();
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown);
  
  // 添加甘特图容器点击事件监听
  nextTick(() => {
    if (ganttContainer.value) {
      ganttContainer.value.addEventListener('click', handleGanttContainerClick);
      ganttContainer.value.addEventListener('click', handleTaskActionClick);
    }
  });
});

onActivated(() => {
  // 当组件被激活时（例如从其他 tab 切换回来时），重新调整甘特图大小
  nextTick(() => {
    if (ganttContainer.value) {
      gantt.setSizes();
      gantt.render();
    }
  });
});

onBeforeUnmount(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeydown);
  
  // 移除甘特图容器点击事件监听
  if (ganttContainer.value) {
    ganttContainer.value.removeEventListener('click', handleGanttContainerClick);
  }
});
</script>

<template>
  <div ref="ganttWrapper" class="gantt-chart-wrapper" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="gantt-toolbar">
      <!-- 全屏模式下左侧显示添加任务按钮 -->
      <Space v-if="isFullscreen">
        <Button
          type="primary"
          size="small"
          @click="handleAddTask"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          添加任务
        </Button>
      </Space>
      <div v-else></div>
      
      <!-- 右侧：时间视图切换和全屏按钮 -->
      <Space>
        <span class="toolbar-label">时间视图：</span>
        <Button
          :type="scaleMode === 'day' ? 'primary' : 'default'"
          size="small"
          @click="handleScaleChange('day')"
        >
          日
        </Button>
        <Button
          :type="scaleMode === 'week' ? 'primary' : 'default'"
          size="small"
          @click="handleScaleChange('week')"
        >
          周
        </Button>
        <Button
          :type="scaleMode === 'month' ? 'primary' : 'default'"
          size="small"
          @click="handleScaleChange('month')"
        >
          月
        </Button>
        <Button
          size="small"
          @click="toggleFullscreen"
          :title="isFullscreen ? '退出全屏' : '全屏显示'"
        >
          <template #icon>
            <FullscreenExitOutlined v-if="isFullscreen" />
            <FullscreenOutlined v-else />
          </template>
        </Button>
      </Space>
    </div>
    <div ref="ganttContainer" class="gantt-container"></div>
  </div>
</template>

<style scoped>
.gantt-chart-wrapper {
  width: 100%;
  height: 500px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gantt-toolbar {
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-label {
  color: #666;
  font-size: 14px;
  margin-right: 4px;
}

.gantt-container {
  width: 100%;
  flex: 1;
  overflow: hidden;
}

/* 全屏样式 */
.gantt-chart-wrapper.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  border-radius: 0;
  background: #fff;
}

/* 覆盖dhtmlx-gantt的默认样式以适配Ant Design主题 */
.gantt-chart-wrapper :deep(.gantt_task_line) {
  border-radius: 4px;
}

.gantt-chart-wrapper :deep(.gantt_task_progress) {
  border-radius: 4px;
}

.gantt-chart-wrapper :deep(.gantt_grid_head_cell) {
  background: #fafafa;
  border-color: #e8e8e8;
}

.gantt-chart-wrapper :deep(.gantt_grid_data .gantt_cell) {
  border-color: #e8e8e8;
}

.gantt-chart-wrapper :deep(.gantt_task .gantt_task_scale .gantt_scale_cell) {
  border-color: #e8e8e8;
}

/* 任务条操作按钮样式 */
/* 修正：使用 gantt_task_content 类名，并确保内容正确布局 */
.gantt-chart-wrapper :deep(.gantt_task_content) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  overflow: visible !important; /* 允许按钮超出一点或显示完整 */
}

.gantt-chart-wrapper :deep(.gantt-task-content-wrapper) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 6px;
}

.gantt-chart-wrapper :deep(.gantt-task-text) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 4px;
}

.gantt-chart-wrapper :deep(.gantt-task-actions) {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 100%;
}

.gantt-chart-wrapper :deep(.gantt-task-action-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%; /* 圆形按钮更好看 */
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #666;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
}

.gantt-chart-wrapper :deep(.gantt-task-action-btn:hover) {
  background: #fff;
  border-color: #1890ff;
  color: #1890ff;
}

.gantt-chart-wrapper :deep(.gantt-task-add-subtask) {
  color: #1890ff;
}

.gantt-chart-wrapper :deep(.gantt-task-add-subtask:hover) {
  background: #e6f7ff;
  border-color: #1890ff;
}

.gantt-chart-wrapper :deep(.gantt-task-delete) {
  color: #ff4d4f;
}

.gantt-chart-wrapper :deep(.gantt-task-delete:hover) {
  background: #fff1f0;
  border-color: #ff4d4f;
}
</style>

