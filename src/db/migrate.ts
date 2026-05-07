import db from './database'

// Drop and recreate with the fixed schema
// Safe because seed data can be re-seeded
db.run(`DROP TABLE IF EXISTS bookings`)
db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id           TEXT PRIMARY KEY,
    item_id      TEXT NOT NULL,
    item_kind    TEXT NOT NULL CHECK(item_kind IN ('room', 'massage')),
    nights       INTEGER NOT NULL DEFAULT 1,
    total        INTEGER NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'expired')),
    start_date   TEXT NOT NULL,
    expires_at   TEXT NOT NULL,
    "ref"        TEXT UNIQUE
  )
`)

console.log('✅ Bookings table migrated')