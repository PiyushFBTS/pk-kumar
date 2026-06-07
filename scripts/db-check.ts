import { createConnection } from "mariadb";

// Read-only connectivity check. Run with the URL in an env var so credentials
// are not written to a file:  $env:CHECK_DATABASE_URL = "..."; npm run db:check
const raw = process.env.CHECK_DATABASE_URL;
if (!raw) {
  console.error("Set CHECK_DATABASE_URL");
  process.exit(1);
}

const url = new URL(raw);
const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";

(async () => {
  const conn = await createConnection({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || undefined,
    ssl: isLocal ? undefined : true,
    connectTimeout: 15000,
  });
  const version = await conn.query("SELECT VERSION() AS v");
  const dbs = await conn.query("SHOW DATABASES");
  console.info("Connected ✓  version:", version[0].v);
  console.info(
    "Databases:",
    dbs.map((d: Record<string, unknown>) => Object.values(d)[0]),
  );
  await conn.end();
})().catch((e) => {
  console.error("Connection failed:", e.message);
  process.exit(1);
});
