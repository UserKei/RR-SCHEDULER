# 时间片轮转调度算法可视化系统

## 📖 项目概述

这是一个基于 Vue 3 + TypeScript + Tailwind CSS + Element Plus 构建的时间片轮转（Round Robin）调度算法可视化系统。该项目旨在通过直观的动画和图表，帮助用户理解操作系统中时间片轮转调度算法的工作原理和执行过程。

## ✨ 核心特性

### 🎯 功能特性

- **进程管理**：支持添加、删除进程，设置到达时间和执行时间
- **实时可视化**：直观展示进程在就绪队列、移动轨道、CPU之间的调度过程
- **动画效果**：流畅的进程弹出、移动、执行动画，真实还原调度过程
- **甘特图展示**：实时生成甘特图，展示进程执行时间线
- **播放控制**：支持开始/暂停、重置、多倍速播放
- **批量操作**：支持随机生成进程、清空所有进程

### 🎨 设计特性

- **极简风格**：采用 Apple/GitHub 风格的极简设计
- **响应式布局**：适配不同屏幕尺寸
- **无障碍访问**：良好的键盘导航和屏幕阅读器支持
- **现代化界面**：简洁的灰白色系，清晰的视觉层次

## 🏗️ 技术架构

### 技术栈

```
前端框架：Vue 3 (Composition API)
类型支持：TypeScript
样式框架：Tailwind CSS
UI 组件：Element Plus
动画库：Motion For Vue
构建工具：Vite
包管理：npm
```

### 项目结构

```
src/
├── components/           # 核心组件
│   ├── ProcessManager.vue      # 进程管理组件
│   ├── ScheduleVisualizer.vue  # 调度可视化组件
│   └── GanttChart.vue          # 甘特图组件
├── types/               # TypeScript 类型定义
│   └── scheduler.ts            # 调度器相关类型
├── utils/               # 工具函数
│   └── roundRobinScheduler.ts  # 时间片轮转调度器
├── App.vue              # 根组件
├── main.ts              # 应用入口
└── style.css            # 全局样式
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 本地开发

```bash
# 克隆项目
git clone https://github.com/你的用户名/kei.git
cd kei

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### GitHub Pages 部署

#### 方法一：GitHub Actions 自动部署（推荐）

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. GitHub Actions 会自动构建并部署到 GitHub Pages
3. 在仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支
4. 访问 `https://你的用户名.github.io/kei/`

#### 方法二：手动部署

```bash
# 构建并部署到 GitHub Pages
npm run deploy
```

**注意**：确保在 GitHub 仓库设置中：

- 启用 GitHub Pages
- 选择 `gh-pages` 分支作为源
- 仓库名为 `kei`（或修改 `vite.config.ts` 中的 `base` 配置）

## 🧩 核心组件设计

### 1. ProcessManager 进程管理器

```typescript
// 核心功能
- 进程添加/删除
- 进程列表展示
- 时间片设置
- 批量操作（随机生成/清空）

// 关键特性
- 表单验证
- 实时状态更新
- 响应式表格
- 空状态处理
```

### 2. ScheduleVisualizer 调度可视化器

```typescript
// 核心功能
- 就绪队列可视化
- 进程移动动画
- CPU执行状态
- 播放控制

// 动画系统
- 三阶段动画：选中 → 弹出 → 移动 → 执行
- Motion For Vue 驱动的流畅动画
- 状态同步机制
```

### 3. GanttChart 甘特图组件

```typescript
// 核心功能
;-实时甘特图生成 -
  时间轴缩放 -
  进程执行详情 -
  交互式查看 -
  // 视觉特性
  极简灰色系设计 -
  响应式时间轴 -
  鼠标悬浮提示
```

## 🔧 调度算法实现

### RoundRobinScheduler 类设计

```typescript
class RoundRobinScheduler {
  private timeQuantum: number
  private processes: Process[]
  private currentTime: number
  private readyQueue: Process[]
  private ganttChart: GanttItem[]

  // 核心方法
  executeStepByStep(): Generator<RoundRobinResult>
  setProcesses(processes: Process[]): void
  private calculateStats(): SchedulingStats
}
```

### 调度算法流程

1. **进程到达检查**：检查当前时间是否有新进程到达
2. **进程选择**：从就绪队列队头选择进程
3. **时间片执行**：进程执行一个时间片或直到完成
4. **状态更新**：更新进程状态和系统状态
5. **队列管理**：未完成进程重新加入队尾
6. **重复循环**：直到所有进程完成

## 🎭 动画系统设计

### 三阶段动画流程

```typescript
// 阶段1：进程选中高亮
selectedProcess → 队头进程被选中并高亮显示

// 阶段2：进程弹出动画
poppingProcess → 选中进程从队头弹出，准备移动

// 阶段3：移动到CPU动画
movingProcess → 进程在移动轨道中移动到CPU

// 阶段4：CPU执行状态
currentProcess → 进程在CPU中执行，显示进度条
```

### 动画配置

```typescript
// Motion For Vue 配置
const animationConfig = {
  spring: { stiffness: 150, damping: 20 },
  duration: { slow: 1200ms, normal: 600ms, fast: 300ms },
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
}
```

## 🎨 UI/UX 设计理念

### 极简设计原则

- **色彩方案**：仅使用灰色系 (gray-50 到 gray-900)
- **字体系统**：Apple 系统字体，简洁的字重层次
- **圆角规范**：统一使用 6px 圆角
- **间距系统**：基于 Tailwind CSS 的 4px 基准间距
- **边框规范**：1px 细边框，gray-200 颜色

### 交互设计

- **微交互**：hover 状态的颜色变化
- **视觉反馈**：按钮点击、进程状态变化的即时反馈
- **加载状态**：播放/暂停状态的清晰指示
- **空状态**：友好的空状态提示和引导

## 📚 使用指南

### 基本操作流程

1. **添加进程**：在进程管理区域添加新进程，设置进程名、到达时间、执行时间
2. **设置时间片**：调整时间片大小（默认为2）
3. **开始模拟**：点击"开始"按钮启动调度模拟
4. **观察过程**：观察进程在队列、移动轨道、CPU之间的调度过程
5. **查看结果**：在甘特图中查看完整的执行时间线

### 高级功能

- **播放速度调节**：支持 0.5x、1x、2x、4x 播放速度
- **随机生成**：一键生成随机进程进行测试
- **甘特图缩放**：支持甘特图的放大缩小查看
- **详细信息**：点击甘特图块查看进程执行详情

## 🔍 算法原理详解

### 时间片轮转算法特点

- **公平性**：每个进程都能获得相等的CPU时间
- **响应性**：适合交互式系统，响应时间较短
- **无饥饿**：不会出现进程饥饿现象
- **抢占式**：基于时间片的抢占式调度

### 关键参数影响

- **时间片过小**：上下文切换频繁，系统开销大
- **时间片过大**：退化为先来先服务算法，响应时间长
- **最优时间片**：通常设置为 1-100ms，需要平衡响应时间和开销

## 🛠️ 开发者指南

### 添加新功能

1. **类型定义**：在 `src/types/scheduler.ts` 中添加相关类型
2. **核心逻辑**：在 `src/utils/roundRobinScheduler.ts` 中实现算法逻辑
3. **UI组件**：在 `src/components/` 中创建或修改组件
4. **样式优化**：使用 Tailwind CSS 保持极简风格

### 代码规范

- **TypeScript**：严格的类型检查，避免 any 类型
- **Vue 3**：使用 Composition API 和 `<script setup>` 语法
- **ESLint**：遵循项目配置的代码规范
- **Prettier**：统一的代码格式化

### 性能优化

- **响应式优化**：合理使用 `ref` 和 `computed`
- **动画性能**：使用 `transform` 而非 `position` 属性
- **内存管理**：及时清理定时器和事件监听器

## 🎯 项目亮点

### 技术亮点

1. **TypeScript 严格模式**：完整的类型安全保障
2. **Composition API**：现代化的 Vue 3 开发模式
3. **Motion For Vue**：高性能的动画系统
4. **Generator 函数**：优雅的步进式算法实现
5. **响应式设计**：完美适配多种设备

### 教育价值

1. **算法可视化**：直观理解时间片轮转算法
2. **实时交互**：参数调整的即时反馈
3. **完整流程**：从进程管理到执行结果的全流程展示
4. **性能指标**：通过甘特图分析算法性能

## 🤝 贡献指南

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建工具相关
```

### Pull Request 流程

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request
5. 代码评审

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 类型支持
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Motion For Vue](https://motion.vueuse.org/) - Vue 动画库

---

**项目作者**：KEI  
**创建时间**：2025年6月  
**最后更新**：2025年6月21日

如有问题或建议，欢迎提交 Issue 或 Pull Request！
