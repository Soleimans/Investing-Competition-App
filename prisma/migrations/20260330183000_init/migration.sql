-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "CompetitionVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "TransactionSide" AS ENUM ('BUY');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'CASH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profileImageDataUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "visibility" "CompetitionVisibility" NOT NULL DEFAULT 'PRIVATE',
    "joinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionMember" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "lastVisitedAt" TIMESTAMP(3),
    CONSTRAINT "CompetitionMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentTransaction" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL DEFAULT 'STOCK',
    "ticker" TEXT NOT NULL,
    "companyName" TEXT,
    "side" "TransactionSide" NOT NULL DEFAULT 'BUY',
    "quantity" DECIMAL(18,6) NOT NULL,
    "pricePerShare" DECIMAL(18,6) NOT NULL,
    "quoteCurrency" TEXT NOT NULL DEFAULT 'USD',
    "executedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvestmentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymbolPriceSnapshot" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "price" DECIMAL(18,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "source" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SymbolPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalValue" DECIMAL(18,6) NOT NULL,
    "totalCost" DECIMAL(18,6) NOT NULL,
    "pnl" DECIMAL(18,6) NOT NULL,
    "snapshottedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "Competition_slug_key" ON "Competition"("slug");
CREATE UNIQUE INDEX "Competition_joinCode_key" ON "Competition"("joinCode");
CREATE INDEX "Competition_createdById_idx" ON "Competition"("createdById");
CREATE UNIQUE INDEX "CompetitionMember_competitionId_userId_key" ON "CompetitionMember"("competitionId", "userId");
CREATE INDEX "CompetitionMember_userId_pinned_idx" ON "CompetitionMember"("userId", "pinned");
CREATE INDEX "CompetitionMember_userId_lastVisitedAt_idx" ON "CompetitionMember"("userId", "lastVisitedAt");
CREATE INDEX "InvestmentTransaction_competitionId_executedAt_idx" ON "InvestmentTransaction"("competitionId", "executedAt");
CREATE INDEX "InvestmentTransaction_userId_competitionId_idx" ON "InvestmentTransaction"("userId", "competitionId");
CREATE INDEX "InvestmentTransaction_ticker_idx" ON "InvestmentTransaction"("ticker");
CREATE INDEX "SymbolPriceSnapshot_ticker_fetchedAt_idx" ON "SymbolPriceSnapshot"("ticker", "fetchedAt");
CREATE INDEX "PortfolioSnapshot_competitionId_snapshottedAt_idx" ON "PortfolioSnapshot"("competitionId", "snapshottedAt");
CREATE INDEX "PortfolioSnapshot_competitionId_userId_snapshottedAt_idx" ON "PortfolioSnapshot"("competitionId", "userId", "snapshottedAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetitionMember" ADD CONSTRAINT "CompetitionMember_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompetitionMember" ADD CONSTRAINT "CompetitionMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InvestmentTransaction" ADD CONSTRAINT "InvestmentTransaction_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InvestmentTransaction" ADD CONSTRAINT "InvestmentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
