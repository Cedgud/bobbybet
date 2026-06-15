"use server";

import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { betSchema, matchImportSchema, matchResultSchema, profileSchema, signUpSchema } from "@/lib/validators";
import { STARTING_TOKENS, calculateBetPoints, calculateBetRewardTokens, ensureDailyTokenGrant, getParisDateKey, getWinnerFromScore } from "@/lib/wallet";

export type ActionState = {
  ok: boolean;
  message: string;
};

const initialError: ActionState = {
  ok: false,
  message: "Une erreur est survenue.",
};

async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth");
  }

  await ensureDailyTokenGrant(session.user.id);

  return session;
}

async function requireAdmin() {
  const session = await requireSession();

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

async function saveAvatar(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (file.size > 1_500_000) {
    throw new Error("Avatar trop lourd. Maximum 1,5 Mo.");
  }

  const allowedTypes = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]);
  const extension = allowedTypes.get(file.type);

  if (!extension) {
    throw new Error("Format avatar non supporte. Utilise JPG, PNG ou WEBP.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), bytes);

  return `/uploads/avatars/${fileName}`;
}

type RecalculableMatch = {
  id: string;
  winner: string | null;
  homeScore: number | null;
  awayScore: number | null;
  bets: Array<{
    id: string;
    userId: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
    stakeAmount: number;
    points: number | null;
    rewardTokens: number | null;
  }>;
};

function normalizeWinner(value: string | null) {
  return value === "HOME" || value === "AWAY" || value === "DRAW" ? value : null;
}

async function applyMatchRewards(matches: RecalculableMatch[]) {
  const rewardOperations = matches.flatMap((match) =>
    match.bets.flatMap((bet) => {
      const winner = normalizeWinner(match.winner);
      const points = calculateBetPoints({
        predictedHomeScore: bet.predictedHomeScore,
        predictedAwayScore: bet.predictedAwayScore,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        winner,
      });
      const rewardTokens = calculateBetRewardTokens({
        predictedHomeScore: bet.predictedHomeScore,
        predictedAwayScore: bet.predictedAwayScore,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        winner,
        stakeAmount: bet.stakeAmount,
      });
      const rewardDelta = (rewardTokens ?? 0) - (bet.rewardTokens ?? 0);

      return [
        prisma.bet.update({
          where: { id: bet.id },
          data: { points, rewardTokens },
        }),
        ...(rewardDelta !== 0
          ? [
              prisma.user.update({
                where: { id: bet.userId },
                data: { walletBalance: { increment: rewardDelta } },
              }),
            ]
          : []),
      ];
    }),
  );

  if (rewardOperations.length > 0) {
    await prisma.$transaction(rewardOperations);
  }
}

export async function signUpAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    pseudo: formData.get("pseudo"),
    email: formData.get("email"),
    password: formData.get("password"),
    vibe: formData.get("vibe"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? initialError.message };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { ok: false, message: "Un compte existe deja avec cet email." };
  }

  const userCount = await prisma.user.count();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      pseudo: parsed.data.pseudo,
      vibe: parsed.data.vibe ?? "",
      role: userCount === 0 ? "ADMIN" : "USER",
      walletBalance: STARTING_TOKENS,
      dailyTokenGrants: {
        create: {
          grantDate: getParisDateKey(),
          amount: 0,
        },
      },
    },
  });

  revalidatePath("/");

  return {
    ok: true,
    message: userCount === 0 ? "Compte admin cree. Tu peux te connecter." : "Compte cree. Tu peux te connecter.",
  };
}

export async function updateProfileAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = profileSchema.safeParse({
    pseudo: formData.get("pseudo"),
    vibe: formData.get("vibe"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Verifie ton pseudo et ta phrase d'ambiance." };
  }

  try {
    const avatarUrl = await saveAvatar(formData.get("avatar") as File | null);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pseudo: parsed.data.pseudo,
        vibe: parsed.data.vibe,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/account");

    return { ok: true, message: "Profil mis a jour." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : initialError.message };
  }
}

export async function importMatchesAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const jsonFile = formData.get("matchesFile") as File | null;
  const pastedJson = String(formData.get("matchesJson") ?? "").trim();

  let raw = pastedJson;
  if (jsonFile && jsonFile.size > 0) {
    raw = await jsonFile.text();
  }

  if (!raw) {
    return { ok: false, message: "Ajoute un fichier JSON ou colle un contenu JSON." };
  }

  try {
    const parsedJson = JSON.parse(raw);
    const matches = matchImportSchema.parse(parsedJson);

    await prisma.$transaction(
      matches.map((match) =>
        prisma.match.upsert({
          where: {
            competition_homeTeam_awayTeam_kickoffAt: {
              competition: match.competition,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              kickoffAt: new Date(match.kickoffAt),
            },
          },
          create: {
            competition: match.competition,
            groupName: match.group ?? null,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            kickoffAt: new Date(match.kickoffAt),
            status: match.status ?? "SCHEDULED",
            homeScore: match.homeScore ?? null,
            awayScore: match.awayScore ?? null,
            winner: match.winner ?? getWinnerFromScore(match.homeScore ?? null, match.awayScore ?? null),
          },
          update: {
            groupName: match.group ?? null,
            status: match.status ?? "SCHEDULED",
            homeScore: match.homeScore ?? null,
            awayScore: match.awayScore ?? null,
            winner: match.winner ?? getWinnerFromScore(match.homeScore ?? null, match.awayScore ?? null),
          },
        }),
      ),
    );

    const updatedMatches = await prisma.match.findMany({
      where: {
        OR: matches.map((match) => ({
          competition: match.competition,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          kickoffAt: new Date(match.kickoffAt),
        })),
      },
      include: { bets: true },
    });

    await applyMatchRewards(updatedMatches);

    revalidatePath("/");
    revalidatePath("/admin");

    return { ok: true, message: `${matches.length} match(s) importe(s).` };
  } catch {
    return { ok: false, message: "JSON invalide ou donnees incompatibles." };
  }
}

export async function saveMatchResultAction(formData: FormData) {
  await requireAdmin();

  const parsed = matchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    winner: formData.get("winner"),
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
  });

  if (!parsed.success) {
    redirect("/admin");
  }

  const hasFullScore = parsed.data.homeScore !== null && parsed.data.awayScore !== null;
  const winner = hasFullScore ? getWinnerFromScore(parsed.data.homeScore, parsed.data.awayScore) : parsed.data.winner;

  const match = await prisma.match.update({
    where: { id: parsed.data.matchId },
    data: {
      winner,
      homeScore: hasFullScore ? parsed.data.homeScore : null,
      awayScore: hasFullScore ? parsed.data.awayScore : null,
      status: "FINISHED",
    },
    include: { bets: true },
  });

  await applyMatchRewards([match]);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath(`/matches/${parsed.data.matchId}`);
  redirect("/admin");
}

export async function saveBetAction(formData: FormData) {
  const session = await requireSession();
  const returnTo = safeReturnPath(String(formData.get("returnTo") ?? "/#matchs"));
  const parsed = betSchema.safeParse({
    matchId: formData.get("matchId"),
    predictedHomeScore: formData.get("predictedHomeScore"),
    predictedAwayScore: formData.get("predictedAwayScore"),
    stakeAmount: formData.get("stakeAmount"),
  });

  if (!parsed.success) {
    redirect(returnTo);
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    select: { kickoffAt: true, status: true, homeScore: true, awayScore: true, winner: true },
  });
  if (!match || match.kickoffAt <= new Date() || match.status !== "SCHEDULED" || match.homeScore !== null || match.awayScore !== null || match.winner !== null) {
    redirect(returnTo);
  }

  const existingBet = await prisma.bet.findUnique({
    where: {
      userId_matchId: {
        userId: session.user.id,
        matchId: parsed.data.matchId,
      },
    },
    select: { id: true },
  });
  if (existingBet) {
    redirect(returnTo);
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { walletBalance: true },
  });
  const points = calculateBetPoints({
    predictedHomeScore: parsed.data.predictedHomeScore,
    predictedAwayScore: parsed.data.predictedAwayScore,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    winner: normalizeWinner(match.winner),
  });
  const rewardTokens = calculateBetRewardTokens({
    predictedHomeScore: parsed.data.predictedHomeScore,
    predictedAwayScore: parsed.data.predictedAwayScore,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    winner: normalizeWinner(match.winner),
    stakeAmount: parsed.data.stakeAmount,
  });

  if (user.walletBalance < parsed.data.stakeAmount) {
    redirect(returnTo);
  }

  const walletDelta = (rewardTokens ?? 0) - parsed.data.stakeAmount;

  try {
    await prisma.$transaction([
      prisma.bet.create({
        data: {
          userId: session.user.id,
          matchId: parsed.data.matchId,
          predictedHomeScore: parsed.data.predictedHomeScore,
          predictedAwayScore: parsed.data.predictedAwayScore,
          stakeAmount: parsed.data.stakeAmount,
          points,
          rewardTokens,
        },
      }),
      ...(walletDelta !== 0
        ? [
            prisma.user.update({
              where: { id: session.user.id },
              data: { walletBalance: { increment: walletDelta } },
            }),
          ]
        : []),
    ]);
  } catch {
    redirect(returnTo);
  }

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath(`/matches/${parsed.data.matchId}`);
  redirect(returnTo);
}

function safeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/#matchs";
  }

  return value;
}

