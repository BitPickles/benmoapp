import type { BorrowRouteRow } from '../domain/borrowTypes'
import type { AppCopy } from '../i18n'
import { BorrowRouteCard, type BorrowRouteMetric } from './BorrowRouteCard'

type BorrowRouteListProps = {
  rows: BorrowRouteRow[]
  copy: AppCopy['borrow']
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

function buildMetrics(row: BorrowRouteRow, copy: AppCopy['borrow']): BorrowRouteMetric[] {
  return [
    { key: 'borrowApr', label: copy.metrics.borrowApr, value: formatPercent(row.borrowApr) },
    { key: 'supplyApr', label: copy.metrics.supplyApr, value: formatPercent(row.supplyApr) },
    { key: 'rewardApr', label: copy.metrics.rewardApr, value: formatPercent(row.rewardApr) },
    { key: 'netBorrowApr', label: copy.metrics.netBorrowApr, value: formatPercent(row.netBorrowApr) },
    { key: 'maxLtv', label: copy.metrics.maxLtv, value: formatLtv(row.maxLtv) },
    {
      key: 'availableLiquidityUsd',
      label: copy.metrics.availableLiquidityUsd,
      value: formatCurrency(row.availableLiquidityUsd),
    },
  ]
}

export function BorrowRouteList({ rows, copy }: BorrowRouteListProps) {
  return (
    <section className="borrow-route-list" aria-label={copy.routesLabel}>
      {rows.map((row) => (
        <BorrowRouteCard
          key={row.id}
          title={row.protocol}
          subtitle={row.marketKey}
          metrics={buildMetrics(row, copy)}
          protocolLabel={copy.protocol}
          marketKeyLabel={copy.marketKey}
          routeCardLabel={copy.routeCard}
        />
      ))}
    </section>
  )
}
