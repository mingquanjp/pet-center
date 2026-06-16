import { query } from "../../db/query.js";

type DatabaseHealthRow = {
  now: Date;
};

export async function getDatabaseNow(): Promise<Date> {
  const result = await query<DatabaseHealthRow>("select now() as now");
  return result.rows[0].now;
}
