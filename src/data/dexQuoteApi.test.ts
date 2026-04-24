import { describe, expect, test, vi } from 'vitest'
import { defaultDexQuoteIntent, fetchDexQuote } from './dexQuoteApi'

describe('dexQuoteApi', () => {
  test('normalizes a BFF quote response', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          quote: {
            quoteId: 'okx_live_quote',
            routeId: 'okx:ethereum:eth-usdc',
            expiresAt: '2026-04-25T12:00:00.000Z',
            providerName: 'OKX DEX',
            summary: 'ETH -> USDC via OKX DEX',
            fromTokenSymbol: 'ETH',
            toTokenSymbol: 'USDC',
            fromAmount: '1.00',
            toAmount: '2,001.20',
            estimatedGasUsd: '$2.70',
            priceImpactPercent: '0.03%',
            liquiditySources: [
              { name: 'Uniswap V3', percent: 70 },
              { name: 'Curve', percent: 30 },
            ],
            sourceKind: 'bff',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const quote = await fetchDexQuote(defaultDexQuoteIntent, {
      endpoint: '/api/dex/quote',
      fetcher,
    })

    expect(fetcher).toHaveBeenCalledWith(
      '/api/dex/quote',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(quote.providerName).toBe('OKX DEX')
    expect(quote.toAmount).toBe('2,001.20')
    expect(quote.liquiditySources).toEqual([
      { name: 'Uniswap V3', percent: 70 },
      { name: 'Curve', percent: 30 },
    ])
    expect(quote.sourceKind).toBe('bff')
  })

  test('falls back to the OKX demo quote when the BFF is unavailable', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('missing', { status: 404 }))

    const quote = await fetchDexQuote(defaultDexQuoteIntent, {
      endpoint: '/api/dex/quote',
      fetcher,
    })

    expect(quote.providerName).toBe('OKX DEX')
    expect(quote.routeId).toBe('okx:ethereum:eth-usdc')
    expect(quote.liquiditySources.length).toBeGreaterThan(0)
    expect(quote.sourceKind).toBe('mock')
  })
})
