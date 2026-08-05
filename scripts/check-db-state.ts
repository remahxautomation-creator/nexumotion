/** Reports what actually exists in the target database — read-only. */
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = neon(url);

  const tables = (await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `) as { table_name: string }[];

  console.log(`tables in public schema: ${tables.length}`);
  for (const t of tables) console.log("  -", t.table_name);

  // Count rows in any application table that exists, so we know whether
  // anything would actually be destroyed.
  //
  // A table name cannot be a bound parameter, so the identifier is quoted and
  // interpolated. It comes from information_schema, never user input, and is
  // additionally checked against a safe pattern below.
  let totalRows = 0;
  for (const t of tables) {
    if (t.table_name.startsWith("_prisma")) continue;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(t.table_name)) continue;
    try {
      const r = (await sql.query(`SELECT COUNT(*)::int AS c FROM "${t.table_name}"`)) as { c: number }[];
      if (r[0].c > 0) console.log(`    ${t.table_name}: ${r[0].c} rows`);
      totalRows += r[0].c;
    } catch { /* ignore */ }
  }
  console.log(`\napplication rows across all tables: ${totalRows}`);
  process.exit(0);
}
main().catch((e) => { console.error(String(e).slice(0, 200)); process.exit(1); });
