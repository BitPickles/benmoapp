# Swap Page MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `D:\3DLAB\ai\benmoAPP` 新建一个可运行的前端项目，并落地一个基于假数据驱动的 Swap 主页面 MVP，覆盖页面骨架、报价展示、执行步骤引导和核心状态切换。

**Architecture:** 使用 `Vite + React + TypeScript` 搭一个单页应用，页面围绕 `Swap Intent -> Quote -> Execution Session -> Next Action` 四层模型组织。首版不接真实后端，而是通过本地 mock adapter 和 reducer 驱动状态，确保后续接入 BFF 时只替换数据层而不重写页面。

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, CSS variables

---

### Task 1: 初始化前端项目与测试基础

**Files:**
- Create: `D:\3DLAB\ai\benmoAPP\package.json`
- Create: `D:\3DLAB\ai\benmoAPP\src\main.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\App.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\styles.css`
- Create: `D:\3DLAB\ai\benmoAPP\src\setupTests.ts`
- Create: `D:\3DLAB\ai\benmoAPP\vite.config.ts`
- Create: `D:\3DLAB\ai\benmoAPP\tsconfig.json`
- Create: `D:\3DLAB\ai\benmoAPP\tsconfig.app.json`
- Create: `D:\3DLAB\ai\benmoAPP\tsconfig.node.json`
- Test: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`

- [ ] **Step 1: 用 Vite React TypeScript 模板初始化项目**

Run: `npm create vite@latest . -- --template react-ts`

Expected: 生成 `src`、`public`、`package.json`、`vite.config.ts` 等基础文件

- [ ] **Step 2: 安装测试依赖**

Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

Expected: `package.json` 中出现测试依赖

- [ ] **Step 3: 增加测试脚本并配置 jsdom 环境**

目标修改：
- `package.json` 增加 `test` 与 `test:run`
- `vite.config.ts` 增加 `test.environment = 'jsdom'`
- 新建 `src/setupTests.ts` 引入 `@testing-library/jest-dom`

- [ ] **Step 4: 运行空测试环境验证可执行**

Run: `npm run test:run`

Expected: 没有配置错误；如果此时无测试文件，Vitest 正常退出或提示无测试

### Task 2: 先写主页面渲染失败测试

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`
- Test: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`

- [ ] **Step 1: 写第一个失败测试，定义 Swap 页面主骨架**

测试目标：
- 页面标题出现
- `Sell` / `Buy` 输入区存在
- `Best Route` 区块存在
- 主 CTA 存在

测试示例：

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders swap shell with intent form, quote panel and primary action', () => {
  render(<App />)

  expect(screen.getByText(/Meta Aggregator Swap/i)).toBeInTheDocument()
  expect(screen.getByText(/Sell/i)).toBeInTheDocument()
  expect(screen.getByText(/Buy/i)).toBeInTheDocument()
  expect(screen.getByText(/Best Route/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Connect Wallet/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/App.test.tsx`

Expected: FAIL，原因是默认模板页面不包含这些内容

- [ ] **Step 3: 用最小实现让测试通过**

目标实现：
- 用基础 JSX 替换默认模板
- 先不接状态机，只渲染静态骨架

- [ ] **Step 4: 再次运行测试确认通过**

Run: `npm run test:run -- src/App.test.tsx`

Expected: PASS

### Task 3: 先写失败测试，定义核心状态流转

**Files:**
- Create: `D:\3DLAB\ai\benmoAPP\src\domain\swapMachine.ts`
- Create: `D:\3DLAB\ai\benmoAPP\src\domain\swapMachine.test.ts`
- Modify: `D:\3DLAB\ai\benmoAPP\src\App.tsx`
- Test: `D:\3DLAB\ai\benmoAPP\src\domain\swapMachine.test.ts`

- [ ] **Step 1: 写 reducer 失败测试，覆盖最小状态转换**

测试覆盖：
- 初始为 `unconnected`
- 连接钱包后进入 `editing`
- 请求报价后进入 `quoting`
- 报价成功后进入 `quote_available`
- 启动执行会话后进入 `execution_preparing`

- [ ] **Step 2: 运行 reducer 测试确认失败**

Run: `npm run test:run -- src/domain/swapMachine.test.ts`

Expected: FAIL，原因是文件或函数不存在

- [ ] **Step 3: 写最小 reducer 实现**

目标函数：
- `createInitialSwapState()`
- `swapReducer(state, event)`

- [ ] **Step 4: 运行 reducer 测试确认通过**

Run: `npm run test:run -- src/domain/swapMachine.test.ts`

Expected: PASS

### Task 4: 先写失败测试，定义执行动作链路

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\src\domain\swapMachine.test.ts`
- Modify: `D:\3DLAB\ai\benmoAPP\src\domain\swapMachine.ts`
- Test: `D:\3DLAB\ai\benmoAPP\src\domain\swapMachine.test.ts`

- [ ] **Step 1: 新增失败测试，覆盖 `approval -> message_sign -> sign_tx -> confirming -> success`**

测试目标：
- `nextAction` 改变时执行状态随之推进
- 用户拒绝签名进入终态失败
- 广播超时进入可重试失败

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- src/domain/swapMachine.test.ts`

Expected: FAIL，原因是现有 reducer 未覆盖这些事件

- [ ] **Step 3: 实现最小状态推进逻辑**

目标实现：
- 增加 `approval_required`
- 增加 `message_signature_required`
- 增加 `tx_signature_required`
- 增加 `broadcasting`
- 增加 `confirming`
- 增加 `success`
- 增加 `retryable_failure`
- 增加 `terminal_failure`

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test:run -- src/domain/swapMachine.test.ts`

Expected: PASS

### Task 5: 先写失败测试，定义主页面交互

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\mocks\mockSwapData.ts`
- Modify: `D:\3DLAB\ai\benmoAPP\src\App.tsx`
- Test: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`

- [ ] **Step 1: 写失败测试，覆盖连接钱包后出现报价和执行引导**

测试目标：
- 点击 `Connect Wallet` 后 CTA 变成 `Get Quotes`
- 点击 `Get Quotes` 后出现推荐 route
- 点击 `Start Swap` 后执行面板出现第一步动作

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- src/App.test.tsx`

Expected: FAIL，原因是页面尚未连到状态和 mock 数据

- [ ] **Step 3: 写最小实现让主交互通过**

目标实现：
- 用 `useReducer` 挂接 `swapReducer`
- 用本地 mock 数据模拟 quote 和 execution session
- 页面 CTA 随状态变化

- [ ] **Step 4: 再次运行测试确认通过**

Run: `npm run test:run -- src/App.test.tsx`

Expected: PASS

### Task 6: 实现页面结构与视觉样式

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\src\App.tsx`
- Modify: `D:\3DLAB\ai\benmoAPP\src\styles.css`

- [ ] **Step 1: 拆出页面区域**

目标区域：
- 顶部导航
- Swap 卡片
- Quote 面板
- Execution 面板
- Side Panel
- 移动端 Sticky CTA

- [ ] **Step 2: 用 CSS variables 建立视觉体系**

目标：
- 明确品牌色、背景层级、边框、阴影
- 使用非默认字体栈，如 `Space Grotesk`, `IBM Plex Sans`, `IBM Plex Mono`
- 桌面和移动端都有可用布局

- [ ] **Step 3: 加入状态文案和错误提示容器**

目标：
- 显示报价 TTL
- 显示 warning pills
- 显示 execution step label

### Task 7: 抽离组件与 mock adapter

**Files:**
- Create: `D:\3DLAB\ai\benmoAPP\src\components\TopNav.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\components\IntentForm.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\components\QuotePanel.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\components\ExecutionPanel.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\components\SidePanel.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\data\swapApi.ts`
- Modify: `D:\3DLAB\ai\benmoAPP\src\App.tsx`

- [ ] **Step 1: 抽离纯展示组件**

目标：
- 每个组件只收 props
- 状态仍集中在 `App.tsx`

- [ ] **Step 2: 增加 `swapApi.ts` 作为 mock BFF adapter**

目标方法：
- `fetchMockQuote()`
- `startMockExecution()`
- `advanceMockExecution()`

- [ ] **Step 3: 页面改为依赖 adapter，而不是在组件里写死数据**

目的：
- 后续替换成真实 BFF 时只改这一层

### Task 8: 验证、构建与交付说明

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\README.md`

- [ ] **Step 1: 运行测试**

Run: `npm run test:run`

Expected: 全部 PASS

- [ ] **Step 2: 运行构建**

Run: `npm run build`

Expected: Vite build 成功

- [ ] **Step 3: 补 README**

README 至少说明：
- 如何安装依赖
- 如何启动开发环境
- 当前页面覆盖哪些状态
- 哪些数据是 mock
- 后续接后端时优先替换哪个文件

## Self-Review

- 规格覆盖：页面骨架、状态机、接口边界、执行步骤、假数据驱动、响应式布局都已覆盖
- 占位检查：没有 `TODO` / `TBD`
- 类型一致性：计划统一围绕 `Swap Intent / Quote / Execution Session / Next Action`

## Execution Handoff

本次我按 **Inline Execution** 继续执行，因为你已经明确要求我直接在该目录把项目做起来。
