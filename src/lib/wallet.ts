import { prisma } from "@/lib/prisma";

export const STARTING_TOKENS = 500;
export const DAILY_TOKENS = 100;
export type MatchWinner = "HOME" | "AWAY" | "DRAW";

export function getParisDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function ensureDailyTokenGrant(userId: string) {
  const grantDate = getParisDateKey();

  try {
    await prisma.$transaction([
      prisma.dailyTokenGrant.create({
        data: {
          userId,
          grantDate,
          amount: DAILY_TOKENS,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: DAILY_TOKENS } },
      }),
    ]);
  } catch {
    // Unique constraint means today's grant already exists.
  }
}

export function calculateBetPoints({
  predictedHomeScore,
  predictedAwayScore,
  homeScore,
  awayScore,
  winner,
}: {
  predictedHomeScore: number;
  predictedAwayScore: number;
  homeScore: number | null;
  awayScore: number | null;
  winner?: MatchWinner | null;
}) {
  const actualWinner = winner ?? getWinnerFromScore(homeScore, awayScore);

  if (!actualWinner) {
    return null;
  }

  const predictedWinner = getWinnerFromScore(predictedHomeScore, predictedAwayScore);
  let points = predictedWinner === actualWinner ? 1 : 0;

  if (homeScore !== null && awayScore !== null && predictedHomeScore === homeScore && predictedAwayScore === awayScore) {
    points += 2;
  }

  return points;
}

export function calculateBetRewardTokens(result: Parameters<typeof calculateBetPoints>[0] & { stakeAmount: number }) {
  const points = calculateBetPoints(result);

  if (points === null) {
    return null;
  }

  if (points === 3) {
    return result.stakeAmount * 3;
  }

  if (points >= 1) {
    return result.stakeAmount * 2;
  }

  return 0;
}

export function getWinnerFromScore(homeScore: number | null, awayScore: number | null): MatchWinner | null {
  if (homeScore === null || awayScore === null) {
    return null;
  }

  if (homeScore > awayScore) {
    return "HOME";
  }

  if (homeScore < awayScore) {
    return "AWAY";
  }

  return "DRAW";
}
