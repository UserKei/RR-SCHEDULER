# 时间片轮转调度算法可视化系统

## 项目简介

这是一个基于 Vue 3 + TypeScript + Tailwind CSS 开发的时间片轮转（Round Robin）调度算法可视化系统，是操作系统课程设计项目。该系统通过直观的动画演示和交互式界面，帮助理解操作系统中的进程调度机制。

**在线演示**: [https://userkei.github.io/RR-SCHEDULER/](https://userkei.github.io/RR-SCHEDULER/)

## 主要功能

- **进程管理**: 添加、删除和编辑进程信息（进程名、到达时间、服务时间）
- **实时调度**: 可视化展示时间片轮转调度的执行过程
- **甘特图**: 直观显示进程执行时间线和调度结果
- **动画演示**: 流畅的动画效果展示进程状态变化
- **响应式设计**: 支持桌面端和移动端访问

## 时间片轮转调度算法

### 算法原理

时间片轮转（Round Robin, RR）是一种抢占式调度算法，广泛应用于分时操作系统中：

#### 核心概念

1. **时间片（Time Quantum）**: 每个进程被分配的连续执行时间
2. **就绪队列**: 所有等待执行的进程按到达时间排队
3. **抢占机制**: 当时间片用尽时，强制切换到下一个进程

#### 调度流程

```
1. 进程按到达时间进入就绪队列
2. CPU 分配给队列首个进程一个时间片
3. 进程执行：
   - 如果在时间片内完成 → 进程结束
   - 如果时间片用尽未完成 → 进程移到队列末尾
4. 重复步骤 2-3 直到所有进程完成
```

#### 算法特点

- **公平性**: 每个进程都能获得相等的 CPU 时间
- **响应时间**: 适合交互式系统，响应时间较短
- **吞吐量**: 相对较高，适合多道程序环境
- **时间片选择**:
  - 时间片过小 → 上下文切换开销大
  - 时间片过大 → 退化为先来先服务算法

### 算法实现详解

本项目的时间片轮转调度算法实现在 `src/utils/roundRobinScheduler.ts` 文件中，采用 TypeScript 编写，具有良好的类型安全性和可维护性。

#### 核心数据结构

```typescript
export class RoundRobinScheduler {
  private timeQuantum: number // 时间片大小
  private processes: Process[] // 进程列表
  private ganttChart: GanttItem[] // 甘特图数据
  private currentTime: number // 当前系统时间
}
```

#### 关键算法实现

**1. 主调度逻辑（execute 方法）**

```typescript
execute(): RoundRobinResult {
  const readyQueue: Process[] = []           // 就绪队列
  const completedProcesses: Process[] = []   // 已完成进程
  const ganttChart: GanttItem[] = []        // 甘特图记录
  let currentTime = 0                       // 当前时间

  // 1. 按到达时间排序所有进程
  const sortedProcesses = [...this.processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
  let processIndex = 0

  // 2. 主调度循环 - 直到所有进程完成
  while (completedProcesses.length < this.processes.length) {
    // 3. 检查新到达的进程，加入就绪队列
    while (processIndex < sortedProcesses.length &&
           sortedProcesses[processIndex].arrivalTime <= currentTime) {
      const process = { ...sortedProcesses[processIndex] }
      process.status = 'ready'
      readyQueue.push(process)
      processIndex++
    }

    // 4. 如果就绪队列为空，推进时间到下一个进程到达
    if (readyQueue.length === 0) {
      if (processIndex < sortedProcesses.length) {
        currentTime = sortedProcesses[processIndex].arrivalTime
      }
      continue
    }

    // 5. 从队头取出进程执行（FIFO原则）
    const currentProcess = readyQueue.shift()!
    currentProcess.status = 'running'

    // 6. 计算本次执行时间（不超过时间片和剩余时间）
    const executionTime = Math.min(this.timeQuantum, currentProcess.remainingTime)
    const startTime = currentTime
    const endTime = currentTime + executionTime

    // 7. 更新进程状态
    currentProcess.remainingTime -= executionTime
    currentTime = endTime

    // 8. 记录甘特图
    ganttChart.push({
      processId: currentProcess.id,
      processName: currentProcess.name,
      startTime,
      endTime,
      status: 'running'
    })

    // 9. 检查是否有新进程在执行期间到达
    while (processIndex < sortedProcesses.length &&
           sortedProcesses[processIndex].arrivalTime <= currentTime) {
      const process = { ...sortedProcesses[processIndex] }
      process.status = 'ready'
      readyQueue.push(process)
      processIndex++
    }

    // 10. 判断进程是否完成
    if (currentProcess.remainingTime === 0) {
      // 进程完成
      currentProcess.status = 'complete'
      currentProcess.endTime = currentTime
      currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime
      completedProcesses.push(currentProcess)
    } else {
      // 进程未完成，时间片用尽，重新加入队列尾部
      currentProcess.status = 'ready'
      readyQueue.push(currentProcess)
    }
  }
}
```

**2. 分步执行逻辑（executeStepByStep 方法）**

为了支持动画演示，实现了基于 Generator 的分步执行：

```typescript
*executeStepByStep(): Generator<RoundRobinResult> {
  // ... 初始化代码 ...

  while (completedProcesses.length < this.processes.length) {
    // 阶段1: 进程到达检查
    while (processIndex < sortedProcesses.length &&
           sortedProcesses[processIndex].arrivalTime <= currentTime) {
      // 新进程加入就绪队列
    }

    // 阶段2: 选中队头进程（高亮显示）
    const selectedProcess = { ...readyQueue[0] }
    selectedProcess.status = 'selected'
    yield { /* 返回当前状态供UI显示 */ }

    // 阶段3: 执行选中的进程
    const currentProcess = readyQueue.shift()!
    // ... 执行逻辑 ...
    yield { /* 返回执行状态 */ }

    // 阶段4: 检查完成状态或重新入队
    if (currentProcess.remainingTime === 0) {
      // 进程完成
    } else {
      // 重新入队
    }
    yield { /* 返回最终状态 */ }
  }
}
```

**3. 性能指标计算**

```typescript
private calculateStats(processes: Process[], totalTime: number, ganttChart: GanttItem[]): SchedulingStats {
  const processCount = processes.length

  // 计算平均等待时间
  const totalWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0)
  const averageWaitingTime = totalWaitingTime / processCount

  // 计算平均周转时间
  const totalTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0)
  const averageTurnaroundTime = totalTurnaroundTime / processCount

  // 计算CPU利用率
  const busyTime = ganttChart.reduce((sum, item) => sum + (item.endTime - item.startTime), 0)
  const cpuUtilization = (busyTime / totalTime) * 100

  return {
    totalTime,
    averageWaitingTime,
    averageTurnaroundTime,
    cpuUtilization,
    processCount
  }
}
```

#### 算法复杂度分析

- **时间复杂度**: O(n × avg_cycles)

  - n: 进程数量
  - avg_cycles: 平均每个进程需要的调度轮次
  - 最坏情况: O(n²)（当时间片很小时）

- **空间复杂度**: O(n)
  - 主要用于存储进程队列和甘特图记录

#### 关键设计思想

1. **队列管理**: 使用数组模拟就绪队列，严格按照FIFO原则
2. **时间推进**: 采用事件驱动的时间推进机制，避免不必要的空转
3. **状态跟踪**: 详细记录每个进程的状态变化，支持可视化展示
4. **类型安全**: 使用TypeScript强类型定义，减少运行时错误
5. **模块化**: 将算法逻辑与UI完全分离，便于测试和维护

## 项目结构

```
RR-SCHEDULER/
├── README.md                    # 项目说明文档
├── package.json                 # 项目依赖和脚本配置
├── vite.config.ts              # Vite 构建配置
├── tailwind.config.js          # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 配置
├── eslint.config.ts            # ESLint 代码规范配置
├── index.html                  # 应用入口 HTML
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动部署配置
├── public/
│   └── favicon.ico             # 网站图标
├── src/                        # 源代码目录
│   ├── main.ts                 # 应用入口文件
│   ├── App.vue                 # 根组件
│   ├── style.css               # 全局样式
│   ├── types/                  # TypeScript 类型定义
│   │   └── scheduler.ts        # 调度器相关类型定义
│   ├── utils/                  # 工具函数
│   │   └── roundRobinScheduler.ts  # 时间片轮转调度算法实现
│   ├── components/             # Vue 组件
│   │   ├── ProcessManager.vue  # 进程管理组件（添加/删除进程）
│   │   ├── ScheduleVisualizer.vue  # 调度可视化组件（显示当前执行状态）
│   │   └── GanttChart.vue      # 甘特图组件（时间线显示）
│   ├── router/                 # 路由配置
│   │   └── index.ts            # Vue Router 路由定义
│   ├── stores/                 # 状态管理（Pinia）
│   └── assets/                 # 静态资源
└── views/                      # 页面组件（暂未使用）
```

### 核心文件说明

#### 核心算法实现

- **`src/utils/roundRobinScheduler.ts`**:
  - 实现时间片轮转调度算法的核心逻辑
  - 包含进程队列管理、时间片控制、状态转换等功能
  - 提供调度步骤的详细记录和状态追踪

#### 类型定义

- **`src/types/scheduler.ts`**:
  - 定义进程、调度状态、执行记录等数据结构
  - 确保类型安全和代码可维护性

#### UI 组件

- **`ProcessManager.vue`**: 进程管理界面

  - 进程信息输入表单（进程名、到达时间、服务时间）
  - 进程列表显示和删除功能
  - 调度参数设置（时间片大小）

- **`ScheduleVisualizer.vue`**: 调度状态可视化

  - 当前执行进程高亮显示
  - 就绪队列实时更新
  - 进程状态动画效果

- **`GanttChart.vue`**: 甘特图时间线
  - 水平时间轴展示
  - 进程执行时间段可视化
  - 完整的调度结果展示

## 技术栈

### 前端框架

- **Vue 3**: 现代化前端框架，组合式 API
- **TypeScript**: 静态类型检查，提高代码质量
- **Vite**: 快速构建工具，热重载开发体验

### UI & 样式

- **Tailwind CSS**: 原子化 CSS 框架，快速样式开发
- **Element Plus**: Vue 3 组件库，丰富的 UI 组件
- **Motion for Vue**: 动画库，流畅的过渡效果

### 开发工具

- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **Pinia**: Vue 3 状态管理

### 部署

- **GitHub Pages**: 免费静态网站托管
- **GitHub Actions**: 自动化 CI/CD 部署

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 部署到 GitHub Pages

```bash
npm run deploy
```

## 使用说明

1. **添加进程**: 在左侧表单中输入进程信息（进程名、到达时间、服务时间）
2. **设置时间片**: 调整时间片大小（默认为 3 个时间单位）
3. **开始调度**: 点击"开始调度"按钮启动算法演示
4. **观察结果**: 查看调度过程动画和最终的甘特图结果
5. **重置**: 可随时重置系统状态，重新开始演示

## 教学目标

通过本系统，学习者可以：

1. **理解调度算法**: 直观掌握时间片轮转调度的工作原理
2. **观察调度过程**: 实时查看进程状态变化和队列管理
3. **分析性能指标**: 通过甘特图分析等待时间、周转时间等指标
4. **比较不同参数**: 调整时间片大小，观察对调度效果的影响
5. **加深理论理解**: 将抽象的操作系统概念具象化

## TODO

- [ ] 添加其他调度算法（FCFS、SJF、优先级调度等）
- [ ] 增加性能指标计算（平均等待时间、平均周转时间等）
- [ ] 支持算法对比功能
- [ ] 添加更多动画效果和交互细节
- [ ] 支持导入/导出进程数据

## 开源协议

本项目采用 MIT 协议开源，欢迎学习和使用。

## 作者

**UserKei** - 操作系统课程设计项目

---

**课程**: 操作系统原理  
**主题**: 进程调度算法可视化  
**完成时间**: 2025年6月
