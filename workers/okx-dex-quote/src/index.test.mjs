import { describe, expect, test, vi } from 'vitest'
import {
  buildOkxQuoteRequest,
  formatUnits,
  handleQuoteRequest,
  normalizeOkxQuoteResponse,
} from './index.mjs'

const env = {
  OKX_API_KEY: 'test-api-key',
  OKX_SECRET_KEY: 'test-secret-key',
  OKX_PASSPHRASE: 'test-passphrase',
  ALLOWED_ORIGINS: 'https://bitpickles.github.io,http://localhost:4173',
}

const quoteIntent = {
  chainIndex: '1',
  amount: '1000000000000000000',
  fromTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  fromTokenSymbol: 'ETH',
  toTokenSymbol: 'USDC',
  swapMode: 'exactIn',
}

const okxQuoteResponse = {
  code: '0',
  data: [
    {
      chainIndex: '1',
      dexRouterList: [
        {
          routerPercent: '100',
          subRouterList: [
            {
              dexProtocol: [
                { dexName: 'Uniswap V3', percent: '70' },
                { dexName: 'Curve', percent: '30' },
              ],
            },
          ],
        },
      ],
      estimateGasFee: '135000',
      fromToken: {
        decimal: '18',
        tokenSymbol: 'ETH',
      },
      fromTokenAmount: '1000000000000000000',
      priceImpactPercentage: '0.04',
      swapMode: 'exactIn',
      toToken: {
        decimal: '6',
        tokenSymbol: 'USDC',
      },
      toTokenAmount: '1998400000',
      tradeFee: '2.84',
    },
  ],
  msg: '',
}

describe('okx quote worker', () => {
  test('builds the OKX quote URL with supported query parameters', () => {
    const request = buildOkxQuoteRequest(quoteIntent)

    expect(request.url).toContain('https://web3.okx.com/api/v5/dex/aggregator/quote?')
    expect(request.requestPath).toContain('/api/v5/dex/aggregator/quote?')
    expect(request.url).toContain('amount=1000000000000000000')
    expect(request.url).toContain('chainIndex=1')
    expect(request.url).toContain('swapMode=exactIn')
  })

  test('formats minimal token units without losing integer precision', () => {
    expect(formatUnits('1000000000000000000', 18)).toBe('1')
    expect(formatUnits('1998400000', 6)).toBe('1998.4')
  })

  test('normalizes an OKX quote response into the Pangolins quote contract', () => {
    const quote = normalizeOkxQuoteResponse(okxQuoteResponse)

    expect(quote).toMatchObject({
      providerName: 'OKX DEX',
      routeId: 'okx:1:eth-usdc',
      fromTokenSymbol: 'ETH',
      toTokenSymbol: 'USDC',
      fromAmount: '1',
      toAmount: '1,998.4',
      estimatedGasUsd: '$2.84',
      priceImpactPercent: '0.04%',
      sourceKind: 'bff',
    })
    expect(quote.liquiditySources).toEqual([
      { name: 'Uniswap V3', percent: 70 },
      { name: 'Curve', percent: 30 },
    ])
  })

  test('returns a signed live quote response for allowed origins', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(okxQuoteResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const request = new Request('https://worker.example/api/dex/quote', {
      method: 'POST',
      headers: {
        Origin: 'https://bitpickles.github.io',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteIntent),
    })

    const response = await handleQuoteRequest(request, env, { fetcher })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://bitpickles.github.io')
    expect(payload.quote.providerName).toBe('OKX DEX')
    expect(payload.quote.sourceKind).toBe('bff')
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('https://web3.okx.com/api/v5/dex/aggregator/quote?'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'OK-ACCESS-KEY': 'test-api-key',
          'OK-ACCESS-PASSPHRASE': 'test-passphrase',
          'OK-ACCESS-SIGN': expect.any(String),
          'OK-ACCESS-TIMESTAMP': expect.any(String),
        }),
      }),
    )
  })

  test('rejects requests when OKX credentials are missing', async () => {
    const request = new Request('https://worker.example/api/dex/quote', {
      method: 'POST',
      headers: {
        Origin: 'https://bitpickles.github.io',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteIntent),
    })

    const response = await handleQuoteRequest(request, {}, { fetcher: vi.fn() })
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload.error).toBe('OKX credentials are not configured')
  })
})
