/*
  Warnings:

  - You are about to drop the `SignupRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `source` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PrimaryProject` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PrimaryUnit` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PrimaryUnit` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Property` table. All the data in the column will be lost.
  - Added the required column `typeKey` to the `PrimaryUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeKey` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Subscription_companyId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SignupRequest";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subscription";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubscriptionPlan";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "DataOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "statusKey" TEXT NOT NULL DEFAULT 'new',
    "sourceKey" TEXT,
    "stageKey" TEXT DEFAULT 'prospect',
    "budget" INTEGER,
    "currency" TEXT DEFAULT 'EGP',
    "region" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("budget", "companyId", "contactEmail", "contactName", "contactPhone", "createdAt", "currency", "id", "notes", "region", "title") SELECT "budget", "companyId", "contactEmail", "contactName", "contactPhone", "createdAt", "currency", "id", "notes", "region", "title" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE TABLE "new_Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "stageKey" TEXT NOT NULL DEFAULT 'qualified',
    "statusKey" TEXT NOT NULL DEFAULT 'open',
    "value" INTEGER,
    "currency" TEXT DEFAULT 'EGP',
    "probability" REAL DEFAULT 0,
    "closeDate" DATETIME,
    "owner" TEXT,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Opportunity" ("closeDate", "companyId", "createdAt", "currency", "id", "notes", "owner", "probability", "title", "value") SELECT "closeDate", "companyId", "createdAt", "currency", "id", "notes", "owner", "probability", "title", "value" FROM "Opportunity";
DROP TABLE "Opportunity";
ALTER TABLE "new_Opportunity" RENAME TO "Opportunity";
CREATE TABLE "new_PrimaryProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "statusKey" TEXT DEFAULT 'planned',
    "description" TEXT,
    "developerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrimaryProject_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PrimaryProject" ("createdAt", "description", "developerId", "id", "name", "region") SELECT "createdAt", "description", "developerId", "id", "name", "region" FROM "PrimaryProject";
DROP TABLE "PrimaryProject";
ALTER TABLE "new_PrimaryProject" RENAME TO "PrimaryProject";
CREATE TABLE "new_PrimaryUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "typeKey" TEXT NOT NULL,
    "statusKey" TEXT DEFAULT 'available',
    "price" INTEGER,
    "currency" TEXT DEFAULT 'EGP',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" INTEGER,
    "areaUnit" TEXT DEFAULT 'sqm',
    "region" TEXT,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrimaryUnit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "PrimaryProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PrimaryUnit" ("area", "areaUnit", "bathrooms", "bedrooms", "createdAt", "currency", "id", "notes", "price", "projectId", "region", "title") SELECT "area", "areaUnit", "bathrooms", "bedrooms", "createdAt", "currency", "id", "notes", "price", "projectId", "region", "title" FROM "PrimaryUnit";
DROP TABLE "PrimaryUnit";
ALTER TABLE "new_PrimaryUnit" RENAME TO "PrimaryUnit";
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "typeKey" TEXT NOT NULL,
    "statusKey" TEXT NOT NULL DEFAULT 'available',
    "price" INTEGER,
    "currency" TEXT DEFAULT 'EGP',
    "addressLine" TEXT,
    "city" TEXT,
    "country" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" INTEGER,
    "areaUnit" TEXT DEFAULT 'sqm',
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "listedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Property_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("addressLine", "area", "areaUnit", "bathrooms", "bedrooms", "city", "companyId", "country", "createdAt", "currency", "description", "id", "listedAt", "price", "title") SELECT "addressLine", "area", "areaUnit", "bathrooms", "bedrooms", "city", "companyId", "country", "createdAt", "currency", "description", "id", "listedAt", "price", "title" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DataOption_category_idx" ON "DataOption"("category");

-- CreateIndex
CREATE INDEX "DataOption_isActive_idx" ON "DataOption"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DataOption_category_key_key" ON "DataOption"("category", "key");
