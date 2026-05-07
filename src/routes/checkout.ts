import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from '../components/layout'
import { RoomCheckoutForm, MassageCheckoutForm } from '../components/checkout-form'
import { SuccessScreen } from '../components/success'
import { generateOTP, verifyOTP, destroyOTP } from '../lib/otp'
import { findRoom } from '../db/rooms'
import { findMassage } from '../db/massage'
import { createBooking, activateBooking, expireStaleBookings, getBooking, saveRef } from '../db/bookings'

const checkout = new Hono()

//  Security headers on ALL checkout routes
checkout.use('/*', async (c, next) => {
  await next()
  // Block crawlers at HTTP level (overrides any meta tag)
  c.header('X-Robots-Tag', 'noindex, nofollow')
  // Prevent this page being loaded in iframes (clickjacking)
  c.header('X-Frame-Options', 'DENY')
  // Block MIME sniffing
  c.header('X-Content-Type-Options', 'nosniff')
  // Don't send referrer when leaving checkout
  c.header('Referrer-Policy', 'no-referrer')
  // Basic CSP — tighten further if you can
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'")
})

/* ─────────────────────────────────────────────────────────
   GET /checkout/confirmed
───────────────────────────────────────────────────────── */
checkout.get('/confirmed', (c) => {
  const bookingId = c.req.query('bookingId')
  const ref       = c.req.query('ref') ?? 'FGH-000000'

  const booking = bookingId ? getBooking(bookingId) : undefined

  let itemName = 'Reserved Service'
  if (booking) {
    if (booking.item_kind === 'room') {
      const room = findRoom(booking.item_id)
      itemName   = room?.name ?? booking.item_id
    } else {
      const massage = findMassage(booking.item_id)
      itemName      = massage?.name ?? booking.item_id
    }
  }

  return c.html(
    Layout({
      title: 'Booking Confirmed — Florida Guest House',
      noindex: true,
      children: SuccessScreen({
        ref,
        roomName: itemName,
        total:    `${(booking?.total ?? 0).toLocaleString()}UGX`,
        checkIn:  booking?.start_date,
        nights:   booking?.nights,
        kind:     booking?.item_kind ?? 'room',
      }),
    })
  )
})

/* ─────────────────────────────────────────────────────────
   POST /checkout/verify  — rate limit + input hardening
───────────────────────────────────────────────────────── */

// Simple in-memory rate limiter: max 5 attempts per sessionId per 10 min
const otpAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(sessionId: string): boolean {
  const now  = Date.now()
  const entry = otpAttempts.get(sessionId)

  if (!entry || now > entry.resetAt) {
    otpAttempts.set(sessionId, { count: 1, resetAt: now + 10 * 60 * 1000 })
    return true // allowed
  }

  if (entry.count >= 5) return false // blocked

  entry.count++
  return true
}

checkout.post('/verify', async (c) => {
  let body: { sessionId?: string; otp?: string }

  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, message: 'Invalid request body.' }, 400)
  }

  const { sessionId, otp } = body

  if (!sessionId || !otp) {
    return c.json({ success: false, message: 'sessionId and otp are required.' }, 400)
  }

 // ✅ Reject obviously fake sessionIds early
  if (typeof sessionId !== 'string' || sessionId.length > 128) {
    return c.json({ success: false, message: 'Invalid session.' }, 400)
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return c.json({ success: false, message: 'OTP must be exactly 6 digits.' }, 400)
  }

  // ✅ Rate limit — 5 attempts per session per 10 minutes
  if (!checkRateLimit(sessionId)) {
    return c.json({ success: false, message: 'Too many attempts. Please wait 10 minutes.' }, 429)
  }

  const valid = verifyOTP(sessionId, otp)
  if (!valid) {
    return c.json(
      { success: false, message: 'Incorrect or expired code. Please try again.' },
      401
    )
  }

   // ✅ Clear rate limit on success
  otpAttempts.delete(sessionId)
  activateBooking(sessionId)

  const booking = getBooking(sessionId)
  console.info(`[VERIFY] sessionId=${sessionId} booking=`, booking)

  const ref = `FGH-${Math.floor(100000 + Math.random() * 900000)}`
  saveRef(sessionId, ref)

  return c.json({
    success:    true,
    ref,
    bookingId:  sessionId,
    start_date: booking?.start_date,
    nights:     booking?.nights,
    total:      booking?.total,
    kind:       booking?.item_kind,
    item_id:    booking?.item_id,
  })
})

/* ─────────────────────────────────────────────────────────
   POST /checkout/resend-otp  — rate limit resends too
───────────────────────────────────────────────────────── */
const resendAttempts = new Map<string, { count: number; resetAt: number }>()

checkout.post('/resend-otp', async (c) => {
  let body: { sessionId?: string }

  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, message: 'Invalid request body.' }, 400)
  }

  const { sessionId } = body
  if (!sessionId) {
    return c.json({ success: false, message: 'sessionId is required.' }, 400)
  }

  // ✅ Max 3 resends per session
  const now   = Date.now()
  const entry = resendAttempts.get(sessionId)

  if (entry && now < entry.resetAt && entry.count >= 3) {
    return c.json({ success: false, message: 'Too many resend requests. Please wait.' }, 429)
  }

  resendAttempts.set(sessionId, {
    count:   (entry && now < entry.resetAt ? entry.count : 0) + 1,
    resetAt: now + 10 * 60 * 1000,
  })

  destroyOTP(sessionId)
  const newOTP = generateOTP(sessionId)
  console.info(`[OTP Resend] session=${sessionId} newCode=${newOTP}`)

  return c.json({ success: true, message: 'New OTP sent.' })
})

/* ─────────────────────────────────────────────────────────
   GET /checkout/massage/:massageId?network=mtn
───────────────────────────────────────────────────────── */
checkout.get('/massage/:massageId', (c) => {
  expireStaleBookings()

  const massage = findMassage(c.req.param('massageId'))
  if (!massage) return c.text('Massage service not found', 404)
  if (!massage.available) return c.redirect(`/massages/${massage.id}`)

  const network    = (c.req.query('network') ?? 'mtn') as 'mtn' | 'airtel'
  const start_date = new Date().toISOString().split('T')[0]

  const booking = createBooking({
    item_id:   massage.id,
    item_kind: 'massage',
    nights:    1,
    total:     massage.rate,
    start_date,
  })

  const otp = generateOTP(booking.id)
  console.info(`[OTP] session=${booking.id} code=${otp}`)

  return c.html(
    Layout({
      title: `Checkout — ${massage.name}`,
       noindex: true,
      children: html`${MassageCheckoutForm({
        massage,
        sessionId:    booking.id,
        merchantCode: booking.id.slice(0, 8).toUpperCase(),
        network,
      })}`,
    })
  )
})

/* ─────────────────────────────────────────────────────────
   GET /checkout/:roomId?network=mtn&nights=2&start_date=2026-04-27
   ↑ MUST be last — wildcard catches everything above if placed first
───────────────────────────────────────────────────────── */
checkout.get('/:roomId', (c) => {
  expireStaleBookings()

  const room = findRoom(c.req.param('roomId'))
  if (!room) return c.text('Room not found', 404)
  if (!room.available) return c.redirect(`/rooms/${room.id}`)

  const network    = (c.req.query('network') ?? 'mtn') as 'mtn' | 'airtel'
  const nights     = Math.max(1, parseInt(c.req.query('nights') ?? '1'))
  const start_date = c.req.query('start_date') ?? new Date().toISOString().split('T')[0]
  const total      = room.rate * nights

  const booking = createBooking({
    item_id:   room.id,
    item_kind: 'room',
    nights,
    total,
    start_date,
  })

  const otp = generateOTP(booking.id)
  console.info(`[OTP] session=${booking.id} code=${otp}`)

  return c.html(
    Layout({
      title: `Checkout — ${room.name}`,
      noindex: true,
      children: html`${RoomCheckoutForm({
        room,
        nights,
        sessionId:    booking.id,
        merchantCode: booking.id.slice(0, 8).toUpperCase(),
        network,
      })}`,
    })
  )
})

export default checkout