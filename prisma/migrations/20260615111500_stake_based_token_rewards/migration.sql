UPDATE "User"
SET "walletBalance" = "walletBalance" + COALESCE((
    SELECT SUM(
        CASE
            WHEN "Bet"."points" IS NULL THEN COALESCE("Bet"."rewardTokens", 0)
            WHEN "Bet"."points" = 3 THEN "Bet"."stakeAmount" * 3
            WHEN "Bet"."points" >= 1 THEN "Bet"."stakeAmount" * 2
            ELSE 0
        END - COALESCE("Bet"."rewardTokens", 0)
    )
    FROM "Bet"
    WHERE "Bet"."userId" = "User"."id"
), 0);

UPDATE "Bet"
SET "rewardTokens" = CASE
    WHEN "points" IS NULL THEN NULL
    WHEN "points" = 3 THEN "stakeAmount" * 3
    WHEN "points" >= 1 THEN "stakeAmount" * 2
    ELSE 0
END;
