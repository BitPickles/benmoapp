import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import * as borrowApi from './data/borrowApi'

afterEach(() => {
  vi.restoreAllMocks()
  window.history.pushState({}, '', '/')
})

test('renders swap shell with intent form, quote panel and primary action', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /Pangolins/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^兑换$/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^中文$/i })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: /^English$/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Gas Refuel/i })).not.toBeInTheDocument()
  const swapPanel = screen.getByRole('region', { name: /兑换面板/i })
  expect(within(swapPanel).getByText(/出售/i)).toBeInTheDocument()
  expect(within(swapPanel).getByText(/买入/i)).toBeInTheDocument()
  expect(screen.getByText(/每次交易前，看清路径/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /连接钱包/i })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /^FAQ$/i })).not.toBeInTheDocument()
  expect(screen.queryByText('What is this?')).not.toBeInTheDocument()
  expect(screen.queryByText('Does Pangolins take any fees?')).not.toBeInTheDocument()
})

test('switches visible product copy to English', async () => {
  const user = userEvent.setup()

  render(<App />)

  await user.click(screen.getByRole('button', { name: /^English$/i }))

  expect(screen.getByRole('button', { name: /^Swap$/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('button', { name: /^English$/i })).toHaveAttribute('aria-pressed', 'true')
  const swapPanel = screen.getByRole('region', { name: /swap panel/i })
  expect(within(swapPanel).getByText(/You sell/i)).toBeInTheDocument()
  expect(screen.getByText(/Route clarity before every trade/i)).toBeInTheDocument()
})

test('walks through the mocked quote and execution flow', async () => {
  const user = userEvent.setup()

  render(<App />)
  const swapPanel = screen.getByRole('region', { name: /兑换面板/i })

  await user.click(within(swapPanel).getByRole('button', { name: /连接钱包/i }))
  expect(within(swapPanel).getByRole('button', { name: /获取报价/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /获取报价/i }))
  expect(await screen.findByRole('heading', { name: /ETH -> USDC 最优路径/i })).toBeInTheDocument()
  expect(screen.getByText(/供应商: OKX DEX/i)).toBeInTheDocument()
  expect(screen.getByText(/^预计收到$/i)).toBeInTheDocument()
  expect(screen.getByText(/1,998\.40 USDC/i)).toBeInTheDocument()
  expect(screen.getByText(/^预估 Gas$/i)).toBeInTheDocument()
  expect(screen.getByText(/\$2\.84/i)).toBeInTheDocument()
  expect(screen.getByText(/^价格影响$/i)).toBeInTheDocument()
  expect(screen.getByText(/0\.04%/i)).toBeInTheDocument()
  expect(screen.getByText(/Uniswap V3 72%/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /开始兑换/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /开始兑换/i }))
  expect(await within(swapPanel).findByText(/先授权代币/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /授权/i })).toBeInTheDocument()
})

test('completes the mocked execution path through signature and confirmation', async () => {
  const user = userEvent.setup()

  render(<App />)
  const swapPanel = screen.getByRole('region', { name: /兑换面板/i })

  await user.click(within(swapPanel).getByRole('button', { name: /连接钱包/i }))
  await user.click(within(swapPanel).getByRole('button', { name: /获取报价/i }))
  await user.click(within(swapPanel).getByRole('button', { name: /开始兑换/i }))
  await user.click(within(swapPanel).getByRole('button', { name: /授权/i }))

  expect(await within(swapPanel).findByText(/签署订单意图/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /签署意图/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /签署意图/i }))
  expect(await within(swapPanel).findByText(/签署链上兑换交易/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /签署交易/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /签署交易/i }))
  expect(await within(swapPanel).findByText(/等待链上确认/i)).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /标记确认/i }))
  expect(await within(swapPanel).findByRole('button', { name: /兑换完成/i })).toBeInTheDocument()
})

test('switches to the earn loading shell when the earn tab is selected', async () => {
  const user = userEvent.setup()

  render(<App />)

  await user.click(screen.getByRole('button', { name: /^赚取$/i }))

  expect(screen.getByRole('button', { name: /^赚取$/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText(/加载中\.\.\./i)).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /赚取面板/i })).toBeInTheDocument()
  expect(screen.queryByRole('region', { name: /兑换面板/i })).not.toBeInTheDocument()
})

test('reads the tab from the query string on first render', () => {
  window.history.pushState({}, '', '/?tab=earn')

  render(<App />)

  expect(screen.getByRole('button', { name: /^赚取$/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText(/加载中\.\.\./i)).toBeInTheDocument()
})

test('loads the default curated borrow route when the borrow tab is selected', async () => {
  const user = userEvent.setup()

  render(<App />)

  await user.click(screen.getByRole('button', { name: /^借贷$/i }))

  expect(screen.getByRole('button', { name: /^借贷$/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('region', { name: /借贷面板/i })).toBeInTheDocument()
  expect(
    await screen.findByRole('region', { name: /ethereum:aave:eth-usdc-core 路径卡片/i }),
  ).toBeInTheDocument()
  expect(screen.queryByRole('region', { name: /兑换面板/i })).not.toBeInTheDocument()
})

test('loads curated borrow routes after the user selects a supported pair', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')

  render(<App />)

  await user.selectOptions(screen.getByLabelText(/^链$/i), 'base')
  await user.selectOptions(screen.getByLabelText(/抵押资产/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/借出资产/i), 'USDC')
  await user.type(screen.getByLabelText(/借款金额/i), '1000')
  await user.click(screen.getByRole('button', { name: /查看路径/i }))

  const routeCard = await screen.findByRole('region', {
    name: /base:morpho:eth-usdc-core 路径卡片/i,
  })

  expect(within(routeCard).getByText(/^净借款 APR$/i)).toBeInTheDocument()
})

test('shows route cards with market identity and cost metrics', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')

  render(<App />)

  await user.selectOptions(screen.getByLabelText(/^链$/i), 'base')
  await user.selectOptions(screen.getByLabelText(/抵押资产/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/借出资产/i), 'USDC')
  await user.click(screen.getByRole('button', { name: /查看路径/i }))

  const routeCard = await screen.findByRole('region', {
    name: /base:morpho:eth-usdc-core 路径卡片/i,
  })

  expect(within(routeCard).getByText(/^市场 Key$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^借款 APR$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^存款 APR$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^奖励 APR$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^最大 LTV$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^可用流动性$/i)).toBeInTheDocument()
})

test('shows an empty curated state when the user switches to degen mode', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')

  render(<App />)

  await user.selectOptions(screen.getByLabelText(/^链$/i), 'base')
  await user.selectOptions(screen.getByLabelText(/抵押资产/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/借出资产/i), 'USDC')
  await user.click(screen.getByRole('button', { name: /^进阶$/i }))
  await user.click(screen.getByRole('button', { name: /查看路径/i }))

  expect(await screen.findByText(/当前没有可用的精选路径。/i)).toBeInTheDocument()
  expect(screen.queryByText(/Morpho/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^进阶$/i })).toHaveAttribute('aria-pressed', 'true')
})

test('shows a curated scope message when the selected pair is not in the allowlist', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')
  render(<App />)

  await user.selectOptions(screen.getByLabelText(/^链$/i), 'bsc')
  await user.selectOptions(screen.getByLabelText(/抵押资产/i), 'BNB')
  await user.selectOptions(screen.getByLabelText(/借出资产/i), 'USDT')
  await user.click(screen.getByRole('button', { name: /查看路径/i }))

  expect(
    await screen.findByText(/这个资产组合暂未进入精选市场范围。/i),
  ).toBeInTheDocument()
})

test('returns borrow scan results as a plain object shape', async () => {
  const result = await borrowApi.fetchCuratedBorrowRoutes({
    chain: 'bsc',
    collateralToken: 'BNB',
    borrowToken: 'USDT',
    amount: '',
    protocols: ['aave', 'morpho', 'lista', 'fluid'],
    sortBy: 'netBorrowApr',
    mode: 'safe',
  })

  expect(Array.isArray(result)).toBe(false)
  expect(result).toEqual({
    rows: [],
    reason: 'unsupported_pair',
  })
})

test('keeps the latest borrow scan results when earlier requests resolve later', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')

  let resolveFirst: ((value: Awaited<ReturnType<typeof borrowApi.fetchCuratedBorrowRoutes>>) => void) | undefined
  let resolveSecond: ((value: Awaited<ReturnType<typeof borrowApi.fetchCuratedBorrowRoutes>>) => void) | undefined

  vi.spyOn(borrowApi, 'fetchCuratedBorrowRoutes').mockImplementation((query) => {
    if (query.mode === 'safe') {
      return new Promise((resolve) => {
        resolveFirst = resolve
      })
    }

    return new Promise((resolve) => {
      resolveSecond = resolve
    })
  })

  render(<App />)

  await user.selectOptions(screen.getByLabelText(/^链$/i), 'base')
  await user.selectOptions(screen.getByLabelText(/抵押资产/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/借出资产/i), 'USDC')
  await user.click(screen.getByRole('button', { name: /查看路径/i }))
  await user.click(screen.getByRole('button', { name: /^进阶$/i }))
  await user.click(screen.getByRole('button', { name: /查看路径/i }))

  resolveSecond?.({
    rows: [
      {
        id: 'degen-route',
        chain: 'base',
        protocol: 'fluid',
        marketKey: 'base:fluid:eth-usdc-core',
        collateralToken: 'ETH',
        borrowToken: 'USDC',
        borrowApr: 7.1,
        supplyApr: 1.3,
        rewardApr: 0.2,
        netBorrowApr: 5.6,
        maxLtv: 0.91,
        availableLiquidityUsd: 210000,
        healthFactorHint: 'Aggressive route',
      },
    ],
    reason: 'ok',
  })

  expect(
    await screen.findByRole('region', { name: /base:fluid:eth-usdc-core 路径卡片/i }),
  ).toBeInTheDocument()

  resolveFirst?.({
    rows: [
      {
        id: 'safe-route',
        chain: 'base',
        protocol: 'morpho',
        marketKey: 'base:morpho:eth-usdc-core',
        collateralToken: 'ETH',
        borrowToken: 'USDC',
        borrowApr: 4.2,
        supplyApr: 1.1,
        rewardApr: 0.4,
        netBorrowApr: 2.7,
        maxLtv: 0.86,
        availableLiquidityUsd: 250000,
        healthFactorHint: 'Conservative route',
      },
    ],
    reason: 'ok',
  })

  expect(
    await screen.findByRole('region', { name: /base:fluid:eth-usdc-core 路径卡片/i }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('region', { name: /base:morpho:eth-usdc-core 路径卡片/i }),
  ).not.toBeInTheDocument()
})
