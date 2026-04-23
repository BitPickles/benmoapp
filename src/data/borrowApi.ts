import type { BorrowQuery, BorrowRouteRow, BorrowScanResult, CuratedBorrowMarket } from '../domain/borrowTypes'
import { mockBorrowData } from '../mocks/mockBorrowData'
import { mockBorrowRegistry } from '../mocks/mockBorrowRegistry'

function sortRows(rows: BorrowRouteRow[], query: BorrowQuery) {
  return [...rows].sort((left, right) => {
    const metricDelta = left[query.sortBy] - right[query.sortBy]
    if (metricDelta !== 0) {
      return metricDelta
    }

    return right.availableLiquidityUsd - left.availableLiquidityUsd
  })
}

function buildBorrowScanResult(
  query: BorrowQuery,
  curatedRegistry: CuratedBorrowMarket[],
  curatedRows: BorrowRouteRow[],
): BorrowScanResult {
  const pairScopedMarkets = curatedRegistry
    .filter((market) => market.enabled)
    .filter((market) => market.chain === query.chain)
    .filter((market) => !query.collateralToken || market.collateralToken === query.collateralToken)
    .filter((market) => !query.borrowToken || market.borrowToken === query.borrowToken)
  const allowedMarkets = pairScopedMarkets
    .filter((market) => query.protocols.includes(market.protocol))
    .filter((market) => market.mode === query.mode)
  const allowedMarketsByKey = new Map(allowedMarkets.map((market) => [market.marketKey, market] as const))

  if (pairScopedMarkets.length === 0) {
    return { rows: [], reason: 'unsupported_pair' }
  }

  if (allowedMarkets.length === 0) {
    return { rows: [], reason: 'no_live_routes' }
  }

  const rows = curatedRows.filter((row) => {
    const market = allowedMarketsByKey.get(row.marketKey)
    if (!market) {
      return false
    }

    if (row.chain !== market.chain) {
      return false
    }

    if (row.protocol !== market.protocol) {
      return false
    }

    if (row.collateralToken !== market.collateralToken) {
      return false
    }

    if (row.borrowToken !== market.borrowToken) {
      return false
    }

    return row.availableLiquidityUsd >= market.minAvailableLiquidityUsd
  })

  if (rows.length === 0) {
    return { rows: [], reason: 'no_live_routes' }
  }

  const sortedRows = sortRows(rows, query)

  return {
    rows: [sortedRows[0], ...sortedRows.slice(1)],
    reason: 'ok',
  }
}

export async function fetchCuratedBorrowRoutes(query: BorrowQuery): Promise<BorrowScanResult> {
  return buildBorrowScanResult(query, mockBorrowRegistry, mockBorrowData)
}

export { buildBorrowScanResult }
