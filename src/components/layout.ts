import { html, raw } from 'hono/html'
import type { HtmlEscapedString } from 'hono/utils/html'

interface SiteData {
  title: string
  description?: string
  children?: any | string
  canonical?: string
  noindex?: boolean
}

const SITE_URL = 'http://localhost:3000';
const DEFAULT_DESCRIPTION = 'Affordable lodging in Kireka, Kampala — minutes from Namboole National Stadium. Clean rooms, modern amenities, warm hospitality. Book your stay at Florida Guest House today.';

export const Layout = (props: SiteData): any => {
  // ✅ FIXED: No window in Hono SSR — noindex only when explicitly set
  const robotsContent = props.noindex ? 'noindex, nofollow' : 'index, follow';

  // ✅ FIXED: Real domain, used as canonical fallback
  const SITE_URL = 'http://localhost:3000'; // <-- change to your real domain

  return html`
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${props.title} — Available</title>
      <meta name="description" content="${props.description ?? DEFAULT_DESCRIPTION}" />
      <link rel="canonical" href="${props.canonical ?? SITE_URL}" />
      <script src="https://cdn.tailwindcss.com"></script>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      ${raw(`
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  display: ['Cormorant Garamond', 'serif'],
                  body: ['DM Sans', 'sans-serif'],
                },
                colors: {
                  charcoal: '#212413',
                  smoke:    '#556B2F',
                  ash:      '#8A9A5B',
                  silver:   '#98A869',
                  mist:     '#B2C495',
                  cloud:    '#EBE3D2',
                  pearl:    '#FDFBD4',
                },
              },
            },
          }
        </script>
      `)}
      ${raw(`<style>
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .display { font-family: 'Cormorant Garamond', serif; }
        body { background: #f0f0f0; }
        .card-img {
          background: linear-gradient(135deg, #c8c8c8 0%, #e0e0e0 40%, #b8b8b8 100%);
          position: relative; overflow: hidden;
        }
        .card-img::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            45deg, transparent, transparent 10px,
            rgba(255,255,255,0.07) 10px, rgba(255,255,255,0.07) 20px
          );
        }
        .card-img-dark { background: linear-gradient(135deg, #383838 0%, #555 40%, #2e2e2e 100%); }
        .tag { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500; }
        .amenity-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: white; border: 1px solid #e4e4e4;
          padding: 4px 10px; border-radius: 20px;
          font-size: 0.72rem; color: #4a4a4a;
        }
        .btn-primary { background: #1a1a1a; color: white; transition: background 0.2s, transform 0.1s; }
        .btn-primary:hover { background: #333; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-ghost {
          border: 1.5px solid #d4d4d4; color: #4a4a4a;
          transition: border-color 0.2s, color 0.2s; background: white;
        }
        .btn-ghost:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease both; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 2px; }
      </style>`)}
    </head>
    <body class="min-h-screen">
      <div class="max-w-md mx-auto min-h-screen bg-pearl">
        ${props.children}
      </div>
    </body>
  </html>
`}
