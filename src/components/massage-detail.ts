import { html, raw } from 'hono/html'
import type { Massage } from '../data/massage'

export const MassageDetail = (massage: Massage): any => {

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": `${massage.name} — Florida Guest House Spa, Kireka`,
    "description": `${massage.type} massage session at Florida Guest House, Kireka, Kampala. ${massage.duration} minutes. ${massage.description}`,
    "image": massage.image_url,
    "priceRange": `${massage.rate.toLocaleString()} UGX per session`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kireka",
      "addressLocality": "Kampala",
      "addressCountry": "UG"
    }
  })

  return html`
    <div class="slide-up">
    ${raw(`<script type="application/ld+json">${jsonLd}</script>`)}
      <!-- HERO WITH IMAGE -->
      <div class="h-64 relative overflow-hidden bg-charcoal">
        <img 
          src="${massage.image_url}" 
          alt="${massage.name} — ${massage.type} spa massage at Florida Guest House Kireka, Kampala"
          fetchpriority="high" 
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- Gradient overlay for text readability -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <div class="absolute bottom-4 left-4 right-4">
          <div class="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 flex items-center justify-between border border-white/10">
            <div>
              <span class="tag text-white/70">${massage.type}</span>
              <p class="text-white font-medium">${massage.name}</p>
            </div>
            <div class="text-right">
              <p class="text-white font-semibold text-lg">${massage.rate.toLocaleString()}UGX</p>
              <p class="text-white/60 text-xs">per session</p>
            </div>
          </div>
        </div>
      </div>

      <!-- INFO PILLS -->
      <div class="px-5 mt-4 flex gap-2 flex-wrap">
        <span class="amenity-pill">
          <i class="ri-timer-line text-xs"></i>
          ${massage.duration} min
        </span>
        ${massage.amenities.map(
          (amenity, i) => html`
            <span class="amenity-pill">
              <i class="${massage.icons[i]} text-xs"></i>
              ${amenity}
            </span>
          `
        )}
      </div>

      <!-- DESCRIPTION -->
      <div class="px-5 mt-4">
        <p class="text-sm text-ash leading-relaxed">${massage.description}</p>
      </div>

      <!-- NETWORK SELECT -->
      <div class="px-5 mt-4">
        <p class="text-xs text-silver mb-2 font-medium uppercase tracking-wider">Select Payment Network</p>
        <div class="relative">
          <select
            id="networkSelect"
            class="w-full px-4 py-3 border border-mist rounded-xl text-sm bg-white appearance-none"
          >
            <option value="mtn">MTN MoMo</option>
            <option value="airtel">Airtel Money</option>
          </select>
          <i class="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-silver"></i>
        </div>
      </div>

      <!-- CTA -->
      <div class="px-5 mt-6 mb-8">
        <button
          onclick="goToCheckout()"
          class="btn-primary w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
        >
          <span>Book This Session</span>
          <i class="ri-arrow-right-line"></i>
        </button>
      </div>

      <script>
        function goToCheckout() {
          const network = document.getElementById('networkSelect').value
          window.location.href = '/checkout/massage/${massage.id}?network=' + network
        }
      </script>
    </div>
  `
}
