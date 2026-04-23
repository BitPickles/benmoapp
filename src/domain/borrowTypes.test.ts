import { expectTypeOf, describe, expect, it } from 'vitest'
import { buildBorrowScanResult, fetchCuratedBorrowRoutes } from '../data/borrowApi'
import {
  buildDefaultBorrowQuery,
  supportedBorrowChains,
  supportedBorrowProtocols,
  type BorrowRouteRow,
  type CuratedBorrowMarket,
} from './borrowTypes'

describe('borrow curated market scope', () => {
  it('locks the first release to the requested chains and protocols', () => {
    expect(supportedBorrowChains).toEqual(['ethereum', 'bsc', 'base'])
    expect(supportedBorrowProtocols).toEqual(['aave', 'morpho', 'lista', 'fluid'])
  })

  it('defines a query shape for curated market scanning', () => {
    expect(buildDefaultBorrowQuery()).toEqual({
      chain: 'ethereum',
      collateralToken: '',
      borrowToken: '',
      amount: '',
      protocols: ['aave', 'morpho', 'lista', 'fluid'],
      sortBy: 'netBorrowApr',
      mode: 'safe',
    })
  })

  it('requires curated markets to carry display and filtering metadata', () => {
    const market = {
      id: 'morpho-eth-usdc-base-1',
      chain: 'base',
      protocol: 'morpho',
      collateralToken: 'ETH',
      borrowToken: 'USDC',
      marketKey: 'base:morpho:eth-usdc-core',
      enabled: true,
      mode: 'safe',
      minAvailableLiquidityUsd: 100000,
    } satisfies CuratedBorrowMarket

    expect(market.marketKey).toBe('base:morpho:eth-usdc-core')
    expectTypeOf(market.mode).toEqualTypeOf<'safe'>()
  })
})

describe('curated borrow adapter', () => {
  it('returns only enabled and usable markets from the registry', async () => {
    const result = await fetchCuratedBorrowRoutes({
      chain: 'base',
      collateralToken: 'ETH',
      borrowToken: 'USDC',
      amount: '1000',
      protocols: ['aave', 'morpho', 'lista', 'fluid'],
      sortBy: 'netBorrowApr',
      mode: 'safe',
    })

    expect(result.reason).toBe('ok')
    expect(result.rows.map((row) => row.id)).toEqual(['route-base-morpho-eth-usdc-safe'])
    expect(result.rows.every((row) => row.chain === 'base')).toBe(true)
    expect(result.rows.every((row) => row.protocol === 'morpho')).toBe(true)
    expect(result.rows.every((row) => row.collateralToken === 'ETH')).toBe(true)
    expect(result.rows.every((row) => row.borrowToken === 'USDC')).toBe(true)
    expect(result.rows.every((row) => row.availableLiquidityUsd >= 100000)).toBe(true)
  })

  it('applies protocol filtering from the query before returning rows', async () => {
    const result = await fetchCuratedBorrowRoutes({
      chain: 'base',
      collateralToken: 'ETH',
      borrowToken: 'USDC',
      amount: '1000',
      protocols: ['aave'],
      sortBy: 'netBorrowApr',
      mode: 'safe',
    })

    expect(result).toEqual({
      rows: [],
      reason: 'no_live_routes',
    })
  })

  it('applies token filtering from the query before returning rows', async () => {
    const result = await fetchCuratedBorrowRoutes({
      chain: 'base',
      collateralToken: 'ETH',
      borrowToken: 'DAI',
      amount: '1000',
      protocols: ['morpho'],
      sortBy: 'netBorrowApr',
      mode: 'safe',
    })

    expect(result).toEqual({
      rows: [],
      reason: 'unsupported_pair',
    })
  })

  it('rejects rows whose metadata drifts from the matched curated market', async () => {
    const driftedRows: BorrowRouteRow[] = [
      {
        id: 'route-base-morpho-eth-usdc-safe',
        chain: 'base',
        protocol: 'morpho',
        marketKey: 'base:morpho:eth-usdc-core',
        collateralToken: 'ETH',
        borrowToken: 'USDC',
        borrowApr: 4.2,
        supplyApr: 1.1,
        rewardApr: 0.4,
        netBorrowApr: 2.7,
        maxLtv: 0.86,
        availableLiquidityUsd: 250000,
        healthFactorHint: 'Conservative buffer above liquidation threshold',
      },
      {
      id: 'route-base-morpho-drifted-metadata',
      chain: 'base',
      protocol: 'fluid',
      marketKey: 'base:morpho:eth-usdc-core',
      collateralToken: 'WBTC',
      borrowToken: 'DAI',
      borrowApr: 3.4,
      supplyApr: 0.7,
      rewardApr: 0.1,
      netBorrowApr: 2.6,
      maxLtv: 0.72,
      availableLiquidityUsd: 400000,
      healthFactorHint: 'Injected regression case for market metadata drift',
      },
    ]

    const result = buildBorrowScanResult(
      {
        chain: 'base',
        collateralToken: 'ETH',
        borrowToken: 'USDC',
        amount: '1000',
        protocols: ['morpho'],
        sortBy: 'netBorrowApr',
        mode: 'safe',
      },
      [
        {
          id: 'base-morpho-eth-usdc-safe',
          chain: 'base',
          protocol: 'morpho',
          collateralToken: 'ETH',
          borrowToken: 'USDC',
          marketKey: 'base:morpho:eth-usdc-core',
          enabled: true,
          mode: 'safe',
          minAvailableLiquidityUsd: 100000,
        },
      ],
      driftedRows,
    )

    expect(result.reason).toBe('ok')
    expect(result.rows.map((row) => row.id)).toEqual(['route-base-morpho-eth-usdc-safe'])
  })
})
