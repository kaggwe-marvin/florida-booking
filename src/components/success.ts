import { html, raw } from 'hono/html'

interface SuccessProps {
  ref: string
  roomName: string
  total: string
  checkIn?: string
  checkOut?: string
  nights?: number
  kind?: 'room' | 'massage'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export const SuccessScreen = (props: SuccessProps): any => {
  const isMassage    = props.kind === 'massage'
  const headline     = isMassage ? 'Session booked!' : "You're all set!"
  const subtext      = isMassage
    ? "Your massage session has been reserved at Florida Guest House. We'll see you soon!"
    : 'Your room has been reserved at Florida Guest House. Show this confirmation at reception.'
  const serviceLabel = isMassage ? 'Service' : 'Room'

  const checkIn  = props.checkIn  ?? new Date().toISOString().split('T')[0]
  const checkOut = props.checkOut ?? addDays(checkIn, props.nights ?? 1)

  return html`
    <div class="flex flex-col items-center justify-center min-h-screen px-6 py-10">
      <div class="w-full max-w-sm text-center space-y-6 slide-up">

        <!-- Check ring -->
        <div
          class="mx-auto"
          style="
            width:72px;height:72px;border-radius:50%;
            background:#f0faf4;border:2px solid #27ae60;
            display:flex;align-items:center;justify-content:center;
            animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both;
          "
        >
          <i class="${isMassage ? 'ri-hand-heart-line' : 'ri-check-line'} text-green-600 text-2xl"></i>
        </div>

        <div>
          <p class="tag text-silver mb-1">Booking Confirmed</p>
          <h2 class="display text-3xl font-light text-charcoal">${headline}</h2>
          <p class="text-sm text-ash mt-2">${subtext}</p>
        </div>

        <!-- Summary card -->
        <div class="rounded-2xl border border-mist bg-white divide-y divide-cloud text-left overflow-hidden">

          <div class="px-4 py-3 flex justify-between text-sm">
            <span class="text-silver">Booking Ref</span>
            <span class="text-charcoal font-medium" style="font-family:'Courier New',monospace">
              ${props.ref}
            </span>
          </div>

          <div class="px-4 py-3 flex justify-between text-sm">
            <span class="text-silver">${serviceLabel}</span>
            <span class="text-charcoal font-medium">${props.roomName}</span>
          </div>

          ${isMassage
            ? html`
                <div class="px-4 py-3 flex justify-between text-sm">
                  <span class="text-silver">Duration</span>
                  <span class="text-charcoal font-medium">At your convenience</span>
                </div>
              `
            : html`
                <div class="px-4 py-3 flex justify-between text-sm">
                  <span class="text-silver">Check-in</span>
                  <span class="text-charcoal font-medium">${formatDate(checkIn)}</span>
                </div>
                <div class="px-4 py-3 flex justify-between text-sm">
                  <span class="text-silver">Check-out</span>
                  <span class="text-charcoal font-medium">${formatDate(checkOut)}</span>
                </div>
                <div class="px-4 py-3 flex justify-between text-sm">
                  <span class="text-silver">Nights</span>
                  <span class="text-charcoal font-medium">${props.nights ?? 1}</span>
                </div>
              `}

          <div class="px-4 py-3 flex justify-between text-sm">
            <span class="text-silver">Total Paid</span>
            <span class="text-charcoal font-semibold">${props.total}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3 w-full">
          
          <a  href="/"
            class="btn-primary w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 no-underline"
          >
            <i class="ri-home-line"></i> Back to Listings
          </a>
          
          <a href="/bookings/${props.ref}"
  class="btn-ghost w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 no-underline"
>
  <i class="ri-file-list-line"></i> View Booking
</a>
        </div>
      </div>
    </div>

    ${raw(`<style>
      @keyframes popIn {
        from { transform: scale(0); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }
    </style>`)}
  `
}