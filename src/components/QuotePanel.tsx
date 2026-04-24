import type { Quote } from '../domain/swapMachine'

type QuotePanelProps = {
  quote: Quote | null
  actionCopy: { title: string; body: string } | null
}

const logos = ['U', 'K', 'B', 'A', 'C']

export function QuotePanel({ quote }: QuotePanelProps) {
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
          <h2 className="quote-heading">{quote.summary}</h2>
          <div className="benefit-row">
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              Best Return
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              Gas Estimation
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              Privacy Ready
            </span>
          </div>
          <p className="hero-copy">
            Provider: {quote.providerName}. Quote ID: {quote.quoteId}. Continue in the left panel to walk through the mocked execution session.
          </p>
        </>
      ) : (
        <>
          <h2 className="quote-heading">Route clarity before every trade</h2>
          <div className="benefit-row">
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              Totally Free
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              Gas Estimation
            </span>
            <span>
              <span className="benefit-marker" aria-hidden="true" />
              Preserves Privacy
            </span>
          </div>
          <p className="hero-copy">
            Pangolins compares executable routes, estimated cost, and provider behavior behind a calmer interface for internal review.
          </p>
          <p className="hero-link">Review available routes</p>
        </>
      )}
    </section>
  )
}
