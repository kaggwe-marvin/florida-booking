import db from './database'

export interface Booking {
  id: string
  item_id: string
  item_kind: 'room' | 'massage'
  nights: number
  total: number
  status: 'pending' | 'active' | 'expired'
  start_date: string
  expires_at: string
}

export function createBooking(data: Omit<Booking, 'id' | 'status' | 'expires_at'>): Booking {
  const id         = crypto.randomUUID()
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  db.query(`
    INSERT INTO bookings (id, item_id, item_kind, nights, total, status, start_date, expires_at)
    VALUES ($id, $item_id, $item_kind, $nights, $total, 'pending', $start_date, $expires_at)
  `).run({
    $id:        id,
    $item_id:   data.item_id,
    $item_kind: data.item_kind,
    $nights:    data.nights,
    $total:     data.total,
    $start_date: data.start_date,
    $expires_at: expires_at,
  })

  return getBooking(id)!
}

export function getBooking(id: string): Booking | undefined {
  return db.query('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined
}

export function activateBooking(id: string): void {
  db.query(`UPDATE bookings SET status = 'active' WHERE id = $id`).run({ $id: id })
}

export function expireStaleBookings(): void {
  db.query(`
    UPDATE bookings SET status = 'expired'
    WHERE status = 'pending' AND expires_at < $now
  `).run({ $now: new Date().toISOString() })
}

export function saveRef(id: string, ref: string): void {
  db.query(`UPDATE bookings SET "ref" = $ref WHERE id = $id`)
    .run({ $ref: ref, $id: id })
}

export function getBookingByRef(ref: string): Booking | undefined {
  return db.query(`SELECT * FROM bookings WHERE "ref" = ? AND status = ?`)
    .get(ref, 'active') as Booking | undefined
}