import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from '../components/layout'
import { FeaturedCard, ListingCard } from '../components/listing-card'
import { FeaturedMassageCard, MassageListingCard } from '../components/massage-card'
import { getAllRooms } from '../db/rooms'  // ← changed
import { getAllMassages } from '../db/massage'


const SITE_URL = 'http://localhost:3000' // ← your real domain

// ── PER-FILTER SEO META ───────────────────────────────────────────────────────
const filterMeta: Record<string, { title: string; description: string; canonical: string }> = {
  all: {
    title: 'All Rooms — Florida Guest House Kireka, Kampala',
    description: 'Browse all available rooms at Florida Guest House in Kireka, Kampala. Budget, VIP and VVIP options near Namboole Stadium. Book your stay today.',
    canonical: `${SITE_URL}/`,
  },
  budget: {
    title: 'Basic Rooms — Affordable Lodging in Kireka, Kampala',
    description: 'Affordable basic rooms at Florida Guest House, Kireka. Clean, comfortable and great value accommodation near Namboole Stadium, Kampala. Book now.',
    canonical: `${SITE_URL}/listings/budget`,
  },
  standard: {
    title: 'VIP Rooms — Florida Guest House Kireka, Kampala',
    description: 'VIP rooms at Florida Guest House in Kireka, Kampala. Enjoy modern amenities, hot water and comfort near Namboole Stadium. Book your VIP stay today.',
    canonical: `${SITE_URL}/listings/standard`,
  },
  deluxe: {
    title: 'VVIP Rooms — Premium Lodging in Kireka, Kampala',
    description: 'VVIP premium rooms at Florida Guest House, Kireka. The best in-house experience near Namboole Stadium, Kampala. Luxury comfort at affordable rates.',
    canonical: `${SITE_URL}/listings/deluxe`,
  },
  'hot-water': {
    title: 'Hot Water Rooms — Florida Guest House Kireka',
    description: 'Hot water rooms at Florida Guest House in Kireka, Kampala. Warm, comfortable accommodation near Namboole National Stadium. Book your room today.',
    canonical: `${SITE_URL}/listings/hot-water`,
  },
  massage: {
    title: 'Spa & Massage Services — Florida Guest House Kireka',
    description: 'Professional spa and massage services at Florida Guest House, Kireka, Kampala. Relax and unwind near Namboole Stadium. Book a session today.',
    canonical: `${SITE_URL}/listings/massage`,
  },
}

const listings = new Hono()

listings.get('/:filter?', (c) => {
  const filter = c.req.param('filter')?.toLowerCase()
  const isMassageFilter = filter === 'massage'

  const rooms = getAllRooms()
  const massages = getAllMassages()  
  
   // ── SEO META — pick per filter, fallback to 'all' ────────────────────────
  const meta = filterMeta[filter ?? 'all'] ?? filterMeta['all']

  // ── ROOM FILTER LOGIC ─────────────────────────────────────────────────────
  const filteredRooms = isMassageFilter
    ? []
    : !filter || filter === 'all'
      ? rooms
      : rooms.filter((room) => {
          const matchesType = room.type.toLowerCase().includes(filter)
          const matchesAmenity = room.amenities.some(
            (a) => a.toLowerCase().replace(/\s+/g, '-') === filter
          )
          return matchesType || matchesAmenity
        })

  // ── FEATURED ROOM ─────────────────────────────────────────────────────────
  const obamaId = 'room-209'
  const foundObama = filteredRooms.find((r) => r.id === obamaId)
  const featuredRoom = foundObama || (filteredRooms.length > 0 ? filteredRooms[0] : null)
  const restRooms = featuredRoom ? filteredRooms.filter((r) => r.id !== featuredRoom.id) : []

  // ── MASSAGE FILTER LOGIC ──────────────────────────────────────────────────
  const showMassages = isMassageFilter
  const featuredMassageId = 'massage-body-to-body'
  const featuredMassage = showMassages
    ? (massages.find((m) => m.id === featuredMassageId) ?? massages[0])
    : null
  const restMassages = featuredMassage
    ? massages.filter((m) => m.id !== featuredMassage.id)
    : []

  // ── CHIP HELPER ───────────────────────────────────────────────────────────
  const getChipClass = (slug: string) => {
    const isActive = filter === slug || (!filter && slug === 'all')
    return isActive
      ? 'whitespace-nowrap px-3 py-1.5 rounded-full bg-charcoal text-white text-xs font-medium border border-charcoal'
      : 'whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-mist text-ash text-xs'
  }

  return c.html(
    Layout({
      title: meta.title,           
      description: meta.description, 
      canonical: meta.canonical,
      children: html`
        <header class="sticky top-0 z-20 bg-pearl border-b border-mist px-5 pt-6 pb-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="tag text-silver text-[10px] uppercase tracking-wider">welcome to</p>
              <h1 class="display text-3xl font-light text-charcoal leading-tight">
                Florida Guest House
              </h1>
            </div>
            <div class="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center">
              <i class="ri-user-line text-white text-sm"></i>
            </div>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1" style="scrollbar-width:none">
            <a href="/" class="${getChipClass('all')}">All</a>
            <a href="/listings/budget" class="${getChipClass('budget')}">Basic</a>
            <a href="/listings/standard" class="${getChipClass('standard')}">VIP</a>
            <a href="/listings/deluxe" class="${getChipClass('deluxe')}">VVIP</a>
            <a href="/listings/hot-water" class="${getChipClass('hot-water')}">Hot-Water</a>
            <a href="/listings/massage" class="${getChipClass('massage')}">Massage</a>
          </div>
        </header>

        <main class="px-4 py-4 space-y-4 pb-10">

          <!-- ── ROOMS SECTION ─────────────────────────────────────── -->
           ${!isMassageFilter ? html`
    ${featuredRoom ? FeaturedCard(featuredRoom) : ''}
    <p class="tag text-silver px-1 pt-2 uppercase tracking-widest text-[10px]">
      ${filter && filter !== 'all' ? `${filter} rooms` : 'Our Rooms'}
    </p>
    <div class="space-y-3">
      ${filteredRooms.length > 0 
        ? restRooms.map((room) => ListingCard(room)) 
        : html`<p class="text-sm text-silver text-center py-10">No rooms match.</p>`}
    </div>
              `
            : ''}

          <!-- ── MASSAGES SECTION ─────────────────────────────────── -->
          ${showMassages ? html`
    ${featuredMassage ? FeaturedMassageCard(featuredMassage) : ''}
    <p class="tag text-silver px-1 pt-2 uppercase tracking-widest text-[10px]">
      Spa & Massage Services
    </p>
    <div class="space-y-3">
      ${restMassages.map((massage) => MassageListingCard(massage))}
    </div>
  ` : ''}

        </main>
      `,
    })
  )
})

export default listings