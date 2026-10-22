import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";

if (!existsSync(".env.local")) {
  writeFileSync(".env.local", `SCOPEZERO_DEMO_MODE=1\nSCOPEZERO_DEMO_SECRET=${randomBytes(32).toString("hex")}\n`, { mode: 0o600 });
  console.log("Created .env.local for local demo only.");
} else {
  console.log(".env.local exists; left it unchanged.");
}
