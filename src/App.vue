<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 标题栏 -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">时间片轮转调度算法可视化</h1>
            <p class="text-gray-600 mt-1">Round Robin Scheduling Algorithm Visualization</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">Vue 3 + TypeScript</span>
            <span class="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">Element Plus</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- 进程管理区域 -->
        <section>
          <ProcessManager :processes="processes" :time-quantum="timeQuantum" @update-processes="handleUpdateProcesses"
            @update-time-quantum="handleUpdateTimeQuantum" />
        </section>

        <!-- 调度可视化区域 -->
        <section>
          <ScheduleVisualizer :processes="processes" :time-quantum="timeQuantum"
            @update-gantt-data="handleUpdateGanttData" />
        </section>

        <!-- 甘特图区域 -->
        <section>
          <GanttChart :gantt-data="ganttData" :processes="processes" />
        </section>

        <!-- 算法说明 -->
        <section class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <el-icon class="mr-2 text-gray-600">
              <InfoFilled />
            </el-icon>
            算法说明
          </h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 class="text-base font-medium text-gray-900 mb-3">时间片轮转算法原理</h4>
              <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start">
                  <span class="text-gray-400 mr-2">•</span>
                  <span>每个进程分配相等的时间片（时间量子）</span>
                </li>
                <li class="flex items-start">
                  <span class="text-gray-400 mr-2">•</span>
                  <span>进程按到达时间顺序进入就绪队列</span>
                </li>
                <li class="flex items-start">
                  <span class="text-gray-400 mr-2">•</span>
                  <span>CPU从队头取出进程执行一个时间片</span>
                </li>
                <li class="flex items-start">
                  <span class="text-gray-400 mr-2">•</span>
                  <span>时间片用完后，进程回到队尾（如未完成）</span>
                </li>
                <li class="flex items-start">
                  <span class="text-gray-400 mr-2">•</span>
                  <span>重复直到所有进程执行完毕</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-base font-medium text-gray-900 mb-3">算法特点</h4>
              <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">✓</span>
                  <span>公平性好，每个进程都能获得CPU时间</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">✓</span>
                  <span>响应时间较短，适合交互式系统</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-600 mr-2">✓</span>
                  <span>不会出现饥饿现象</span>
                </li>
                <li class="flex items-start">
                  <span class="text-yellow-600 mr-2">⚠</span>
                  <span>时间片大小影响性能和响应时间</span>
                </li>
                <li class="flex items-start">
                  <span class="text-yellow-600 mr-2">⚠</span>
                  <span>上下文切换开销相对较大</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center text-gray-500 text-sm">
          <p>© 2025 时间片轮转调度算法可视化系统 | 基于 Vue 3 + TypeScript + Tailwind CSS + Element Plus 构建</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import ProcessManager from './components/ProcessManager.vue'
import ScheduleVisualizer from './components/ScheduleVisualizer.vue'
import GanttChart from './components/GanttChart.vue'
import type { Process, GanttItem } from './types/scheduler'

// 响应式状态
const processes = ref<Process[]>([])
const timeQuantum = ref(2)
const ganttData = ref<GanttItem[]>([])

// 处理进程更新
const handleUpdateProcesses = (newProcesses: Process[]) => {
  processes.value = newProcesses
  // 清空甘特图数据
  ganttData.value = []
}

// 处理时间片更新
const handleUpdateTimeQuantum = (quantum: number) => {
  timeQuantum.value = quantum
  // 清空甘特图数据
  ganttData.value = []
}

// 处理甘特图数据更新
const handleUpdateGanttData = (newGanttData: GanttItem[]) => {
  ganttData.value = newGanttData
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Element Plus 全局样式调整 */
.el-button {
  border-radius: 6px !important;
  font-weight: 500 !important;
}

.el-table {
  border-radius: 6px !important;
  overflow: hidden !important;
}

.el-dialog {
  border-radius: 8px !important;
}
</style>
