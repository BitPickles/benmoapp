import { describe, expect, test } from 'vitest'
import { createInitialSwapState, swapReducer } from './swapMachine'

describe('swapMachine', () => {
  test('moves from unconnected to quote available through the quote flow', () => {
    const initialState = createInitialSwapState()

    expect(initialState.sessionStatus).toBe('unconnected')

    const connectedState = swapReducer(initialState, { type: 'wallet_connected' })
    expect(connectedState.sessionStatus).toBe('connected')
    expect(connectedState.quoteStatus).toBe('editing')

    const quotingState = swapReducer(connectedState, { type: 'quote_requested' })
    expect(quotingState.quoteStatus).toBe('quoting')

    const quotedState = swapReducer(quotingState, {
      type: 'quote_succeeded',
      quote: {
        quoteId: 'qt_demo',
        routeId: 'rt_best',
        expiresAt: '2026-04-22T22:20:00Z',
        providerName: 'Llama Meta',
        summary: 'ETH -> USDC best route',
      },
    })

    expect(quotedState.quoteStatus).toBe('quote_available')
    expect(quotedState.quote?.quoteId).toBe('qt_demo')
  })

  test('moves into execution preparing once a quote is selected', () => {
    const quotedState = {
      ...createInitialSwapState(),
      sessionStatus: 'connected' as const,
      quoteStatus: 'quote_available' as const,
      quote: {
        quoteId: 'qt_demo',
        routeId: 'rt_best',
        expiresAt: '2026-04-22T22:20:00Z',
        providerName: 'Llama Meta',
        summary: 'ETH -> USDC best route',
      },
    }

    const executionState = swapReducer(quotedState, {
      type: 'execution_started',
      execution: {
        executionId: 'ex_demo',
        nextAction: 'approval',
      },
    })

    expect(executionState.executionStatus).toBe('execution_preparing')
    expect(executionState.execution?.executionId).toBe('ex_demo')
  })

  test('walks through approval, signing, confirming and success', () => {
    const executionState = swapReducer(createInitialSwapState(), {
      type: 'execution_started',
      execution: {
        executionId: 'ex_demo',
        nextAction: 'approval',
      },
    })

    const approvalState = swapReducer(executionState, {
      type: 'next_action_received',
      nextAction: 'approval',
    })
    expect(approvalState.executionStatus).toBe('approval_required')

    const messageSignState = swapReducer(approvalState, {
      type: 'next_action_received',
      nextAction: 'message_sign',
    })
    expect(messageSignState.executionStatus).toBe('message_signature_required')

    const txSignState = swapReducer(messageSignState, {
      type: 'next_action_received',
      nextAction: 'sign_tx',
    })
    expect(txSignState.executionStatus).toBe('tx_signature_required')

    const broadcastingState = swapReducer(txSignState, {
      type: 'tx_signed',
    })
    expect(broadcastingState.executionStatus).toBe('broadcasting')

    const confirmingState = swapReducer(broadcastingState, {
      type: 'broadcast_succeeded',
      txHash: '0xabc',
    })
    expect(confirmingState.executionStatus).toBe('confirming')

    const successState = swapReducer(confirmingState, {
      type: 'confirmation_succeeded',
      txHash: '0xabc',
    })
    expect(successState.executionStatus).toBe('success')
  })

  test('moves into recoverable or terminal failures for key execution errors', () => {
    const executionState = swapReducer(createInitialSwapState(), {
      type: 'execution_started',
      execution: {
        executionId: 'ex_demo',
        nextAction: 'sign_tx',
      },
    })

    const retryableState = swapReducer(executionState, {
      type: 'broadcast_timed_out',
    })
    expect(retryableState.executionStatus).toBe('retryable_failure')

    const terminalState = swapReducer(executionState, {
      type: 'user_rejected',
      stage: 'sign_tx',
    })
    expect(terminalState.executionStatus).toBe('terminal_failure')
  })
})
