<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
    <!-- 标题区域 -->
    <div class="border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            <el-icon class="text-gray-600">
              <Plus />
            </el-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">进程管理</h3>
        </div>
        <div class="flex items-center">
          <span class="text-sm text-gray-600 mr-2">时间片:</span>
          <span class="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">{{ timeQuantum }}</span>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- 进程输入表单 -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-4">添加新进程</h4>

        <div class="border border-gray-200 rounded p-4 bg-gray-50">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1">进程名</label>
              <input v-model="newProcess.name" type="text" placeholder="进程1"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">到达时间</label>
              <input v-model.number="newProcess.arrivalTime" type="number" min="0" max="100" placeholder="0"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">执行时间</label>
              <input v-model.number="newProcess.burstTime" type="number" min="1" max="20" placeholder="1"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" />
            </div>

            <div class="flex items-end">
              <button @click="addProcess" :disabled="!isFormValid"
                class="w-full px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150">
                添加进程
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div>
        <div class="flex items-center mb-4">
          <h4 class="text-base font-medium text-gray-900">批量操作</h4>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex flex-wrap gap-3 items-center justify-between">
            <div class="flex gap-3">
              <button
                class="flex items-center px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="generateRandomProcesses">
                <el-icon class="mr-1">
                  <Refresh />
                </el-icon>
                随机生成进程
              </button>

              <button
                class="flex items-center px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="clearAllProcesses" :disabled="processes.length === 0">
                <el-icon class="mr-1">
                  <Delete />
                </el-icon>
                清空所有进程
              </button>
            </div>

            <div class="flex items-center bg-white rounded border border-gray-200 px-3 py-2">
              <span class="text-sm text-gray-600 mr-3">时间片大小:</span>
              <div class="flex items-center">
                <button @click="decreaseTimeQuantum" :disabled="timeQuantum <= 1"
                  class="w-6 h-6 border border-gray-300 border-r-0 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed text-xs flex items-center justify-center rounded-l">
                  −
                </button>
                <input v-model.number="timeQuantum" type="number" min="1" max="10" @input="handleTimeQuantumInput"
                  class="w-12 h-6 text-center text-xs border-t border-b border-gray-300 bg-white text-gray-900 focus:outline-none" />
                <button @click="increaseTimeQuantum" :disabled="timeQuantum >= 10"
                  class="w-6 h-6 border border-gray-300 border-l-0 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed text-xs flex items-center justify-center rounded-r">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进程列表 -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-base font-medium text-gray-900">进程列表</h4>
          <span class="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            共 {{ processes.length }} 个进程
          </span>
        </div>

        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <el-table :data="processes" style="width: 100%" :header-cell-style="{
            background: '#f9fafb',
            color: '#374151',
            fontWeight: '500',
            fontSize: '14px',
            borderBottom: '1px solid #e5e7eb',
            height: '48px'
          }" :row-style="{ height: '52px' }" :cell-style="{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6' }"
            :stripe="false">

            <!-- 自定义空状态 -->
            <template #empty>
              <div class="flex flex-col items-center justify-center py-12 px-8">
                <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mb-3">
                  <el-icon class="text-xl text-gray-400">
                    <List />
                  </el-icon>
                </div>

                <h3 class="text-base font-medium text-gray-900 mb-2">暂无进程数据</h3>
                <p class="text-gray-500 text-center mb-4 text-sm max-w-sm">
                  通过上方的表单添加新进程，或者使用随机生成功能创建示例数据
                </p>

                <div class="flex gap-3">
                  <button class="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800"
                    @click="scrollToForm">
                    添加进程
                  </button>
                  <button
                    class="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
                    @click="generateRandomProcesses">
                    随机生成
                  </button>
                </div>
              </div>
            </template>

            <el-table-column prop="name" label="进程名" width="160" align="center">
              <template #default="{ row }">
                <div class="flex items-center justify-center">
                  <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <span class="font-medium text-gray-900 text-sm">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="arrivalTime" label="到达时间" width="120" align="center">
              <template #default="{ row }">
                <span class="font-mono text-gray-900 text-sm">
                  {{ row.arrivalTime }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="burstTime" label="执行时间" width="120" align="center">
              <template #default="{ row }">
                <span class="font-mono text-gray-900 text-sm">
                  {{ row.burstTime }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="remainingTime" label="剩余时间" min-width="180" align="center">
              <template #default="{ row }">
                <div class="w-full max-w-[160px] mx-auto">
                  <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div class="bg-gray-500 h-2 rounded-full transition-all duration-300" :style="{
                      width: `${((row.burstTime - row.remainingTime) / row.burstTime) * 100}%`
                    }">
                    </div>
                  </div>
                  <span class="font-mono text-gray-700 text-xs">
                    {{ row.remainingTime }} / {{ row.burstTime }}
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {{ getStatusText(row.status) }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ $index }">
                <button
                  class="w-7 h-7 bg-white border border-gray-300 rounded hover:bg-red-50 hover:border-red-300 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  @click="removeProcess($index)" title="删除进程">
                  <el-icon class="text-sm">
                    <Delete />
                  </el-icon>
                </button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Delete, List } from '@element-plus/icons-vue'
import type { Process, ProcessStatus } from '@/types/scheduler'
import { RoundRobinScheduler } from '@/utils/roundRobinScheduler'

const props = defineProps<{
  processes: Process[]
  timeQuantum: number
}>()

const emit = defineEmits<{
  updateProcesses: [processes: Process[]]
  updateTimeQuantum: [quantum: number]
}>()

const newProcess = ref({
  name: '',
  arrivalTime: 0,
  burstTime: 1
})

const timeQuantum = ref(props.timeQuantum)

const isFormValid = computed(() => {
  return newProcess.value.name.trim() !== '' &&
    newProcess.value.arrivalTime >= 0 &&
    newProcess.value.burstTime >= 1
})

const processes = computed(() => props.processes)

// 监听时间片变化
watch(() => props.timeQuantum, (newVal) => {
  timeQuantum.value = newVal
})

// 添加进程
const addProcess = () => {
  // 检查表单是否有效
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的进程信息')
    return
  }

  // 检查进程名是否重复
  if (processes.value.some(p => p.name === newProcess.value.name)) {
    ElMessage.warning('进程名已存在，请使用不同的进程名')
    return
  }

  const process: Process = {
    id: `P${Date.now()}`,
    name: newProcess.value.name,
    arrivalTime: newProcess.value.arrivalTime,
    burstTime: newProcess.value.burstTime,
    remainingTime: newProcess.value.burstTime,
    status: 'ready' as ProcessStatus
  }

  emit('updateProcesses', [...processes.value, process])

  // 重置表单
  newProcess.value = {
    name: `进程${processes.value.length + 1}`,
    arrivalTime: 0,
    burstTime: 1
  }

  ElMessage.success('进程添加成功')
}

// 移除进程
const removeProcess = (index: number) => {
  const updatedProcesses = [...processes.value]
  updatedProcesses.splice(index, 1)
  emit('updateProcesses', updatedProcesses)
  ElMessage.success('进程删除成功')
}

// 生成随机进程
const generateRandomProcesses = () => {
  const randomProcesses = RoundRobinScheduler.generateRandomProcesses(5)
  emit('updateProcesses', randomProcesses)
  ElMessage.success('随机进程生成成功')
}

// 清空所有进程
const clearAllProcesses = () => {
  emit('updateProcesses', [])
  ElMessage.success('所有进程已清空')
}

// 处理时间片输入
const handleTimeQuantumInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 1
  timeQuantum.value = Math.max(1, Math.min(10, value))
  emit('updateTimeQuantum', timeQuantum.value)
}

// 减少时间片
const decreaseTimeQuantum = () => {
  if (timeQuantum.value > 1) {
    timeQuantum.value--
    emit('updateTimeQuantum', timeQuantum.value)
  }
}

// 增加时间片
const increaseTimeQuantum = () => {
  if (timeQuantum.value < 10) {
    timeQuantum.value++
    emit('updateTimeQuantum', timeQuantum.value)
  }
}

// 获取状态文本
const getStatusText = (status: ProcessStatus) => {
  switch (status) {
    case 'ready': return '就绪'
    case 'running': return '运行'
    case 'complete': return '完成'
    case 'waiting': return '等待'
    default: return '未知'
  }
}

// 初始化表单
newProcess.value.name = `进程${processes.value.length + 1}`

// 滚动到表单区域
const scrollToForm = () => {
  const formElement = document.querySelector('.group:first-child')
  if (formElement) {
    formElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>
