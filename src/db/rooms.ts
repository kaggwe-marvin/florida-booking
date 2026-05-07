import db from "./database";
import type { Room } from "../data/room"; 

// Helper to parse JSON columns back into arrays
function parseRoom(raw: any): Room {
  return {
    ...raw,
    amenities: JSON.parse(raw.amenities),
    icons:     JSON.parse(raw.icons),
    available: raw.available === 1,
  };
}

export function getAllRooms(): Room[] {
  return db.query("SELECT * FROM rooms").all().map(parseRoom);
}

export function findRoom(id: string): Room | undefined {
  const raw = db.query("SELECT * FROM rooms WHERE id = ?").get(id);
  return raw ? parseRoom(raw) : undefined;
}

export function getAvailableRooms(): Room[] {
  return db.query("SELECT * FROM rooms WHERE available = 1").all().map(parseRoom);
}

export function updateAvailability(id: string, available: boolean): void {
  db.query("UPDATE rooms SET available = $available WHERE id = $id")
    .run({ $available: available ? 1 : 0, $id: id });
}