import { html } from 'hono/html'
import type { Room } from '../data/room'

export const ListingCard = (room: Room): any => html`
  
    <a href="${room.available ? `/rooms/${room.id}` : '#'}"
    class="block bg-white rounded-2xl border border-mist overflow-hidden group transition ${
      room.available ? 'cursor-pointer hover:shadow-sm' : 'opacity-50 pointer-events-none'
    }"
  >
    <div class="flex gap-3 p-3">
      <div class="rounded-xl w-24 h-24 flex-shrink-0 relative overflow-hidden">
        <img
          src="${room.image_url}"
          alt="${room.name} — ${room.type} room at Florida Guest House Kireka, Kampala"
          loading="lazy"
          class="w-full h-full object-cover"
        />
        ${room.amenities.includes('Hot Water')
          ? html`
              <div class="absolute top-1 right-1 bg-silver/90 text-[10px] text-charcoal px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                HOT
              </div>
            `
          : ''}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-1">
          <div>
            <span class="tag text-silver">${room.type}</span>

            <h3 class="text-charcoal font-medium text-sm leading-tight mt-0.5">
              ${room.name}
            </h3>
          </div>

          ${!room.available
            ? html`
                <span class="tag bg-cloud text-silver px-2 py-0.5 rounded-full whitespace-nowrap">
                  Booked
                </span>
              `
            : ''}
        </div>

        <div class="flex items-center gap-1 mt-1">
          <i class="ri-star-fill text-yellow-400 text-xs"></i>

          <span class="text-xs text-ash">
            ${room.rating}
            <span class="text-silver">(${room.reviews})</span>
          </span>

          ${room.amenities.includes('TV')
            ? html`
                <span class="ml-2 bg-blue-50 text-blue-500 text-[10px] px-1.5 rounded border border-blue-100 uppercase font-bold">
                  TV
                </span>
              `
            : ''}
        </div>

        <div class="flex flex-wrap gap-1 mt-2">
          ${room.amenities.slice(0, 2).map(
            (amenity, i) => html`
              <span class="amenity-pill">
                <i class="${room.icons[i]} text-xs"></i>
                ${amenity}
              </span>
            `
          )}
        </div>

        <div class="flex items-center justify-between mt-2">
          <span class="text-charcoal font-semibold text-sm">
            ${room.rate.toLocaleString()}UGX
            <span class="text-silver font-normal text-xs">/ night</span>
          </span>

          ${room.available
            ? html`
                <i class="ri-arrow-right-line text-silver text-sm group-hover:translate-x-1 transition-transform"></i>
              `
            : ''}
        </div>
      </div>
    </div>
  </a>
`

export const FeaturedCard = (room: Room): any => html`
  
  <a  href="/rooms/${room.id}"
    class="block rounded-2xl overflow-hidden bg-charcoal group transition hover:shadow-md"
  >
    <div class="h-52 flex items-end p-4 relative overflow-hidden">
      <img
        src="${room.image_url}"
        alt="${room.name} featured ${room.type} room — Florida Guest House Kireka near Namboole Stadium"
        fetchpriority="high"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/40"></div>

      <div class="absolute top-3 right-3 flex gap-2">
        ${room.amenities.includes('Hot Water')
          ? html`
              <div class="bg-silver/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span class="tag text-charcoal">Hot Water</span>
              </div>
            `
          : ''}

        <div class="bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span class="tag text-white">Featured</span>
        </div>
      </div>

      <div class="relative z-10">
        <span class="tag text-white/60">${room.type}</span>

        <h2 class="display text-2xl text-white font-light leading-tight">
          ${room.name}
        </h2>

        <div class="flex items-center gap-3 mt-1">
          <span class="text-white text-lg font-medium">
            ${room.rate.toLocaleString()}UGX
            <span class="text-sm font-light text-white/60">/ night</span>
          </span>

          <div class="flex items-center gap-1">
            <i class="ri-star-fill text-yellow-400 text-xs"></i>

            <span class="text-white/80 text-xs">
              ${room.rating} (${room.reviews})
            </span>

            ${room.amenities.includes('TV')
              ? html`
                  <span class="ml-2 text-[10px] text-blue-300 font-bold border border-blue-300/30 px-1 rounded">
                    TV INCLUDED
                  </span>
                `
              : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-3 flex items-center justify-between">
      <div class="flex gap-2">
        ${room.amenities.slice(0, 3).map(
          (amenity, i) => html`
            <span
              class="amenity-pill"
              style="background:#2a2a2a;border-color:#444;color:#aaa"
            >
              <i class="${room.icons[i]} text-xs"></i>
              ${amenity}
            </span>
          `
        )}
      </div>

      <i class="ri-arrow-right-line text-silver text-sm group-hover:translate-x-1 transition-transform"></i>
    </div>
  </a>
`