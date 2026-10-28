import { describe, expect, it } from 'vitest';
import { UnprocessableError } from '#shared/errors';
import { ratingRequestCreateSchema, ratingRequestsQuerySchema } from './contracts';
import { RatingsRepository } from './repository';
import { buildRatingSeed } from './seed';
import { RatingChannelEnum, RatingStatusEnum, RatingTargetKindEnum } from './enums';

const FIXED_NOW = new Date('2026-10-28T12:00:00.000Z');
const createRepository = () => new RatingsRepository(buildRatingSeed(), () => FIXED_NOW);

describe('RatingsRepository', () => {
  it('should list only the requested target kind', () => {
    const page = createRepository().list(ratingRequestsQuerySchema.parse({ targetKind: 'auto_center', limit: 200 }));
    expect(page.items.every((rating) => rating.targetKind === RatingTargetKindEnum.AutoCenter)).toBe(true);
  });

  it('should count the summary over all matches, not only the page', () => {
    const repository = createRepository();
    const all = repository.list(ratingRequestsQuerySchema.parse({ targetKind: 'workshop', limit: 200 }));
    const onePage = repository.list(ratingRequestsQuerySchema.parse({ targetKind: 'workshop', limit: 1 }));
    expect(onePage.items).toHaveLength(1);
    expect(onePage.summary).toEqual(all.summary);
    expect(all.summary.total).toBe(all.total);
    expect(all.summary.pending + all.summary.sent + all.summary.responded + all.summary.error).toBe(all.total);
  });

  it('should put pending requests (never sent) first when no sort is chosen', () => {
    const page = createRepository().list(ratingRequestsQuerySchema.parse({ targetKind: 'workshop', limit: 200 }));
    const firstSentIndex = page.items.findIndex((rating) => rating.sentAt !== null);
    expect(page.items.slice(0, firstSentIndex).every((rating) => rating.sentAt === null)).toBe(true);
  });

  it('should filter by status and channel', () => {
    const page = createRepository().list(
      ratingRequestsQuerySchema.parse({
        targetKind: 'workshop',
        statuses: 'responded',
        channels: 'sms',
        limit: 200,
      }),
    );
    expect(page.items.every((rating) => rating.status === RatingStatusEnum.Responded)).toBe(true);
    expect(page.items.every((rating) => rating.channels.includes(RatingChannelEnum.Sms))).toBe(true);
  });

  it('should create a request already sent with the chosen channels', () => {
    const created = createRepository().create(
      ratingRequestCreateSchema.parse({
        targetKind: 'workshop',
        providerName: 'Oficina X',
        providerDocument: '12.345.678/0001-21',
        customerName: 'Cliente',
        customerCode: 'C-1',
        channels: ['email'],
      }),
    );
    expect(created.status).toBe(RatingStatusEnum.Sent);
    expect(created.sentAt).toBe(FIXED_NOW.toISOString());
    expect(created.providerDocument).toBe('12345678000121');
    expect(created.channels).toEqual(['email']);
  });

  it('should not resend a request that was already answered', () => {
    const repository = createRepository();
    const responded = repository.list(
      ratingRequestsQuerySchema.parse({ targetKind: 'workshop', statuses: 'responded', limit: 1 }),
    );
    const id = responded.items[0]?.id ?? '';
    expect(() => repository.resend(id)).toThrow(UnprocessableError);
  });

  it('should resend a pending request with a new sent date', () => {
    const repository = createRepository();
    const pending = repository.list(
      ratingRequestsQuerySchema.parse({ targetKind: 'workshop', statuses: 'pending', limit: 1 }),
    );
    const resent = repository.resend(pending.items[0]?.id ?? '');
    expect(resent.status).toBe(RatingStatusEnum.Sent);
    expect(resent.sentAt).toBe(FIXED_NOW.toISOString());
  });

  it('should return unique provider options per target kind', () => {
    const options = createRepository().providerOptions(RatingTargetKindEnum.AutoCenter);
    const documents = options.map((option) => option.document);
    expect(new Set(documents).size).toBe(documents.length);
  });
});
