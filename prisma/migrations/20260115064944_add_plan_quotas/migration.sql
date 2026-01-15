-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN "bandwidthGB" INTEGER;
ALTER TABLE "SubscriptionPlan" ADD COLUMN "estatesLimit" INTEGER;
ALTER TABLE "SubscriptionPlan" ADD COLUMN "leadsLimit" INTEGER;
ALTER TABLE "SubscriptionPlan" ADD COLUMN "propertiesLimit" INTEGER;
ALTER TABLE "SubscriptionPlan" ADD COLUMN "storageGB" INTEGER;
ALTER TABLE "SubscriptionPlan" ADD COLUMN "usersLimit" INTEGER;
