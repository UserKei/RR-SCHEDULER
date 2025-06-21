<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
      <el-icon class="mr-2 text-gray-600">
        <DataLine />
      </el-icon>
      甘特图
    </h3>

    <!-- 甘特图控制面板 -->
    <div class="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <span class="text-sm text-gray-600">时间范围: <span class="font-mono text-gray-900">0-{{ maxTime }}</span></span>
          <span class="text-sm text-gray-600">进程数: <span class="font-mono text-gray-900">{{ uniqueProcesses.length
              }}</span></span>
        </div>

        <div class="flex items-center gap-2">
          <button class="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300" @click="zoomOut"
            :disabled="scale <= minScale">
            <el-icon>
              <ZoomOut />
            </el-icon>
          </button>
          <span class="text-xs text-gray-500 min-w-[50px] text-center">{{ Math.round(scale * 100) }}%</span>
          <button class="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300" @click="zoomIn"
            :disabled="scale >= maxScale">
            <el-icon>
              <ZoomIn />
            </el-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- 甘特图容器 -->
    <div class="border border-gray-200 rounded overflow-hidden">
      <!-- 时间轴 -->
      <div class="bg-white border-b border-gray-200 p-3">
        <div class="flex items-center">
          <div class="w-24 text-xs font-medium text-gray-600">进程</div>
          <div class="flex-1 relative">
            <div class="flex relative" :style="{ width: `${timelineWidth}px` }">
              <div v-for="time in timePoints" :key="time" class="relative" :style="{
                width: `${timeUnitWidth}px`,
                marginLeft: time === 0 ? '0' : '-1px'
              }">
                <div class="absolute left-0 top-0 h-1 border-l border-gray-300"></div>
                <div class="absolute left-0 top-2 text-xs text-gray-400 transform -translate-x-1/2">
                  {{ time }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 甘特图主体 -->
      <div class="max-h-80 overflow-y-auto">
        <div v-if="ganttData.length === 0" class="text-center py-16 text-gray-400">
          <div class="text-sm">暂无调度数据</div>
        </div>

        <div v-else>
          <!-- 进程行 -->
          <div v-for="process in uniqueProcesses" :key="process.id"
            class="flex items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
            <!-- 进程信息 -->
            <div class="w-24 p-3 bg-gray-50 border-r border-gray-200">
              <div class="text-sm font-medium text-gray-900 truncate">{{ process.name }}</div>
            </div>

            <!-- 甘特条 -->
            <div class="flex-1 p-2 relative">
              <div class="relative" :style="{ width: `${timelineWidth}px`, height: '32px' }">
                <!-- 背景网格 -->
                <div class="absolute inset-0 flex">
                  <div v-for="time in timePoints" :key="`grid-${time}`"
                    class="border-l border-gray-100 first:border-l-0" :style="{ width: `${timeUnitWidth}px` }"></div>
                </div>

                <!-- 进程执行块 -->
                <div v-for="(item, index) in getProcessGanttItems(process.id)" :key="`${item.processId}-${index}`"
                  class="absolute gantt-bar cursor-pointer" :style="getGanttBarStyle(item)"
                  @click="showGanttDetail(item)" @mouseenter="showTooltip($event, item)" @mouseleave="hideTooltip">
                  <div class="h-full flex items-center justify-center text-white text-xs">
                    {{ item.endTime - item.startTime }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细信息弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="执行详情" width="400px" :append-to-body="true">
      <div v-if="selectedGanttItem" class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-600">进程名称:</span>
          <span class="font-medium">{{ selectedGanttItem.processName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">开始时间:</span>
          <span class="font-medium">{{ selectedGanttItem.startTime }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">结束时间:</span>
          <span class="font-medium">{{ selectedGanttItem.endTime }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">执行时长:</span>
          <span class="font-medium">{{ selectedGanttItem.endTime - selectedGanttItem.startTime }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">状态:</span>
          <span class="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {{ getStatusText(selectedGanttItem.status) }}
          </span>
        </div>
      </div>
    </el-dialog>

    <!-- Tooltip -->
    <div ref="tooltipRef" v-show="tooltipVisible"
      class="absolute z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none" :style="tooltipStyle">
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { DataLine, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import type { GanttItem, Process, ProcessStatus } from '@/types/scheduler'

const props = defineProps<{
  ganttData: GanttItem[]
  processes: Process[]
}>()

// 响应式状态
const scale = ref(1)
const minScale = 0.5
const maxScale = 3
const timeUnitWidth = computed(() => 40 * scale.value)
const detailDialogVisible = ref(false)
const selectedGanttItem = ref<GanttItem | null>(null)
const tooltipVisible = ref(false)
const tooltipRef = ref<HTMLElement>()
const tooltipStyle = ref({})
const tooltipText = ref('')

// 计算最大时间
const maxTime = computed(() => {
  if (props.ganttData.length === 0) return 10
  return Math.max(...props.ganttData.map(item => item.endTime), 10)
})

// 生成时间点
const timePoints = computed(() => {
  const points = []
  for (let i = 0; i <= maxTime.value; i++) {
    points.push(i)
  }
  return points
})

// 时间轴宽度
const timelineWidth = computed(() => {
  return timePoints.value.length * timeUnitWidth.value
})

// 获取唯一进程列表
const uniqueProcesses = computed(() => {
  const processMap = new Map()

  // 从甘特图数据中提取进程信息
  props.ganttData.forEach(item => {
    if (!processMap.has(item.processId)) {
      const originalProcess = props.processes.find(p => p.id === item.processId)
      processMap.set(item.processId, {
        id: item.processId,
        name: item.processName,
        arrivalTime: originalProcess?.arrivalTime || 0,
        burstTime: originalProcess?.burstTime || 0
      })
    }
  })

  // 如果没有甘特图数据，显示所有进程
  if (processMap.size === 0) {
    props.processes.forEach(process => {
      processMap.set(process.id, process)
    })
  }

  return Array.from(processMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

// 获取特定进程的甘特图项
const getProcessGanttItems = (processId: string) => {
  return props.ganttData.filter(item => item.processId === processId)
}

// 获取甘特条样式
const getGanttBarStyle = (item: GanttItem) => {
  const left = item.startTime * timeUnitWidth.value
  const width = (item.endTime - item.startTime) * timeUnitWidth.value - 1 // 减去边距

  return {
    left: `${left}px`,
    width: `${width}px`,
    height: '28px',
    top: '6px',
    backgroundColor: '#374151', // 统一使用深灰色
    border: '1px solid #6b7280',
    borderRadius: '4px'
  }
}

// 获取状态文本
const getStatusText = (status: ProcessStatus) => {
  switch (status) {
    case 'running': return '运行中'
    case 'ready': return '就绪'
    case 'complete': return '完成'
    case 'waiting': return '等待'
    default: return '未知'
  }
}

// 放大
const zoomIn = () => {
  if (scale.value < maxScale) {
    scale.value = Math.min(scale.value + 0.25, maxScale)
  }
}

// 缩小
const zoomOut = () => {
  if (scale.value > minScale) {
    scale.value = Math.max(scale.value - 0.25, minScale)
  }
}

// 显示甘特图详情
const showGanttDetail = (item: GanttItem) => {
  selectedGanttItem.value = item
  detailDialogVisible.value = true
}

// 显示 Tooltip
const showTooltip = (event: MouseEvent, item: GanttItem) => {
  tooltipText.value = `${item.processName}: ${item.startTime} - ${item.endTime}`
  tooltipStyle.value = {
    left: `${event.pageX + 10}px`,
    top: `${event.pageY - 30}px`
  }
  tooltipVisible.value = true
}

// 隐藏 Tooltip
const hideTooltip = () => {
  tooltipVisible.value = false
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    zoomIn()
  } else if (event.key === '-') {
    event.preventDefault()
    zoomOut()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.gantt-bar {
  transition: all 0.2s ease;
}

.gantt-bar:hover {
  opacity: 0.8;
}
</style>
