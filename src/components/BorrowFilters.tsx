import type { FormEvent } from 'react'
import {
  supportedBorrowChains,
  type BorrowChain,
} from '../domain/borrowTypes'
import type { AppCopy } from '../i18n'

type BorrowFiltersProps = {
  chain: BorrowChain
  collateralToken: string
  borrowToken: string
  amount: string
  copy: AppCopy['borrow']
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
  copy,
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
        {copy.fields.chain}
        <select value={chain} onChange={(event) => onChainChange(event.target.value as BorrowChain)}>
          {supportedBorrowChains.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </label>

      <label>
        {copy.fields.collateralToken}
        <select
          value={collateralToken}
          onChange={(event) => onCollateralTokenChange(event.target.value)}
        >
          {tokenOptions.map((token) => (
            <option key={token || 'empty-collateral'} value={token}>
              {token || copy.placeholders.collateral}
            </option>
          ))}
        </select>
      </label>

      <label>
        {copy.fields.borrowToken}
        <select value={borrowToken} onChange={(event) => onBorrowTokenChange(event.target.value)}>
          {tokenOptions.map((token) => (
            <option key={token || 'empty-borrow'} value={token}>
              {token || copy.placeholders.borrow}
            </option>
          ))}
        </select>
      </label>

      <label>
        {copy.fields.amount}
        <input value={amount} onChange={(event) => onAmountChange(event.target.value)} />
      </label>

      <button type="submit">{copy.showRoutes}</button>
    </form>
  )
}
