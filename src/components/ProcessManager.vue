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

    <div class="p-8 space-y-8">
      <!-- 进程输入表单 -->
      <div class="group">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-br from-emerald-500 to-blue-500 w-1.5 h-8 rounded-full mr-4 shadow-lg"></div>
          <h4 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">添加新进程
          </h4>
          <div
            class="ml-4 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
            快速添加
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/90">
          <el-form :model="newProcess" :rules="rules" ref="formRef" label-width="90px" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
              <el-form-item label="进程名" prop="name" class="mb-0">
                <el-input v-model="newProcess.name" placeholder="输入进程名称" size="large"
                  class="hover:shadow-md transition-shadow duration-200">
                  <template #prefix>
                    <el-icon class="text-blue-500">
                      <User />
                    </el-icon>
                  </template>
                </el-input>
                <div class="text-xs text-gray-500 mt-2 flex items-center">
                  <div class="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                  进程的唯一标识符
                </div>
              </el-form-item>

              <el-form-item label="到达时间" prop="arrivalTime" class="mb-0">
                <el-input-number v-model="newProcess.arrivalTime" :min="0" :max="100" controls-position="right"
                  size="large" class="w-full hover:shadow-md transition-shadow duration-200" />
                <div class="text-xs text-gray-500 mt-2 flex items-center">
                  <div class="w-1 h-1 bg-green-400 rounded-full mr-2"></div>
                  进程何时到达系统
                </div>
              </el-form-item>

              <el-form-item label="执行时间" prop="burstTime" class="mb-0">
                <el-input-number v-model="newProcess.burstTime" :min="1" :max="20" controls-position="right"
                  size="large" class="w-full hover:shadow-md transition-shadow duration-200" />
                <div class="text-xs text-gray-500 mt-2 flex items-center">
                  <div class="w-1 h-1 bg-orange-400 rounded-full mr-2"></div>
                  进程需要的CPU时间
                </div>
              </el-form-item>

              <el-form-item class="mb-0">
                <el-button type="primary" @click="addProcess" :disabled="!isFormValid" size="large"
                  class="w-full h-12 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700">
                  <el-icon class="mr-2 text-lg">
                    <Plus />
                  </el-icon>
                  添加进程
                </el-button>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="group">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-br from-orange-500 to-pink-500 w-1.5 h-8 rounded-full mr-4 shadow-lg"></div>
          <h4 class="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">批量操作
          </h4>
          <div
            class="ml-4 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
            高效管理
          </div>
        </div>

        <div
          class="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/90">
          <div class="flex flex-wrap gap-4 items-center">
            <el-button type="success" @click="generateRandomProcesses" size="large"
              class="px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 border-0 hover:from-emerald-700 hover:to-teal-700">
              <el-icon class="mr-2 text-lg">
                <Refresh />
              </el-icon>
              随机生成进程
            </el-button>

            <el-button type="danger" @click="clearAllProcesses" :disabled="processes.length === 0" size="large"
              class="px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-red-600 to-pink-600 border-0 hover:from-red-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500">
              <el-icon class="mr-2 text-lg">
                <Delete />
              </el-icon>
              清空所有进程
            </el-button>

            <div
              class="flex items-center bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-2xl px-6 py-4 ml-auto shadow-lg border border-purple-200/50">
              <span class="text-purple-800 font-semibold mr-4 text-base">时间片大小:</span>
              <el-input-number v-model="timeQuantum" :min="1" :max="10" controls-position="right" size="large"
                class="hover:shadow-md transition-shadow duration-200" @change="onTimeQuantumChange" />
            </div>
          </div>
        </div>
      </div>

      <!-- 进程列表 -->
      <div class="group">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="bg-gradient-to-br from-indigo-500 to-purple-500 w-1.5 h-8 rounded-full mr-4 shadow-lg"></div>
            <h4 class="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">进程列表
            </h4>
            <div
              class="ml-4 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
              实时监控
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <el-tag type="primary" effect="dark" size="large"
              class="px-4 py-2 font-bold text-base shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
              <el-icon class="mr-2 text-lg">
                <List />
              </el-icon>
              共 {{ processes.length }} 个进程
            </el-tag>
          </div>
        </div>

        <div class="overflow-x-auto">
          <div
            class="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 overflow-hidden hover:shadow-3xl transition-all duration-300 min-w-[1200px]">
            <el-table :data="processes" stripe :header-cell-style="{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              color: '#1e293b',
              fontWeight: '700',
              fontSize: '14px',
              borderBottom: '2px solid #e2e8f0',
              textAlign: 'center'
            }" :row-style="{ height: '60px' }" class="process-table" style="width: 100%;"
              :cell-style="{ textAlign: 'center' }">

              <!-- 自定义空状态 -->
              <template #empty>
                <div class="flex flex-col items-center justify-center py-16 px-8">
                  <!-- 图标区域 -->
                  <div class="mb-6 relative">
                    <div
                      class="bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
                      <el-icon class="text-4xl text-blue-500">
                        <List />
                      </el-icon>
                    </div>
                    <!-- 装饰性小圆点 -->
                    <div
                      class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full shadow-md">
                    </div>
                    <div
                      class="absolute -bottom-1 -left-2 w-4 h-4 bg-gradient-to-r from-green-400 to-teal-400 rounded-full shadow-md">
                    </div>
                  </div>

                  <!-- 主要文本 -->
                  <h3 class="text-xl font-bold text-gray-700 mb-3">暂无进程数据</h3>
                  <p class="text-gray-500 text-center max-w-md leading-relaxed mb-8">
                    您的进程列表是空的。通过上方的表单添加新进程，或者使用随机生成功能快速创建示例数据。
                  </p>

                  <!-- 操作按钮组 -->
                  <div class="flex flex-col sm:flex-row gap-4 items-center">
                    <el-button type="primary" size="large"
                      class="px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700"
                      @click="scrollToForm">
                      <el-icon class="mr-2">
                        <Plus />
                      </el-icon>
                      添加第一个进程
                    </el-button>

                    <span class="text-gray-400 font-medium">或者</span>

                    <el-button type="success" size="large"
                      class="px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 border-0 hover:from-emerald-700 hover:to-teal-700"
                      @click="generateRandomProcesses">
                      <el-icon class="mr-2">
                        <Refresh />
                      </el-icon>
                      随机生成示例
                    </el-button>
                  </div>

                  <!-- 提示信息 -->
                  <div class="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      <span>支持批量管理</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span>实时状态监控</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      <span>可视化调度</span>
                    </div>
                  </div>
                </div>
              </template>
              >
              <el-table-column prop="name" label="进程名" width="200" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-500 w-3 h-3 rounded-full mr-3 shadow-md"></div>
                    <el-tag :type="getProcessTagType(row.status)"
                      class="font-bold text-sm px-3 py-1 rounded-lg shadow-md" effect="dark">
                      {{ row.name }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="arrivalTime" label="到达时间" width="200" align="center">
                <template #default="{ row }">
                  <div
                    class="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 font-bold px-4 py-2 rounded-xl inline-block shadow-md border border-blue-300/50">
                    {{ row.arrivalTime }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="burstTime" label="执行时间" width="200" align="center">
                <template #default="{ row }">
                  <div
                    class="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 font-bold px-4 py-2 rounded-xl inline-block shadow-md border border-emerald-300/50">
                    {{ row.burstTime }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="remainingTime" label="剩余时间" width="240" align="center">
                <template #default="{ row }">
                  <div class="px-2">
                    <el-progress :percentage="((row.burstTime - row.remainingTime) / row.burstTime) * 100"
                      :stroke-width="16" :show-text="false" :color="getProgressColor(row.status)"
                      class="mb-3 shadow-sm" />
                    <div
                      class="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 font-bold px-3 py-1 rounded-lg text-sm inline-block shadow-md border border-orange-300/50">
                      {{ row.remainingTime }} / {{ row.burstTime }}
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="status" label="状态" width="200" align="center">
                <template #default="{ row }">
                  <el-tag :type="getProcessTagType(row.status)" class="font-bold px-4 py-2 rounded-xl shadow-lg text-sm"
                    effect="dark">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="160" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" size="default" @click="removeProcess($index)" :icon="Delete" circle
                    class="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 border-0 hover:from-red-600 hover:to-pink-600 w-10 h-10" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh, Delete, User, List } from '@element-plus/icons-vue'
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

const formRef = ref<FormInstance>()
const newProcess = ref({
  name: '',
  arrivalTime: 0,
  burstTime: 1
})

const timeQuantum = ref(props.timeQuantum)

const rules: FormRules = {
  name: [
    { required: true, message: '请输入进程名', trigger: 'blur' },
    { min: 1, max: 10, message: '进程名长度为1-10个字符', trigger: 'blur' }
  ],
  arrivalTime: [
    { required: true, message: '请输入到达时间', trigger: 'change' }
  ],
  burstTime: [
    { required: true, message: '请输入执行时间', trigger: 'change' }
  ]
}

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
const addProcess = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

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
  } catch (error) {
    console.error('表单验证失败', error)
  }
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

// 时间片变化处理
const onTimeQuantumChange = (value: number) => {
  emit('updateTimeQuantum', value)
}

// 获取进程状态标签类型
const getProcessTagType = (status: ProcessStatus) => {
  switch (status) {
    case 'ready': return 'primary'
    case 'running': return 'success'
    case 'complete': return 'info'
    case 'waiting': return 'warning'
    default: return 'info'
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

// 获取进度条颜色
const getProgressColor = (status: ProcessStatus) => {
  switch (status) {
    case 'ready': return '#409eff'
    case 'running': return '#67c23a'
    case 'complete': return '#909399'
    case 'waiting': return '#e6a23c'
    default: return '#909399'
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
