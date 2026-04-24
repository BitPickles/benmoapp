import type { Quote } from '../domain/swapMachine'
import type { AppCopy } from '../i18n'

type QuotePanelProps = {
  quote: Quote | null
  actionCopy: { title: string; body: string } | null
  copy: AppCopy['quote']
}

const logos = ['U', 'K', 'B', 'A', 'C']

export function QuotePanel({ quote, copy }: QuotePanelProps) {
  return (
    <section className="quote-card">
      <div className="logo-strip" aria-hidden="true">
        {logos.map((logo, index) => (
          <div key={`${logo}-${index}`} className={index === 2 ? 'logo-tile is-featured' : 'logo-tile'}>
            {logo}
          </div>
        ))}
      </div>

      {quote ? (
        <>
          <h2 className="quote-heading">{copy.quotedHeading}</h2>
          <div className="benefit-row">
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              {copy.benefits.bestReturn}
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              {copy.benefits.gas}
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              {copy.benefits.privacy}
            </span>
          </div>
          <p className="hero-copy">
            {copy.provider}: {quote.providerName}. {copy.quoteId}: {quote.quoteId}. {copy.continueFlow}
          </p>
          <div className="quote-metric-grid">
            <div className="quote-metric">
              <span>{copy.metrics.received}</span>
              <strong>
                {quote.toAmount} {quote.toTokenSymbol}
              </strong>
            </div>
            <div className="quote-metric">
              <span>{copy.metrics.gas}</span>
              <strong>{quote.estimatedGasUsd}</strong>
            </div>
            <div className="quote-metric">
              <span>{copy.metrics.priceImpact}</span>
              <strong>{quote.priceImpactPercent}</strong>
            </div>
          </div>
          <div className="liquidity-route">
            <p>{copy.liquiditySources}</p>
            <div className="liquidity-source-list">
              {quote.liquiditySources.map((source) => (
                <span key={source.name}>
                  {source.name} {source.percent}%
                </span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="quote-heading">{copy.initialHeading}</h2>
          <div className="benefit-row">
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              {copy.benefits.free}
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              {copy.benefits.gas}
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              {copy.benefits.privacy}
            </span>
          </div>
          <p className="hero-copy">
            {copy.initialBody}
          </p>
          <p className="hero-link">{copy.link}</p>
        </>
      )}
    </section>
  )
}
