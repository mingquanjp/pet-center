import type { PoolClient } from "pg";
import { query } from "../../db/query.js";

const supportedPrefixes = new Set([
  "own",
  "stf",
  "doc",
  "adm",
  "prt",
  "pet",
  "hp",
  "svc",
  "med",
  "appt",
  "mex",
  "efd",
  "efv",
  "rx",
  "rxi",
  "vac",
  "fui",
  "spa",
  "gti",
  "rt",
  "brd",
  "bup",
  "inv",
  "inl",
  "pay",
  "noti",
  "elog",
  "rem"
]);

type QueryClient = Pick<PoolClient, "query">;

export async function createId(prefix: string, client?: QueryClient): Promise<string> {
  if (!supportedPrefixes.has(prefix)) {
    throw new Error(`Unsupported ID prefix: ${prefix}`);
  }

  const executor = client ?? { query };
  const result = await executor.query<{ id: string }>(
    "select $1::text || nextval($2::regclass)::text as id",
    [prefix, `pet_center.${prefix}_id_seq`]
  );

  return result.rows[0]!.id;
}
