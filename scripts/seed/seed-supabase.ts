import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = process.env.SEED_FIXTURES_DIR
  ? isAbsolute(process.env.SEED_FIXTURES_DIR)
    ? process.env.SEED_FIXTURES_DIR
    : join(process.cwd(), process.env.SEED_FIXTURES_DIR)
  : join(__dirname, "fixtures");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

type JsonRecord = Record<string, unknown>;
const idMap = new Map<string, string>();

function toSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function camelToSnake(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelToSnake);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as JsonRecord).map(([key, nested]) => [toSnakeKey(key), camelToSnake(nested)]));
  }
  return value;
}

async function fixture<T>(name: string): Promise<T[]> {
  const raw = await readFile(join(fixturesDir, `${name}.json`), "utf8");
  return JSON.parse(raw) as T[];
}

async function upsert(table: string, rows: JsonRecord[]) {
  const mappedRows = replaceMappedIds(rows) as JsonRecord[];
  const { error } = await supabase.from(table).upsert(camelToSnake(mappedRows) as JsonRecord[], { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.info(`${table}: ${rows.length} ligne(s)`);
}

function replaceMappedIds(value: unknown): unknown {
  if (typeof value === "string") return idMap.get(value) ?? value;
  if (Array.isArray(value)) return value.map(replaceMappedIds);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as JsonRecord).map(([key, nested]) => [key, replaceMappedIds(nested)]));
  }
  return value;
}

async function seedUsers() {
  const users = await fixture<JsonRecord & { email: string; password: string }>("users");
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName }
    });
    if (error && !error.message.includes("already registered")) {
      console.warn(`auth user ${user.email}: ${error.message}`);
    }
    if (data.user?.id) {
      idMap.set(String(user.id), data.user.id);
    } else if (error?.message.includes("already registered")) {
      const { data: listed } = await supabase.auth.admin.listUsers();
      const existing = listed.users.find((candidate) => candidate.email === user.email);
      if (existing?.id) idMap.set(String(user.id), existing.id);
    }
  }

  const profiles = users.map(({ password: _password, ...user }) => user);
  await upsert("user_profiles", profiles);
}

async function main() {
  await upsert("sites", await fixture("sites"));
  await seedUsers();
  await upsert("lots", await fixture("lots"));
  await upsert("tanks", await fixture("tanks"));
  await upsert("harvest_receipts", await fixture("harvest-receipts"));
  await upsert("document_attachments", await fixture("document-attachments"));
  await upsert("sub_lot_samples", await fixture("sub-lot-samples"));
  await upsert("operations", await fixture("operations"));
  await upsert("work_orders", await fixture("work-orders"));
  await upsert("inputs", await fixture("inputs"));
  await upsert("stock_items", await fixture("stock-items"));
  await upsert("stock_movements", await fixture("stock-movements"));
  await upsert("analyses", await fixture("analyses"));
  await upsert("transfer_orders", await fixture("transfer-orders"));
  await upsert("traceability_events", await fixture("traceability-events"));
  await upsert("sensor_readings", await fixture("sensor-readings"));
  await upsert("alert_rules", await fixture("alert-rules"));
  await upsert("alerts", await fixture("alerts"));
  await upsert("bottling_batches", await fixture("bottling-batches"));
  await upsert("audit_logs", await fixture("audit-logs"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
