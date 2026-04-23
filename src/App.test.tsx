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
  expect(screen.getByRole('button', { name: /Swap/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Gas Refuel/i })).not.toBeInTheDocument()
  const swapPanel = screen.getByRole('region', { name: /swap panel/i })
  expect(within(swapPanel).getByText(/You sell/i)).toBeInTheDocument()
  expect(within(swapPanel).getByText(/You buy/i)).toBeInTheDocument()
  expect(screen.getByText(/The Aggregator of Aggregators/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /Connect Wallet/i })).toBeInTheDocument()
})

test('walks through the mocked quote and execution flow', async () => {
  const user = userEvent.setup()

  render(<App />)
  const swapPanel = screen.getByRole('region', { name: /swap panel/i })

  await user.click(within(swapPanel).getByRole('button', { name: /Connect Wallet/i }))
  expect(within(swapPanel).getByRole('button', { name: /Get Quotes/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /Get Quotes/i }))
  expect(await screen.findByRole('heading', { name: /ETH -> USDC best route/i })).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /Start Swap/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /Start Swap/i }))
  expect(await within(swapPanel).findByText(/Approve token before swap/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /Approve/i })).toBeInTheDocument()
})

test('completes the mocked execution path through signature and confirmation', async () => {
  const user = userEvent.setup()

  render(<App />)
  const swapPanel = screen.getByRole('region', { name: /swap panel/i })

  await user.click(within(swapPanel).getByRole('button', { name: /Connect Wallet/i }))
  await user.click(within(swapPanel).getByRole('button', { name: /Get Quotes/i }))
  await user.click(within(swapPanel).getByRole('button', { name: /Start Swap/i }))
  await user.click(within(swapPanel).getByRole('button', { name: /Approve/i }))

  expect(await within(swapPanel).findByText(/Sign order intent before execution/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /Sign Intent/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /Sign Intent/i }))
  expect(await within(swapPanel).findByText(/Approve the on-chain swap transaction/i)).toBeInTheDocument()
  expect(within(swapPanel).getByRole('button', { name: /Sign Transaction/i })).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /Sign Transaction/i }))
  expect(await within(swapPanel).findByText(/Waiting for on-chain confirmation/i)).toBeInTheDocument()

  await user.click(within(swapPanel).getByRole('button', { name: /Mark Confirmed/i }))
  expect(await within(swapPanel).findByRole('button', { name: /Swap Complete/i })).toBeInTheDocument()
})

test('switches to the earn loading shell when the earn tab is selected', async () => {
  const user = userEvent.setup()

  render(<App />)

  await user.click(screen.getByRole('button', { name: /^Earn$/i }))

  expect(screen.getByRole('button', { name: /^Earn$/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /earn panel/i })).toBeInTheDocument()
  expect(screen.queryByRole('region', { name: /swap panel/i })).not.toBeInTheDocument()
})

test('reads the tab from the query string on first render', () => {
  window.history.pushState({}, '', '/?tab=earn')

  render(<App />)

  expect(screen.getByRole('button', { name: /^Earn$/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument()
})

test('switches to the borrow placeholder shell when the borrow tab is selected', async () => {
  const user = userEvent.setup()

  render(<App />)

  await user.click(screen.getByRole('button', { name: /^Borrow$/i }))

  expect(screen.getByRole('button', { name: /^Borrow$/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('region', { name: /borrow panel/i })).toBeInTheDocument()
  expect(screen.getByText(/Select a lending and borrowing token to see the available pairs\./i)).toBeInTheDocument()
  expect(screen.queryByRole('region', { name: /swap panel/i })).not.toBeInTheDocument()
})

test('loads curated borrow routes after the user selects a supported pair', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')

  render(<App />)

  await user.selectOptions(screen.getByLabelText(/Chain/i), 'base')
  await user.selectOptions(screen.getByLabelText(/Collateral Token/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/Borrow Token/i), 'USDC')
  await user.type(screen.getByLabelText(/Borrow Amount/i), '1000')
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))

  const routeCard = await screen.findByRole('region', {
    name: /base:morpho:eth-usdc-core route card/i,
  })

  expect(within(routeCard).getByText(/^Net Borrow APR$/i)).toBeInTheDocument()
})

test('shows route cards with market identity and cost metrics', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')

  render(<App />)

  await user.selectOptions(screen.getByLabelText(/Chain/i), 'base')
  await user.selectOptions(screen.getByLabelText(/Collateral Token/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/Borrow Token/i), 'USDC')
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))

  const routeCard = await screen.findByRole('region', {
    name: /base:morpho:eth-usdc-core route card/i,
  })

  expect(within(routeCard).getByText(/^Market Key$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^Borrow APR$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^Supply APR$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^Reward APR$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^Max LTV$/i)).toBeInTheDocument()
  expect(within(routeCard).getByText(/^Available Liquidity$/i)).toBeInTheDocument()
})

test('shows an empty curated state when the user switches to degen mode', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')

  render(<App />)

  await user.selectOptions(screen.getByLabelText(/Chain/i), 'base')
  await user.selectOptions(screen.getByLabelText(/Collateral Token/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/Borrow Token/i), 'USDC')
  await user.click(screen.getByRole('button', { name: /^Degen$/i }))
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))

  expect(await screen.findByText(/No live curated routes are available right now\./i)).toBeInTheDocument()
  expect(screen.queryByText(/Morpho/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Degen$/i })).toHaveAttribute('aria-pressed', 'true')
})

test('shows a curated scope message when the selected pair is not in the allowlist', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')
  render(<App />)

  await user.selectOptions(screen.getByLabelText(/Chain/i), 'bsc')
  await user.selectOptions(screen.getByLabelText(/Collateral Token/i), 'BNB')
  await user.selectOptions(screen.getByLabelText(/Borrow Token/i), 'USDT')
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))

  expect(
    await screen.findByText(/This pair is not in the curated market scope yet/i),
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

  await user.selectOptions(screen.getByLabelText(/Chain/i), 'base')
  await user.selectOptions(screen.getByLabelText(/Collateral Token/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/Borrow Token/i), 'USDC')
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))
  await user.click(screen.getByRole('button', { name: /^Degen$/i }))
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))

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
    await screen.findByRole('region', { name: /base:fluid:eth-usdc-core route card/i }),
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
    await screen.findByRole('region', { name: /base:fluid:eth-usdc-core route card/i }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('region', { name: /base:morpho:eth-usdc-core route card/i }),
  ).not.toBeInTheDocument()
})
