import db from './database'
import { createBooking } from './bookings'

const existing = db.query('SELECT COUNT(*) as count FROM bookings').get() as { count: number }
if (existing.count > 0) {
  console.log('Bookings already seeded, skipping.')
  process.exit(0)
}

const today    = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

// A few sample bookings — mix of active and pending
const samples = [
  { item_id: 'room-207', item_kind: 'room' as const, nights: 2, total: 50000, start_date: today },
  { item_id: 'room-208', item_kind: 'room' as const, nights: 1, total: 30000, start_date: today },
  { item_id: 'room-203', item_kind: 'room' as const, nights: 3, total: 90000, start_date: tomorrow, },
]

for (const s of samples) {
  const booking = createBooking(s)
  // Mark rooms 201 and 205 as already active (paid)
  if (s.item_id !== 'room-206') {
    db.query(`UPDATE bookings SET status = 'active' WHERE id = ?`).run(booking.id)
  }
  console.log(`✅ Seeded booking ${booking.id} for ${s.item_id}`)
}