<template>
    <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <el-icon class="mr-2 text-purple-500">
                <DataLine />
            </el-icon>
            甘特图
        </h3>

        <!-- 甘特图控制面板 -->
        <div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <span class="text-gray-600">时间范围:</span>
                    <el-tag type="info">0 - {{ maxTime }}</el-tag>
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-gray-600">总进程数:</span>
                    <el-tag type="primary">{{ ganttData.length }}</el-tag>
                </div>

                <div class="flex items-center gap-2">
                    <el-button size="small" @click="zoomIn" :disabled="scale >= maxScale">
                        <el-icon>
                            <ZoomIn />
                        </el-icon>
                    </el-button>
                    <span class="text-sm text-gray-600">{{ Math.round(scale * 100) }}%</span>
                    <el-button size="small" @click="zoomOut" :disabled="scale <= minScale">
                        <el-icon>
                            <ZoomOut />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 甘特图容器 -->
        <div class="border rounded-lg overflow-hidden bg-gray-50">
            <!-- 时间轴 -->
            <div class="bg-white border-b p-4">
                <div class="flex items-center mb-2">
                    <div class="w-32 text-sm font-medium text-gray-600">时间轴</div>
                    <div class="flex-1 relative">
                        <div class="flex relative" :style="{ width: `${timelineWidth}px` }">
                            <div v-for="time in timePoints" :key="time" class="relative" :style="{
                                width: `${timeUnitWidth}px`,
                                marginLeft: time === 0 ? '0' : '-1px'
                            }">
                                <div class="absolute left-0 top-0 h-2 border-l border-gray-300"></div>
                                <div class="absolute left-0 top-3 text-xs text-gray-500 transform -translate-x-1/2">
                                    {{ time }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 甘特图主体 -->
            <div class="max-h-96 overflow-y-auto">
                <div v-if="ganttData.length === 0" class="text-center py-12 text-gray-400">
                    <el-icon size="48" class="mb-4">
                        <DataLine />
                    </el-icon>
                    <div>暂无调度数据，请开始模拟执行</div>
                </div>

                <div v-else>
                    <!-- 进程行 -->
                    <div v-for="process in uniqueProcesses" :key="process.id"
                        class="flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <!-- 进程信息 -->
                        <div class="w-32 p-4 bg-white border-r">
                            <div class="font-medium text-gray-800">{{ process.name }}</div>
                            <div class="text-xs text-gray-500">
                                到达: {{ process.arrivalTime }} | 执行: {{ process.burstTime }}
                            </div>
                        </div>

                        <!-- 甘特条 -->
                        <div class="flex-1 p-2 relative">
                            <div class="relative" :style="{ width: `${timelineWidth}px`, height: '40px' }">
                                <!-- 背景网格 -->
                                <div class="absolute inset-0 flex">
                                    <div v-for="time in timePoints" :key="`grid-${time}`"
                                        class="border-l border-gray-200 opacity-30"
                                        :style="{ width: `${timeUnitWidth}px` }"></div>
                                </div>

                                <!-- 进程执行块 -->
                                <div v-for="(item, index) in getProcessGanttItems(process.id)"
                                    :key="`${item.processId}-${index}`"
                                    class="absolute gantt-bar cursor-pointer transition-all duration-300 hover:shadow-lg"
                                    :style="getGanttBarStyle(item)" @click="showGanttDetail(item)"
                                    @mouseenter="showTooltip($event, item)" @mouseleave="hideTooltip">
                                    <div class="h-full flex items-center justify-center text-white text-xs font-medium">
                                        {{ item.endTime - item.startTime }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 图例 -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium text-gray-700 mb-3">状态图例</div>
            <div class="flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-green-500 rounded"></div>
                    <span class="text-sm text-gray-600">运行中</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-blue-500 rounded"></div>
                    <span class="text-sm text-gray-600">就绪</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-gray-500 rounded"></div>
                    <span class="text-sm text-gray-600">完成</span>
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
                    <el-tag :type="getStatusTagType(selectedGanttItem.status)">
                        {{ getStatusText(selectedGanttItem.status) }}
                    </el-tag>
                </div>
            </div>
        </el-dialog>

        <!-- Tooltip -->
        <div ref="tooltipRef" v-show="tooltipVisible"
            class="absolute z-50 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none"
            :style="tooltipStyle">
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
    const width = (item.endTime - item.startTime) * timeUnitWidth.value - 2 // 减去边距

    return {
        left: `${left}px`,
        width: `${width}px`,
        height: '32px',
        top: '4px',
        backgroundColor: getStatusColor(item.status),
        border: `2px solid ${getStatusBorderColor(item.status)}`,
        borderRadius: '6px'
    }
}

// 获取状态颜色
const getStatusColor = (status: ProcessStatus) => {
    switch (status) {
        case 'running': return '#10b981'
        case 'ready': return '#3b82f6'
        case 'complete': return '#6b7280'
        case 'waiting': return '#f59e0b'
        default: return '#6b7280'
    }
}

// 获取状态边框颜色
const getStatusBorderColor = (status: ProcessStatus) => {
    switch (status) {
        case 'running': return '#059669'
        case 'ready': return '#2563eb'
        case 'complete': return '#4b5563'
        case 'waiting': return '#d97706'
        default: return '#4b5563'
    }
}

// 获取状态标签类型
const getStatusTagType = (status: ProcessStatus) => {
    switch (status) {
        case 'running': return 'success'
        case 'ready': return 'primary'
        case 'complete': return 'info'
        case 'waiting': return 'warning'
        default: return 'info'
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
    transition: all 0.3s ease;
}

.gantt-bar:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip-enter-active,
.tooltip-leave-active {
    transition: opacity 0.3s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
    opacity: 0;
}
</style>
