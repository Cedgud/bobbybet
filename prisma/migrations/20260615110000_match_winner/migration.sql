ALTER TABLE "Match" ADD COLUMN "winner" TEXT;

UPDATE "Match"
SET "winner" = CASE
    WHEN "homeScore" IS NULL OR "awayScore" IS NULL THEN NULL
    WHEN "homeScore" > "awayScore" THEN 'HOME'
    WHEN "homeScore" < "awayScore" THEN 'AWAY'
    ELSE 'DRAW'
END;
