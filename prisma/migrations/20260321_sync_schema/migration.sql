-- CreateTable
CREATE TABLE "ShopSettings" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "language" TEXT NOT NULL DEFAULT 'en'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ThemeSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "themeId" TEXT NOT NULL,
    "themeName" TEXT NOT NULL,
    "userName" TEXT NOT NULL DEFAULT 'System',
    "notes" TEXT,
    "scheduledAt" DATETIME NOT NULL,
    "executedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shop" TEXT NOT NULL,
    "previousThemeId" TEXT,
    "previousThemeName" TEXT,
    "backupThemeId" TEXT,
    "backupThemeName" TEXT,
    "errorDetail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ThemeSchedule" ("createdAt", "id", "scheduledAt", "shop", "status", "themeId", "themeName") SELECT "createdAt", "id", "scheduledAt", "shop", "status", "themeId", "themeName" FROM "ThemeSchedule";
DROP TABLE "ThemeSchedule";
ALTER TABLE "new_ThemeSchedule" RENAME TO "ThemeSchedule";
CREATE INDEX "ThemeSchedule_scheduledAt_idx" ON "ThemeSchedule"("scheduledAt");
CREATE INDEX "ThemeSchedule_status_idx" ON "ThemeSchedule"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

