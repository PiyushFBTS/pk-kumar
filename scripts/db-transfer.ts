import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { makeMariaAdapter } from "../src/lib/db-adapter";

/*
 * Copies all rows from a SOURCE database to a TARGET database.
 * The TARGET schema must already exist (run `prisma migrate deploy` against it first).
 *
 * Usage (PowerShell):
 *   $env:SOURCE_DATABASE_URL = "mysql://root:pass@localhost:3306/prkumar"
 *   $env:TARGET_DATABASE_URL = "mysql://user:pass@<tidb-host>:4000/prkumar"
 *   npm run db:transfer
 */
// SOURCE defaults to the local DATABASE_URL from .env; TARGET must be provided.
const SOURCE = process.env.SOURCE_DATABASE_URL ?? process.env.DATABASE_URL;
const TARGET = process.env.TARGET_DATABASE_URL;

if (!SOURCE || !TARGET) {
  console.error("Set TARGET_DATABASE_URL (SOURCE defaults to .env DATABASE_URL).");
  process.exit(1);
}
if (SOURCE === TARGET) {
  console.error("SOURCE and TARGET are the same database — aborting.");
  process.exit(1);
}

const src = new PrismaClient({ adapter: makeMariaAdapter(SOURCE) });
const dst = new PrismaClient({ adapter: makeMariaAdapter(TARGET) });

async function main() {
  // Read everything from the source.
  const [users, partners, areas, quotes, resources, articles, enquiries, applications] =
    await Promise.all([
      src.user.findMany(),
      src.partner.findMany(),
      src.practiceArea.findMany(),
      src.partnerQuote.findMany(),
      src.resource.findMany(),
      src.article.findMany(),
      src.enquiry.findMany(),
      src.jobApplication.findMany(),
    ]);

  // Insert into the target. Users first (articles reference them); the rest are
  // independent. skipDuplicates keeps the run idempotent if re-run.
  if (users.length) await dst.user.createMany({ data: users, skipDuplicates: true });
  if (partners.length) await dst.partner.createMany({ data: partners, skipDuplicates: true });
  if (areas.length) await dst.practiceArea.createMany({ data: areas, skipDuplicates: true });
  if (quotes.length) await dst.partnerQuote.createMany({ data: quotes, skipDuplicates: true });
  if (resources.length) await dst.resource.createMany({ data: resources, skipDuplicates: true });
  if (articles.length) await dst.article.createMany({ data: articles, skipDuplicates: true });
  if (enquiries.length) await dst.enquiry.createMany({ data: enquiries, skipDuplicates: true });
  if (applications.length)
    await dst.jobApplication.createMany({ data: applications, skipDuplicates: true });

  console.info("✔ Transfer complete:", {
    users: users.length,
    partners: partners.length,
    practiceAreas: areas.length,
    quotes: quotes.length,
    resources: resources.length,
    articles: articles.length,
    enquiries: enquiries.length,
    applications: applications.length,
  });
}

main()
  .catch((e) => {
    console.error("Transfer failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await src.$disconnect();
    await dst.$disconnect();
  });
