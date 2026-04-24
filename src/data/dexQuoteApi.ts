import type { Quote, QuoteLiquiditySource } from '../domain/swapMachine'
import { fetchOkxDemoQuote } from '../mocks/mockSwapData'

export type DexQuoteIntent = {
  chainIndex: string
  chainName: string
  fromTokenAddress: string
  toTokenAddress: string
  fromTokenSymbol: string
  toTokenSymbol: string
  amount: string
  amountLabel: string
  swapMode: 'exactIn' | 'exactOut'
  slippagePercent: string
}

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export const defaultDexQuoteEndpoint = import.meta.env.VITE_DEX_QUOTE_ENDPOINT?.trim() || '/api/dex/quote'

export const defaultDexQuoteIntent: DexQuoteIntent = {
  chainIndex: '1',
  chainName: 'Ethereum',
  fromTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  fromTokenSymbol: 'ETH',
  toTokenSymbol: 'USDC',
  amount: '1000000000000000000',
  amountLabel: '1.00',
  swapMode: 'exactIn',
  slippagePercent: '0.3',
}

function isLiquiditySource(value: unknown): value is QuoteLiquiditySource {
  if (!value || typeof value !== 'object') {
    return false
  }

  const source = value as Partial<QuoteLiquiditySource>
  return typeof source.name === 'string' && typeof source.percent === 'number'
}

function isQuote(value: unknown): value is Quote {
  if (!value || typeof value !== 'object') {
    return false
  }

  const quote = value as Partial<Quote>
  return (
    typeof quote.quoteId === 'string' &&
    typeof quote.routeId === 'string' &&
    typeof quote.expiresAt === 'string' &&
    typeof quote.providerName === 'string' &&
    typeof quote.summary === 'string' &&
    typeof quote.fromTokenSymbol === 'string' &&
    typeof quote.toTokenSymbol === 'string' &&
    typeof quote.fromAmount === 'string' &&
    typeof quote.toAmount === 'string' &&
    typeof quote.estimatedGasUsd === 'string' &&
    typeof quote.priceImpactPercent === 'string' &&
    Array.isArray(quote.liquiditySources) &&
    quote.liquiditySources.every(isLiquiditySource) &&
    (quote.sourceKind === 'bff' || quote.sourceKind === 'mock')
  )
}

function unwrapQuote(payload: unknown): Quote | null {
  if (isQuote(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object' && 'quote' in payload) {
    const quote = (payload as { quote: unknown }).quote
    return isQuote(quote) ? quote : null
  }

  return null
}

export async function fetchDexQuote(
  intent: DexQuoteIntent = defaultDexQuoteIntent,
  options: { endpoint?: string; fetcher?: Fetcher } = {},
): Promise<Quote> {
  const endpoint = options.endpoint ?? defaultDexQuoteEndpoint
  const fetcher = options.fetcher ?? globalThis.fetch

  if (!endpoint || !fetcher) {
    return fetchOkxDemoQuote()
  }

  try {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intent),
    })

    if (!response.ok) {
      return fetchOkxDemoQuote()
    }

    const quote = unwrapQuote(await response.json())
    return quote ?? fetchOkxDemoQuote()
  } catch {
    return fetchOkxDemoQuote()
  }
}
