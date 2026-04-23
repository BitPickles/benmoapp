export const supportedBorrowChains = ['ethereum', 'bsc', 'base'] as const
export type BorrowChain = (typeof supportedBorrowChains)[number]

export const supportedBorrowProtocols = ['aave', 'morpho', 'lista', 'fluid'] as const
export type BorrowProtocol = (typeof supportedBorrowProtocols)[number]

export type BorrowMode = 'safe' | 'degen'
export type BorrowSortKey = 'netBorrowApr' | 'borrowApr' | 'maxLtv'

export type BorrowQuery = {
  chain: BorrowChain
  collateralToken: string
  borrowToken: string
  amount: string
  protocols: BorrowProtocol[]
  sortBy: BorrowSortKey
  mode: BorrowMode
}

export type CuratedBorrowMarket = {
  id: string
  chain: BorrowChain
  protocol: BorrowProtocol
  collateralToken: string
  borrowToken: string
  marketKey: string
  enabled: boolean
  mode: BorrowMode
  minAvailableLiquidityUsd: number
}

export type BorrowRouteRow = {
  id: string
  chain: BorrowChain
  protocol: BorrowProtocol
  marketKey: string
  collateralToken: string
  borrowToken: string
  borrowApr: number
  supplyApr: number
  rewardApr: number
  netBorrowApr: number
  maxLtv: number
  availableLiquidityUsd: number
  healthFactorHint: string
}

export type BorrowScanResult =
  | {
      rows: [BorrowRouteRow, ...BorrowRouteRow[]]
      reason: 'ok'
    }
  | {
      rows: []
      reason: 'unsupported_pair' | 'no_live_routes'
    }

export function buildDefaultBorrowQuery(): BorrowQuery {
  return {
    chain: 'ethereum',
    collateralToken: '',
    borrowToken: '',
    amount: '',
    protocols: [...supportedBorrowProtocols],
    sortBy: 'netBorrowApr',
    mode: 'safe',
  }
}
