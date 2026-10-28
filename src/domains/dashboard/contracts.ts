import { z } from 'zod/v4';
import { DashboardIndicatorEnum, DashboardPeriodEnum } from './enums';

const breakdownItemSchema = z.object({
  key: z.string(),
  value: z.number(),
});

export const dashboardSummarySchema = z.object({
  indicators: z.array(z.object({
    kind: z.enum(DashboardIndicatorEnum),
    value: z.number(),
    previousValue: z.number().describe('Valor no início do período, para comparação.'),
  })),
  averageRating: z.number().min(0).max(5),
  nps: z.number().int().min(-100).max(100),
  statusSeries: z.array(z.object({
    startsAt: z.iso.datetime(),
    referenced: z.number().int().min(0),
    unreferenced: z.number().int().min(0),
  })),
  workshopTypes: z.array(breakdownItemSchema),
  imageInspection: z.array(breakdownItemSchema),
  transmissions: z.array(breakdownItemSchema),
  situations: z.array(breakdownItemSchema),
  zones: z.array(breakdownItemSchema),
}).meta({ id: 'DashboardSummary' });

export const dashboardSummaryQuerySchema = z.object({
  period: z.enum(DashboardPeriodEnum).default(DashboardPeriodEnum.Last30Days),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
