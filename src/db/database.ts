import { Database} from "bun:sqlite";

const db = new Database("db.sqlite", {create: true});

db.run("PRAGMA journal_mode = WAL;");

db.run(`
  CREATE TABLE IF NOT EXISTS rooms (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    name        TEXT NOT NULL,
    rate        INTEGER NOT NULL,
    rating      REAL NOT NULL,
    reviews     INTEGER NOT NULL,
    beds        TEXT NOT NULL,
    sqft        INTEGER NOT NULL,
    amenities   TEXT NOT NULL,
    icons       TEXT NOT NULL,
    available   INTEGER NOT NULL DEFAULT 1,
    image_url   TEXT NOT NULL DEFAULT '/images/rooms/default.jpg'
  );
   CREATE TABLE IF NOT EXISTS massages (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    name        TEXT NOT NULL,
    rate        INTEGER NOT NULL,
    duration    INTEGER NOT NULL,
    description TEXT NOT NULL,
    amenities   TEXT NOT NULL,
    icons       TEXT NOT NULL,
    available   INTEGER NOT NULL DEFAULT 1,
    image_url   TEXT NOT NULL DEFAULT '/images/massages/default.jpg'
    );
    CREATE TABLE IF NOT EXISTS bookings (
    id           TEXT PRIMARY KEY,
    item_id      TEXT NOT NULL,
    item_kind    TEXT NOT NULL CHECK(item_kind IN ('room', 'massage')),
    nights       INTEGER NOT NULL DEFAULT 1,
    total        INTEGER NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'expired')),
    start_date   TEXT NOT NULL,
    expires_at   TEXT NOT NULL,
    "ref"          TEXT UNIQUE
  );
`);

export default db;