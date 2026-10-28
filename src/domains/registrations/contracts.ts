import { z } from 'zod/v4';
import { csvEnumSchema, csvStringsSchema, pagedSchema, pagingQuerySchema } from '#shared/paging';
import { onlyDigits } from '#shared/text';
import { PermissionEnum, UserStatusEnum } from './enums';

export const accountSchema = z
  .object({
    id: z.string(),
    legalName: z.string().describe('Razão social.'),
    tradeName: z.string().describe('Nome fantasia.'),
    document: z.string().length(14).describe('CNPJ só com dígitos.'),
    email: z.string(),
    isActive: z.boolean(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'Account' });

export const accountOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const accountFormSchema = z.object({
  legalName: z.string().trim().min(1),
  tradeName: z.string().trim().min(1),
  document: z.string().transform(onlyDigits).pipe(z.string().length(14, 'O CNPJ deve ter 14 dígitos.')),
  email: z.email('E-mail inválido.'),
  isActive: z.boolean(),
});

export const profileSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    permissions: z.array(z.enum(PermissionEnum)),
    usersCount: z.number().int().min(0).describe('Usuários com este perfil.'),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'Profile' });

export const profileOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const profileFormSchema = z.object({
  name: z.string().trim().min(1),
  permissions: z.array(z.enum(PermissionEnum)),
});

export const userSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    document: z.string().length(11).describe('CPF só com dígitos.'),
    email: z.string(),
    status: z.enum(UserStatusEnum),
    accountId: z.string(),
    profileId: z.string(),
    lastAccessAt: z.iso.datetime().nullable(),
  })
  .meta({ id: 'User' });

export const userFormSchema = z.object({
  name: z.string().trim().min(1),
  document: z.string().transform(onlyDigits).pipe(z.string().length(11, 'O CPF deve ter 11 dígitos.')),
  email: z.email('E-mail inválido.'),
  accountId: z.string().min(1),
  profileId: z.string().min(1),
  status: z.enum(UserStatusEnum),
});

export const integrationTokenSchema = z
  .object({
    id: z.string(),
    accountId: z.string(),
    accountName: z.string(),
    system: z.string(),
    token: z
      .string()
      .regex(/^[0-9A-F]{40}$/)
      .describe('Token de 40 caracteres hexadecimais maiúsculos.'),
    url: z.string(),
    isActive: z.boolean(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'IntegrationToken' });

export const integrationTokenCreateSchema = z.object({
  accountId: z.string().min(1),
  system: z.string().trim().min(1),
  url: z.url('URL inválida.'),
});

export const integrationTokenActiveSchema = z.object({
  isActive: z.boolean(),
});

const searchQuery = pagingQuerySchema.extend({
  search: z.string().optional(),
});

export const accountsQuerySchema = searchQuery;
export const profilesQuerySchema = searchQuery;
export const tokensQuerySchema = searchQuery;

export const usersQuerySchema = searchQuery.extend({
  statuses: csvEnumSchema(UserStatusEnum),
  profileIds: csvStringsSchema,
  accountIds: csvStringsSchema,
});

export const accountsPageSchema = pagedSchema(accountSchema);
export const usersPageSchema = pagedSchema(userSchema);
export const profilesPageSchema = pagedSchema(profileSchema);
export const tokensPageSchema = pagedSchema(integrationTokenSchema);

export type AccountEntity = z.infer<typeof accountSchema>;
export type AccountFormInput = z.output<typeof accountFormSchema>;
export type AccountOption = z.infer<typeof accountOptionSchema>;
export type ProfileEntity = z.infer<typeof profileSchema>;
export type ProfileFormInput = z.output<typeof profileFormSchema>;
export type ProfileOption = z.infer<typeof profileOptionSchema>;
export type UserEntity = z.infer<typeof userSchema>;
export type UserFormInput = z.output<typeof userFormSchema>;
export type IntegrationTokenEntity = z.infer<typeof integrationTokenSchema>;
export type IntegrationTokenCreateInput = z.output<typeof integrationTokenCreateSchema>;
export type AccountsQuery = z.output<typeof accountsQuerySchema>;
export type ProfilesQuery = z.output<typeof profilesQuerySchema>;
export type TokensQuery = z.output<typeof tokensQuerySchema>;
export type UsersQuery = z.output<typeof usersQuerySchema>;
