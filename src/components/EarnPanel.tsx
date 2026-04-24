import type { AppCopy } from '../i18n'

type EarnPanelProps = {
  copy: AppCopy['earn']
}

export function EarnPanel({ copy }: EarnPanelProps) {
  return (
    <section className="earn-shell">
      <div className="earn-card" role="region" aria-label={copy.panelLabel}>
        <div className="earn-illustration" aria-hidden="true">
          <span className="earn-illustration-core" />
          <span className="earn-illustration-spark earn-illustration-spark--top" />
          <span className="earn-illustration-spark earn-illustration-spark--right" />
          <span className="earn-illustration-spark earn-illustration-spark--left" />
        </div>
        <p className="earn-loading-copy">{copy.loading}</p>
      </div>
    </section>
  )
}
