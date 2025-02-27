import { z } from 'zod';
import { User } from '@attraccess/database-entities';
import { Request as BaseRequest } from 'express';

export interface AuthenticatedRequest extends Omit<BaseRequest, 'logout'> {
  user: User;
  authInfo: {
    tokenId: string;
  };
  logout: (callback: () => void) => Promise<void>;
}

export const PaginationOptionsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;
