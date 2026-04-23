import type { CuratedBorrowMarket } from '../domain/borrowTypes'

export const mockBorrowRegistry: CuratedBorrowMarket[] = [
  {
    id: 'eth-aave-eth-usdc-safe',
    chain: 'ethereum',
    protocol: 'aave',
    collateralToken: 'ETH',
    borrowToken: 'USDC',
    marketKey: 'ethereum:aave:eth-usdc-core',
    enabled: true,
    mode: 'safe',
    minAvailableLiquidityUsd: 500000,
  },
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
  {
    id: 'base-fluid-eth-usdc-safe-disabled',
    chain: 'base',
    protocol: 'fluid',
    collateralToken: 'ETH',
    borrowToken: 'USDC',
    marketKey: 'base:fluid:eth-usdc-core',
    enabled: false,
    mode: 'safe',
    minAvailableLiquidityUsd: 100000,
  },
]
