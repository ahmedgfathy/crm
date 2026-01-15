-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SignupRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT NOT NULL,
    "password" TEXT,
    "subscriptionPlanId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SignupRequest_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SignupRequest" ("company", "createdAt", "email", "id", "mobile", "note", "password", "status", "updatedAt") SELECT "company", "createdAt", "email", "id", "mobile", "note", "password", "status", "updatedAt" FROM "SignupRequest";
DROP TABLE "SignupRequest";
ALTER TABLE "new_SignupRequest" RENAME TO "SignupRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
