import { useEffect, useRef, useState } from 'react'
import { fetchCuratedBorrowRoutes } from '../data/borrowApi'
import {
  buildDefaultBorrowQuery,
  type BorrowChain,
  type BorrowMode,
  type BorrowScanResult,
} from '../domain/borrowTypes'
import type { AppCopy } from '../i18n'
import { BorrowFilters } from './BorrowFilters'
import { BorrowRouteList } from './BorrowRouteList'

type BorrowDisplayState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; result: BorrowScanResult }

type BorrowPanelProps = {
  copy: AppCopy['borrow']
}

export function BorrowPanel({ copy }: BorrowPanelProps) {
  const [query, setQuery] = useState(buildDefaultBorrowQuery)
  const [displayState, setDisplayState] = useState<BorrowDisplayState>({ kind: 'idle' })
  const scanRequestIdRef = useRef(0)

  function invalidateCurrentResults() {
    scanRequestIdRef.current += 1
    setDisplayState({ kind: 'idle' })
  }

  function updateChain(chain: BorrowChain) {
    invalidateCurrentResults()
    setQuery((currentQuery) => ({ ...currentQuery, chain }))
  }

  function updateCollateralToken(collateralToken: string) {
    invalidateCurrentResults()
    setQuery((currentQuery) => ({ ...currentQuery, collateralToken }))
  }

  function updateBorrowToken(borrowToken: string) {
    invalidateCurrentResults()
    setQuery((currentQuery) => ({ ...currentQuery, borrowToken }))
  }

  function updateAmount(amount: string) {
    invalidateCurrentResults()
    setQuery((currentQuery) => ({ ...currentQuery, amount }))
  }

  function updateMode(mode: BorrowMode) {
    invalidateCurrentResults()
    setQuery((currentQuery) => ({ ...currentQuery, mode }))
  }

  async function scanBorrowRoutes(nextQuery = query) {
    const requestId = scanRequestIdRef.current + 1
    scanRequestIdRef.current = requestId
    setDisplayState({ kind: 'loading' })
    const nextResult = await fetchCuratedBorrowRoutes(nextQuery)
    if (requestId !== scanRequestIdRef.current) {
      return
    }
    setDisplayState({ kind: 'ready', result: nextResult })
  }

  useEffect(() => {
    void scanBorrowRoutes(query)
  }, [])

  async function handleScan() {
    await scanBorrowRoutes(query)
  }

  return (
    <section className="borrow-shell" role="region" aria-label={copy.panelLabel}>
      <div className="borrow-loading-card">
        <div className="borrow-loading-illustration" aria-hidden="true">
          <span className="borrow-loading-illustration-core" />
          <span className="borrow-loading-illustration-spark borrow-loading-illustration-spark--top" />
          <span className="borrow-loading-illustration-spark borrow-loading-illustration-spark--right" />
          <span className="borrow-loading-illustration-spark borrow-loading-illustration-spark--left" />
        </div>
        <p className="borrow-loading-copy">
          {displayState.kind === 'loading' ? copy.loadingRoutes : copy.loading}
        </p>
      </div>

      <div className="borrow-info-card">
        <div className="borrow-mode-tabs" aria-label={copy.panelLabel}>
          <button
            type="button"
            className={`borrow-mode-tab${query.mode === 'safe' ? ' is-active' : ''}`}
            aria-pressed={query.mode === 'safe'}
            onClick={() => updateMode('safe')}
          >
            {copy.modes.safe}
          </button>
          <button
            type="button"
            className={`borrow-mode-tab${query.mode === 'degen' ? ' is-active' : ''}`}
            aria-pressed={query.mode === 'degen'}
            onClick={() => updateMode('degen')}
          >
            {copy.modes.degen}
          </button>
        </div>

        <BorrowFilters
          chain={query.chain}
          collateralToken={query.collateralToken}
          borrowToken={query.borrowToken}
          amount={query.amount}
          copy={copy}
          onChainChange={updateChain}
          onCollateralTokenChange={updateCollateralToken}
          onBorrowTokenChange={updateBorrowToken}
          onAmountChange={updateAmount}
          onSubmit={handleScan}
        />

        {displayState.kind === 'ready' && displayState.result.reason === 'ok' ? (
          <BorrowRouteList rows={displayState.result.rows} copy={copy} />
        ) : (
          <div className="borrow-empty-state">
            <div className="borrow-illustration" aria-hidden="true">
              <span className="borrow-arrow borrow-arrow--top" />
              <div className="borrow-token-pair">
                <span className="borrow-token borrow-token--eth">E</span>
                <span className="borrow-token borrow-token--stable">$</span>
              </div>
              <span className="borrow-arrow borrow-arrow--bottom" />
            </div>

            <p className="borrow-copy">{copy.empty}</p>
            {displayState.kind === 'ready' && displayState.result.reason === 'unsupported_pair' ? (
              <p className="borrow-status-copy">{copy.unsupportedPair}</p>
            ) : null}
            {displayState.kind === 'ready' && displayState.result.reason === 'no_live_routes' ? (
              <p className="borrow-status-copy">{copy.noLiveRoutes}</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
