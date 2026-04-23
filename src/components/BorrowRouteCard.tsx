export type BorrowRouteMetricKey =
  | 'borrowApr'
  | 'supplyApr'
  | 'rewardApr'
  | 'netBorrowApr'
  | 'maxLtv'
  | 'availableLiquidityUsd'

export type BorrowRouteMetric = {
  key: BorrowRouteMetricKey
  label: string
  value: string
}

type BorrowRouteCardProps = {
  title: string
  subtitle: string
  metrics: BorrowRouteMetric[]
}

export function BorrowRouteCard({ title, subtitle, metrics }: BorrowRouteCardProps) {
  return (
    <section className="borrow-route-card" aria-label={`${subtitle} route card`}>
      <header className="borrow-route-card__header">
        <p className="borrow-route-card__eyebrow">Protocol</p>
        <h3 className="borrow-route-card__title">{title}</h3>
        <p className="borrow-route-card__eyebrow">Market Key</p>
        <p className="borrow-route-card__subtitle">{subtitle}</p>
      </header>

      <dl className="borrow-route-card__metrics">
        {metrics.map((metric) => (
          <div key={metric.key} className="borrow-route-card__metric">
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
