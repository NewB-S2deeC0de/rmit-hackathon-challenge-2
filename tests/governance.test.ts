import { test } from "node:test";
import { strict as assert } from "node:assert";
import { proposeGrant, approveGrant } from "../src/lib/demo/governance";

test("mock self-grant stays pending until a second distinct admin approves", () => {
  const pending = proposeGrant("admin-a");
  assert.equal(pending.status, "pending");
  assert.equal(pending.canDecrypt, false);
  assert.deepEqual(pending.approvals, ["admin-a"]);
  const repeat = approveGrant(pending, "admin-a");
  assert.deepEqual(repeat.approvals, ["admin-a"]);
  assert.equal(repeat.canDecrypt, false);
  const committed = approveGrant(repeat, "admin-b");
  assert.equal(committed.status, "committed");
  assert.equal(committed.canDecrypt, true);
});
