# SSO Implementation Task Checklist

This document contains a comprehensive breakdown of the SSO implementation into 1-story-point tasks with detailed technical specifications for easy execution.

## Database Tasks

### 1. Add `canManageSystem` Permission

- [ ] Add new `canManageSystem` boolean field to `SystemPermissions` class in `libs/database-entities/src/lib/entities/user.entity.ts`
- [ ] Add appropriate Swagger API property decorators with description
- [ ] Default value should be set to `false`
- [ ] Update any relevant interface definitions or type guards

### 2. Create SSOProvider Entity

- [ ] Create file `libs/database-entities/src/lib/entities/ssoProvider.entity.ts`
- [ ] Define `SSOProviderType` enum with values: `KEYCLOAK`, `OIDC`
- [ ] Implement entity with fields: id, name, type, isEnabled, relationships to configs and roleMappings
- [ ] Add TypeORM decorators for all fields and relationships
- [ ] Add Swagger API property decorators with descriptions and examples
- [ ] Add CreateDateColumn and UpdateDateColumn

### 3. Create KeycloakProviderConfig Entity

- [ ] Create file `libs/database-entities/src/lib/entities/keycloakProviderConfig.entity.ts`
- [ ] Implement entity with fields: id, ssoProviderId, clientId, clientSecret, baseUrl, realm, callbackUrl
- [ ] Configure one-to-one relationship with SSOProvider entity with appropriate cascade options
- [ ] Add TypeORM decorators for all fields and relationships
- [ ] Add Swagger API property decorators with descriptions and examples
- [ ] Add CreateDateColumn and UpdateDateColumn

### 4. Create OidcProviderConfig Entity

- [ ] Create file `libs/database-entities/src/lib/entities/oidcProviderConfig.entity.ts`
- [ ] Implement entity with fields: id, ssoProviderId, clientId, clientSecret, discoveryUrl, callbackUrl, scope, additionalConfig
- [ ] Configure one-to-one relationship with SSOProvider entity with appropriate cascade options
- [ ] Add TypeORM decorators for all fields and relationships
- [ ] Add Swagger API property decorators with descriptions and examples
- [ ] Add CreateDateColumn and UpdateDateColumn

### 5. Create RoleMapping Entity

- [ ] Create file `libs/database-entities/src/lib/entities/roleMapping.entity.ts`
- [ ] Implement entity with fields: id, ssoProviderId, externalRole, systemPermissions
- [ ] Configure many-to-one relationship with SSOProvider entity with appropriate cascade options
- [ ] Add TypeORM decorators for all fields and relationships
- [ ] Add Swagger API property decorators with descriptions and examples
- [ ] Add CreateDateColumn and UpdateDateColumn
- [ ] Ensure systemPermissions is stored as JSON type

### 6. Update AuthenticationType Enum

- [ ] Update `libs/database-entities/src/lib/types/authenticationType.enum.ts` to include SSO types
- [ ] Add `KEYCLOAK` and `OIDC` to the enum
- [ ] Ensure any TypeScript interfaces or discriminated unions using this enum are updated

### 7. Update AuthenticationDetail Entity

- [ ] Modify `libs/database-entities/src/lib/entities/authenticationDetail.entity.ts`
- [ ] Add ssoProviderId (nullable number), externalUserId (nullable string), and externalProfileData (nullable JSON) fields
- [ ] Add appropriate TypeORM decorators for new fields
- [ ] Add Swagger API property decorators with descriptions
- [ ] Update any type definitions or interfaces related to this entity

### 8. Export New Entities in Index

- [ ] Update `libs/database-entities/src/index.ts` to export all new entities
- [ ] Ensure all new entities are included in the TypeORM entity array in relevant module configurations

## Backend Implementation Tasks

### 9. Create SSOProvider Module

- [ ] Create `apps/api/src/users-and-auth/sso-providers/sso-providers.module.ts`
- [ ] Import required NestJS modules and dependencies
- [ ] Import TypeORM module with the new entities
- [ ] Define module with appropriate controllers and services
- [ ] Export necessary services for use in other modules

### 10. Create SSOProvider DTOs

- [ ] Create DTO folder `apps/api/src/users-and-auth/sso-providers/dto/`
- [ ] Create `create-sso-provider.dto.ts` with validation decorators
- [ ] Create `update-sso-provider.dto.ts` with validation decorators
- [ ] Create provider-specific DTOs for Keycloak and OIDC configuration
- [ ] Create role-mapping DTOs for assigning external roles to permissions
- [ ] Add class-validator decorators for input validation
- [ ] Add Swagger API property decorators for documentation

### 11. Create SSOProvider Service

- [ ] Create `apps/api/src/users-and-auth/sso-providers/sso-providers.service.ts`
- [ ] Inject TypeORM repositories for all new entities
- [ ] Implement CRUD methods for SSO providers
- [ ] Implement methods to handle provider configuration
- [ ] Add transaction support for operations that modify multiple entities
- [ ] Implement methods to handle role mappings
- [ ] Add error handling with appropriate HTTP exceptions

### 12. Create Keycloak Provider Service

- [ ] Create `apps/api/src/users-and-auth/sso-providers/keycloak-provider.service.ts`
- [ ] Implement Keycloak-specific authentication logic
- [ ] Add methods to validate Keycloak configuration
- [ ] Implement methods to extract user details from Keycloak tokens
- [ ] Add methods to fetch user roles from Keycloak
- [ ] Implement JWT validation for Keycloak tokens

### 13. Create OIDC Provider Service

- [ ] Create `apps/api/src/users-and-auth/sso-providers/oidc-provider.service.ts`
- [ ] Implement OIDC-specific authentication logic
- [ ] Add methods to validate OIDC configuration
- [ ] Implement methods to extract user details from OIDC tokens
- [ ] Add methods to fetch user roles from OIDC provider
- [ ] Implement JWT validation for OIDC tokens

### 14. Create SSOProvider Controller

- [ ] Create `apps/api/src/users-and-auth/sso-providers/sso-providers.controller.ts`
- [ ] Implement CRUD endpoints for SSO providers
- [ ] Add endpoints for managing provider configuration
- [ ] Implement endpoints for role mapping management
- [ ] Add appropriate permission guards using SystemPermission guard
- [ ] Add Swagger documentation for all endpoints
- [ ] Implement validation pipes for all endpoints

### 15. Update System Permissions

- [ ] Add `canManageSystem` to the `SystemPermission` enum in `apps/api/src/users-and-auth/strategies/systemPermissions.guard.ts`
- [ ] Update permission checking logic in relevant guards
- [ ] Add the new permission to any permission checking utilities
- [ ] Update JWT payload interface to include the new permission

### 16. Implement Base SSO Strategy

- [ ] Create `apps/api/src/users-and-auth/strategies/sso.strategy.ts`
- [ ] Implement abstract base class for SSO strategies
- [ ] Add common methods for token validation and user extraction
- [ ] Define interface for provider configuration
- [ ] Implement methods for mapping external roles to system permissions
- [ ] Add error handling for common SSO issues

### 17. Implement Keycloak Strategy

- [ ] Create `apps/api/src/users-and-auth/strategies/keycloak.strategy.ts`
- [ ] Extend base SSO strategy for Keycloak
- [ ] Implement Keycloak-specific authentication flow
- [ ] Add methods for verifying Keycloak tokens
- [ ] Implement user profile extraction from Keycloak tokens
- [ ] Add role extraction from Keycloak JWT

### 18. Implement OIDC Strategy

- [ ] Create `apps/api/src/users-and-auth/strategies/oidc.strategy.ts`
- [ ] Extend base SSO strategy for OIDC
- [ ] Implement OIDC-specific authentication flow
- [ ] Add methods for verifying OIDC tokens
- [ ] Implement user profile extraction from OIDC tokens
- [ ] Add role extraction from OIDC JWT

### 19. Extend Auth Service for SSO

- [ ] Update `apps/api/src/users-and-auth/auth/auth.service.ts`
- [ ] Add methods to handle SSO login initiation
- [ ] Implement callback handling for SSO providers
- [ ] Add user creation/linking for SSO accounts
- [ ] Implement `getUserBySSOProviderAndExternalId` method
- [ ] Add `mapExternalRolesToSystemPermissions` method
- [ ] Implement JWT generation for SSO authenticated users

### 20. Update Auth Controller for SSO

- [ ] Update `apps/api/src/users-and-auth/auth/auth.controller.ts`
- [ ] Add `GET /auth/sso/:providerId/login` endpoint
- [ ] Implement `GET /auth/sso/:providerId/callback` endpoint
- [ ] Add appropriate Swagger documentation
- [ ] Implement error handling for SSO-specific errors
- [ ] Add redirects to frontend after successful authentication

### 21. Create Dynamic Strategy Factory

- [ ] Create `apps/api/src/users-and-auth/strategies/strategy.factory.ts`
- [ ] Implement factory pattern for creating SSO strategies dynamically
- [ ] Add method to create strategy based on provider type and configuration
- [ ] Implement singleton pattern for strategy instances
- [ ] Add error handling for invalid configurations

### 22. Update Login Guard for SSO

- [ ] Modify `apps/api/src/users-and-auth/strategies/login.guard.ts`
- [ ] Add support for dynamic SSO strategies
- [ ] Implement strategy resolution based on request parameters
- [ ] Update authentication flow to support multiple auth methods
- [ ] Add error handling for SSO-specific authentication failures

### 23. Update Auth Module with Dynamic Strategies

- [ ] Update `apps/api/src/users-and-auth/users-and-auth.module.ts`
- [ ] Add dynamic strategy registration
- [ ] Implement on-module-init hook to load configured providers
- [ ] Add logic to refresh strategies when providers are updated
- [ ] Import and register new SSO provider module

## Frontend Implementation Tasks

### 24. Create SSOProvider Types

- [ ] Create `apps/frontend/src/types/ssoProvider.ts`
- [ ] Define TypeScript interfaces for all SSO-related entities
- [ ] Add type definitions for provider configurations
- [ ] Create type guards for SSO provider types
- [ ] Add utility types for SSO provider management

### 25. Update Auth Context and Hook

- [ ] Update `apps/frontend/src/hooks/useAuth.ts`
- [ ] Add support for SSO login flow
- [ ] Implement methods to initiate SSO login
- [ ] Add handling for SSO callback and token storage
- [ ] Update permission checking to include new permissions
- [ ] Add SSO-specific user info to auth context

### 26. Create SSO Provider API Service

- [ ] Create `apps/frontend/src/services/ssoProviderService.ts`
- [ ] Implement API calls for SSO provider CRUD operations
- [ ] Add methods for managing provider configurations
- [ ] Implement role mapping management methods
- [ ] Add error handling for SSO API calls

### 27. Create SSO Provider List Component

- [ ] Create `apps/frontend/src/components/sso/ProviderList.tsx`
- [ ] Implement component to display all configured SSO providers
- [ ] Add filtering and sorting capabilities
- [ ] Implement provider enabling/disabling toggle
- [ ] Add delete confirmation dialog
- [ ] Include navigation to provider detail/edit screens

### 28. Create Base SSO Provider Form Component

- [ ] Create `apps/frontend/src/components/sso/BaseProviderForm.tsx`
- [ ] Implement common form fields for all provider types
- [ ] Add validation for common fields
- [ ] Implement form submission handling
- [ ] Add error message display
- [ ] Create responsive layout for form elements

### 29. Create Keycloak Provider Form Component

- [ ] Create `apps/frontend/src/components/sso/KeycloakProviderForm.tsx`
- [ ] Extend base form with Keycloak-specific fields
- [ ] Implement validation for Keycloak configuration
- [ ] Add help text and tooltips for configuration fields
- [ ] Implement test connection functionality
- [ ] Add form submission handling for Keycloak configuration

### 30. Create OIDC Provider Form Component

- [ ] Create `apps/frontend/src/components/sso/OidcProviderForm.tsx`
- [ ] Extend base form with OIDC-specific fields
- [ ] Implement validation for OIDC configuration
- [ ] Add help text and tooltips for configuration fields
- [ ] Implement test connection functionality
- [ ] Add form submission handling for OIDC configuration

### 31. Create Role Mapping Component

- [ ] Create `apps/frontend/src/components/sso/RoleMapping.tsx`
- [ ] Implement UI for mapping external roles to system permissions
- [ ] Add ability to create/edit/delete role mappings
- [ ] Implement permission selection interface
- [ ] Add validation for role mapping configuration
- [ ] Create responsive layout for mapping interface

### 32. Create SSO Provider Management Page

- [ ] Create `apps/frontend/src/pages/admin/SSOProviderManagement.tsx`
- [ ] Implement page layout with tabs for different provider types
- [ ] Add provider list with CRUD operations
- [ ] Integrate provider form components
- [ ] Add role mapping management interface
- [ ] Implement permission-based access control

### 33. Update Login Page for SSO

- [ ] Update `apps/frontend/src/pages/Login.tsx`
- [ ] Add section for SSO login options
- [ ] Implement dynamic rendering of available SSO providers
- [ ] Add SSO login buttons with appropriate styling
- [ ] Implement login flow for SSO providers
- [ ] Add loading states during SSO redirect

### 34. Implement SSO Callback Handler

- [ ] Create `apps/frontend/src/pages/SSOCallback.tsx`
- [ ] Implement callback handling for SSO providers
- [ ] Add loading state during token exchange
- [ ] Implement error handling for failed authentication
- [ ] Add redirect to application after successful authentication
- [ ] Store authentication token and user information

### 35. Add Protected Routes for SSO Management

- [ ] Update routing configuration in `apps/frontend/src/App.tsx` or relevant router file
- [ ] Add protected routes for SSO provider management
- [ ] Implement permission checks for accessing SSO management pages
- [ ] Add navigation links in admin dashboard
- [ ] Update navigation guards to check for new permissions

### 36. Update User Management UI

- [ ] Update user detail view to show SSO connection information
- [ ] Add UI for manually linking/unlinking SSO accounts
- [ ] Update user creation/edit forms to include SSO options
- [ ] Add indicators for SSO-authenticated users in user list

## Testing Tasks

### 37. Unit Test SSOProvider Service

- [ ] Create `apps/api/src/users-and-auth/sso-providers/sso-providers.service.spec.ts`
- [ ] Implement tests for CRUD operations
- [ ] Add tests for provider configuration handling
- [ ] Implement tests for role mapping functionality
- [ ] Add tests for error handling scenarios
- [ ] Mock required dependencies and repositories

### 38. Unit Test Keycloak Provider Service

- [ ] Create `apps/api/src/users-and-auth/sso-providers/keycloak-provider.service.spec.ts`
- [ ] Implement tests for Keycloak authentication flow
- [ ] Add tests for token validation
- [ ] Test user profile extraction
- [ ] Implement tests for role mapping
- [ ] Add tests for error scenarios

### 39. Unit Test OIDC Provider Service

- [ ] Create `apps/api/src/users-and-auth/sso-providers/oidc-provider.service.spec.ts`
- [ ] Implement tests for OIDC authentication flow
- [ ] Add tests for token validation
- [ ] Test user profile extraction
- [ ] Implement tests for role mapping
- [ ] Add tests for error scenarios

### 40. Unit Test SSO Strategies

- [ ] Create test files for base and provider-specific strategies
- [ ] Implement tests for token validation
- [ ] Add tests for user extraction
- [ ] Test role mapping functionality
- [ ] Implement tests for error handling
- [ ] Mock external SSO provider responses

### 41. Unit Test Auth Service SSO Methods

- [ ] Add tests for SSO-specific methods in auth service
- [ ] Test user creation/linking functionality
- [ ] Implement tests for external role mapping
- [ ] Add tests for JWT generation
- [ ] Test error handling

### 42. Integration Test SSO Provider API

- [ ] Create integration tests for SSO provider CRUD operations
- [ ] Test role mapping API endpoints
- [ ] Implement tests for provider configuration validation
- [ ] Add tests with invalid inputs
- [ ] Test permission requirements

### 43. Integration Test SSO Login Flow

- [ ] Create integration tests for SSO login flow
- [ ] Test callback handling with mock SSO responses
- [ ] Implement tests for user creation/linking
- [ ] Add tests for role mapping application
- [ ] Test with various token structures and payloads

### 44. E2E Test SSO Flow with Mock Server

- [ ] Set up mock SSO server for testing
- [ ] Create E2E tests for complete login flow
- [ ] Test redirection and callback handling
- [ ] Implement tests for successful and failed authentication
- [ ] Add tests for accessing protected resources after authentication

## Migration and Deployment Tasks

### 45. Generate Initial Database Migration

- [ ] Run `pnpm nx run api:generate-migration src/database/migrations/add-sso-entities`
- [ ] Review generated migration file
- [ ] Add any missing manual migration steps
- [ ] Add migration to the array in the datasource config
- [ ] Test migration on development database

### 46. Create Data Seeder for Testing

- [ ] Create seeder file for SSO providers
- [ ] Add sample Keycloak configuration
- [ ] Add sample OIDC configuration
- [ ] Create test role mappings
- [ ] Add seeder to development environment setup

### 47. Update API Documentation

- [ ] Add SSO API endpoints to Swagger documentation
- [ ] Update existing documentation with SSO-related changes
- [ ] Add examples for SSO configuration
- [ ] Document role mapping functionality
- [ ] Add security considerations to documentation

### 48. Prepare Deployment Scripts

- [ ] Update deployment scripts to include new migrations
- [ ] Add configuration for production SSO settings
- [ ] Update environment variable documentation
- [ ] Add deployment verification steps
- [ ] Create rollback plan

## Security Tasks

### 49. Implement Secure Storage for SSO Secrets

- [ ] Add encryption for client secrets in database
- [ ] Implement secure environment variable handling
- [ ] Add masking of secrets in logs and UI
- [ ] Create secure API for accessing provider credentials
- [ ] Implement key rotation mechanism

### 50. Add SSO Security Headers and CSRF Protection

- [ ] Configure secure HTTP headers for SSO endpoints
- [ ] Implement CSRF protection for SSO callbacks
- [ ] Add state parameter validation for OIDC flow
- [ ] Configure secure cookie settings for SSO sessions
- [ ] Implement nonce validation for callbacks

### 51. Add Audit Logging for SSO Configuration Changes

- [ ] Create audit log entries for SSO provider management
- [ ] Log all configuration changes with user information
- [ ] Implement logging for role mapping changes
- [ ] Add logs for authentication attempts
- [ ] Create admin view for SSO audit logs

### 52. Implement Token Revocation

- [ ] Add methods to revoke SSO-derived tokens
- [ ] Implement token blacklisting if needed
- [ ] Add UI for admins to force-logout SSO users
- [ ] Update token validation to check revocation status
- [ ] Document token security measures

## Final Integration Tasks

### 53. Update Documentation

- [ ] Update README with SSO configuration instructions
- [ ] Create user guide for SSO setup
- [ ] Add troubleshooting section for common SSO issues
- [ ] Create documentation for external role mapping
- [ ] Add security guidelines for SSO configuration

### 54. Create Demo SSO Configuration

- [ ] Set up demo Keycloak server
- [ ] Create sample OIDC configuration
- [ ] Add demonstration users and roles
- [ ] Create step-by-step setup guide
- [ ] Add demo SSO configuration to development environment
