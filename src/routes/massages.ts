import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from '../components/layout'
import { MassageDetail } from '../components/massage-detail'
import { findMassage } from '../db/massage'


const SITE_URL = 'http://localhost:3000'



const massages = new Hono()

massages.get('/:id', (c) => {
  const massage = findMassage(c.req.param('id'))

  if (!massage) {
    return c.html(
      Layout({
        title: 'Service Not Found — Florida Guest House Kireka',
        noindex: true,
        children: html`
          <div class="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4">
            <i class="ri-hand-heart-line text-5xl text-mist"></i>
            <h2 class="display text-2xl text-charcoal font-light">Service Not Found</h2>
            <p class="text-sm text-silver">This massage service doesn't exist or is no longer available.</p>
            <a href="/" class="btn-primary px-6 py-3 rounded-2xl text-sm font-medium no-underline">
              Back to Listings
            </a>
          </div>
        `,
      }),
      404
    )
  }

  return c.html(
    Layout({
      title: `${massage.name} —  at Florida Guest House Kireka `,
      description: `Book a ${massage.name} at Florida Guest House, Kireka, Kampala. ${massage.type} massage, ${massage.duration} minutes. near Namboole Stadium. From ${massage.rate.toLocaleString()} UGX/session.`,
      canonical: `${SITE_URL}/massages/${massage.id}`,
      children: html`
        <header
          class="sticky top-0 z-20 bg-pearl/80 backdrop-blur-sm border-b border-mist px-5 py-3 flex items-center gap-3"
        >
          <a
            href="/"
            class="w-9 h-9 rounded-full bg-cloud flex items-center justify-center"
          >
            <i class="ri-arrow-left-line text-charcoal text-sm"></i>
          </a>
          <div>
            <p class="text-xs text-silver">${massage.type}</p>
            <h2 class="display text-lg font-light text-charcoal leading-tight">
              ${massage.name}
            </h2>
          </div>
        </header>
        <main>
          ${MassageDetail(massage)}
        </main>
      `,
    })
  )
})

export default massages