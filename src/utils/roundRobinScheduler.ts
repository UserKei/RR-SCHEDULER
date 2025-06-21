import type {
  Process,
  ProcessStatus,
  GanttItem,
  RoundRobinResult,
  SchedulingStats,
} from '@/types/scheduler'

export class RoundRobinScheduler {
  private timeQuantum: number
  private processes: Process[]
  private ganttChart: GanttItem[]
  private currentTime: number

  constructor(timeQuantum: number = 2) {
    this.timeQuantum = timeQuantum
    this.processes = []
    this.ganttChart = []
    this.currentTime = 0
  }

  // 设置进程列表
  setProcesses(processes: Process[]): void {
    this.processes = processes.map((p) => ({
      ...p,
      remainingTime: p.burstTime,
      status: 'ready' as ProcessStatus,
      waitingTime: 0,
      turnaroundTime: 0,
    }))
    this.ganttChart = []
    this.currentTime = 0
  }

  // 设置时间片大小
  setTimeQuantum(quantum: number): void {
    this.timeQuantum = quantum
  }

  // 执行完整的调度算法
  execute(): RoundRobinResult {
    const readyQueue: Process[] = []
    const completedProcesses: Process[] = []
    const ganttChart: GanttItem[] = []
    let currentTime = 0

    // 按到达时间排序
    const sortedProcesses = [...this.processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
    let processIndex = 0

    while (completedProcesses.length < this.processes.length) {
      // 将到达的进程加入就绪队列
      while (
        processIndex < sortedProcesses.length &&
        sortedProcesses[processIndex].arrivalTime <= currentTime
      ) {
        const process = { ...sortedProcesses[processIndex] }
        process.status = 'ready' as ProcessStatus
        readyQueue.push(process)
        processIndex++
      }

      if (readyQueue.length === 0) {
        // CPU空闲，时间推进到下一个进程到达
        if (processIndex < sortedProcesses.length) {
          currentTime = sortedProcesses[processIndex].arrivalTime
        }
        continue
      }

      // 从队头取出进程执行
      const currentProcess = readyQueue.shift()!
      currentProcess.status = 'running' as ProcessStatus

      if (!currentProcess.startTime) {
        currentProcess.startTime = currentTime
      }

      // 计算本次执行时间
      const executionTime = Math.min(this.timeQuantum, currentProcess.remainingTime)
      const startTime = currentTime
      const endTime = currentTime + executionTime

      // 更新进程状态
      currentProcess.remainingTime -= executionTime
      currentTime = endTime

      // 添加到甘特图
      ganttChart.push({
        processId: currentProcess.id,
        processName: currentProcess.name,
        startTime,
        endTime,
        status: 'running' as ProcessStatus,
      })

      // 将新到达的进程加入队列
      while (
        processIndex < sortedProcesses.length &&
        sortedProcesses[processIndex].arrivalTime <= currentTime
      ) {
        const process = { ...sortedProcesses[processIndex] }
        process.status = 'ready' as ProcessStatus
        readyQueue.push(process)
        processIndex++
      }

      // 检查进程是否完成
      if (currentProcess.remainingTime === 0) {
        currentProcess.status = 'complete' as ProcessStatus
        currentProcess.endTime = currentTime
        currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime
        completedProcesses.push(currentProcess)
      } else {
        // 进程未完成，重新加入队列尾部
        currentProcess.status = 'ready' as ProcessStatus
        readyQueue.push(currentProcess)
      }
    }

    // 计算统计信息
    const stats = this.calculateStats(completedProcesses, currentTime, ganttChart)

    return {
      ganttChart,
      processes: completedProcesses,
      stats,
      currentTime,
    }
  }

  // 分步执行调度算法（用于动画）
  *executeStepByStep(): Generator<RoundRobinResult> {
    const readyQueue: Process[] = []
    const completedProcesses: Process[] = []
    const ganttChart: GanttItem[] = []
    let currentTime = 0

    const sortedProcesses = [...this.processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
    let processIndex = 0

    while (completedProcesses.length < this.processes.length) {
      // 将到达的进程加入就绪队列
      while (
        processIndex < sortedProcesses.length &&
        sortedProcesses[processIndex].arrivalTime <= currentTime
      ) {
        const process = { ...sortedProcesses[processIndex] }
        process.status = 'ready' as ProcessStatus
        readyQueue.push(process)
        processIndex++
      }

      if (readyQueue.length === 0) {
        if (processIndex < sortedProcesses.length) {
          currentTime = sortedProcesses[processIndex].arrivalTime
        }
        continue
      }

      // 阶段1: 选中队头进程
      const selectedProcess = { ...readyQueue[0] }
      selectedProcess.status = 'selected' as ProcessStatus

      // 返回选中状态
      yield {
        ganttChart: [...ganttChart],
        processes: [...completedProcesses],
        stats: this.calculateStats([...completedProcesses], currentTime, [...ganttChart]),
        currentTime,
        selectedProcess: selectedProcess,
      }

      // 阶段2: 从队头取出进程执行
      const currentProcess = readyQueue.shift()!
      currentProcess.status = 'running' as ProcessStatus

      if (!currentProcess.startTime) {
        currentProcess.startTime = currentTime
      }

      const executionTime = Math.min(this.timeQuantum, currentProcess.remainingTime)
      const startTime = currentTime
      const endTime = currentTime + executionTime

      currentProcess.remainingTime -= executionTime
      currentTime = endTime

      ganttChart.push({
        processId: currentProcess.id,
        processName: currentProcess.name,
        startTime,
        endTime,
        status: 'running' as ProcessStatus,
      })

      // 返回执行状态
      yield {
        ganttChart: [...ganttChart],
        processes: [...completedProcesses],
        stats: this.calculateStats([...completedProcesses], currentTime, [...ganttChart]),
        currentTime,
        currentProcess: { ...currentProcess },
      }

      // 将新到达的进程加入队列
      while (
        processIndex < sortedProcesses.length &&
        sortedProcesses[processIndex].arrivalTime <= currentTime
      ) {
        const process = { ...sortedProcesses[processIndex] }
        process.status = 'ready' as ProcessStatus
        readyQueue.push(process)
        processIndex++
      }

      if (currentProcess.remainingTime === 0) {
        currentProcess.status = 'complete' as ProcessStatus
        currentProcess.endTime = currentTime
        currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime
        completedProcesses.push(currentProcess)
      } else {
        currentProcess.status = 'ready' as ProcessStatus
        readyQueue.push(currentProcess)
      }
    }

    // 最终状态
    yield {
      ganttChart,
      processes: completedProcesses,
      stats: this.calculateStats(completedProcesses, currentTime, ganttChart),
      currentTime,
    }
  }

  // 计算统计信息
  private calculateStats(
    processes: Process[],
    totalTime: number,
    ganttChart?: GanttItem[],
  ): SchedulingStats {
    if (processes.length === 0) {
      return {
        totalProcesses: this.processes.length,
        completedProcesses: 0,
        averageWaitingTime: 0,
        averageTurnaroundTime: 0,
        cpuUtilization: 0,
      }
    }

    const totalWaitingTime = processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0)
    const totalTurnaroundTime = processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0)

    // 基于甘特图计算实际CPU工作时间（更准确）
    let cpuWorkTime = 0
    if (ganttChart && ganttChart.length > 0) {
      cpuWorkTime = ganttChart.reduce((sum, item) => sum + (item.endTime - item.startTime), 0)
    } else {
      // 备用计算：已完成进程的执行时间
      cpuWorkTime = processes.reduce((sum, p) => sum + p.burstTime, 0)
    }

    return {
      totalProcesses: this.processes.length,
      completedProcesses: processes.length,
      averageWaitingTime: processes.length > 0 ? totalWaitingTime / processes.length : 0,
      averageTurnaroundTime: processes.length > 0 ? totalTurnaroundTime / processes.length : 0,
      cpuUtilization: totalTime > 0 ? Math.min(100, (cpuWorkTime / totalTime) * 100) : 0,
    }
  }

  // 生成随机测试数据
  static generateRandomProcesses(count: number = 5): Process[] {
    const processes: Process[] = []

    for (let i = 0; i < count; i++) {
      const burstTime = Math.floor(Math.random() * 8) + 1
      processes.push({
        id: `P${i + 1}`,
        name: `进程${i + 1}`,
        arrivalTime: Math.floor(Math.random() * 5),
        burstTime: burstTime,
        remainingTime: burstTime,
        status: 'ready' as ProcessStatus,
      })
    }

    return processes
  }
}
