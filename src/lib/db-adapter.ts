import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Builds the mariadb driver adapter from a MySQL/TiDB connection URL.
// TLS is enabled automatically for any non-local host — managed databases
// like TiDB Cloud and PlanetScale require it. Local dev (localhost) stays plain.
export function makeMariaAdapter(databaseUrl: string): PrismaMariaDb {
  const url = new URL(databaseUrl);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || undefined,
    // `true` enables TLS with the system CA store + SNI (works with TiDB Cloud).
    ssl: isLocal ? undefined : true,
  });
}
