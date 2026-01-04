import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<boolean, boolean> | null = null;

export function getDb(): NeonQueryFunction<boolean, boolean> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    _sql = neon(url);
  }
  return _sql;
}

// For testing: reset the connection
export function resetDb(): void {
  _sql = null;
}
