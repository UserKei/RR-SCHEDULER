<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
      <el-icon class="mr-2 text-gray-600">
        <Timer />
      </el-icon>
      调度可视化
    </h3>

    <!-- 播放控制面板 -->
    <div class="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button :class="[
            'flex items-center px-4 py-2 text-sm font-medium rounded border',
            isPlaying ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' :
              'bg-gray-900 border-gray-900 text-white hover:bg-gray-800',
            processes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          ]" @click="togglePlayback" :disabled="processes.length === 0">
            <el-icon class="mr-1">
              <VideoPlay v-if="!isPlaying" />
              <VideoPause v-else />
            </el-icon>
            {{ isPlaying ? '暂停' : '开始' }}
          </button>

          <button
            class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            @click="resetSimulation" :disabled="processes.length === 0">
            <el-icon class="mr-1">
              <Refresh />
            </el-icon>
            重置
          </button>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">播放速度:</span>
          <div class="flex border border-gray-300 rounded">
            <button v-for="speed in [0.5, 1, 2, 4]" :key="speed" :class="[
              'px-3 py-1 text-sm font-medium border-r border-gray-300 last:border-r-0',
              playbackSpeed === speed ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            ]" @click="() => { playbackSpeed = speed; onSpeedChange(speed) }">
              {{ speed }}x
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">当前时间:</span>
          <span class="text-sm font-mono font-medium text-gray-900 bg-white border border-gray-300 px-2 py-1 rounded">
            {{ currentTime }}
          </span>
        </div>
      </div>
    </div>

    <!-- 调度状态展示区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 就绪队列 -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 class="text-base font-medium text-gray-900 mb-4 flex items-center">
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
          }" class="process-card p-3 rounded border-2 border-red-500 bg-red-50 absolute top-0 left-0 right-0 z-20">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-red-900">{{ poppingProcess.name }}</div>
                <div class="text-sm text-gray-600">
                  剩余: {{ poppingProcess.remainingTime }}
                </div>
              </div>
              <span class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                弹出中
              </span>
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
              'process-card p-3 rounded border transition-all duration-300 ease-out',
              // 被选中的进程特殊样式
              selectedProcess && process.id === selectedProcess.id ?
                'border-orange-500 bg-orange-50' :
                // 队头进程等待样式
                index === 0 && isPlaying && !poppingProcess && !selectedProcess ?
                  'border-yellow-500 bg-yellow-50 animate-pulse' :
                  'border-gray-300 bg-white'
            ]" :style="{
              zIndex: readyQueue.length - index,
              marginTop: poppingProcess ? '60px' : '0px' // 为弹出进程让出空间
            }">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium" :class="[
                  selectedProcess && process.id === selectedProcess.id ? 'text-orange-900' :
                    index === 0 && !poppingProcess && !selectedProcess ? 'text-yellow-900' : 'text-gray-900'
                ]">
                  {{ process.name }}
                </div>
                <div class="text-sm text-gray-600">
                  剩余: {{ process.remainingTime }}
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <span :class="[
                  'text-xs px-2 py-1 rounded',
                  selectedProcess && process.id === selectedProcess.id ? 'bg-orange-100 text-orange-700' :
                    index === 0 && !poppingProcess && !selectedProcess ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                ]">
                  {{ selectedProcess && process.id === selectedProcess.id ? '已选中' :
                    index === 0 && !poppingProcess && !selectedProcess ? '即将执行' : '等待中' }}
                </span>
                <div class="text-xs text-gray-400">
                  #{{ index + 1 }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="readyQueue.length === 0" class="text-center text-gray-500 py-8">
            队列为空
          </div>
        </div>
      </div>

      <!-- 移动轨道 -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
        <h4 class="text-base font-medium text-gray-900 mb-4 text-center">
          <el-icon class="mr-2">
            <Right />
          </el-icon>
          移动轨道
        </h4>

        <div class="flex items-center justify-center h-[200px] relative overflow-hidden">
          <!-- 移动轨道背景 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-full h-1 bg-gray-300 rounded-full relative">
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
          }" class="process-card p-3 rounded border-2 border-orange-500 bg-orange-50 absolute z-10">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-orange-900">{{ movingProcess.name }}</div>
                <div class="text-sm text-gray-600">
                  剩余: {{ movingProcess.remainingTime }}
                </div>
              </div>
              <span class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                移动中
              </span>
            </div>
          </div>

          <!-- 移动轨道线 -->
          <div class="w-full h-1 bg-gray-300 rounded-full">
          </div>
        </div>
      </div>

      <!-- CPU执行区域 -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 class="text-base font-medium text-gray-900 mb-4 flex items-center">
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
            'process-card p-4 rounded border bg-white',
            isPlaying ? 'border-green-500' : 'border-gray-300'
          ]">
            <div class="mb-3">
              <div class="flex justify-between items-center mb-2">
                <div class="font-medium text-gray-900">{{ currentProcess.name }}</div>
                <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">运行中</span>
              </div>
              <div class="text-sm text-gray-600 mb-2">
                剩余时间: {{ currentProcess.remainingTime }}
              </div>
            </div>

            <!-- 执行进度条 -->
            <div class="mb-3">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>执行进度</span>
                <span>{{ Math.round(((currentProcess.burstTime - currentProcess.remainingTime) /
                  currentProcess.burstTime) * 100) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full transition-all duration-300" :style="{
                  width: `${((currentProcess.burstTime - currentProcess.remainingTime) / currentProcess.burstTime) * 100}%`
                }">
                </div>
              </div>
            </div>

            <!-- 时间片进度 -->
            <div>
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>时间片进度</span>
                <span>{{ timeSliceProgress }}/{{ timeQuantum }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-yellow-500 h-2 rounded-full transition-all duration-300" :style="{
                  width: `${(timeSliceProgress / timeQuantum) * 100}%`
                }">
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-gray-500 py-8">
            CPU空闲
          </div>
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
import type { Process, RoundRobinResult, GanttItem } from '@/types/scheduler'
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

    // 发送甘特图数据给父组件
    emit('updateGanttData', schedulingResult.ganttChart)        // 处理不同的调度阶段
    if (schedulingResult.selectedProcess) {
      // 阶段1: 进程被选中
      handleProcessSelection(schedulingResult.selectedProcess)
    } else if (schedulingResult.currentProcess) {
      // 阶段2: 进程开始执行
      handleProcessExecution(schedulingResult.currentProcess)
    } else {
      // 没有当前进程，清除CPU显示
      if (currentProcess.value) {
        console.log('清除当前进程:', currentProcess.value.name)
        currentProcess.value = null
        timeSliceProgress.value = 0
      }
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

  // 使用调度器返回的实时进程状态，而不是原始props
  const currentProcesses = result.processes || props.processes

  // 获取所有已到达且未完成的进程（使用实时的remainingTime）
  const availableProcesses = currentProcesses.filter(p => {
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

  console.log('更新就绪队列:', {
    allProcesses: currentProcesses.map(p => ({ name: p.name, remaining: p.remainingTime })),
    availableProcesses: availableProcesses.map(p => ({ name: p.name, remaining: p.remainingTime })),
    queueProcesses: queueProcesses.map(p => ({ name: p.name, remaining: p.remainingTime })),
    currentProcess: result.currentProcess?.name,
    selectedProcess: selectedProcess.value?.name
  })
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
    // 同一进程继续执行，更新当前进程状态和时间片进度
    currentProcess.value = { ...process } // 使用最新的进程状态
    timeSliceProgress.value = Math.min(props.timeQuantum, process.remainingTime || 0)
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
  transition: all 0.3s ease;
}

.move-to-cpu-enter-active {
  transition: all 0.6s ease;
}

.move-to-cpu-enter-from {
  transform: translateX(-50px);
  opacity: 0;
}

.move-to-cpu-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.queue-enter-active {
  transition: all 0.3s ease;
}

.queue-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  left: 0;
  right: 0;
}

.queue-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.queue-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.queue-move {
  transition: all 0.3s ease;
}
</style>
