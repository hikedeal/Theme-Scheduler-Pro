-- CreateTable
CREATE TABLE "ThemeSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "themeId" TEXT NOT NULL,
    "themeName" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ThemeSchedule_scheduledAt_idx" ON "ThemeSchedule"("scheduledAt");

-- CreateIndex
CREATE INDEX "ThemeSchedule_status_idx" ON "ThemeSchedule"("status");
