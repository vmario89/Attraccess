# SSO Implementation Tasks

## Overview

Implement configurable SSO providers for login with support for Keycloak and OIDC. This will allow users with "canManageSystem" permission to add, remove, and update SSO providers to extend the login functionality. External roles/permissions should be mappable to system permissions.

## Database Changes

### 1. Add `canManageSystem` Permission

- Add a new `canManageSystem` permission to the `SystemPermissions` class in `libs/database-entities/src/lib/entities/user.entity.ts`

```typescript
@Column({ default: false })
@ApiProperty({
  description: 'Whether the user can manage system settings including SSO providers',
  example: false,
})
canManageSystem!: boolean;
```

### 2. Create Base SSOProvider Entity

- Create new entity in `libs/database-entities/src/lib/entities/ssoProvider.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RoleMapping } from './roleMapping.entity';
import { KeycloakProviderConfig } from './keycloakProviderConfig.entity';
import { OidcProviderConfig } from './oidcProviderConfig.entity';

export enum SSOProviderType {
  KEYCLOAK = 'keycloak',
  OIDC = 'oidc',
}

@Entity()
export class SSOProvider {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the SSO provider',
    example: 1,
  })
  id!: number;

  @Column()
  @ApiProperty({
    description: 'The name of the SSO provider',
    example: 'Company Keycloak',
  })
  name!: string;

  @Column({
    type: 'simple-enum',
    enum: SSOProviderType,
  })
  @ApiProperty({
    description: 'The type of SSO provider',
    enum: SSOProviderType,
    example: SSOProviderType.KEYCLOAK,
  })
  type!: SSOProviderType;

  @Column({ default: true })
  @ApiProperty({
    description: 'Whether the SSO provider is enabled',
    example: true,
  })
  isEnabled!: boolean;

  @OneToMany(() => RoleMapping, (roleMapping) => roleMapping.ssoProvider)
  roleMappings!: RoleMapping[];

  @OneToOne(() => KeycloakProviderConfig, (config) => config.ssoProvider)
  keycloakConfig?: KeycloakProviderConfig;

  @OneToOne(() => OidcProviderConfig, (config) => config.ssoProvider)
  oidcConfig?: OidcProviderConfig;

  @CreateDateColumn()
  @ApiProperty({
    description: 'When the SSO provider was created',
  })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'When the SSO provider was last updated',
  })
  updatedAt!: Date;
}
```

### 3. Create Keycloak Provider Config Entity

- Create new entity in `libs/database-entities/src/lib/entities/keycloakProviderConfig.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SSOProvider } from './ssoProvider.entity';

@Entity()
export class KeycloakProviderConfig {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the Keycloak configuration',
    example: 1,
  })
  id!: number;

  @Column()
  @ApiProperty({
    description: 'The ID of the SSO provider this configuration belongs to',
    example: 1,
  })
  ssoProviderId!: number;

  @Column()
  @ApiProperty({
    description: 'The client ID for the Keycloak provider',
    example: 'attraccess-client',
  })
  clientId!: string;

  @Column()
  @ApiProperty({
    description: 'The client secret for the Keycloak provider',
    example: 'client-secret-123',
  })
  clientSecret!: string;

  @Column()
  @ApiProperty({
    description: 'The base URL for the Keycloak server',
    example: 'https://keycloak.example.com',
  })
  baseUrl!: string;

  @Column()
  @ApiProperty({
    description: 'The realm name in Keycloak',
    example: 'master',
  })
  realm!: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'The callback URL for the Keycloak provider',
    example: 'https://app.example.com/auth/sso/keycloak/callback',
    required: false,
  })
  callbackUrl?: string;

  @OneToOne(() => SSOProvider, (provider) => provider.keycloakConfig, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ssoProviderId' })
  ssoProvider!: SSOProvider;

  @CreateDateColumn()
  @ApiProperty({
    description: 'When the Keycloak configuration was created',
  })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'When the Keycloak configuration was last updated',
  })
  updatedAt!: Date;
}
```

### 4. Create OIDC Provider Config Entity

- Create new entity in `libs/database-entities/src/lib/entities/oidcProviderConfig.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SSOProvider } from './ssoProvider.entity';

@Entity()
export class OidcProviderConfig {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the OIDC configuration',
    example: 1,
  })
  id!: number;

  @Column()
  @ApiProperty({
    description: 'The ID of the SSO provider this configuration belongs to',
    example: 1,
  })
  ssoProviderId!: number;

  @Column()
  @ApiProperty({
    description: 'The client ID for the OIDC provider',
    example: 'attraccess-client',
  })
  clientId!: string;

  @Column()
  @ApiProperty({
    description: 'The client secret for the OIDC provider',
    example: 'client-secret-123',
  })
  clientSecret!: string;

  @Column()
  @ApiProperty({
    description: 'The discovery URL or issuer URL for the OIDC provider',
    example: 'https://accounts.google.com',
  })
  discoveryUrl!: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'The callback URL for the OIDC provider',
    example: 'https://app.example.com/auth/sso/oidc/callback',
    required: false,
  })
  callbackUrl?: string;

  @Column({ nullable: true, default: 'openid profile email' })
  @ApiProperty({
    description: 'The scope to request from the OIDC provider',
    example: 'openid profile email',
    required: false,
  })
  scope?: string;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({
    description: 'Additional configuration for the OIDC provider',
    required: false,
  })
  additionalConfig?: Record<string, any>;

  @OneToOne(() => SSOProvider, (provider) => provider.oidcConfig, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ssoProviderId' })
  ssoProvider!: SSOProvider;

  @CreateDateColumn()
  @ApiProperty({
    description: 'When the OIDC configuration was created',
  })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'When the OIDC configuration was last updated',
  })
  updatedAt!: Date;
}
```

### 5. Create RoleMapping Entity

- Create new entity in `libs/database-entities/src/lib/entities/roleMapping.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SSOProvider } from './ssoProvider.entity';

@Entity()
export class RoleMapping {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the role mapping',
    example: 1,
  })
  id!: number;

  @Column()
  @ApiProperty({
    description: 'The ID of the SSO provider',
    example: 1,
  })
  ssoProviderId!: number;

  @Column()
  @ApiProperty({
    description: 'The external role name from the SSO provider',
    example: 'admin',
  })
  externalRole!: string;

  @Column({ type: 'json' })
  @ApiProperty({
    description: 'The system permissions to grant for this role',
    example: {
      canManageResources: true,
      canManageSystemConfiguration: false,
    },
  })
  systemPermissions!: Record<string, boolean>;

  @ManyToOne(() => SSOProvider, (provider) => provider.roleMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ssoProviderId' })
  ssoProvider!: SSOProvider;

  @CreateDateColumn()
  @ApiProperty({
    description: 'When the role mapping was created',
  })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'When the role mapping was last updated',
  })
  updatedAt!: Date;
}
```

### 6. Update AuthenticationType Enum

- Update `libs/database-entities/src/lib/types/authenticationType.enum.ts` to include SSO provider types

```typescript
export enum AuthenticationType {
  LOCAL_PASSWORD = 'local_password',
  KEYCLOAK = 'keycloak',
  OIDC = 'oidc',
}
```

### 7. Update AuthenticationDetail Entity

- Modify `libs/database-entities/src/lib/entities/authenticationDetail.entity.ts` to include SSO-specific fields

```typescript
// Add these fields to the AuthenticationDetail entity
@Column({ nullable: true })
@ApiProperty({
  description: 'The ID of the SSO provider if using SSO authentication',
  required: false,
})
ssoProviderId?: number;

@Column({ nullable: true })
@ApiProperty({
  description: 'The external user ID from the SSO provider',
  required: false,
})
externalUserId?: string;

@Column({ type: 'json', nullable: true })
@ApiProperty({
  description: 'External profile data from the SSO provider',
  required: false,
})
externalProfileData?: Record<string, any>;
```

## Backend Implementation

### 1. Create SSOProvider Module and Service

- Create `apps/api/src/users-and-auth/sso-providers/sso-providers.module.ts`
- Create `apps/api/src/users-and-auth/sso-providers/sso-providers.service.ts` for CRUD operations on SSO providers
- Create `apps/api/src/users-and-auth/sso-providers/sso-providers.controller.ts` with endpoints for managing providers
  - Ensure all controllers are properly annotated with NestJS Swagger decorators
- Create provider-specific services:
  - `apps/api/src/users-and-auth/sso-providers/keycloak-provider.service.ts`
  - `apps/api/src/users-and-auth/sso-providers/oidc-provider.service.ts`

### 2. Update System Permissions

- Add `canManageSystem` to the `SystemPermission` enum in `apps/api/src/users-and-auth/strategies/systemPermissions.guard.ts`
- Update frontend types for system permissions in `apps/frontend/src/hooks/useAuth.ts`

### 3. Implement SSO Strategies

- Create base SSO strategy in `apps/api/src/users-and-auth/strategies/sso.strategy.ts`
- Implement Keycloak strategy in `apps/api/src/users-and-auth/strategies/keycloak.strategy.ts`
- Implement OIDC strategy in `apps/api/src/users-and-auth/strategies/oidc.strategy.ts`

### 4. Extend AuthService

- Update `apps/api/src/users-and-auth/auth/auth.service.ts` with methods to:
  - Handle SSO login/callback
  - Extract user information from SSO payloads
  - Map external roles to system permissions
  - Link SSO accounts to existing users or create new users
  - Add `getUserBySSOProviderAndExternalId` method
  - Add `mapExternalRolesToSystemPermissions` method

### 5. Update Authentication Flow

- Add SSO login routes in `apps/api/src/users-and-auth/auth/auth.controller.ts`:
  - `GET /auth/sso/:providerId/login` - Redirect to SSO provider
  - `GET /auth/sso/:providerId/callback` - Handle SSO callback and issue JWT

### 6. Update Login Guard

- Modify `apps/api/src/users-and-auth/strategies/login.guard.ts` to include dynamic SSO strategies
- Implement factory pattern to create provider-specific strategies at runtime

### 7. Dynamic Strategy Registration

- Implement dynamic strategy registration in `apps/api/src/users-and-auth/users-and-auth.module.ts`
- Create strategy factory pattern to instantiate strategies based on configured providers

## Frontend Implementation

### 1. SSO Provider Management UI

- Create SSO provider management page in frontend app
- Implement CRUD operations for SSO providers
- Implement role mapping configuration UI
- Create provider-specific configuration forms:
  - Keycloak provider form
  - OIDC provider form
- Implement validation for provider-specific configuration

### 2. Update Login Page

- Update login UI to display available SSO providers
- Add SSO login buttons for each enabled provider
- Implement SSO login flow with redirect and callback handling

### 3. Update Authentication Hooks

- Modify `apps/frontend/src/hooks/useAuth.ts` to handle SSO login flow
- Add support for storing and using JWT token after SSO login

## Testing

### 1. Unit Tests

- Add unit tests for SSOProvider service
- Add unit tests for provider-specific services
- Add unit tests for SSO strategies
- Add unit tests for role mapping functionality

### 2. Integration Tests

- Add integration tests for SSO login flow
- Test role mapping functionality
- Test provider management API endpoints

### 3. E2E Tests

- Add end-to-end tests for SSO login flow with mock SSO server
- Test complete flow from login to accessing protected resources

## Migration and Deployment

### 1. Database Migrations

- Generate migration by running:
  ```
  pnpm nx run api:generate-migration src/database/migrations/<migration-name>
  ```
- Add the generated migration to the array of migrations in the datasource config in the API
- Execute migrations by running:
  ```
  pnpm nx run api:run-migrations
  ```

## Security Considerations

### 1. Secrets Management

- Implement secure storage for SSO client secrets
- Consider encryption for sensitive provider configuration

### 2. JWT Token Security

- Ensure token validation is consistent across auth methods
- Verify token revocation works correctly for SSO-derived tokens

### 3. Permission Checks

- Ensure strict permission checks for SSO provider management
- Add audit logging for changes to SSO configuration
