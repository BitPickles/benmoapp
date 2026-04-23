import type { BorrowRouteRow } from '../domain/borrowTypes'
import { BorrowRouteCard, type BorrowRouteMetric } from './BorrowRouteCard'

type BorrowRouteListProps = {
  rows: BorrowRouteRow[]
}

function formatPercent(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`
}

function formatLtv(value: number) {
  return `${(value * 100).toFixed(0)}%`
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`
}

function buildMetrics(row: BorrowRouteRow): BorrowRouteMetric[] {
  return [
    { key: 'borrowApr', label: 'Borrow APR', value: formatPercent(row.borrowApr) },
    { key: 'supplyApr', label: 'Supply APR', value: formatPercent(row.supplyApr) },
    { key: 'rewardApr', label: 'Reward APR', value: formatPercent(row.rewardApr) },
    { key: 'netBorrowApr', label: 'Net Borrow APR', value: formatPercent(row.netBorrowApr) },
    { key: 'maxLtv', label: 'Max LTV', value: formatLtv(row.maxLtv) },
    {
      key: 'availableLiquidityUsd',
      label: 'Available Liquidity',
      value: formatCurrency(row.availableLiquidityUsd),
    },
  ]
}

export function BorrowRouteList({ rows }: BorrowRouteListProps) {
  return (
    <section className="borrow-route-list" aria-label="borrow routes">
      {rows.map((row) => (
        <BorrowRouteCard
          key={row.id}
          title={row.protocol}
          subtitle={row.marketKey}
          metrics={buildMetrics(row)}
        />
      ))}
    </section>
  )
}
