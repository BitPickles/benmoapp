export type SessionStatus = 'unconnected' | 'connected'
export type QuoteStatus = 'editing' | 'quoting' | 'quote_available'
export type ExecutionStatus =
  | 'execution_idle'
  | 'execution_preparing'
  | 'approval_required'
  | 'message_signature_required'
  | 'tx_signature_required'
  | 'broadcasting'
  | 'confirming'
  | 'success'
  | 'retryable_failure'
  | 'terminal_failure'
export type NextAction = 'approval' | 'message_sign' | 'sign_tx'

export type Quote = {
  quoteId: string
  routeId: string
  expiresAt: string
  providerName: string
  summary: string
}

export type ExecutionSession = {
  executionId: string
  nextAction: NextAction
}

export type SwapState = {
  sessionStatus: SessionStatus
  quoteStatus: QuoteStatus
  executionStatus: ExecutionStatus
  quote: Quote | null
  execution: ExecutionSession | null
}

type WalletConnectedEvent = { type: 'wallet_connected' }
type QuoteRequestedEvent = { type: 'quote_requested' }
type QuoteSucceededEvent = { type: 'quote_succeeded'; quote: Quote }
type ExecutionStartedEvent = {
  type: 'execution_started'
  execution: ExecutionSession
}
type NextActionReceivedEvent = {
  type: 'next_action_received'
  nextAction: NextAction
}
type TxSignedEvent = { type: 'tx_signed' }
type BroadcastSucceededEvent = { type: 'broadcast_succeeded'; txHash: string }
type ConfirmationSucceededEvent = {
  type: 'confirmation_succeeded'
  txHash: string
}
type BroadcastTimedOutEvent = { type: 'broadcast_timed_out' }
type UserRejectedEvent = {
  type: 'user_rejected'
  stage: 'approval' | 'message_sign' | 'sign_tx'
}

export type SwapEvent =
  | WalletConnectedEvent
  | QuoteRequestedEvent
  | QuoteSucceededEvent
  | ExecutionStartedEvent
  | NextActionReceivedEvent
  | TxSignedEvent
  | BroadcastSucceededEvent
  | ConfirmationSucceededEvent
  | BroadcastTimedOutEvent
  | UserRejectedEvent

export function createInitialSwapState(): SwapState {
  return {
    sessionStatus: 'unconnected',
    quoteStatus: 'editing',
    executionStatus: 'execution_idle',
    quote: null,
    execution: null,
  }
}

export function swapReducer(state: SwapState, event: SwapEvent): SwapState {
  switch (event.type) {
    case 'wallet_connected':
      return {
        ...state,
        sessionStatus: 'connected',
        quoteStatus: 'editing',
      }
    case 'quote_requested':
      return {
        ...state,
        quoteStatus: 'quoting',
      }
    case 'quote_succeeded':
      return {
        ...state,
        quoteStatus: 'quote_available',
        quote: event.quote,
      }
    case 'execution_started':
      return {
        ...state,
        executionStatus: 'execution_preparing',
        execution: event.execution,
      }
    case 'next_action_received':
      return {
        ...state,
        executionStatus:
          event.nextAction === 'approval'
            ? 'approval_required'
            : event.nextAction === 'message_sign'
              ? 'message_signature_required'
              : 'tx_signature_required',
        execution: state.execution
          ? {
              ...state.execution,
              nextAction: event.nextAction,
            }
          : state.execution,
      }
    case 'tx_signed':
      return {
        ...state,
        executionStatus: 'broadcasting',
      }
    case 'broadcast_succeeded':
      return {
        ...state,
        executionStatus: 'confirming',
      }
    case 'confirmation_succeeded':
      return {
        ...state,
        executionStatus: 'success',
      }
    case 'broadcast_timed_out':
      return {
        ...state,
        executionStatus: 'retryable_failure',
      }
    case 'user_rejected':
      return {
        ...state,
        executionStatus: 'terminal_failure',
      }
  }
}
