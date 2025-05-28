// This file previously contained logic for JWT secret retrieval.
// This logic has been moved to UsersAndAuthModule and JwtStrategy to use ConfigService.

/**
 * @deprecated This module no longer exports JWT secrets.
 * Please import JWT configuration from UsersAndAuthModule or inject ConfigService.
 * Example:
 * constructor(private configService: ConfigService) {
 *   const jwtSecret = this.configService.get('app.AUTH_JWT_SECRET'); // Adjusted to match new config structure
 * }
 */
export const jwtConstants = {}; // No longer exporting secret from here
