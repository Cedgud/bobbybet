import { z } from "zod";

const optionalScoreSchema = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().min(0).max(30).nullable(),
);

export const signUpSchema = z.object({
  pseudo: z.string().trim().min(2, "Le pseudo doit contenir au moins 2 caracteres.").max(32),
  email: z.string().trim().email("Email invalide.").toLowerCase(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
  vibe: z.string().trim().max(140).optional(),
});

export const profileSchema = z.object({
  pseudo: z.string().trim().min(2).max(32),
  vibe: z.string().trim().max(140),
});

export const betSchema = z.object({
  matchId: z.string().min(1),
  predictedHomeScore: z.coerce.number().int().min(0).max(30),
  predictedAwayScore: z.coerce.number().int().min(0).max(30),
  stakeAmount: z.coerce.number().int().min(10).max(500),
});

export const matchImportSchema = z.array(
  z.object({
    competition: z.string().trim().min(2),
    homeTeam: z.string().trim().min(2),
    awayTeam: z.string().trim().min(2),
    kickoffAt: z.string().datetime(),
    group: z.string().trim().optional(),
    status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]).optional(),
    homeScore: z.number().int().min(0).nullable().optional(),
    awayScore: z.number().int().min(0).nullable().optional(),
    winner: z.enum(["HOME", "AWAY", "DRAW"]).nullable().optional(),
  }),
);

export const matchResultSchema = z.object({
  matchId: z.string().min(1),
  winner: z.enum(["HOME", "AWAY", "DRAW"]),
  homeScore: optionalScoreSchema,
  awayScore: optionalScoreSchema,
});
