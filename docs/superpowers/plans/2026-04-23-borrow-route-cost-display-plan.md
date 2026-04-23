# Borrow Curated Markets Route Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Borrow page that shows route and cost comparisons only for curated, usable markets on `ETH`, `BSC`, and `Base` across `Aave`, `Morpho`, `Lista`, and `Fluid`, without any wallet execution flow.

**Architecture:** Do not model Borrow as a full-protocol scanner. Add a `market registry` layer that explicitly allowlists supported markets, then have the borrow adapter read only those markets and return normalized display rows. The frontend should consume a single `fetchCuratedBorrowRoutes()` boundary so later backend or database integration can replace the mock adapter without changing the page contract.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, CSS variables, mock adapter first, curated market registry

---

### Task 1: Define Curated Market Registry Types

**Files:**
- Create: `D:\3DLAB\ai\benmoAPP\src\domain\borrowTypes.ts`
- Create: `D:\3DLAB\ai\benmoAPP\src\domain\borrowTypes.test.ts`
- Test: `D:\3DLAB\ai\benmoAPP\src\domain\borrowTypes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import {
  buildDefaultBorrowQuery,
  supportedBorrowChains,
  supportedBorrowProtocols,
  type CuratedBorrowMarket,
} from './borrowTypes'

describe('borrow curated market scope', () => {
  it('locks the first release to the requested chains and protocols', () => {
    expect(supportedBorrowChains).toEqual(['ethereum', 'bsc', 'base'])
    expect(supportedBorrowProtocols).toEqual(['aave', 'morpho', 'lista', 'fluid'])
  })

  it('defines a query shape for curated market scanning', () => {
    expect(buildDefaultBorrowQuery()).toEqual({
      chain: 'ethereum',
      collateralToken: '',
      borrowToken: '',
      amount: '',
      protocols: ['aave', 'morpho', 'lista', 'fluid'],
      sortBy: 'netBorrowApr',
      mode: 'safe',
    })
  })

  it('requires curated markets to carry display and filtering metadata', () => {
    const market: CuratedBorrowMarket = {
      id: 'morpho-eth-usdc-base-1',
      chain: 'base',
      protocol: 'morpho',
      collateralToken: 'ETH',
      borrowToken: 'USDC',
      marketKey: 'base:morpho:eth-usdc-core',
      enabled: true,
      mode: 'safe',
      minAvailableLiquidityUsd: 100000,
    }

    expect(market.marketKey).toContain('morpho')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/domain/borrowTypes.test.ts`

Expected: FAIL because `borrowTypes.ts` does not exist yet

- [ ] **Step 3: Write minimal implementation**

```ts
export type BorrowChain = 'ethereum' | 'bsc' | 'base'
export type BorrowProtocol = 'aave' | 'morpho' | 'lista' | 'fluid'
export type BorrowMode = 'safe' | 'degen'
export type BorrowSortKey = 'netBorrowApr' | 'borrowApr' | 'maxLtv'

export type BorrowQuery = {
  chain: BorrowChain
  collateralToken: string
  borrowToken: string
  amount: string
  protocols: BorrowProtocol[]
  sortBy: BorrowSortKey
  mode: BorrowMode
}

export type CuratedBorrowMarket = {
  id: string
  chain: BorrowChain
  protocol: BorrowProtocol
  collateralToken: string
  borrowToken: string
  marketKey: string
  enabled: boolean
  mode: BorrowMode
  minAvailableLiquidityUsd: number
}

export type BorrowRouteRow = {
  id: string
  chain: BorrowChain
  protocol: BorrowProtocol
  marketKey: string
  collateralToken: string
  borrowToken: string
  borrowApr: number
  supplyApr: number
  rewardApr: number
  netBorrowApr: number
  maxLtv: number
  availableLiquidityUsd: number
  healthFactorHint: string
}

export const supportedBorrowChains: BorrowChain[] = ['ethereum', 'bsc', 'base']
export const supportedBorrowProtocols: BorrowProtocol[] = ['aave', 'morpho', 'lista', 'fluid']

export function buildDefaultBorrowQuery(): BorrowQuery {
  return {
    chain: 'ethereum',
    collateralToken: '',
    borrowToken: '',
    amount: '',
    protocols: [...supportedBorrowProtocols],
    sortBy: 'netBorrowApr',
    mode: 'safe',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/domain/borrowTypes.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/borrowTypes.ts src/domain/borrowTypes.test.ts
git commit -m "feat: define curated borrow market types"
```

### Task 2: Add Curated Market Registry And Filtered Borrow Adapter

**Files:**
- Create: `D:\3DLAB\ai\benmoAPP\src\mocks\mockBorrowRegistry.ts`
- Create: `D:\3DLAB\ai\benmoAPP\src\mocks\mockBorrowData.ts`
- Create: `D:\3DLAB\ai\benmoAPP\src\data\borrowApi.ts`
- Modify: `D:\3DLAB\ai\benmoAPP\src\domain\borrowTypes.ts`
- Test: `D:\3DLAB\ai\benmoAPP\src\domain\borrowTypes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { fetchCuratedBorrowRoutes } from '../data/borrowApi'

describe('curated borrow adapter', () => {
  it('returns only enabled and usable markets from the registry', async () => {
    const rows = await fetchCuratedBorrowRoutes({
      chain: 'base',
      collateralToken: 'ETH',
      borrowToken: 'USDC',
      amount: '1000',
      protocols: ['aave', 'morpho', 'lista', 'fluid'],
      sortBy: 'netBorrowApr',
      mode: 'safe',
    })

    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((row) => row.chain === 'base')).toBe(true)
    expect(rows.every((row) => row.availableLiquidityUsd >= 100000)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/domain/borrowTypes.test.ts`

Expected: FAIL because the curated registry and adapter do not exist yet

- [ ] **Step 3: Write minimal implementation**

```ts
import type { CuratedBorrowMarket } from '../domain/borrowTypes'

export const mockBorrowRegistry: CuratedBorrowMarket[] = [
  {
    id: 'eth-aave-eth-usdc-safe',
    chain: 'ethereum',
    protocol: 'aave',
    collateralToken: 'ETH',
    borrowToken: 'USDC',
    marketKey: 'ethereum:aave:eth-usdc-core',
    enabled: true,
    mode: 'safe',
    minAvailableLiquidityUsd: 500000,
  },
  {
    id: 'base-morpho-eth-usdc-safe',
    chain: 'base',
    protocol: 'morpho',
    collateralToken: 'ETH',
    borrowToken: 'USDC',
    marketKey: 'base:morpho:eth-usdc-core',
    enabled: true,
    mode: 'safe',
    minAvailableLiquidityUsd: 100000,
  },
]
```

```ts
import type { BorrowQuery, BorrowRouteRow } from '../domain/borrowTypes'
import { mockBorrowData } from '../mocks/mockBorrowData'
import { mockBorrowRegistry } from '../mocks/mockBorrowRegistry'

export async function fetchCuratedBorrowRoutes(query: BorrowQuery): Promise<BorrowRouteRow[]> {
  const allowedMarketKeys = mockBorrowRegistry
    .filter((market) => market.enabled)
    .filter((market) => market.chain === query.chain)
    .filter((market) => market.mode === query.mode)
    .filter((market) => query.protocols.includes(market.protocol))
    .filter((market) => !query.collateralToken || market.collateralToken === query.collateralToken)
    .filter((market) => !query.borrowToken || market.borrowToken === query.borrowToken)
    .map((market) => market.marketKey)

  return mockBorrowData
    .filter((row) => allowedMarketKeys.includes(row.marketKey))
    .filter((row) => row.availableLiquidityUsd > 0)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/domain/borrowTypes.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/mocks/mockBorrowRegistry.ts src/mocks/mockBorrowData.ts src/data/borrowApi.ts src/domain/borrowTypes.ts
git commit -m "feat: add curated borrow registry and adapter"
```

### Task 3: Replace Borrow Placeholder With Registry-Driven Filters

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`
- Modify: `D:\3DLAB\ai\benmoAPP\src\components\BorrowPanel.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\components\BorrowFilters.tsx`
- Test: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
test('loads curated borrow routes after the user selects a supported pair', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')
  render(<App />)

  await user.selectOptions(screen.getByLabelText(/Chain/i), 'base')
  await user.selectOptions(screen.getByLabelText(/Collateral Token/i), 'ETH')
  await user.selectOptions(screen.getByLabelText(/Borrow Token/i), 'USDC')
  await user.type(screen.getByLabelText(/Borrow Amount/i), '1000')
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))

  expect(await screen.findByText(/Morpho/i)).toBeInTheDocument()
  expect(screen.getByText(/Net Borrow APR/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/App.test.tsx`

Expected: FAIL because the Borrow page still renders only placeholder content

- [ ] **Step 3: Write minimal implementation**

```tsx
const [query, setQuery] = useState(buildDefaultBorrowQuery())
const [rows, setRows] = useState<BorrowRouteRow[]>([])
const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle')

async function handleScan() {
  setStatus('loading')
  const nextRows = await fetchCuratedBorrowRoutes(query)
  setRows(nextRows)
  setStatus('ready')
}
```

```tsx
<BorrowFilters query={query} onQueryChange={setQuery} onSubmit={handleScan} />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/App.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/BorrowPanel.tsx src/components/BorrowFilters.tsx src/App.test.tsx
git commit -m "feat: add curated borrow filters"
```

### Task 4: Render Route Cards With Cost And Market Identity

**Files:**
- Create: `D:\3DLAB\ai\benmoAPP\src\components\BorrowRouteCard.tsx`
- Create: `D:\3DLAB\ai\benmoAPP\src\components\BorrowRouteList.tsx`
- Modify: `D:\3DLAB\ai\benmoAPP\src\components\BorrowPanel.tsx`
- Modify: `D:\3DLAB\ai\benmoAPP\src\styles.css`
- Test: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
test('shows route cards with market identity and cost metrics', async () => {
  window.history.pushState({}, '', '/?tab=borrow')
  render(<App />)

  await userEvent.click(screen.getByRole('button', { name: /Show Routes/i }))

  expect(await screen.findByText(/Market Key/i)).toBeInTheDocument()
  expect(screen.getByText(/Borrow APR/i)).toBeInTheDocument()
  expect(screen.getByText(/Supply APR/i)).toBeInTheDocument()
  expect(screen.getByText(/Reward APR/i)).toBeInTheDocument()
  expect(screen.getByText(/Max LTV/i)).toBeInTheDocument()
  expect(screen.getByText(/Available Liquidity/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/App.test.tsx`

Expected: FAIL because route results are not rendered yet

- [ ] **Step 3: Write minimal implementation**

```tsx
<BorrowRouteCard
  key={row.id}
  title={row.protocol}
  subtitle={row.marketKey}
  metrics={[
    ['Borrow APR', `${row.borrowApr.toFixed(2)}%`],
    ['Supply APR', `${row.supplyApr.toFixed(2)}%`],
    ['Reward APR', `${row.rewardApr.toFixed(2)}%`],
    ['Net Borrow APR', `${row.netBorrowApr.toFixed(2)}%`],
    ['Max LTV', `${row.maxLtv.toFixed(0)}%`],
    ['Available Liquidity', `$${row.availableLiquidityUsd.toLocaleString()}`],
  ]}
/>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/App.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/BorrowRouteCard.tsx src/components/BorrowRouteList.tsx src/components/BorrowPanel.tsx src/styles.css src/App.test.tsx
git commit -m "feat: render curated borrow route cards"
```

### Task 5: Add Allowlist-Aware Sorting, Empty State, And “Not In Curated Scope” Messaging

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\src\components\BorrowFilters.tsx`
- Modify: `D:\3DLAB\ai\benmoAPP\src\components\BorrowPanel.tsx`
- Modify: `D:\3DLAB\ai\benmoAPP\src\data\borrowApi.ts`
- Modify: `D:\3DLAB\ai\benmoAPP\src\styles.css`
- Test: `D:\3DLAB\ai\benmoAPP\src\App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
test('shows a curated scope message when the selected pair is not in the allowlist', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/?tab=borrow')
  render(<App />)

  await user.selectOptions(screen.getByLabelText(/Chain/i), 'bsc')
  await user.selectOptions(screen.getByLabelText(/Collateral Token/i), 'BNB')
  await user.selectOptions(screen.getByLabelText(/Borrow Token/i), 'USDT')
  await user.click(screen.getByRole('button', { name: /Show Routes/i }))

  expect(await screen.findByText(/This pair is not in the curated market scope yet/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/App.test.tsx`

Expected: FAIL because the page does not distinguish “empty because unsupported” from “empty because no data”

- [ ] **Step 3: Write minimal implementation**

```ts
export type BorrowScanResult = {
  rows: BorrowRouteRow[]
  reason: 'ok' | 'unsupported_pair' | 'no_live_routes'
}
```

```tsx
if (status === 'ready' && result.reason === 'unsupported_pair') {
  return <p className="borrow-status-copy">This pair is not in the curated market scope yet.</p>
}

if (status === 'ready' && result.reason === 'no_live_routes') {
  return <p className="borrow-status-copy">No live curated routes are available right now.</p>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/App.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/BorrowFilters.tsx src/components/BorrowPanel.tsx src/data/borrowApi.ts src/styles.css src/App.test.tsx
git commit -m "feat: add curated scope borrow states"
```

### Task 6: Document Real Backend Contract Around Curated Markets

**Files:**
- Create: `D:\3DLAB\ai\benmoAPP\docs\superpowers\specs\2026-04-24-borrow-curated-markets-api-draft.md`
- Modify: `D:\3DLAB\ai\benmoAPP\README.md`

- [ ] **Step 1: Draft the API contract file**

```md
# Borrow Curated Markets API Draft

## GET /borrow/registry

Returns:
- chains[]
- protocols[]
- markets[]

## POST /borrow/scan

Request:
- chain
- collateralToken
- borrowToken
- amount
- protocols
- sortBy
- mode

Response:
- reason
- rows[]
- generatedAt
- staleAfter
```

- [ ] **Step 2: Update README to clarify the data boundary**

```md
Borrow does not scan full protocol inventory.
Borrow reads only curated markets defined in `src/mocks/mockBorrowRegistry.ts`.
Replace `src/data/borrowApi.ts` when the real backend or database is ready.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-04-24-borrow-curated-markets-api-draft.md README.md
git commit -m "docs: add curated borrow api draft"
```

### Task 7: Final Verification And Scope Check

**Files:**
- Modify: `D:\3DLAB\ai\benmoAPP\docs\superpowers\plans\2026-04-23-borrow-route-cost-display-plan.md`

- [ ] **Step 1: Run tests**

Run: `npm run test:run`

Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Capture the Borrow page for review**

Run: `node .\scripts\capture-site.mjs "http://127.0.0.1:4173/?tab=borrow" .\reference-benmo-borrow-curated.png`

Expected: screenshot file created in the project root

- [ ] **Step 4: Verify the business scope**

Check:
- only `ETH / BSC / Base`
- only `Aave / Morpho / Lista / Fluid`
- only curated markets from the registry
- no full-protocol market enumeration
- no wallet execution flow

## Self-Review

- Spec coverage: this version explicitly adds a curated market registry, allowlist-aware adapter, UI filters, route cards, and unsupported-scope handling
- Placeholder scan: no `TODO`, `TBD`, or undefined implementation markers remain
- Type consistency: the plan consistently uses `BorrowQuery`, `CuratedBorrowMarket`, `BorrowRouteRow`, and `BorrowScanResult`
