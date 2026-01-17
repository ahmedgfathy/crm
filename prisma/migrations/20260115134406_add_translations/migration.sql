-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Translation_locale_idx" ON "Translation"("locale");

-- CreateIndex
CREATE INDEX "Translation_category_idx" ON "Translation"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_key_locale_key" ON "Translation"("key", "locale");
