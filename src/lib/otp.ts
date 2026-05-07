/**
 * In-memory OTP store.
 * Each entry: sessionId → { code, expiresAt }
 * In production replace with Cloudflare KV:
 *   await c.env.KV.put(`otp:${sessionId}`, code, { expirationTtl: 900 })
 */

interface OTPEntry {
  code: string
  expiresAt: number // Unix ms
}

const otpStore = new Map<string, OTPEntry>()

const OTP_TTL_MS = 15 * 60 * 1000 // 15 minutes

/** Generate a 6-digit OTP and store it against the sessionId. */
export const generateOTP = (sessionId: string): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  otpStore.set(sessionId, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  })
  return code
}

/**
 * Verify the OTP.
 * Returns true on exact match — and immediately destroys the entry.
 * Returns false if missing, expired, or wrong.
 */
export const verifyOTP = (sessionId: string, input: string): boolean => {
  const entry = otpStore.get(sessionId)

  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(sessionId)
    return false
  }
  if (entry.code !== input.trim()) return false

  otpStore.delete(sessionId) // destroy immediately on match
  return true
}

/** Explicitly invalidate an OTP (e.g. on session expiry or resend). */
export const destroyOTP = (sessionId: string): void => {
  otpStore.delete(sessionId)
}

/** Check if a session has a live (non-expired) OTP pending. */
export const hasActiveOTP = (sessionId: string): boolean => {
  const entry = otpStore.get(sessionId)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(sessionId)
    return false
  }
  return true
}
