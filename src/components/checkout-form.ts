import { html, raw } from 'hono/html'
import type { Room } from '../data/room'
import type { Massage } from '../data/massage'
import { OTPInput } from './otp-input'

interface BookableItem {
  id: string
  name: string
  type: string
  rate: number
}

interface CheckoutFormProps {
  item: BookableItem
  itemKind: 'room' | 'massage'
  sessionId: string
  merchantCode: string
  nights?: number
  network?: 'mtn' | 'airtel'
}

const MERCHANTS = {
  mtn: '32758790',
  airtel: '8021490',
} as const

export const CheckoutForm = (props: CheckoutFormProps): any => {
  const network: 'mtn' | 'airtel' =
    props.network === 'airtel' ? 'airtel' : 'mtn'

  const merchantNumber = MERCHANTS[network]
  const networkLabel   = network === 'mtn' ? 'MTN MoMo' : 'Airtel Money'
  const networkColor   = network === 'mtn' ? 'text-yellow-600' : 'text-red-600'

  const isRoom    = props.itemKind === 'room'
  const nights    = props.nights ?? 1
  const total     = isRoom ? props.item.rate * nights : props.item.rate
  const unitLabel = isRoom ? `${nights} night${nights !== 1 ? 's' : ''}` : '1 session'

  return html`
    <div class="slide-up px-5 py-5 space-y-5 pb-10">

      <!-- ITEM SUMMARY -->
      <div class="rounded-xl bg-cloud px-4 py-3 flex items-center justify-between">
        <div>
          <p class="text-xs text-silver">${props.item.type}</p>
          <p class="text-charcoal font-medium text-sm">${props.item.name}</p>
          <p class="text-xs text-silver mt-0.5">${unitLabel}</p>
        </div>
        <div class="text-right">
          <p class="text-charcoal font-bold">${total.toLocaleString()}UGX</p>
        </div>
      </div>

      <!-- PAYMENT INSTRUCTIONS -->
      <div class="rounded-xl border border-mist px-4 py-4 space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-silver">Pay via</p>
          <span class="text-xs font-semibold ${networkColor}">${networkLabel}</span>
        </div>

        <div class="border-t border-mist pt-3 space-y-1">
          <p class="text-xs text-silver">Merchant Number</p>
          <p class="text-charcoal font-bold text-2xl tracking-wide">${merchantNumber}</p>
          <p class="text-xs text-silver">Confirms as <span class="text-charcoal font-medium">Florida Guest House Kireka</span></p>
        </div>

        <div class="border-t border-mist pt-3">
          <p class="text-xs text-silver mb-1">Amount to send</p>
          <p class="text-charcoal font-bold text-xl">${total.toLocaleString()} UGX</p>
        </div>
      </div>

      <!-- STEP HINT -->
      <div class="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <i class="ri-information-line text-amber-500 text-base mt-0.5 flex-shrink-0"></i>
        <p class="text-xs text-amber-700 leading-relaxed">
          Go to <span class="font-semibold">${networkLabel}</span>, pay to merchant
          <span class="font-semibold">${merchantNumber}</span>, enter your PIN —
          when it shows <span class="font-semibold">Florida Guest House Kireka</span> you're good.
          Then enter the OTP sent to your phone below.
        </p>
      </div>

      <!-- OTP -->
      ${OTPInput({
        maskedPhone: network === 'mtn' ? '+256 77* *** ***' : '+256 70* *** ***',
      })}

      <input type="hidden" id="session-id" value="${props.sessionId}" />

      <button
        onclick="confirmPayment()"
        class="btn-primary w-full py-4 rounded-2xl text-sm font-medium"
      >
        Confirm Payment
      </button>
    </div>

    ${raw(`
      <script>
        async function confirmPayment() {
          const otp       = getOTPValue()
          const sessionId = document.getElementById('session-id').value

          const res = await fetch('/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, otp }),
          })

          const data = await res.json()

          if (!data.success) {
            alert(data.message || 'Invalid OTP')
            return
          }

          const params = new URLSearchParams({
            ref:       data.ref,
            bookingId: data.bookingId,
          })

          window.location.href = '/checkout/confirmed?' + params.toString()
        }
      </script>
    `)}
  `
}

export const RoomCheckoutForm = (
  props: Omit<CheckoutFormProps, 'item' | 'itemKind'> & { room: Room }
): any =>
  CheckoutForm({ ...props, item: props.room, itemKind: 'room' })

export const MassageCheckoutForm = (
  props: Omit<CheckoutFormProps, 'item' | 'itemKind' | 'nights'> & { massage: Massage }
): any =>
  CheckoutForm({ ...props, item: props.massage, itemKind: 'massage' })