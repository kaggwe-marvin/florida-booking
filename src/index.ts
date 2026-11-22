import { Hono } from 'hono'
import { html } from 'hono/html'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import listings from './routes/listings'
import rooms from './routes/rooms'
import checkout from './routes/checkout'
import { Layout } from './components/layout'
import massages from './routes/massages'
import bookings from './routes/bookings'

type Bindings = {
  DB: D1Database
}
const app = new Hono<{ Bindings: Bindings }>()

/* ── Global middleware ── */
app.use('*', logger())
app.use('*', secureHeaders())

/* ── Routes ── */
app.route('/', listings)         // GET /
app.route('/listings', listings) // GET /listings/:filter?
app.route('/rooms', rooms)       // GET /rooms/:id
app.route('/massages', massages) // GET /massages/:id
app.route('/bookings', bookings) // GET /bookings/:ref
app.route('/checkout', checkout) // GET /checkout/:roomId

/* ── 404 fallback ── */
app.notFound((c) =>
  c.html(
    Layout({
      title: 'Page Not Found',
      children: html`
        <div
          class="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4"
        >
          <i class="ri-map-pin-off-line text-5xl text-mist"></i>
          <h2 class="display text-3xl font-light text-charcoal">
            404 — Not Found
          </h2>
          <p class="text-sm text-silver">
            The page you're looking for doesn't exist.
          </p>
          <a
            href="/"
            class="btn-primary px-6 py-3 rounded-2xl text-sm font-medium no-underline"
          >
            Back to Home
          </a>
        </div>
      `,
    }),
    404
  )
)

/* ── Global error handler ── */
app.onError((err, c) => {
  console.error(err)
  return c.html(
    Layout({
      title: 'Something went wrong',
      children: html`
        <div
          class="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4"
        >
          <i class="ri-error-warning-line text-5xl text-mist"></i>
          <h2 class="display text-3xl font-light text-charcoal">
            Something went wrong
          </h2>
          <p class="text-sm text-silver">${err.message}</p>
          <a
            href="/"
            class="btn-primary px-6 py-3 rounded-2xl text-sm font-medium no-underline"
          >
            Back to Home
          </a>
        </div>
      `,
    }),
    500
  )
})

export default app
