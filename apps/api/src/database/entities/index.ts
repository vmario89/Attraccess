export * from './user.entity';
export * from './authenticationDetail.entity';
export * from './revokedToken.entity';

import { User } from './user.entity';
import { AuthenticationDetail } from './authenticationDetail.entity';
import { RevokedToken } from './revokedToken.entity';

export const entities = [AuthenticationDetail, User, RevokedToken];
