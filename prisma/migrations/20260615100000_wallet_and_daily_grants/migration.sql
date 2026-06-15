ALTER TABLE "User" ADD COLUMN "walletBalance" INTEGER NOT NULL DEFAULT 500;

CREATE TABLE "DailyTokenGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "grantDate" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyTokenGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DailyTokenGrant_userId_grantDate_key" ON "DailyTokenGrant"("userId", "grantDate");
