import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { Layout } from '../components/layout'
import { getBookingByRef } from '../db/bookings'
import { findRoom } from '../db/rooms'
import { findMassage } from '../db/massage'

const bookings = new Hono()

/* ─────────────────────────────────────────────────────────
   GET /bookings/:ref
───────────────────────────────────────────────────────── */
bookings.get('/:ref', (c) => {
  const ref     = c.req.param('ref')
  const booking = getBookingByRef(ref)

  if (!booking) {
    return c.html(
      Layout({
        title: 'Booking Not Found',
        children: html`
          <div class="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4">
            <i class="ri-file-damage-line text-5xl text-mist"></i>
            <h2 class="display text-2xl text-charcoal font-light">Booking Not Found</h2>
            <p class="text-sm text-silver">
              This booking doesn't exist, is pending, or has expired.
            </p>
            <a href="/" class="btn-primary px-6 py-3 rounded-2xl text-sm font-medium no-underline">
              Back to Listings
            </a>
          </div>
        `,
      }),
      404
    )
  }

  let itemName = 'Reserved Service'
  let itemType = ''
  if (booking.item_kind === 'room') {
    const room = findRoom(booking.item_id)
    itemName   = room?.name ?? booking.item_id
    itemType   = room?.type ?? 'Room'
  } else {
    const massage = findMassage(booking.item_id)
    itemName      = massage?.name ?? booking.item_id
    itemType      = 'Massage'
  }

  const isMassage  = booking.item_kind === 'massage'
  const checkIn    = booking.start_date
  const checkOut   = (() => {
    const d = new Date(checkIn)
    d.setDate(d.getDate() + booking.nights)
    return d.toISOString().split('T')[0]
  })()

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })

  return c.html(
    Layout({
      title: `Booking ${ref}`,
      children: html`
        <div class="slide-up">

          <!-- HEADER -->
          <header class="sticky top-0 z-20 bg-pearl/80 backdrop-blur-sm border-b border-mist px-5 py-3 flex items-center gap-3">
            <a href="/" class="w-9 h-9 rounded-full bg-cloud flex items-center justify-center">
              <i class="ri-arrow-left-line text-charcoal text-sm"></i>
            </a>
            <div>
              <p class="text-xs text-silver">Booking</p>
              <h2 class="display text-lg font-light text-charcoal leading-tight">${ref}</h2>
            </div>
            <!-- Active badge -->
            <div class="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span class="text-xs text-green-700 font-medium">Active</span>
            </div>
          </header>

          <main class="px-5 py-5 space-y-4 pb-10">

            <!-- SUMMARY CARD -->
            <div class="rounded-2xl border border-mist bg-white divide-y divide-cloud overflow-hidden">
              <div class="px-4 py-3 flex justify-between text-sm">
                <span class="text-silver">Reference</span>
                <span class="font-medium text-charcoal" style="font-family:'Courier New',monospace">${ref}</span>
              </div>
              <div class="px-4 py-3 flex justify-between text-sm">
                <span class="text-silver">${isMassage ? 'Service' : 'Room'}</span>
                <span class="font-medium text-charcoal">${itemName}</span>
              </div>
              <div class="px-4 py-3 flex justify-between text-sm">
                <span class="text-silver">Type</span>
                <span class="font-medium text-charcoal">${itemType}</span>
              </div>

              ${isMassage
                ? html`
                    <div class="px-4 py-3 flex justify-between text-sm">
                      <span class="text-silver">Duration</span>
                      <span class="font-medium text-charcoal">At your convenience</span>
                    </div>
                  `
                : html`
                    <div class="px-4 py-3 flex justify-between text-sm">
                      <span class="text-silver">Check-in</span>
                      <span class="font-medium text-charcoal">${fmt(checkIn)}</span>
                    </div>
                    <div class="px-4 py-3 flex justify-between text-sm">
                      <span class="text-silver">Check-out</span>
                      <span class="font-medium text-charcoal">${fmt(checkOut)}</span>
                    </div>
                    <div class="px-4 py-3 flex justify-between text-sm">
                      <span class="text-silver">Nights</span>
                      <span class="font-medium text-charcoal">${booking.nights}</span>
                    </div>
                  `}

              <div class="px-4 py-3 flex justify-between text-sm">
                <span class="text-silver">Total Paid</span>
                <span class="font-semibold text-charcoal">${booking.total.toLocaleString()}UGX</span>
              </div>
            </div>

            <!-- RECEIPT NOTICE -->
            <div class="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <i class="ri-information-line text-blue-400 text-base mt-0.5 flex-shrink-0"></i>
              <p class="text-xs text-blue-700 leading-relaxed">
                Show this page at reception as proof of payment.
                Use the button below to download a printable receipt.
              </p>
            </div>

            <!-- ACTIONS -->
            <div class="flex flex-col gap-3">
              
                <a href="/bookings/${ref}/receipt"
                class="btn-primary w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 no-underline"
              >
                <i class="ri-download-line"></i> Download Receipt
              </a>
              
              <a  href="/"
                class="btn-ghost w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 no-underline"
              >
                <i class="ri-home-line"></i> Back to Listings
              </a>
            </div>

          </main>
        </div>
      `,
    })
  )
})

/* ─────────────────────────────────────────────────────────
   GET /bookings/:ref/receipt  — printable HTML receipt
───────────────────────────────────────────────────────── */
bookings.get('/:ref/receipt', (c) => {
  const ref     = c.req.param('ref')
  const booking = getBookingByRef(ref)

  if (!booking) return c.text('Booking not found or not active', 404)

  let itemName = 'Reserved Service'
  let itemType = ''
  if (booking.item_kind === 'room') {
    const room = findRoom(booking.item_id)
    itemName   = room?.name ?? booking.item_id
    itemType   = room?.type ?? 'Room'
  } else {
    const massage = findMassage(booking.item_id)
    itemName      = massage?.name ?? booking.item_id
    itemType      = 'Massage'
  }

  const isMassage = booking.item_kind === 'massage'
  const checkIn   = booking.start_date
  const checkOut  = (() => {
    const d = new Date(checkIn)
    d.setDate(d.getDate() + booking.nights)
    return d.toISOString().split('T')[0]
  })()
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
  const issuedAt = new Date().toLocaleDateString('en-UG', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  // Return a standalone print-optimised HTML page (no Layout wrapper)
  return c.html(html`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Receipt — ${ref}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background: #fff;
          color: #1a1a1a;
          padding: 40px;
          max-width: 480px;
          margin: 0 auto;
        }
        .logo {
          font-size: 20px;
          font-weight: 300;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .sub {
          font-size: 11px;
          color: #888;
          margin-bottom: 32px;
        }
        .badge {
          display: inline-block;
          background: #f0faf4;
          border: 1px solid #27ae60;
          color: #27ae60;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 99px;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        h1 {
          font-size: 28px;
          font-weight: 300;
          margin-bottom: 4px;
        }
        .ref {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #555;
          margin-bottom: 32px;
        }
        .divider {
          border: none;
          border-top: 1px solid #eee;
          margin: 20px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 8px 0;
        }
        .row .label { color: #888; }
        .row .value { font-weight: 500; }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 600;
          padding: 12px 0;
          border-top: 2px solid #1a1a1a;
          margin-top: 8px;
        }
        .footer {
          margin-top: 48px;
          font-size: 10px;
          color: #aaa;
          text-align: center;
          line-height: 1.6;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="logo">Florida Guest House</div>
      <div class="sub">Kireka, Kampala — Uganda</div>

      <div class="badge">✓ Payment Confirmed</div>

      <h1>Receipt</h1>
      <div class="ref">${ref}</div>

      <div class="row">
        <span class="label">Issued</span>
        <span class="value">${issuedAt}</span>
      </div>

      <hr class="divider" />

      <div class="row">
        <span class="label">${isMassage ? 'Service' : 'Room'}</span>
        <span class="value">${itemName}</span>
      </div>
      <div class="row">
        <span class="label">Type</span>
        <span class="value">${itemType}</span>
      </div>

      ${isMassage
        ? html`
            <div class="row">
              <span class="label">Duration</span>
              <span class="value">At your convenience</span>
            </div>
          `
        : html`
            <div class="row">
              <span class="label">Check-in</span>
              <span class="value">${fmt(checkIn)}</span>
            </div>
            <div class="row">
              <span class="label">Check-out</span>
              <span class="value">${fmt(checkOut)}</span>
            </div>
            <div class="row">
              <span class="label">Nights</span>
              <span class="value">${booking.nights}</span>
            </div>
          `}

      <div class="total-row">
        <span>Total Paid</span>
        <span>${booking.total.toLocaleString()} UGX</span>
      </div>

      <div class="footer">
        Florida Guest House · Kireka, Kampala<br/>
        This receipt serves as proof of payment.<br/>
        Please present it at reception on arrival.
      </div>

      <div class="no-print" style="margin-top:32px;text-align:center">
        <button
          onclick="window.print()"
          style="background:#1a1a1a;color:#fff;border:none;padding:12px 32px;border-radius:99px;font-size:13px;cursor:pointer"
        >
          Print / Save as PDF
        </button>
      </div>
    </body>
    </html>
  `)
})

export default bookings