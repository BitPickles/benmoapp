import { useEffect, useMemo, useReducer, useState } from 'react'
import { BetaFootnote } from './components/BetaFootnote'
import { BorrowPanel } from './components/BorrowPanel'
import { EarnPanel } from './components/EarnPanel'
import { IntentForm } from './components/IntentForm'
import { QuotePanel } from './components/QuotePanel'
import { TopNav, type AppTab } from './components/TopNav'
import { advanceMockExecution, fetchMockQuote, startMockExecution } from './data/swapApi'
import { createInitialSwapState, swapReducer } from './domain/swapMachine'
import { copy as localizedCopy, type Language } from './i18n'

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
  const [language, setLanguage] = useState<Language>('zh')
  const currentCopy = localizedCopy[language]

  useEffect(() => {
    function handlePopState() {
      setActiveTab(readTabFromLocation())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  function handleTabChange(tab: AppTab) {
    setActiveTab(tab)
    writeTabToLocation(tab)
  }

  const primaryLabel = useMemo(() => {
    if (state.sessionStatus === 'unconnected') {
      return currentCopy.swap.primary.connectWallet
    }

    if (state.quoteStatus !== 'quote_available') {
      return currentCopy.swap.primary.getQuotes
    }

    if (state.executionStatus === 'approval_required') {
      return currentCopy.swap.primary.approve
    }

    if (state.executionStatus === 'message_signature_required') {
      return currentCopy.swap.primary.signIntent
    }

    if (state.executionStatus === 'tx_signature_required') {
      return currentCopy.swap.primary.signTransaction
    }

    if (state.executionStatus === 'confirming') {
      return currentCopy.swap.primary.markConfirmed
    }

    if (state.executionStatus === 'success') {
      return currentCopy.swap.primary.swapComplete
    }

    return currentCopy.swap.primary.startSwap
  }, [currentCopy.swap.primary, state.executionStatus, state.quoteStatus, state.sessionStatus])

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
        return currentCopy.swap.actionCopy.approval_required
      case 'message_signature_required':
        return currentCopy.swap.actionCopy.message_signature_required
      case 'tx_signature_required':
        return currentCopy.swap.actionCopy.tx_signature_required
      case 'confirming':
        return currentCopy.swap.actionCopy.confirming
      case 'success':
        return currentCopy.swap.actionCopy.success
      default:
        return null
    }
  }, [currentCopy.swap.actionCopy, state.executionStatus])

  return (
    <>
      <main className="page-shell">
        <div className="app-frame">
          <TopNav
            activeTab={activeTab}
            walletLabel={state.sessionStatus === 'unconnected' ? currentCopy.nav.connectWallet : currentCopy.nav.connectedWallet}
            language={language}
            copy={currentCopy.nav}
            onWalletAction={handlePrimaryAction}
            onTabChange={handleTabChange}
            onLanguageChange={setLanguage}
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
                  copy={currentCopy.swap}
                />
                <QuotePanel quote={state.quote} actionCopy={actionCopy} copy={currentCopy.quote} />
              </section>

              <BetaFootnote copy={currentCopy.beta} />
            </>
          ) : null}

          {activeTab === 'earn' ? <EarnPanel copy={currentCopy.earn} /> : null}
          {activeTab === 'borrow' ? <BorrowPanel copy={currentCopy.borrow} /> : null}
        </div>
      </main>
    </>
  )
}

export default App
