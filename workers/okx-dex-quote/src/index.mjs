const OKX_QUOTE_PATH = '/api/v5/dex/aggregator/quote'
const OKX_QUOTE_URL = `https://web3.okx.com${OKX_QUOTE_PATH}`
const DEFAULT_ALLOWED_ORIGINS = [
  'https://bitpickles.github.io',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

const DEFAULT_DECIMALS = {
  ETH: 18,
  WETH: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
}

function textEncoder() {
  return new TextEncoder()
}

function base64FromArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

export async function createOkxSignature({ timestamp, method, requestPath, secretKey }) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder().encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder().encode(`${timestamp}${method}${requestPath}`),
  )

  return base64FromArrayBuffer(signature)
}

function allowedOriginsFromEnv(env) {
  if (!env.ALLOWED_ORIGINS) {
    return DEFAULT_ALLOWED_ORIGINS
  }

  return env.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function corsOrigin(request, env) {
  const origin = request.headers.get('Origin')
  if (!origin) {
    return '*'
  }

  return allowedOriginsFromEnv(env).includes(origin) ? origin : null
}

function corsHeaders(request, env) {
  const origin = corsOrigin(request, env)
  if (!origin) {
    return null
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function jsonResponse(request, env, payload, status = 200) {
  const cors = corsHeaders(request, env)
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(cors ?? {}),
  }

  return new Response(JSON.stringify(payload), { status, headers })
}

function normalizeTokenAddress(address) {
  return String(address ?? '').trim()
}

function validateQuoteIntent(value) {
  if (!value || typeof value !== 'object') {
    return { ok: false, error: 'Invalid JSON body' }
  }

  const intent = value
  const chainIndex = String(intent.chainIndex ?? '').trim()
  const amount = String(intent.amount ?? '').trim()
  const fromTokenAddress = normalizeTokenAddress(intent.fromTokenAddress)
  const toTokenAddress = normalizeTokenAddress(intent.toTokenAddress)
  const swapMode = String(intent.swapMode ?? 'exactIn').trim()

  if (!chainIndex || !amount || !fromTokenAddress || !toTokenAddress) {
    return { ok: false, error: 'Missing required quote fields' }
  }

  if (!/^\d+$/.test(amount)) {
    return { ok: false, error: 'Amount must be a positive integer in minimal units' }
  }

  if (swapMode !== 'exactIn' && swapMode !== 'exactOut') {
    return { ok: false, error: 'swapMode must be exactIn or exactOut' }
  }

  return {
    ok: true,
    intent: {
      chainIndex,
      amount,
      fromTokenAddress,
      toTokenAddress,
      swapMode,
      fromTokenSymbol: String(intent.fromTokenSymbol ?? '').trim(),
      toTokenSymbol: String(intent.toTokenSymbol ?? '').trim(),
    },
  }
}

export function buildOkxQuoteRequest(intent) {
  const params = new URLSearchParams({
    amount: intent.amount,
    chainIndex: intent.chainIndex,
    fromTokenAddress: intent.fromTokenAddress,
    toTokenAddress: intent.toTokenAddress,
    swapMode: intent.swapMode,
  })
  const query = params.toString()

  return {
    url: `${OKX_QUOTE_URL}?${query}`,
    requestPath: `${OKX_QUOTE_PATH}?${query}`,
  }
}

function decimalsFor(symbol, fallback) {
  const normalizedSymbol = String(symbol ?? '').toUpperCase()
  const parsed = Number(fallback)

  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed
  }

  return DEFAULT_DECIMALS[normalizedSymbol] ?? 18
}

export function formatUnits(value, decimals, maxFractionDigits = 6) {
  const cleanValue = String(value ?? '0')
  const normalizedDecimals = Math.max(0, Number(decimals) || 0)
  const raw = BigInt(cleanValue)
  const base = 10n ** BigInt(normalizedDecimals)
  const whole = raw / base
  const fraction = raw % base

  if (fraction === 0n || maxFractionDigits === 0) {
    return whole.toString()
  }

  const paddedFraction = fraction.toString().padStart(normalizedDecimals, '0')
  const visibleFraction = paddedFraction.slice(0, maxFractionDigits).replace(/0+$/, '')

  return visibleFraction ? `${whole.toString()}.${visibleFraction}` : whole.toString()
}

function formatDisplayNumber(value, maxFractionDigits = 6) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return value
  }

  return numberValue.toLocaleString('en-US', {
    maximumFractionDigits: maxFractionDigits,
  })
}

function formatUsd(value) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return '$0.00'
  }

  return `$${numberValue.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`
}

function formatPercent(value) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return '0%'
  }

  return `${numberValue.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}%`
}

function collectLiquiditySources(route) {
  const sourceWeights = new Map()

  for (const router of route.dexRouterList ?? []) {
    const routerPercent = Number(router.routerPercent ?? 100)

    for (const subRouter of router.subRouterList ?? []) {
      for (const protocol of subRouter.dexProtocol ?? []) {
        const protocolPercent = Number(protocol.percent ?? 0)
        const weightedPercent = Number.isFinite(routerPercent) && Number.isFinite(protocolPercent)
          ? (routerPercent * protocolPercent) / 100
          : protocolPercent
        const nextPercent = (sourceWeights.get(protocol.dexName) ?? 0) + weightedPercent
        sourceWeights.set(protocol.dexName, nextPercent)
      }
    }
  }

  return [...sourceWeights.entries()]
    .filter(([name, percent]) => typeof name === 'string' && name && percent > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([name, percent]) => ({ name, percent: Math.round(percent) }))
}

export function normalizeOkxQuoteResponse(okxPayload) {
  if (!okxPayload || okxPayload.code !== '0' || !Array.isArray(okxPayload.data) || okxPayload.data.length === 0) {
    throw new Error(okxPayload?.msg || 'OKX returned no quote')
  }

  const route = okxPayload.data[0]
  const fromTokenSymbol = route.fromToken?.tokenSymbol || 'ETH'
  const toTokenSymbol = route.toToken?.tokenSymbol || 'USDC'
  const fromDecimals = decimalsFor(fromTokenSymbol, route.fromToken?.decimal)
  const toDecimals = decimalsFor(toTokenSymbol, route.toToken?.decimal)
  const fromAmount = formatDisplayNumber(formatUnits(route.fromTokenAmount, fromDecimals, 6), 6)
  const toAmount = formatDisplayNumber(formatUnits(route.toTokenAmount, toDecimals, 6), 6)
  const liquiditySources = collectLiquiditySources(route)

  return {
    quoteId: `okx_${route.chainIndex}_${route.fromTokenAmount}_${route.toTokenAmount}`,
    routeId: `okx:${route.chainIndex}:${fromTokenSymbol.toLowerCase()}-${toTokenSymbol.toLowerCase()}`,
    expiresAt: new Date(Date.now() + 30_000).toISOString(),
    providerName: 'OKX DEX',
    summary: `${fromTokenSymbol} -> ${toTokenSymbol} via OKX DEX`,
    fromTokenSymbol,
    toTokenSymbol,
    fromAmount,
    toAmount,
    estimatedGasUsd: formatUsd(route.tradeFee),
    priceImpactPercent: formatPercent(route.priceImpactPercentage),
    liquiditySources: liquiditySources.length > 0 ? liquiditySources : [{ name: 'OKX DEX', percent: 100 }],
    sourceKind: 'bff',
  }
}

function hasOkxCredentials(env) {
  return Boolean(env.OKX_API_KEY && env.OKX_SECRET_KEY && env.OKX_PASSPHRASE)
}

export async function handleQuoteRequest(request, env, context = {}) {
  const fetcher = context.fetcher ?? fetch

  if (request.method === 'OPTIONS') {
    const cors = corsHeaders(request, env)
    return new Response(null, { status: cors ? 204 : 403, headers: cors ?? {} })
  }

  if (request.method !== 'POST') {
    return jsonResponse(request, env, { error: 'Method not allowed' }, 405)
  }

  if (!corsHeaders(request, env)) {
    return jsonResponse(request, env, { error: 'Origin not allowed' }, 403)
  }

  if (!hasOkxCredentials(env)) {
    return jsonResponse(request, env, { error: 'OKX credentials are not configured' }, 500)
  }

  let payload

  try {
    payload = await request.json()
  } catch {
    return jsonResponse(request, env, { error: 'Invalid JSON body' }, 400)
  }

  const validation = validateQuoteIntent(payload)

  if (!validation.ok) {
    return jsonResponse(request, env, { error: validation.error }, 400)
  }

  const { url, requestPath } = buildOkxQuoteRequest(validation.intent)
  const timestamp = new Date().toISOString()
  const signature = await createOkxSignature({
    timestamp,
    method: 'GET',
    requestPath,
    secretKey: env.OKX_SECRET_KEY,
  })

  const okxResponse = await fetcher(url, {
    method: 'GET',
    headers: {
      'OK-ACCESS-KEY': env.OKX_API_KEY,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': env.OKX_PASSPHRASE,
    },
  })
  const okxPayload = await okxResponse.json()

  if (!okxResponse.ok) {
    return jsonResponse(request, env, { error: 'OKX quote request failed', details: okxPayload?.msg ?? '' }, 502)
  }

  try {
    return jsonResponse(request, env, { quote: normalizeOkxQuoteResponse(okxPayload) })
  } catch (error) {
    return jsonResponse(request, env, { error: error.message }, 502)
  }
}

export default {
  fetch(request, env, context) {
    const url = new URL(request.url)

    if (url.pathname !== '/api/dex/quote') {
      return jsonResponse(request, env, { error: 'Not found' }, 404)
    }

    return handleQuoteRequest(request, env, context)
  },
}
