import type { ExecutionStatus, Quote } from '../domain/swapMachine'
import type { AppCopy } from '../i18n'

type IntentFormProps = {
  primaryLabel: string
  onPrimaryAction: () => void
  quote: Quote | null
  executionStatus: ExecutionStatus
  actionCopy: { title: string; body: string } | null
  copy: AppCopy['swap']
}

export function IntentForm({
  primaryLabel,
  onPrimaryAction,
  quote,
  executionStatus,
  actionCopy,
  copy,
}: IntentFormProps) {
  const showStatusChip = executionStatus !== 'execution_idle'
  const showBestRouteBanner = Boolean(quote || actionCopy)

  return (
    <section className="swap-card" role="region" aria-label={copy.panelLabel}>
      <div className="card-header-row">
        <span className="card-title">{copy.chain}</span>
        <div className="chain-toolbar">
          <span className="toolbar-label">{copy.hideIp}</span>
          <span className="toggle-shell" aria-hidden="true">
            <span className="toggle-thumb" />
          </span>
          <button type="button" className="icon-button" aria-label={copy.settings}>
            <span className="icon-button-glyph icon-button-glyph--settings" aria-hidden="true" />
          </button>
        </div>
      </div>

      <button type="button" className="chain-selector">
        <span className="token-chip token-chip--compact">
          <span className="token-dot">E</span>
          {copy.ethereum}
        </span>
        <span className="chevron" aria-hidden="true" />
      </button>

      <div className="token-panel">
        <div className="token-panel-copy">
          <span className="muted-label">{copy.youSell}</span>
          <p className="amount-value">{quote ? quote.fromAmount : '0'}</p>
        </div>
        <button type="button" className="token-selector">
          <span className="token-chip">
            <span className="token-dot">E</span>
            ETH
          </span>
          <span className="chevron" aria-hidden="true" />
        </button>
      </div>

      <div className="range-wrap" aria-hidden="true">
        <span className="range-badge">0%</span>
        <div className="range-track">
          <span className="range-progress" />
          <span className="range-node is-active" />
          <span className="range-node" />
          <span className="range-node" />
          <span className="range-node" />
          <span className="range-node" />
        </div>
      </div>

      <button type="button" className="swap-direction-button" aria-label={copy.flipTokens}>
        <span className="swap-direction-glyph" aria-hidden="true" />
      </button>

      <div className="token-panel token-panel--buy">
        <div className="token-panel-copy">
          <span className="muted-label">{copy.youBuy}</span>
          <p className="amount-value amount-value--ghost">{quote ? quote.toAmount : '0'}</p>
        </div>
        <button type="button" className="token-selector">
          <span className="token-chip">
            <span className="token-dot token-dot--buy">$</span>
            {quote ? quote.toTokenSymbol : copy.selectToken}
          </span>
          <span className="chevron" aria-hidden="true" />
        </button>
      </div>

      <div className="slippage-block">
        <div className="card-title-row">
          <span className="card-title">{copy.slippage}</span>
          {showStatusChip ? <span className="status-chip">{copy.status[executionStatus]}</span> : null}
        </div>
        <div className="slippage-row">
          <div className="slippage-input">0.3</div>
          <div className="slippage-presets">
            <button type="button" className="preset-chip is-active">
              0.02
            </button>
            <button type="button" className="preset-chip">
              0.1
            </button>
            <button type="button" className="preset-chip">
              0.5
            </button>
            <button type="button" className="preset-chip">
              1
            </button>
          </div>
        </div>
      </div>

      {actionCopy ? (
        <div className="action-banner">
          <p className="action-banner-title">{actionCopy.title}</p>
          <p className="action-banner-body">{actionCopy.body}</p>
        </div>
      ) : showBestRouteBanner ? (
        <div className="action-banner action-banner--quiet">
          <p className="action-banner-title">{copy.bestRoute}</p>
          <p className="action-banner-body">{quote ? `${quote.providerName} ${copy.routeReady}` : copy.requestQuote}</p>
        </div>
      ) : null}

      <button type="button" className="swap-action-button" onClick={onPrimaryAction}>
        {primaryLabel}
      </button>
    </section>
  )
}
