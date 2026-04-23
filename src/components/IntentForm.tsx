import type { ExecutionStatus, Quote } from '../domain/swapMachine'

type IntentFormProps = {
  primaryLabel: string
  onPrimaryAction: () => void
  quote: Quote | null
  executionStatus: ExecutionStatus
  actionCopy: { title: string; body: string } | null
}

const statusMap: Record<ExecutionStatus, string> = {
  execution_idle: 'Ready to quote',
  execution_preparing: 'Preparing route',
  approval_required: 'Approval required',
  message_signature_required: 'Message signature required',
  tx_signature_required: 'Transaction signature required',
  broadcasting: 'Broadcasting',
  confirming: 'Confirming on chain',
  success: 'Swap complete',
  retryable_failure: 'Retry available',
  terminal_failure: 'Execution failed',
}

export function IntentForm({
  primaryLabel,
  onPrimaryAction,
  quote,
  executionStatus,
  actionCopy,
}: IntentFormProps) {
  const showStatusChip = executionStatus !== 'execution_idle'
  const showBestRouteBanner = Boolean(quote || actionCopy)

  return (
    <section className="swap-card" role="region" aria-label="swap panel">
      <div className="card-header-row">
        <span className="card-title">Chain</span>
        <div className="chain-toolbar">
          <span className="toolbar-label">Hide IP</span>
          <span className="toggle-shell" aria-hidden="true">
            <span className="toggle-thumb" />
          </span>
          <button type="button" className="icon-button" aria-label="Settings">
            *
          </button>
        </div>
      </div>

      <button type="button" className="chain-selector">
        <span className="token-chip token-chip--compact">
          <span className="token-dot">E</span>
          Ethereum
        </span>
        <span className="chevron">v</span>
      </button>

      <div className="token-panel">
        <div className="token-panel-copy">
          <span className="muted-label">You sell</span>
          <p className="amount-value">0</p>
        </div>
        <button type="button" className="token-selector">
          <span className="token-chip">
            <span className="token-dot">E</span>
            ETH
          </span>
          <span className="chevron">v</span>
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

      <button type="button" className="swap-direction-button" aria-label="Flip tokens">
        |
      </button>

      <div className="token-panel token-panel--buy">
        <div className="token-panel-copy">
          <span className="muted-label">You buy</span>
          <p className="amount-value amount-value--ghost">{quote ? '1,998.40' : '0'}</p>
        </div>
        <button type="button" className="token-selector">
          <span className="token-chip">
            <span className="token-dot token-dot--buy">$</span>
            {quote ? 'USDC' : 'Select Token'}
          </span>
          <span className="chevron">v</span>
        </button>
      </div>

      <div className="slippage-block">
        <div className="card-title-row">
          <span className="card-title">Slippage (%)</span>
          {showStatusChip ? <span className="status-chip">{statusMap[executionStatus]}</span> : null}
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
          <p className="action-banner-title">Best Route</p>
          <p className="action-banner-body">{quote ? `${quote.providerName} is ready. Continue with the next step.` : 'Request a quote to load the best route and execution steps.'}</p>
        </div>
      ) : null}

      <button type="button" className="swap-action-button" onClick={onPrimaryAction}>
        {primaryLabel}
      </button>
    </section>
  )
}
