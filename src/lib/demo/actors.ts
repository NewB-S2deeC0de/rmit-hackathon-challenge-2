import type { Actor } from "@/types";

const actors: Record<string, Actor> = {
  "supplier-a": { id: "supplier-a", name: "Supplier A", role: "supplier" },
  "supplier-b": { id: "supplier-b", name: "Supplier B", role: "supplier" },
  buyer: { id: "buyer", name: "Buyer", role: "buyer" },
  "admin-a": { id: "admin-a", name: "Admin A", role: "admin" },
  "admin-b": { id: "admin-b", name: "Admin B", role: "admin" },
  "admin-c": { id: "admin-c", name: "Admin C", role: "admin" },
};
export const demoActors = Object.values(actors);
export function actorById(id: string): Actor | null { return actors[id] ?? null; }
export function canReadEncryptedBatch(actor: Actor | null, ownerId: string): boolean { return actor?.role === "supplier" && actor.id === ownerId; }
