# Florida Guest House

A mobile-first hotel booking web app for **Florida Guest House, Kireka — Kampala, Uganda**. Built with Bun, Hono, and SQLite. Supports room listings, massage services, mobile money payments (MTN MoMo & Airtel Money), and booking management.

---

## Tech Stack

- **Runtime** — [Bun](https://bun.sh)
- **Framework** — [Hono](https://hono.dev) (server-side HTML rendering)
- **Database** — SQLite via `bun:sqlite`
- **Styling** — Tailwind CSS (CDN)
- **Icons** — Remix Icon

---

## Project Structure

```
florida/
├── public/
│   └── images/
│       └── rooms/          # Room photos (room-200.jpg, room-201.jpg, ...)
├── src/
│   ├── db/
│   │   ├── database.ts     # DB connection, table creation
│   │   ├── rooms.ts        # Room queries
│   │   ├── bookings.ts     # Booking queries
│   │   ├── massage.ts      # Massage queries
│   │   ├── seed.ts         # Seed rooms data
│   │   ├── seed-bookings.ts# Seed sample bookings
│   │   └── migrate.ts      # One-off migrations
│   ├── routes/
│   │   ├── listings.ts     # GET / and /listings/:filter?
│   │   ├── rooms.ts        # GET /rooms/:id
│   │   ├── massages.ts     # GET /massages/:id
│   │   ├── checkout.ts     # Checkout + OTP + verify flow
│   │   └── bookings.ts     # GET /bookings/:ref + receipt
│   ├── components/
│   │   ├── layout.ts
│   │   ├── listing-card.ts
│   │   ├── massage-card.ts
│   │   ├── room-detail.ts
│   │   ├── checkout-form.ts
│   │   ├── success.ts
│   │   └── otp-input.ts
│   ├── lib/
│   │   ├── otp.ts          # OTP generation & verification
│   │   └── merchant.ts     # Merchant code helpers
│   └── index.ts            # App entry point
├── db.sqlite               # SQLite database file (auto-created)
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0 or later

### Install

```bash
bun install
```

### Set up the database

```bash
# Create tables and seed rooms
bun run seed

# Seed sample bookings (optional)
bun run seed:bookings
```

### Run

```bash
bun run dev
```

App runs at `http://localhost:3000`.

---

## Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start dev server with hot reload |
| `bun run seed` | Seed rooms into the database |
| `bun run seed:bookings` | Seed sample bookings |
| `bun run migrate` | Run one-off DB migrations |

---

## Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | All listings (rooms + massages) |
| `GET` | `/listings/:filter?` | Filtered listings (`budget`, `standard`, `deluxe`, `hot-water`, `massage`) |
| `GET` | `/rooms/:id` | Room detail with nights selector |
| `GET` | `/massages/:id` | Massage detail |
| `GET` | `/checkout/:roomId` | Room checkout page |
| `GET` | `/checkout/massage/:massageId` | Massage checkout page |
| `POST` | `/checkout/verify` | Verify OTP and activate booking |
| `POST` | `/checkout/resend-otp` | Resend OTP |
| `GET` | `/checkout/confirmed` | Booking confirmed screen |
| `GET` | `/bookings/:ref` | View active booking by reference |
| `GET` | `/bookings/:ref/receipt` | Printable receipt (save as PDF) |

---

## Database Schema

### `rooms`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | Primary key e.g. `room-200` |
| `type` | TEXT | `Budget Room`, `Standard Room`, `Deluxe Room` |
| `name` | TEXT | Display name |
| `rate` | INTEGER | Per night in UGX (VAT inclusive) |
| `rating` | REAL | |
| `reviews` | INTEGER | |
| `beds` | TEXT | e.g. `King Bed` |
| `sqft` | INTEGER | |
| `amenities` | TEXT | JSON array e.g. `["WiFi","Hot Water"]` |
| `icons` | TEXT | JSON array of Remix Icon classes |
| `available` | INTEGER | `1` = available, `0` = booked |
| `image_url` | TEXT | Path e.g. `/images/rooms/room-200.jpg` |

### `bookings`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | UUID, primary key — doubles as OTP session ID |
| `item_id` | TEXT | Room or massage ID |
| `item_kind` | TEXT | `room` or `massage` |
| `nights` | INTEGER | Number of nights (1 for massages) |
| `total` | INTEGER | Total in UGX |
| `status` | TEXT | `pending`, `active`, or `expired` |
| `start_date` | TEXT | ISO date string e.g. `2026-04-27` |
| `expires_at` | TEXT | ISO datetime — pending bookings expire after 15 min |
| `ref` | TEXT | Unique booking reference e.g. `FGH-512528` |

---

## Booking Flow

```
Listings → Room Detail
              ↓
        Pick nights + network
              ↓
        /checkout/:roomId
          - Creates pending booking (15 min expiry)
          - Generates OTP
              ↓
        Pay via MTN MoMo or Airtel Money
        Merchant number: see checkout page
        Confirms as: Florida Guest House Kireka
              ↓
        Enter OTP → POST /checkout/verify
          - Booking status: pending → active
          - Booking ref saved (FGH-xxxxxx)
              ↓
        /checkout/confirmed
              ↓
        /bookings/:ref        ← show at reception
        /bookings/:ref/receipt ← print or save as PDF
```

---

## Room Categories

| Filter slug | Display name | Room types included |
|---|---|---|
| `budget` | Basic | Budget Room |
| `standard` | VIP | Standard Room |
| `deluxe` | VVIP | Deluxe Room |
| `hot-water` | Hot-Water | Any room with Hot Water amenity |
| `massage` | Massage | Massage services only |

---

## Adding Room Images

Place images in `public/images/rooms/` named to match room IDs:

```
public/images/rooms/
  room-200.jpg
  room-201.jpg
  ...
  default.jpg   ← fallback for rooms without a photo
```

Images are served at `/images/rooms/room-200.jpg` via Hono's static file middleware.

---

## Payment

Payments are processed manually via **MTN MoMo** and **Airtel Money** merchant numbers. The app does not integrate with a payment gateway — the OTP flow is used as a confirmation step after the guest has sent the payment independently.

All rates are **VAT inclusive** (Uganda uses indirect tax, VAT is baked into the displayed price).

---

## Notes

- WAL mode is enabled on the SQLite database for better read performance
- Pending bookings that are not confirmed within 15 minutes are automatically expired on the next checkout page visit
- The booking `id` (UUID) doubles as the OTP session ID throughout the checkout flow
- `bun:sqlite` query results are cached as prepared statements — arrays stored as JSON strings and parsed back on read