import { z } from 'zod';

const trimmedName = z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_. -]+$/);

export const registerSchema = z.object({
  name: trimmedName,
  password: z.string().min(8).max(100),
  profileImageDataUrl: z.string().max(2_000_000).optional(),
});

export const loginSchema = z.object({
  name: trimmedName,
  password: z.string().min(8).max(100),
});

export const createCompetitionSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  startDate: z.string().min(1),
});

export const joinCompetitionSchema = z.object({
  joinCode: z.string().trim().min(6).max(20),
});

export const addTransactionSchema = z.object({
  assetType: z.enum(['STOCK', 'CASH']).default('STOCK'),
  ticker: z.string().trim().min(1).max(20),
  companyName: z.string().trim().max(120).optional().or(z.literal('')),
  quantity: z.coerce.number().positive(),
  pricePerShare: z.coerce.number().positive(),
  quoteCurrency: z.enum(['EUR', 'USD']).default('USD'),
  executedAt: z.string().min(1),
  note: z.string().trim().max(250).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.assetType === 'STOCK' && !/^[A-Za-z0-9.-]+$/.test(data.ticker)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ticker'], message: 'Invalid ticker format' });
  }
});
