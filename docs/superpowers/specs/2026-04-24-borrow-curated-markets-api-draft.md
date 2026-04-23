# Borrow Curated Markets API Draft

## GET /borrow/registry

Returns:
- `chains[]`
  - `ethereum | bsc | base`
- `protocols[]`
  - `aave | morpho | lista | fluid`
- `markets[]`
  - `id`
  - `chain`
  - `protocol`
  - `collateralToken`
  - `borrowToken`
  - `marketKey`
  - `enabled`
  - `mode`
    - `safe | degen`
  - `minAvailableLiquidityUsd`

Notes:
- This registry is a curated allowlist, not a full protocol inventory.
- `enabled: true` means the market is in scope, not that it will always return a live route.
- A market can still produce no row if its live liquidity is below `minAvailableLiquidityUsd`.

## POST /borrow/scan

Request:
- `chain`
- `collateralToken`
- `borrowToken`
- `amount`
- `protocols`
- `sortBy`
- `mode`

Response:
- `reason`
  - `ok`
  - `unsupported_pair`
  - `no_live_routes`
- `rows[]`
  - `id`
  - `chain`
  - `protocol`
  - `marketKey`
  - `collateralToken`
  - `borrowToken`
  - `borrowApr`
  - `supplyApr`
  - `rewardApr`
  - `netBorrowApr`
  - `maxLtv`
  - `availableLiquidityUsd`
  - `healthFactorHint`

Notes:
- The current UI contract returns only `reason` and `rows`.
- `generatedAt` and `staleAfter` are not part of the implemented response shape yet.
- `unsupported_pair` means the selected chain/collateral/borrow pair is outside the curated allowlist.
- `no_live_routes` means the pair is in scope, but no route passed protocol, mode, or live-liquidity filtering.
