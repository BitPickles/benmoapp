# Benmo Swap Page MVP

这是一个前端页面项目，用来演示“聚合器的聚合器” Swap 产品的主页面和核心状态流转。

当前版本重点不是接真实链路，而是把下面三件事先做稳：

- 页面结构
- 前端状态机
- 后续对接 BFF 的边界

## 当前覆盖的能力

- 单页 Swap 页面骨架
- `Connect Wallet -> Get Quotes -> Start Swap -> Approve -> Sign Intent -> Sign Transaction -> Confirm -> Success` 的完整 mock 演示链
- 基于 reducer 的前端状态机
- 本地 mock adapter，后续可替换成真实 BFF
- 基础响应式布局和视觉样式

## 技术栈

- Vite
- React
- TypeScript
- Vitest
- Testing Library

## 本地启动

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

运行测试：

```bash
npm run test:run
```

构建产物：

```bash
npm run build
```

## 目录说明

- `src/App.tsx`
  页面主装配层，负责把状态机、adapter 和组件组合起来

- `src/domain/swapMachine.ts`
  前端状态机，定义报价和执行状态

- `src/data/swapApi.ts`
  前端数据适配层。现在接的是 mock，实现真实后端时优先替换这里

- `src/mocks/mockSwapData.ts`
  本地演示数据和执行推进逻辑

- `src/components/*`
  页面展示组件

## 后续接真实后端时怎么改

优先替换：

- `src/data/swapApi.ts`

建议对接成这几类方法：

- `fetchQuote`
- `refreshQuote`
- `startExecution`
- `submitActionResult`
- `pollExecution`

页面层尽量不要直接请求后端，也不要直接理解 provider 私有结构。所有 provider 差异都先在 adapter/BFF 层收敛成统一字段，再喂给页面。

## 当前已验证

- `npm run test:run`
- `npm run build`

## Borrow Data Boundary

Borrow does not scan full protocol inventory.
Borrow reads only curated markets defined in `src/mocks/mockBorrowRegistry.ts`.
Curated markets are still filtered by `enabled`, `mode`, and each market's `minAvailableLiquidityUsd`, so an in-scope market may still return no live route.
Replace `src/data/borrowApi.ts` when the real backend or database is ready.

都已通过。
