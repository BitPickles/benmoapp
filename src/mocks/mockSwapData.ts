import type { ExecutionSession, ExecutionStatus, NextAction, Quote } from '../domain/swapMachine'

export const okxDemoQuote: Quote = {
  quoteId: 'okx_demo_eth_usdc',
  routeId: 'okx:ethereum:eth-usdc',
  expiresAt: '2026-04-25T12:00:00.000Z',
  providerName: 'OKX DEX',
  summary: 'ETH -> USDC via OKX DEX',
  fromTokenSymbol: 'ETH',
  toTokenSymbol: 'USDC',
  fromAmount: '1.00',
  toAmount: '1,998.40',
  estimatedGasUsd: '$2.84',
  priceImpactPercent: '0.04%',
  liquiditySources: [
    { name: 'Uniswap V3', percent: 72 },
    { name: 'Curve', percent: 28 },
  ],
  sourceKind: 'mock',
}

export function fetchOkxDemoQuote(): Promise<Quote> {
  return Promise.resolve(okxDemoQuote)
}

export function fetchMockQuote(): Promise<Quote> {
  return fetchOkxDemoQuote()
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
