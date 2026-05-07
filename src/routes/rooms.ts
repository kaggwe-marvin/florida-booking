import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from '../components/layout'
import { RoomDetail } from '../components/room-detail'
import { findRoom } from '../db/rooms' 
import type { Room } from '../data/room'

const SITE_URL = 'http://localhost:3000' // Update this to your actual site URL in production

const rooms = new Hono()

rooms.get('/:id', (c) => {
  const room = findRoom(c.req.param('id'))

  if (!room) {
    return c.html(
      Layout({
        title: 'Room Not Found — Florida Guest House Kireka',
        noindex: true,
        children: html`
          <div class="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4">
            <i class="ri-hotel-bed-line text-5xl text-mist"></i>
            <h2 class="display text-2xl text-charcoal font-light">Room Not Found</h2>
            <p class="text-sm text-silver">This room doesn't exist or is no longer available.</p>
            <a href="/" class="btn-primary px-6 py-3 rounded-2xl text-sm font-medium no-underline">
              Back to Listings
            </a>
          </div>
        `,
      }),
      404
    )
  }

  // OPTIONAL: Removed the "if (!room.available)" 409 block. 
  // It's better to let them see the room and show "Currently Booked" 
  // inside the RoomDetail component instead of a full error page.

  return c.html(
    Layout({
      title: `${room.name} — ${room.type} Room at Florida Guest House Kireka`,

      
      description: `Book ${room.name} at Florida Guest House, Kireka, Kampala. ${room.type} room with ${room.beds}, modern amenities near Namboole Stadium. From ${room.rate.toLocaleString()} UGX/night.`,

      
      canonical: `${SITE_URL}/rooms/${room.id}`,
      children: html`
        <!-- Simple Back Nav (Matches your new clean style) -->
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
            <p class="text-xs text-silver">${room.type}</p>
            <h2 class="display text-lg font-light text-charcoal leading-tight">
              ${room.name}
            </h2>
          </div>
        </header>

        <main>
          ${RoomDetail(room)}
        </main>
      `,
    })
  )
})

export default rooms
