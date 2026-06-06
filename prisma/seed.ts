import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { partners, practiceAreas } from "../src/content/firm";

// Seed baseline content from the firm content module (single source of truth).
// Run with: npm run db:seed
const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

const resources = [
  { label: "MCA", url: "https://www.mca.gov.in/", category: "Regulatory", order: 1 },
  { label: "CBDT", url: "https://www.incometax.gov.in/", category: "Tax", order: 2 },
  { label: "GST Portal", url: "https://www.gst.gov.in/", category: "Tax", order: 3 },
  { label: "SEBI", url: "https://www.sebi.gov.in/", category: "Regulatory", order: 4 },
  { label: "RBI", url: "https://www.rbi.org.in/", category: "Regulatory", order: 5 },
];

async function main() {
  // Admin user
  const adminEmail = "admin@prkumar.in";
  const passwordHash = await bcrypt.hash("ChangeMe@123", 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: "Administrator", email: adminEmail, passwordHash, role: "ADMIN" },
  });

  for (const p of partners) {
    const data = {
      slug: p.slug,
      name: p.name,
      role: p.role,
      bio: `${p.credentials}. ${p.bio}`,
      phone: p.phone,
      email: p.email,
      order: p.order,
    };
    await prisma.partner.upsert({ where: { slug: p.slug }, update: data, create: data });
  }

  for (const a of practiceAreas) {
    const data = {
      slug: a.slug,
      name: a.name,
      leadPartner: a.leads.join(", "),
      summary: a.summary,
      services: a.services,
      order: a.order,
    };
    await prisma.practiceArea.upsert({ where: { slug: a.slug }, update: data, create: data });
  }

  // Resources have no natural unique key; only seed when empty.
  if ((await prisma.resource.count()) === 0) {
    await prisma.resource.createMany({ data: resources });
  }

  console.info("✔ Seed complete. Admin login: admin@prkumar.in / ChangeMe@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
