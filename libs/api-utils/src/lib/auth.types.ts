import { User } from '@attraccess/database-entities';
import { Request as BaseRequest } from 'express';

export interface AuthenticatedRequest extends Omit<BaseRequest, 'logout'> {
  user: User;
  authInfo: {
    tokenId: string;
  };
  logout: (callback: () => void) => Promise<void>;
}
