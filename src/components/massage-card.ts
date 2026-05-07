import { html } from 'hono/html'
import type { Massage } from '../data/massage'

export const MassageListingCard = (massage: Massage): any => html`
  <a
    href="${massage.available ? `/massages/${massage.id}` : '#'}"
    class="block bg-white rounded-2xl border border-mist overflow-hidden group transition ${
      massage.available ? 'cursor-pointer hover:shadow-sm' : 'opacity-50 pointer-events-none'
    }"
  >
    <div class="flex gap-3 p-3">
      <div class="rounded-xl w-24 h-24 flex-shrink-0 relative overflow-hidden bg-mist">
        <img 
          src="${massage.image_url}" 
          alt="${massage.name} — ${massage.type} massage at Florida Guest House Kireka, Kampala"
          loading="lazy" 
          class="w-full h-full object-cover transition group-hover:scale-105"
        />

        ${massage.type === 'Couples'
          ? html`
              <div class="absolute top-1 right-1 bg-pink-400/90 text-[10px] text-white px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                COUPLES
              </div>
            `
          : massage.type === 'Luxury'
            ? html`
                <div class="absolute top-1 right-1 bg-amber-400/90 text-[10px] text-charcoal px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                  LUXURY
                </div>
              `
            : ''}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-1">
          <div>
            <span class="tag text-silver">${massage.type}</span>
            <h3 class="text-charcoal font-medium text-sm leading-tight mt-0.5">
              ${massage.name}
            </h3>
          </div>

          ${!massage.available
            ? html`<span class="tag bg-cloud text-silver px-2 py-0.5 rounded-full whitespace-nowrap">Unavailable</span>`
            : ''}
        </div>

        <div class="flex items-center gap-1 mt-1">
          <i class="ri-timer-line text-silver text-xs"></i>
          <span class="text-xs text-ash">${massage.duration} min</span>
        </div>

        <div class="flex flex-wrap gap-1 mt-2">
          ${massage.amenities.slice(0, 2).map(
            (amenity, i) => html`
              <span class="amenity-pill">
                <i class="${massage.icons[i]} text-xs"></i>
                ${amenity}
              </span>
            `
          )}
        </div>

        <div class="flex items-center justify-between mt-2">
          <span class="text-charcoal font-semibold text-sm">
            ${massage.rate.toLocaleString()}UGX
            <span class="text-silver font-normal text-xs">/ session</span>
          </span>

          ${massage.available
            ? html`<i class="ri-arrow-right-line text-silver text-sm group-hover:translate-x-1 transition-transform"></i>`
            : ''}
        </div>
      </div>
    </div>
  </a>
`

export const FeaturedMassageCard = (massage: Massage): any => html`
  <a
    href="/massages/${massage.id}"
    class="block rounded-2xl overflow-hidden bg-charcoal group transition hover:shadow-md"
  >
    <div class="h-52 flex items-end p-4 relative overflow-hidden">
      <img 
        src="${massage.image_url}" 
        alt="${massage.name} featured ${massage.type} spa session — Florida Guest House Kireka" 
        fetchpriority="high"
        class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      <div class="absolute top-3 right-3 flex gap-2">
        ${massage.type === 'Couples'
          ? html`
              <div class="bg-pink-400/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span class="tag text-white">Couples</span>
              </div>
            `
          : massage.type === 'Luxury'
            ? html`
                <div class="bg-amber-400/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span class="tag text-charcoal">Luxury</span>
                </div>
              `
            : ''}

        <div class="bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span class="tag text-white">Featured</span>
        </div>
      </div>

      <div class="relative z-10">
        <span class="tag text-white/60">${massage.type}</span>

        <h2 class="display text-2xl text-white font-light leading-tight">
          ${massage.name}
        </h2>

        <div class="flex items-center gap-3 mt-1">
          <span class="text-white text-lg font-medium">
            ${massage.rate.toLocaleString()}UGX
            <span class="text-sm font-light text-white/60">/ session</span>
          </span>

          <div class="flex items-center gap-1">
            <i class="ri-timer-line text-white/60 text-xs"></i>
            <span class="text-white/80 text-xs">${massage.duration} min</span>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-3 flex items-center justify-between">
      <div class="flex gap-2">
        ${massage.amenities.slice(0, 3).map(
          (amenity, i) => html`
            <span
              class="amenity-pill"
              style="background:#2a2a2a;border-color:#444;color:#aaa"
            >
              <i class="${massage.icons[i]} text-xs"></i>
              ${amenity}
            </span>
          `
        )}
      </div>

      <i class="ri-arrow-right-line text-silver text-sm group-hover:translate-x-1 transition-transform"></i>
    </div>
  </a>
`
