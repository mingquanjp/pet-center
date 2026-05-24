import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

const sqlPath = resolve(process.cwd(), "../database/init_db.sql");
const sql = await readFile(sqlPath, "utf8");

const client = new Client({
  connectionString: databaseUrl
});

try {
  await client.connect();
  await client.query(sql);

  const tables = await client.query<{ table_name: string }>(`
    select table_name
    from information_schema.tables
    where table_schema = 'pet_center'
    order by table_name
  `);

  console.log(`Database initialized successfully. Tables created: ${tables.rowCount ?? 0}`);
  console.log(tables.rows.map((row) => `- pet_center.${row.table_name}`).join("\n"));
} finally {
  await client.end();
}
