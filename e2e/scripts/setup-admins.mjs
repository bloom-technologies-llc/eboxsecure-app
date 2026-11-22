// Creates QA admin-portal test accounts (Clerk admin TEST instance + database rows),
// mirroring what the "Invite Admin" flow does, but with a known password.
// Usage (from repo root):
//   npx dotenv -e .env -e apps/admin-portal/.env -- node e2e/scripts/setup-admins.mjs
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const key = process.env.CLERK_SECRET_KEY;
if (!key?.startsWith("sk_test_")) throw new Error("Refusing to run: CLERK_SECRET_KEY is not a Clerk TEST key");

const out = new URL("../.auth/admins.json", import.meta.url);
if (existsSync(out)) {
  console.log("admins.json already exists; not creating new accounts");
  process.exit(0);
}

const db = new PrismaClient();
const password = process.env.E2E_PASSWORD ?? "Ebox-QA-test-2026!";
const stamp = Date.now().toString(36);
const locations = await db.location.findMany({ orderBy: { id: "asc" }, take: 2, select: { id: true, name: true } });
if (locations.length < 2) throw new Error("Need at least two locations in the database");
const [locA, locB] = locations;

const specs = [
  { key: "corporate", first: "Casey", last: "Corporate", type: "CORPORATE" },
  { key: "managerA", first: "Morgan", last: "Manager", type: "EMPLOYEE", role: "MANAGER", location: locA },
  { key: "associateA", first: "Alex", last: "Associate", type: "EMPLOYEE", role: "ASSOCIATE", location: locA },
  { key: "associateB", first: "Blake", last: "Associate", type: "EMPLOYEE", role: "ASSOCIATE", location: locB },
];

const result = {};
for (const spec of specs) {
  const email = `ebox.qa.${spec.key.toLowerCase()}.${stamp}+clerk_test@example.com`;
  const res = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email_address: [email], password, first_name: spec.first, last_name: spec.last }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Clerk createUser failed for ${spec.key}: ${JSON.stringify(body.errors ?? body)}`);
  await db.user.upsert({
    where: { id: body.id },
    update: {},
    create: {
      id: body.id,
      userType: spec.type,
      ...(spec.type === "CORPORATE"
        ? { corporateAccount: { create: {} } }
        : { employeeAccount: { create: { employeeRole: spec.role, locationId: spec.location.id } } }),
    },
  });
  result[spec.key] = { id: body.id, email, password, name: `${spec.first} ${spec.last}`, role: spec.role ?? "CORPORATE", location: spec.location ?? null };
  console.log(`created ${spec.key}: ${email}${spec.location ? ` @ location ${spec.location.id} (${spec.location.name})` : ""}`);
}
mkdirSync(new URL("../.auth/", import.meta.url), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2));
await db.$disconnect();
