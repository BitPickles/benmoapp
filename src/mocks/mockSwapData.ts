import type { ExecutionSession, ExecutionStatus, NextAction, Quote } from '../domain/swapMachine'

export function fetchMockQuote(): Promise<Quote> {
  return Promise.resolve({
    quoteId: 'qt_demo',
    routeId: 'rt_best',
    expiresAt: '2026-04-22T22:20:00Z',
    providerName: 'Llama Meta',
    summary: 'ETH -> USDC best route',
  })
}

export function startMockExecution(): Promise<ExecutionSession> {
  return Promise.resolve({
    executionId: 'ex_demo',
    nextAction: 'approval',
  })
}

export function advanceMockExecution(
  executionStatus: ExecutionStatus,
): Promise<
  | { kind: 'next_action'; nextAction: NextAction }
  | { kind: 'broadcasted'; txHash: string }
  | { kind: 'confirmed'; txHash: string }
> {
  switch (executionStatus) {
    case 'approval_required':
      return Promise.resolve({ kind: 'next_action', nextAction: 'message_sign' })
    case 'message_signature_required':
      return Promise.resolve({ kind: 'next_action', nextAction: 'sign_tx' })
    case 'tx_signature_required':
      return Promise.resolve({ kind: 'broadcasted', txHash: '0xabc' })
    case 'confirming':
      return Promise.resolve({ kind: 'confirmed', txHash: '0xabc' })
    default:
      return Promise.resolve({ kind: 'next_action', nextAction: 'approval' })
  }
}
