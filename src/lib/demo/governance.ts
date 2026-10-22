import { randomUUID } from "node:crypto";

export type MockGrant = { id: string; target: "admin-a"; approvals: string[]; status: "pending" | "committed"; canDecrypt: boolean };
export function proposeGrant(adminId: string): MockGrant {
  if (adminId !== "admin-a") throw new Error("Only Admin A proposes this self-grant demo");
  return { id: randomUUID(), target: "admin-a", approvals: [adminId], status: "pending", canDecrypt: false };
}
export function approveGrant(grant: MockGrant, adminId: string): MockGrant {
  if (!/^admin-[abc]$/.test(adminId)) throw new Error("Admin role required");
  if (grant.status === "committed" || grant.approvals.includes(adminId)) return grant;
  const approvals = [...grant.approvals, adminId];
  const committed = approvals.length >= 2;
  return { ...grant, approvals, status: committed ? "committed" : "pending", canDecrypt: committed };
}
