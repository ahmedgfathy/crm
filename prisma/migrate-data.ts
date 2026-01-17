import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Migrating existing data to new structure...");

  // Migrate Property type/status to keys
  const properties = await prisma.$queryRaw<any[]>`SELECT * FROM Property`;
  for (const prop of properties) {
    const typeKey = prop.type?.toLowerCase().replace(/\s+/g, "_") || "apartment";
    const statusKey = prop.status?.toLowerCase().replace(/\s+/g, "_") || "available";
    await prisma.$executeRaw`UPDATE Property SET type = ${typeKey}, status = ${statusKey} WHERE id = ${prop.id}`;
  }

  // Migrate Lead status/source/stage to keys
  const leads = await prisma.$queryRaw<any[]>`SELECT * FROM Lead`;
  for (const lead of leads) {
    const statusKey = lead.status?.toLowerCase().replace(/\s+/g, "_") || "new";
    const sourceKey = lead.source?.toLowerCase().replace(/\s+/g, "_") || null;
    const stageKey = lead.stage?.toLowerCase().replace(/\s+/g, "_") || "prospect";
    await prisma.$executeRaw`UPDATE Lead SET status = ${statusKey}, source = ${sourceKey}, stage = ${stageKey} WHERE id = ${lead.id}`;
  }

  // Migrate Opportunity stage/status to keys
  const opportunities = await prisma.$queryRaw<any[]>`SELECT * FROM Opportunity`;
  for (const opp of opportunities) {
    const stageKey = opp.stage?.toLowerCase().replace(/\s+/g, "_") || "qualified";
    const statusKey = opp.status?.toLowerCase().replace(/\s+/g, "_") || "open";
    await prisma.$executeRaw`UPDATE Opportunity SET stage = ${stageKey}, status = ${statusKey} WHERE id = ${opp.id}`;
  }

  // Migrate PrimaryProject status to keys
  const projects = await prisma.$queryRaw<any[]>`SELECT * FROM PrimaryProject`;
  for (const proj of projects) {
    const statusKey = proj.status?.toLowerCase().replace(/\s+/g, "_") || "planned";
    await prisma.$executeRaw`UPDATE PrimaryProject SET status = ${statusKey} WHERE id = ${proj.id}`;
  }

  // Migrate PrimaryUnit type/status to keys
  const units = await prisma.$queryRaw<any[]>`SELECT * FROM PrimaryUnit`;
  for (const unit of units) {
    const typeKey = unit.type?.toLowerCase().replace(/\s+/g, "_") || "unit";
    const statusKey = unit.status?.toLowerCase().replace(/\s+/g, "_") || "available";
    await prisma.$executeRaw`UPDATE PrimaryUnit SET type = ${typeKey}, status = ${statusKey} WHERE id = ${unit.id}`;
  }

  console.log("Data migration complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
