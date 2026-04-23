import { useRef, useState } from 'react'
import { fetchCuratedBorrowRoutes } from '../data/borrowApi'
import {
  buildDefaultBorrowQuery,
  type BorrowChain,
  type BorrowMode,
  type BorrowScanResult,
} from '../domain/borrowTypes'
import { BorrowFilters } from './BorrowFilters'
import { BorrowRouteList } from './BorrowRouteList'

type BorrowDisplayState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; result: BorrowScanResult }

export function BorrowPanel() {
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

  async function handleScan() {
    const requestId = scanRequestIdRef.current + 1
    scanRequestIdRef.current = requestId
    setDisplayState({ kind: 'loading' })
    const nextResult = await fetchCuratedBorrowRoutes(query)
    if (requestId !== scanRequestIdRef.current) {
      return
    }
    setDisplayState({ kind: 'ready', result: nextResult })
  }

  return (
    <section className="borrow-shell" role="region" aria-label="borrow panel">
      <div className="borrow-loading-card">
        <div className="borrow-loading-illustration" aria-hidden="true">
          <span className="borrow-loading-illustration-core" />
          <span className="borrow-loading-illustration-spark borrow-loading-illustration-spark--top" />
          <span className="borrow-loading-illustration-spark borrow-loading-illustration-spark--right" />
          <span className="borrow-loading-illustration-spark borrow-loading-illustration-spark--left" />
        </div>
        <p className="borrow-loading-copy">
          {displayState.kind === 'loading' ? 'Loading routes...' : 'Loading...'}
        </p>
      </div>

      <div className="borrow-info-card">
        <div className="borrow-mode-tabs" aria-label="Borrow modes">
          <button
            type="button"
            className={`borrow-mode-tab${query.mode === 'safe' ? ' is-active' : ''}`}
            aria-pressed={query.mode === 'safe'}
            onClick={() => updateMode('safe')}
          >
            Safe
          </button>
          <button
            type="button"
            className={`borrow-mode-tab${query.mode === 'degen' ? ' is-active' : ''}`}
            aria-pressed={query.mode === 'degen'}
            onClick={() => updateMode('degen')}
          >
            Degen
          </button>
        </div>

        <BorrowFilters
          chain={query.chain}
          collateralToken={query.collateralToken}
          borrowToken={query.borrowToken}
          amount={query.amount}
          onChainChange={updateChain}
          onCollateralTokenChange={updateCollateralToken}
          onBorrowTokenChange={updateBorrowToken}
          onAmountChange={updateAmount}
          onSubmit={handleScan}
        />

        {displayState.kind === 'ready' && displayState.result.reason === 'ok' ? (
          <BorrowRouteList rows={displayState.result.rows} />
        ) : (
          <div className="borrow-empty-state">
            <div className="borrow-illustration" aria-hidden="true">
              <span className="borrow-arrow borrow-arrow--top">↻</span>
              <div className="borrow-token-pair">
                <span className="borrow-token borrow-token--eth">E</span>
                <span className="borrow-token borrow-token--stable">$</span>
              </div>
              <span className="borrow-arrow borrow-arrow--bottom">↺</span>
            </div>

            <p className="borrow-copy">Select a lending and borrowing token to see the available pairs.</p>
            {displayState.kind === 'ready' && displayState.result.reason === 'unsupported_pair' ? (
              <p className="borrow-status-copy">This pair is not in the curated market scope yet.</p>
            ) : null}
            {displayState.kind === 'ready' && displayState.result.reason === 'no_live_routes' ? (
              <p className="borrow-status-copy">No live curated routes are available right now.</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
