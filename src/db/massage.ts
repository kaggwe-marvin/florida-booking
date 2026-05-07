import db from "./database";
import type { Massage } from "../data/massage"; 

function parseMassage(raw: any): Massage & { image_url: string } {
  return {
    ...raw,
    amenities: JSON.parse(raw.amenities),
    icons:     JSON.parse(raw.icons),
    available: raw.available === 1,
    // image_url is already a string, so it maps directly from raw.image_url
  };
}


export function getAllMassages(): Massage[] {
  return db.query("SELECT * FROM massages").all().map(parseMassage);
}

export function findMassage(id: string): Massage | undefined {
  const raw = db.query("SELECT * FROM massages WHERE id = ?").get(id);
  return raw ? parseMassage(raw) : undefined;
}

export function updateMassageAvailability(id: string, available: boolean): void {
  db.query("UPDATE massages SET available = $available WHERE id = $id")
    .run({ $available: available ? 1 : 0, $id: id });
}
