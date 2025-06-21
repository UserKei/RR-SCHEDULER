// 进程状态枚举
export enum ProcessStatus {
  READY = 'ready',
  SELECTED = 'selected', // 新增：进程被选中等待执行
  RUNNING = 'running',
  COMPLETE = 'complete',
  WAITING = 'waiting',
}

// 进程控制块接口
export interface Process {
  id: string
  name: string
  arrivalTime: number
  burstTime: number
  remainingTime: number
  status: ProcessStatus
  startTime?: number
  endTime?: number
  waitingTime?: number
  turnaroundTime?: number
}

// 甘特图项接口
export interface GanttItem {
  processId: string
  processName: string
  startTime: number
  endTime: number
  status: ProcessStatus
}

// 调度统计信息接口
export interface SchedulingStats {
  totalProcesses: number
  completedProcesses: number
  averageWaitingTime: number
  averageTurnaroundTime: number
  cpuUtilization: number
}

// 时间片轮转调度结果接口
export interface RoundRobinResult {
  ganttChart: GanttItem[]
  processes: Process[]
  stats: SchedulingStats
  currentTime: number
  currentProcess?: Process
  selectedProcess?: Process // 新增：被选中即将执行的进程
}

// 播放控制接口
export interface PlaybackControl {
  isPlaying: boolean
  speed: number
  currentStep: number
  totalSteps: number
}

// 队列状态接口
export interface QueueState {
  readyQueue: Process[]
  currentProcess?: Process
  completedProcesses: Process[]
}
