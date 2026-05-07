/**
 * Merchant payment accounts
 */
export const MERCHANTS = {
  mtn: '32758790',
  airtel: '8021490',
} as const

export type MerchantNetwork = keyof typeof MERCHANTS

/**
 * Safe visual chars for short public codes
 * avoids: O 0 I 1 L
 */
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Generate short display code
 * Example: FG7X2K
 */
export const generateMerchantCode = (length = 6): string => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)

  return Array.from(bytes, (byte) =>
    SAFE_CHARS[byte % SAFE_CHARS.length]
  ).join('')
}

/**
 * Format code for UI
 * FG7X2K -> FG7 X2K
 */
export const formatMerchantCode = (code: string): string => {
  const clean = code.replace(/\s+/g, '').toUpperCase()
  return `${clean.slice(0, 3)} ${clean.slice(3)}`
}

/**
 * Get real merchant number by network
 */
export const getMerchantNumber = (
  network: MerchantNetwork
): string => MERCHANTS[network]

/**
 * Optional: generate payment payload
 */
export const createMerchantPayment = (
  network: MerchantNetwork
) => {
  const code = generateMerchantCode()

  return {
    network,
    merchantNumber: getMerchantNumber(network),
    merchantCode: code,
    formattedCode: formatMerchantCode(code),
  }
}