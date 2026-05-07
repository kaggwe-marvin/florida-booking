import { html, raw } from 'hono/html'
import type { HtmlEscapedString } from 'hono/utils/html'

interface OTPInputProps {
  maskedPhone: string // e.g. "+1 305 *** 0142"
}

export const OTPInput = (props: OTPInputProps): any => html`
  <div class="rounded-2xl border border-mist bg-white px-4 py-4 space-y-3">
    <p class="tag text-silver">Payment Confirmation OTP</p>
    <p class="text-xs text-ash">
      A 6-digit code was sent to your phone
      <span class="text-charcoal font-medium">${props.maskedPhone}</span>
    </p>

    <!-- 6 boxes -->
    <div class="flex justify-center gap-2 py-2" id="otp-boxes">
      <input class="otp-input" id="otp0" maxlength="1" inputmode="numeric" pattern="[0-9]" autocomplete="one-time-code" />
      <input class="otp-input" id="otp1" maxlength="1" inputmode="numeric" pattern="[0-9]" />
      <input class="otp-input" id="otp2" maxlength="1" inputmode="numeric" pattern="[0-9]" />
      <input class="otp-input" id="otp3" maxlength="1" inputmode="numeric" pattern="[0-9]" />
      <input class="otp-input" id="otp4" maxlength="1" inputmode="numeric" pattern="[0-9]" />
      <input class="otp-input" id="otp5" maxlength="1" inputmode="numeric" pattern="[0-9]" />
    </div>

    <div class="flex items-center justify-between text-xs">
      <span class="text-silver">Didn't receive it?</span>
      <button
        type="button"
        onclick="resendOTP()"
        class="text-charcoal font-medium underline underline-offset-2"
      >
        Resend
      </button>
    </div>

    <!-- Feedback message -->
    <div
      id="otp-feedback"
      class="hidden text-xs text-center py-1.5 px-3 rounded-lg"
    ></div>
  </div>

  ${raw(`
  <style>
    .otp-input {
      width: 44px; height: 52px;
      text-align: center;
      font-size: 1.4rem; font-weight: 500;
      border: 1.5px solid #d4d4d4;
      border-radius: 8px;
      background: white;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .otp-input:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.08); }
    .otp-input.filled  { border-color: #1a1a1a; background: #f8f8f8; }
    .otp-input.error   { border-color: #c0392b; background: #fff5f5; }
    .otp-input.success { border-color: #27ae60; background: #f0faf4; }
    @keyframes shake {
      0%,100%{ transform: translateX(0); }
      20%    { transform: translateX(-6px); }
      40%    { transform: translateX(6px); }
      60%    { transform: translateX(-4px); }
      80%    { transform: translateX(4px); }
    }
  </style>
  <script>
    (function () {
      function initOTP() {
        for (let i = 0; i < 6; i++) {
          const inp = document.getElementById('otp' + i)
          if (!inp) continue
          inp.oninput = function (e) {
            const val = e.target.value.replace(/\\D/g, '')
            e.target.value = val.slice(-1)
            if (val && i < 5) document.getElementById('otp' + (i + 1)).focus()
            e.target.classList.toggle('filled', !!val)
            clearOTPFeedback()
          }
          inp.onkeydown = function (e) {
            if (e.key === 'Backspace' && !inp.value && i > 0) {
              document.getElementById('otp' + (i - 1)).focus()
            }
          }
        }
      }

      window.getOTPValue = function () {
        return Array.from({ length: 6 }, (_, i) => {
          const el = document.getElementById('otp' + i)
          return el ? el.value : ''
        }).join('')
      }

      window.setOTPState = function (state) {
        for (let i = 0; i < 6; i++) {
          const el = document.getElementById('otp' + i)
          if (el) el.className = 'otp-input ' + state
        }
      }

      window.clearOTPFeedback = function () {
        const fb = document.getElementById('otp-feedback')
        if (fb) { fb.className = 'hidden text-xs text-center py-1.5 px-3 rounded-lg'; fb.textContent = '' }
      }

      window.showOTPFeedback = function (msg, type) {
        const fb = document.getElementById('otp-feedback')
        if (!fb) return
        const colours = {
          error:   'bg-red-50 text-red-600',
          success: 'bg-green-50 text-green-600 font-medium',
          info:    'bg-gray-50 text-gray-600',
        }
        fb.className = 'text-xs text-center py-1.5 px-3 rounded-lg ' + (colours[type] || colours.info)
        fb.textContent = msg
      }

      window.shakeOTP = function () {
        const boxes = document.getElementById('otp-boxes')
        if (!boxes) return
        boxes.style.animation = 'none'
        boxes.offsetHeight
        boxes.style.animation = 'shake 0.4s ease'
      }

      document.addEventListener('DOMContentLoaded', initOTP)
    })()
  </script>
  `)}
`
