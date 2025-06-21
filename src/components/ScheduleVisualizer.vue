<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
      <el-icon class="mr-2 text-green-500">
        <Timer />
      </el-icon>
      调度可视化
    </h3>

    <!-- 播放控制面板 -->
    <div class="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <el-button :type="isPlaying ? 'warning' : 'success'" @click="togglePlayback"
            :disabled="processes.length === 0" class="px-6">
            <el-icon class="mr-1">
              <VideoPlay v-if="!isPlaying" />
              <VideoPause v-else />
            </el-icon>
            {{ isPlaying ? '暂停' : '开始' }}
          </el-button>

          <el-button type="info" @click="resetSimulation" :disabled="processes.length === 0">
            <el-icon class="mr-1">
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-gray-600">播放速度:</span>
          <el-radio-group v-model="playbackSpeed" @change="onSpeedChange">
            <el-radio-button :value="0.5">0.5x</el-radio-button>
            <el-radio-button :value="1">1x</el-radio-button>
            <el-radio-button :value="2">2x</el-radio-button>
            <el-radio-button :value="4">4x</el-radio-button>
          </el-radio-group>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-gray-600">当前时间:</span>
          <el-tag type="primary" size="large" class="font-bold">
            {{ currentTime }}
          </el-tag>
        </div>
      </div>
    </div> <!-- 调试信息 -->
    <div class="mb-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
      <div>选中进程: {{ selectedProcess?.name || '无' }}</div>
      <div>弹出进程: {{ poppingProcess?.name || '无' }}</div>
      <div>移动进程: {{ movingProcess?.name || '无' }}</div>
      <div>CPU进程: {{ currentProcess?.name || '无' }}</div>
      <div>队列长度: {{ readyQueue.length }}</div>
      <div>动画状态: {{ isAnimating ? '进行中' : '停止' }}</div>
    </div>

    <!-- 调度状态展示区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 就绪队列 -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <el-icon class="mr-2">
            <List />
          </el-icon>
          就绪队列
        </h4>

        <div class="space-y-3 min-h-[200px] relative">
          <!-- 弹出中的进程（从队头弹出，准备移动） -->
          <div v-if="poppingProcess" v-motion :initial="{ opacity: 1, y: 0, scale: 1 }" :enter="{
            opacity: 1,
            y: -10,
            scale: 1.1,
            transition: {
              duration: 300,
              type: 'spring',
              stiffness: 150
            }
          }" :leave="{
            opacity: 0,
            x: 150,
            y: -20,
            scale: 0.9,
            transition: {
              duration: 400,
              type: 'spring'
            }
          }"
            class="process-card p-3 rounded-lg border-2 border-red-400 bg-red-50 shadow-lg absolute top-0 left-0 right-0 z-20 ring-2 ring-red-200">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-bold text-red-800">{{ poppingProcess.name }}</div>
                <div class="text-sm text-gray-600">
                  剩余: {{ poppingProcess.remainingTime }}
                </div>
              </div>
              <el-tag type="danger" size="small" effect="dark">
                弹出中
              </el-tag>
            </div>
          </div>

          <!-- 正常的队列进程 -->
          <div v-for="(process, index) in readyQueue" :key="process.id" v-motion
            :initial="{ opacity: 0, y: 30, scale: 0.9 }" :enter="{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                delay: index * 80,
                duration: 600,
                type: 'spring',
                stiffness: 100,
                damping: 15
              }
            }" :leave="{
              opacity: 0,
              y: -30,
              scale: 0.9,
              transition: {
                duration: 500,
                type: 'spring'
              }
            }" :class="[
                          'process-card p-3 rounded-lg border-2 transition-all duration-300 ease-out',
                          // 被选中的进程特殊样式
                          selectedProcess && process.id === selectedProcess.id ?
                            'border-orange-400 bg-orange-50 ring-2 ring-orange-200 selected-process' :
                            // 队头进程等待样式
                            index === 0 && isPlaying && !poppingProcess && !selectedProcess ?
                              'queue-next border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200 animate-pulse' :
                              'border-blue-200 bg-white',
                          'shadow-md hover:shadow-lg transform-gpu'
                        ]" :style="{
                          zIndex: readyQueue.length - index,
                          marginTop: poppingProcess ? '60px' : '0px' // 为弹出进程让出空间
                        }">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-bold" :class="[
                  selectedProcess && process.id === selectedProcess.id ? 'text-orange-800' :
                    index === 0 && !poppingProcess && !selectedProcess ? 'text-yellow-800' : 'text-blue-800'
                ]">
                  {{ process.name }}
                </div>
                <div class="text-sm text-gray-600">
                  剩余: {{ process.remainingTime }}
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <el-tag :type="selectedProcess && process.id === selectedProcess.id ? 'danger' :
                  index === 0 && !poppingProcess && !selectedProcess ? 'warning' : 'primary'" size="small" :effect="(selectedProcess && process.id === selectedProcess.id) ||
                    (index === 0 && !poppingProcess && !selectedProcess) ? 'dark' : 'light'">
                  {{ selectedProcess && process.id === selectedProcess.id ? '已选中' :
                    index === 0 && !poppingProcess && !selectedProcess ? '即将执行' : '等待中' }}
                </el-tag>
                <div class="text-xs text-gray-400">
                  #{{ index + 1 }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="readyQueue.length === 0" class="text-center text-gray-400 py-8">
            队列为空
          </div>
        </div>
      </div>

      <!-- 移动轨道 -->
      <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 relative">
        <h4 class="text-lg font-semibold text-gray-800 mb-4 text-center">
          <el-icon class="mr-2">
            <Right />
          </el-icon>
          移动轨道
        </h4>

        <div class="flex items-center justify-center h-[200px] relative overflow-hidden">
          <!-- 移动轨道背景 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="w-full h-2 bg-gradient-to-r from-blue-300 via-orange-300 to-green-300 rounded-full opacity-40 relative">
              <!-- 流动效果 -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse">
              </div>
            </div>
          </div> <!-- 移动中的进程 -->
          <div v-if="movingProcess" v-motion :initial="{ opacity: 0, x: -100, scale: 0.8, rotate: -5 }" :enter="{
            opacity: 1,
            x: 0,
            scale: 1,
            rotate: 0,
            transition: {
              duration: 1200 / playbackSpeed,
              type: 'spring',
              stiffness: 60,
              damping: 20
            }
          }" :leave="{
            opacity: 0,
            x: 200,
            scale: 0.9,
            transition: {
              duration: 300,
              type: 'spring'
            }
          }"
            class="process-card p-3 rounded-lg border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-xl absolute z-10">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-bold text-orange-800">{{ movingProcess.name }}</div>
                <div class="text-sm text-gray-600">
                  剩余: {{ movingProcess.remainingTime }}
                </div>
              </div>
              <el-tag type="warning" size="small" effect="dark">
                移动中
              </el-tag>
            </div>
          </div>

          <!-- 移动轨道线 -->
          <div class="w-full h-1 bg-gradient-to-r from-blue-300 via-orange-300 to-green-300 rounded-full opacity-50">
          </div>
        </div>
      </div>

      <!-- CPU执行区域 -->
      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <el-icon class="mr-2">
            <Monitor />
          </el-icon>
          CPU执行
        </h4>

        <div class="space-y-4 min-h-[200px]">
          <div v-if="currentProcess" v-motion :initial="{ opacity: 0, scale: 0.9, y: 20 }" :enter="{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              duration: 600,
              type: 'spring',
              stiffness: 120,
              damping: 20
            }
          }" :leave="{
            opacity: 0,
            scale: 0.9,
            y: -20,
            transition: {
              duration: 400,
              type: 'spring'
            }
          }" :class="[
                      'process-card p-4 rounded-lg border-2 border-green-200 bg-white shadow-md',
                      isPlaying ? 'cpu-glow' : ''
                    ]">
            <div class="mb-3">
              <div class="flex justify-between items-center mb-2">
                <div class="font-bold text-green-800">{{ currentProcess.name }}</div>
                <el-tag type="success" size="small">运行中</el-tag>
              </div>
              <div class="text-sm text-gray-600 mb-2">
                剩余时间: {{ currentProcess.remainingTime }}
              </div>
            </div>

            <!-- 执行进度条 -->
            <div class="mb-2">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>执行进度</span>
                <span>{{ Math.round(((currentProcess.burstTime - currentProcess.remainingTime) /
                  currentProcess.burstTime) * 100) }}%</span>
              </div>
              <el-progress
                :percentage="((currentProcess.burstTime - currentProcess.remainingTime) / currentProcess.burstTime) * 100"
                :stroke-width="8" :show-text="false" color="#10b981" />
            </div>

            <!-- 时间片进度 -->
            <div>
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>时间片进度</span>
                <span>{{ timeSliceProgress }}/{{ timeQuantum }}</span>
              </div>
              <el-progress :percentage="(timeSliceProgress / timeQuantum) * 100" :stroke-width="6" :show-text="false"
                color="#f59e0b" />
            </div>
          </div>

          <div v-else class="text-center text-gray-400 py-8">
            CPU空闲
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-motion :initial="{ opacity: 0, y: 30, scale: 0.95 }" :visible="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          delay: 100,
          duration: 500,
          type: 'spring',
          stiffness: 100
        }
      }" class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
        <div class="text-purple-600 text-sm font-medium">完成进程</div>
        <div class="text-2xl font-bold text-purple-800">
          {{ stats.completedProcesses }}/{{ stats.totalProcesses }}
        </div>
      </div>

      <div v-motion :initial="{ opacity: 0, y: 30, scale: 0.95 }" :visible="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          delay: 200,
          duration: 500,
          type: 'spring',
          stiffness: 100
        }
      }" class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
        <div class="text-indigo-600 text-sm font-medium">平均等待时间</div>
        <div class="text-2xl font-bold text-indigo-800">
          {{ stats.averageWaitingTime.toFixed(2) }}
        </div>
      </div>

      <div v-motion :initial="{ opacity: 0, y: 30, scale: 0.95 }" :visible="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          delay: 300,
          duration: 500,
          type: 'spring',
          stiffness: 100
        }
      }" class="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
        <div class="text-cyan-600 text-sm font-medium">平均周转时间</div>
        <div class="text-2xl font-bold text-cyan-800">
          {{ stats.averageTurnaroundTime.toFixed(2) }}
        </div>
      </div>

      <div v-motion :initial="{ opacity: 0, y: 30, scale: 0.95 }" :visible="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          delay: 400,
          duration: 500,
          type: 'spring',
          stiffness: 100
        }
      }" class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
        <div class="text-teal-600 text-sm font-medium">CPU利用率</div>
        <div class="text-2xl font-bold text-teal-800">
          {{ stats.cpuUtilization.toFixed(1) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Timer, VideoPlay, VideoPause, Refresh, List, Right, Monitor
} from '@element-plus/icons-vue'
import type { Process, RoundRobinResult, SchedulingStats, GanttItem } from '@/types/scheduler'
import { RoundRobinScheduler } from '@/utils/roundRobinScheduler'

const props = defineProps<{
  processes: Process[]
  timeQuantum: number
}>()

const emit = defineEmits<{
  updateGanttData: [ganttData: GanttItem[]]
}>()

// 响应式状态
const isPlaying = ref(false)
const playbackSpeed = ref(1)
const currentTime = ref(0)
const currentProcess = ref<Process | null>(null)
const selectedProcess = ref<Process | null>(null) // 新增：被选中的进程
const movingProcess = ref<Process | null>(null)
const poppingProcess = ref<Process | null>(null) // 正在弹出的进程
const isAnimating = ref(false)
const readyQueue = ref<Process[]>([])
const timeSliceProgress = ref(0)
const stats = ref<SchedulingStats>({
  totalProcesses: 0,
  completedProcesses: 0,
  averageWaitingTime: 0,
  averageTurnaroundTime: 0,
  cpuUtilization: 0
})

// 调度器实例和状态
let scheduler: RoundRobinScheduler | null = null
let executionGenerator: Generator<RoundRobinResult> | null = null
let animationTimer: number | null = null

// 监听进程和时间片变化
watch([() => props.processes, () => props.timeQuantum], () => {
  resetSimulation()
}, { deep: true })

// 初始化调度器
const initializeScheduler = () => {
  if (props.processes.length === 0) return

  scheduler = new RoundRobinScheduler(props.timeQuantum)
  scheduler.setProcesses(props.processes)
  executionGenerator = scheduler.executeStepByStep()

  // 重置状态
  currentTime.value = 0
  currentProcess.value = null
  selectedProcess.value = null
  movingProcess.value = null
  poppingProcess.value = null
  timeSliceProgress.value = 0

  // 初始化就绪队列（显示已到达的进程）
  readyQueue.value = props.processes
    .filter(p => p.arrivalTime <= 0 && p.remainingTime > 0)
    .slice(0, 4)

  stats.value = {
    totalProcesses: props.processes.length,
    completedProcesses: 0,
    averageWaitingTime: 0,
    averageTurnaroundTime: 0,
    cpuUtilization: 0
  }
}

// 切换播放状态
const togglePlayback = () => {
  if (props.processes.length === 0) {
    ElMessage.warning('请先添加进程')
    return
  }

  if (!scheduler) {
    initializeScheduler()
  }

  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    startSimulation()
  } else {
    stopSimulation()
  }
}

// 开始模拟
const startSimulation = () => {
  if (!executionGenerator) return

  const step = () => {
    if (!isPlaying.value) return

    const result = executionGenerator!.next()

    if (result.done) {
      // 模拟完成
      isPlaying.value = false
      ElMessage.success('调度模拟完成')
      return
    }

    const schedulingResult = result.value

    // 更新基础状态
    currentTime.value = schedulingResult.currentTime
    stats.value = schedulingResult.stats

    // 发送甘特图数据给父组件
    emit('updateGanttData', schedulingResult.ganttChart)        // 处理不同的调度阶段
    if (schedulingResult.selectedProcess) {
      // 阶段1: 进程被选中
      handleProcessSelection(schedulingResult.selectedProcess)
    } else if (schedulingResult.currentProcess) {
      // 阶段2: 进程开始执行
      handleProcessExecution(schedulingResult.currentProcess)
    }

    // 更新就绪队列状态
    updateReadyQueue(schedulingResult)

    // 继续下一步
    animationTimer = window.setTimeout(step, 2000 / playbackSpeed.value)
  }

  step()
}

// 停止模拟
const stopSimulation = () => {
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
}

// 重置模拟
const resetSimulation = () => {
  stopSimulation()
  isPlaying.value = false
  initializeScheduler()
}

// 改变播放速度
const onSpeedChange = (speed: number) => {
  playbackSpeed.value = speed
  if (isPlaying.value) {
    stopSimulation()
    startSimulation()
  }
}

// 更新就绪队列状态
const updateReadyQueue = (result: RoundRobinResult) => {
  // 只在没有进行动画时更新队列，避免影响动画状态
  if (isAnimating.value || poppingProcess.value || movingProcess.value) {
    return
  }

  // 模拟真实的时间片轮转队列状态
  const allProcesses = [...props.processes]

  // 获取所有已到达且未完成的进程
  const availableProcesses = allProcesses.filter(p => {
    const hasArrived = p.arrivalTime <= currentTime.value
    const notCompleted = p.remainingTime > 0
    return hasArrived && notCompleted
  })

  // 从可用进程中移除当前正在执行的进程和选中的进程
  const queueProcesses = availableProcesses.filter(p => {
    return p.id !== result.currentProcess?.id && p.id !== selectedProcess.value?.id
  })

  // 按照时间片轮转的顺序排列（简化模拟）
  readyQueue.value = queueProcesses.slice(0, 4) // 限制显示数量以保持界面整洁
}

// 处理进程选中阶段
const handleProcessSelection = (process: Process) => {
  console.log('处理进程选中:', process.name)
  selectedProcess.value = { ...process }

  // 确保选中的进程在队列头部
  const processIndex = readyQueue.value.findIndex(p => p.id === process.id)
  if (processIndex === -1) {
    // 如果进程不在队列中，添加到队头
    readyQueue.value.unshift({ ...process })
    console.log('将进程添加到队头:', process.name)
  } else if (processIndex !== 0) {
    // 如果进程不在队头，移动到队头
    const [selectedProc] = readyQueue.value.splice(processIndex, 1)
    readyQueue.value.unshift(selectedProc)
    console.log('将进程移动到队头:', process.name)
  }
}

// 处理进程执行阶段
const handleProcessExecution = (process: Process) => {
  // 检查是否是新的进程调度
  if (process.id !== currentProcess.value?.id) {
    // 开始新进程的调度动画
    simulateProcessScheduling(process)
  } else {
    // 同一进程继续执行，只更新时间片进度
    timeSliceProgress.value = Math.min(props.timeQuantum, process.burstTime || 0)
  }
}

// 三阶段进程调度动画
const simulateProcessScheduling = (process: Process) => {
  console.log('开始调度动画:', process.name)
  console.log('当前队列:', readyQueue.value.map(p => p.name))

  // 阶段1: 进程已经被选中并高亮（由handleProcessSelection处理）

  // 阶段2: 弹出进程（1000ms后）
  setTimeout(() => {
    console.log('尝试弹出进程:', process.name)
    // 从队列中找到要执行的进程
    const processIndex = readyQueue.value.findIndex(p => p.id === process.id)
    console.log('进程在队列中的位置:', processIndex)

    if (processIndex !== -1) {
      // 将进程设置为弹出状态
      poppingProcess.value = { ...readyQueue.value[processIndex] }
      // 从队列中移除
      readyQueue.value.splice(processIndex, 1)
      console.log('进程已弹出，新队列:', readyQueue.value.map(p => p.name))
    } else if (selectedProcess.value && selectedProcess.value.id === process.id) {
      // 如果进程在选中状态但不在队列中，直接使用选中的进程
      poppingProcess.value = { ...selectedProcess.value }
      console.log('使用选中进程进行弹出:', selectedProcess.value.name)
    }

    // 清除选中状态
    selectedProcess.value = null
  }, 1000 / playbackSpeed.value)

  // 阶段3: 弹出进程移动到轨道（1800ms后）
  setTimeout(() => {
    console.log('移动到轨道:', process.name, '弹出进程:', poppingProcess.value?.name)
    if (poppingProcess.value) {
      // 弹出进程移动到移动轨道
      movingProcess.value = { ...poppingProcess.value }
      poppingProcess.value = null
      isAnimating.value = true
    }
  }, 1800 / playbackSpeed.value)

  // 阶段4: 进程到达CPU（3200ms后）
  setTimeout(() => {
    console.log('到达CPU:', process.name, '移动进程:', movingProcess.value?.name)
    if (movingProcess.value) {
      currentProcess.value = { ...movingProcess.value }
      movingProcess.value = null
      isAnimating.value = false
      timeSliceProgress.value = Math.min(props.timeQuantum, process.burstTime || 0)
    }
  }, 3200 / playbackSpeed.value)
}

// 组件卸载时清理
onUnmounted(() => {
  stopSimulation()
})

// 初始化
initializeScheduler()
</script>

<style scoped>
.process-card {
  transition: all 0.3s ease-in-out;
}

.cpu-glow {
  animation: pulse-cpu 2s infinite;
}

.queue-highlight {
  animation: highlight-queue 2s ease-in-out infinite;
}

.selected-process {
  animation: selected-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-cpu {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }

  50% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
}

@keyframes highlight-queue {

  0%,
  100% {
    background-color: white;
    transform: scale(1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  50% {
    background-color: #dbeafe;
    transform: scale(1.02);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.05);
  }
}

@keyframes selected-glow {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(249, 115, 22, 0), 0 8px 15px -3px rgba(249, 115, 22, 0.3);
  }
}

.move-to-cpu-enter-active {
  transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.move-to-cpu-enter-from {
  transform: translateX(-100%) scale(0.8) rotate(-5deg);
  opacity: 0;
}

.move-to-cpu-enter-to {
  transform: translateX(0) scale(1) rotate(0deg);
  opacity: 1;
}

.queue-enter-active {
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.queue-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  left: 0;
  right: 0;
}

.queue-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.queue-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.queue-move {
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 队列项的交错进入动画 */
.queue-enter-active:nth-child(1) {
  transition-delay: 0ms;
}

.queue-enter-active:nth-child(2) {
  transition-delay: 80ms;
}

.queue-enter-active:nth-child(3) {
  transition-delay: 160ms;
}

.queue-enter-active:nth-child(4) {
  transition-delay: 240ms;
}

.queue-enter-active:nth-child(5) {
  transition-delay: 320ms;
}

/* 下一个执行进程的特殊动画 */
.queue-next {
  animation: next-highlight 2s ease-in-out infinite;
}

@keyframes next-highlight {

  0%,
  100% {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  50% {
    box-shadow: 0 8px 25px -3px rgba(251, 191, 36, 0.3), 0 4px 6px -2px rgba(251, 191, 36, 0.1);
  }
}
</style>
