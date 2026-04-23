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
            <span>o Best Return</span>
            <span>o Gas Estimation</span>
            <span>o Privacy Ready</span>
          </div>
          <p className="hero-copy">
            Provider: {quote.providerName}. Quote ID: {quote.quoteId}. Continue in the left panel to walk through the mocked execution session.
          </p>
        </>
      ) : (
        <>
          <h2 className="quote-heading">The Aggregator of Aggregators</h2>
          <div className="benefit-row">
            <span>o Totally Free</span>
            <span>o Gas Estimation</span>
            <span>o Preserves Privacy</span>
          </div>
          <p className="hero-copy">
            BenmoSwap looks for the best route for your trade among a variety of DEX aggregators, keeping the interface simple while the routing complexity stays behind the API boundary.
          </p>
          <p className="hero-link">Try it now or learn more</p>
        </>
      )}
    </section>
  )
}
