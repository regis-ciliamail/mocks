import { z } from 'zod/v4';
import { onlyDigits } from '#shared/text';

const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .pipe(z.string().length(11, 'O CPF deve ter 11 dígitos.'));

export const loginAccountSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const loginAccountsQuerySchema = z.object({
  username: cpfSchema.describe('CPF com 11 dígitos, com ou sem pontuação.'),
});

export const sessionUserSchema = z.object({
  name: z.string(),
  organization: z.string(),
  role: z.string().nullable(),
  avatarUrl: z.string().nullable(),
}).meta({ id: 'SessionUser' });

export const dualLoginBodySchema = z.object({
  username: cpfSchema,
  accountId: z.number().int().positive().describe('Conta escolhida entre as retornadas por `/auth/accounts`.'),
  password: z.string().min(1, 'Informe a senha.'),
});

export const dualLoginResultSchema = z.object({
  accessToken: z.string().describe('Token de sessão, enviado no header `Authorization: Bearer <token>`.'),
  user: sessionUserSchema,
  legacyFinalizeUrl: z.string().nullable(),
  legacyHandoffExpiresAt: z.iso.datetime().nullable(),
});

export const ciliaSsoBodySchema = z.object({
  userToken: z.string().trim().min(1, 'Token do Cilia Web ausente.'),
});

export const ciliaSsoResultSchema = z.object({
  accessToken: z.string(),
  user: sessionUserSchema,
});

export type LoginAccount = z.infer<typeof loginAccountSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type DualLoginBody = z.output<typeof dualLoginBodySchema>;
export type DualLoginResult = z.infer<typeof dualLoginResultSchema>;
export type CiliaSsoResult = z.infer<typeof ciliaSsoResultSchema>;
