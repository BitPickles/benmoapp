import { useEffect, useMemo, useReducer, useState } from 'react'
import { BetaFootnote } from './components/BetaFootnote'
import { BorrowPanel } from './components/BorrowPanel'
import { EarnPanel } from './components/EarnPanel'
import { IntentForm } from './components/IntentForm'
import { QuotePanel } from './components/QuotePanel'
import { TopNav, type AppTab } from './components/TopNav'
import { advanceMockExecution, fetchMockQuote, startMockExecution } from './data/swapApi'
import { createInitialSwapState, swapReducer } from './domain/swapMachine'

function readTabFromLocation(): AppTab {
  const value = new URLSearchParams(window.location.search).get('tab')

  if (value === 'earn') {
    return 'earn'
  }

  if (value === 'borrow') {
    return 'borrow'
  }

  return 'swap'
}

function writeTabToLocation(tab: AppTab) {
  const url = new URL(window.location.href)

  if (tab === 'swap') {
    url.searchParams.delete('tab')
  } else {
    url.searchParams.set('tab', tab)
  }

  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

function App() {
  const [state, dispatch] = useReducer(swapReducer, undefined, createInitialSwapState)
  const [activeTab, setActiveTab] = useState<AppTab>(() => readTabFromLocation())

  useEffect(() => {
    function handlePopState() {
      setActiveTab(readTabFromLocation())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function handleTabChange(tab: AppTab) {
    setActiveTab(tab)
    writeTabToLocation(tab)
  }

  const primaryLabel = useMemo(() => {
    if (state.sessionStatus === 'unconnected') {
      return 'Connect Wallet'
    }

    if (state.quoteStatus !== 'quote_available') {
      return 'Get Quotes'
    }

    if (state.executionStatus === 'approval_required') {
      return 'Approve'
    }

    if (state.executionStatus === 'message_signature_required') {
      return 'Sign Intent'
    }

    if (state.executionStatus === 'tx_signature_required') {
      return 'Sign Transaction'
    }

    if (state.executionStatus === 'confirming') {
      return 'Mark Confirmed'
    }

    if (state.executionStatus === 'success') {
      return 'Swap Complete'
    }

    return 'Start Swap'
  }, [state.executionStatus, state.quoteStatus, state.sessionStatus])

  async function handlePrimaryAction() {
    if (state.sessionStatus === 'unconnected') {
      dispatch({ type: 'wallet_connected' })
      return
    }

    if (state.quoteStatus !== 'quote_available') {
      dispatch({ type: 'quote_requested' })
      const quote = await fetchMockQuote()
      dispatch({ type: 'quote_succeeded', quote })
      return
    }

    if (state.executionStatus === 'approval_required') {
      const result = await advanceMockExecution(state.executionStatus)
      if (result.kind === 'next_action') {
        dispatch({ type: 'next_action_received', nextAction: result.nextAction })
      }
      return
    }

    if (state.executionStatus === 'message_signature_required') {
      const result = await advanceMockExecution(state.executionStatus)
      if (result.kind === 'next_action') {
        dispatch({ type: 'next_action_received', nextAction: result.nextAction })
      }
      return
    }

    if (state.executionStatus === 'tx_signature_required') {
      const result = await advanceMockExecution(state.executionStatus)
      if (result.kind === 'broadcasted') {
        dispatch({ type: 'tx_signed' })
        dispatch({ type: 'broadcast_succeeded', txHash: result.txHash })
      }
      return
    }

    if (state.executionStatus === 'confirming') {
      const result = await advanceMockExecution(state.executionStatus)
      if (result.kind === 'confirmed') {
        dispatch({ type: 'confirmation_succeeded', txHash: result.txHash })
      }
      return
    }

    if (state.executionStatus === 'success') {
      return
    }

    const execution = await startMockExecution()
    dispatch({ type: 'execution_started', execution })
    dispatch({ type: 'next_action_received', nextAction: execution.nextAction })
  }

  const actionCopy = useMemo(() => {
    switch (state.executionStatus) {
      case 'approval_required':
        return {
          title: 'Approve token before swap',
          body: 'This route needs one approval before the transaction can continue.',
        }
      case 'message_signature_required':
        return {
          title: 'Sign order intent before execution',
          body: 'This step signs an intent message. It does not send an on-chain transaction yet.',
        }
      case 'tx_signature_required':
        return {
          title: 'Approve the on-chain swap transaction',
          body: 'This is the on-chain transaction signature step for the selected route.',
        }
      case 'confirming':
        return {
          title: 'Waiting for on-chain confirmation',
          body: 'The route has been broadcast. Confirm the final state once the chain receipt arrives.',
        }
      case 'success':
        return {
          title: 'Swap complete',
          body: 'The mocked execution has reached a successful terminal state.',
        }
      default:
        return null
    }
  }, [state.executionStatus])

  return (
    <>
      <main className="page-shell">
        <div className="app-frame">
          <TopNav
            activeTab={activeTab}
            walletLabel={state.sessionStatus === 'unconnected' ? 'Connect Wallet' : '0x71...fa'}
            onWalletAction={handlePrimaryAction}
            onTabChange={handleTabChange}
          />

          {activeTab === 'swap' ? (
            <>
              <section className="hero-grid">
                <IntentForm
                  primaryLabel={primaryLabel}
                  onPrimaryAction={handlePrimaryAction}
                  quote={state.quote}
                  executionStatus={state.executionStatus}
                  actionCopy={actionCopy}
                />
                <QuotePanel quote={state.quote} actionCopy={actionCopy} />
              </section>

              <BetaFootnote />
            </>
          ) : null}

          {activeTab === 'earn' ? <EarnPanel /> : null}
          {activeTab === 'borrow' ? <BorrowPanel /> : null}
        </div>
      </main>
    </>
  )
}

export default App
