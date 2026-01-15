-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "brief" TEXT,
    "history" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrimaryProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "status" TEXT DEFAULT 'Planned',
    "description" TEXT,
    "developerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrimaryProject_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrimaryUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT DEFAULT 'AVAILABLE',
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
