-- BlogPost table for D1. Apply once:
--   npx wrangler d1 execute nexumotion --remote --file prisma/d1-blog.sql
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT,
    "excerptAr" TEXT NOT NULL,
    "excerptEn" TEXT,
    "bodyAr" TEXT NOT NULL,
    "bodyEn" TEXT,
    "keywords" TEXT,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");
