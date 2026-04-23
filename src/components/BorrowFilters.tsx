import type { FormEvent } from 'react'
import {
  supportedBorrowChains,
  type BorrowChain,
} from '../domain/borrowTypes'

type BorrowFiltersProps = {
  chain: BorrowChain
  collateralToken: string
  borrowToken: string
  amount: string
  onChainChange: (chain: BorrowChain) => void
  onCollateralTokenChange: (token: string) => void
  onBorrowTokenChange: (token: string) => void
  onAmountChange: (amount: string) => void
  onSubmit: () => void | Promise<void>
}

const tokenOptions = ['', 'ETH', 'USDC', 'BNB', 'USDT']

export function BorrowFilters({
  chain,
  collateralToken,
  borrowToken,
  amount,
  onChainChange,
  onCollateralTokenChange,
  onBorrowTokenChange,
  onAmountChange,
  onSubmit,
}: BorrowFiltersProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Chain
        <select value={chain} onChange={(event) => onChainChange(event.target.value as BorrowChain)}>
          {supportedBorrowChains.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </label>

      <label>
        Collateral Token
        <select
          value={collateralToken}
          onChange={(event) => onCollateralTokenChange(event.target.value)}
        >
          {tokenOptions.map((token) => (
            <option key={token || 'empty-collateral'} value={token}>
              {token || 'Select collateral'}
            </option>
          ))}
        </select>
      </label>

      <label>
        Borrow Token
        <select value={borrowToken} onChange={(event) => onBorrowTokenChange(event.target.value)}>
          {tokenOptions.map((token) => (
            <option key={token || 'empty-borrow'} value={token}>
              {token || 'Select borrow token'}
            </option>
          ))}
        </select>
      </label>

      <label>
        Borrow Amount
        <input value={amount} onChange={(event) => onAmountChange(event.target.value)} />
      </label>

      <button type="submit">Show Routes</button>
    </form>
  )
}
