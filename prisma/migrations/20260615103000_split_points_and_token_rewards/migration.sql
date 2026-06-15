ALTER TABLE "Bet" ADD COLUMN "rewardTokens" INTEGER;

UPDATE "Bet"
SET "rewardTokens" = CASE
    WHEN "points" IS NULL THEN NULL
    WHEN "points" >= 100 THEN "points"
    WHEN "points" = 3 THEN 300
    WHEN "points" = 1 THEN 100
    ELSE 0
END;

UPDATE "Bet"
SET "points" = CASE
    WHEN "points" IS NULL THEN NULL
    WHEN "points" >= 100 THEN "points" / 100
    ELSE "points"
END;
