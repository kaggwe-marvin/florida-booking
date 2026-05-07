import { html, raw } from 'hono/html'
import type { Room } from '../data/room'

export const RoomDetail = (room: Room): any => {
  const today = new Date().toISOString().split('T')[0]

  // ✅ JSON-LD structured data for this room
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": `${room.name} — Florida Guest House Kireka`,
    "description": `${room.type} room at Florida Guest House, Kireka, Kampala. ${room.beds}, ${room.sqft} sqft. Near Namboole National Stadium.`,
    "image": room.image_url,
    "priceRange": `${room.rate.toLocaleString()} UGX per night`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kireka",
      "addressLocality": "Kampala",
      "addressCountry": "UG"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": room.rating,
      "reviewCount": room.reviews
    }
  })

  return html`
    <div class="slide-up">
       ${raw(`<script type="application/ld+json">${jsonLd}</script>`)}
      <!-- HERO WITH IMAGE -->
      <div class="h-64 relative overflow-hidden bg-charcoal rounded-b-3xl">
        <img
          src="${room.image_url}"
          alt="${room.name} — ${room.type} room at Florida Guest House Kireka, Kampala"
          fetchpriority="high"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <div class="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 flex items-center justify-between border border-white/10">
            <div>
              <span class="tag text-white/70">${room.type}</span>
              <p class="text-white font-medium">${room.name}</p>
            </div>
            <div class="text-right">
              <p class="text-white font-semibold text-lg" id="stay-total">${room.rate.toLocaleString()}UGX</p>
              <p class="text-white/60 text-xs" id="per-night-label">per night</p>
            </div>
          </div>
        </div>
      </div>

      <!-- INFO PILLS -->
      <div class="px-5 mt-4 flex gap-2 flex-wrap">
        <span class="amenity-pill">
          <i class="ri-hotel-bed-line text-xs"></i>
          ${room.beds}
        </span>
        <span class="amenity-pill">
          <i class="ri-ruler-2-line text-xs"></i>
          ${room.sqft} sqft
        </span>
      </div>

      <!-- STAY DETAILS -->
      <div class="px-5 mt-6">
        <p class="text-xs text-silver mb-2 font-medium uppercase tracking-wider">Stay Details</p>
        <div class="rounded-xl bg-cloud px-4 py-3 space-y-3">

          <!-- Check-in -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-silver">Check-in</span>
            <span class="text-sm text-charcoal font-medium">${today}</span>
            <input type="hidden" id="start-date" value="${today}" />
          </div>

          <!-- Nights stepper + keyboard input -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-silver">Nights</span>
            <div class="flex items-center gap-2">
              <button
                onclick="changeNights(-1)"
                class="w-8 h-8 rounded-full bg-white border border-mist flex items-center justify-center text-charcoal"
              >
                <i class="ri-subtract-line text-sm"></i>
              </button>

              <input
                type="number"
                id="nights-input"
                value="1"
                min="1"
                max="365"
                oninput="onNightsInput()"
                class="w-12 text-center text-charcoal font-semibold text-sm border border-mist rounded-lg py-1 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                onclick="changeNights(1)"
                class="w-8 h-8 rounded-full bg-white border border-mist flex items-center justify-center text-charcoal"
              >
                <i class="ri-add-line text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Check-out -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-silver">Check-out</span>
            <span class="text-sm text-charcoal font-medium" id="checkout-date">${today}</span>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between border-t border-mist pt-3">
            <span class="text-xs text-silver">Total</span>
            <span class="text-charcoal font-bold text-sm" id="stay-total-pill">${room.rate.toLocaleString()}UGX</span>
          </div>
        </div>
      </div>

      <!-- NETWORK SELECT -->
      <div class="px-5 mt-4">
        <p class="text-xs text-silver mb-2 font-medium uppercase tracking-wider">Payment Network</p>
        <div class="relative">
          <select
            id="networkSelect"
            class="w-full px-4 py-3 border border-mist rounded-xl text-sm bg-white appearance-none"
          >
            <option value="mtn">MTN MoMo</option>
            <option value="airtel">Airtel Money</option>
          </select>
          <i class="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-silver pointer-events-none"></i>
        </div>
      </div>

      <!-- CTA -->
      <div class="px-5 mt-6 mb-8">
        <button
          onclick="goToCheckout()"
          class="btn-primary w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
        >
          <span>Reserve This Room</span>
          <i class="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>

    ${raw(`
      <script>
        const RATE = ${room.rate}

        function updateUI(nights) {
          const start    = new Date(document.getElementById('start-date').value)
          const checkout = new Date(start)
          checkout.setDate(checkout.getDate() + nights)

          document.getElementById('checkout-date').textContent =
            checkout.toISOString().split('T')[0]

          const total = (RATE * nights).toLocaleString() + 'UGX'
          document.getElementById('stay-total').textContent      = total
          document.getElementById('stay-total-pill').textContent = total

          document.getElementById('per-night-label').textContent =
            nights === 1 ? 'per night' : nights + ' nights'
        }

        function changeNights(delta) {
          const input  = document.getElementById('nights-input')
          const nights = Math.max(1, (parseInt(input.value) || 1) + delta)
          input.value  = nights
          updateUI(nights)
        }

        function onNightsInput() {
          const input  = document.getElementById('nights-input')
          const nights = parseInt(input.value)
          if (!nights || nights < 1) return  // wait until valid before updating
          updateUI(nights)
        }

        function goToCheckout() {
          const nights     = Math.max(1, parseInt(document.getElementById('nights-input').value) || 1)
          const network    = document.getElementById('networkSelect').value
          const start_date = document.getElementById('start-date').value
          const params     = new URLSearchParams({
            network,
            nights:     String(nights),
            start_date,
          })
          window.location.href = '/checkout/${room.id}?' + params.toString()
        }
      </script>
    `)}
  `
}