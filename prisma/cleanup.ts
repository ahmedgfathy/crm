import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up unused tables...");
  
  await prisma.$executeRaw`DELETE FROM SignupRequest`;
  await prisma.$executeRaw`DELETE FROM SubscriptionPlan`;
  await prisma.$executeRaw`DELETE FROM Subscription`;
  
  console.log("Cleanup complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
