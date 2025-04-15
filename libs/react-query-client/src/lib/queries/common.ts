// generated with @7nohe/openapi-react-query-codegen@1.6.2 

import { UseQueryResult } from "@tanstack/react-query";
import { ApplicationService, AuthenticationService, MqttResourceConfigurationService, MqttServersService, ResourceIntroducersService, ResourceIntroductionService, ResourceUsageService, ResourcesService, SseService, SsoService, UsersService, WebhooksService } from "../requests/services.gen";
export type ApplicationServicePing2DefaultResponse = Awaited<ReturnType<typeof ApplicationService.ping2>>;
export type ApplicationServicePing2QueryResult<TData = ApplicationServicePing2DefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useApplicationServicePing2Key = "ApplicationServicePing2";
export const UseApplicationServicePing2KeyFn = (queryKey?: Array<unknown>) => [useApplicationServicePing2Key, ...(queryKey ?? [])];
export type UsersServiceGetAllUsersDefaultResponse = Awaited<ReturnType<typeof UsersService.getAllUsers>>;
export type UsersServiceGetAllUsersQueryResult<TData = UsersServiceGetAllUsersDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useUsersServiceGetAllUsersKey = "UsersServiceGetAllUsers";
export const UseUsersServiceGetAllUsersKeyFn = ({ limit, page, search }: {
  limit?: number;
  page?: number;
  search?: string;
} = {}, queryKey?: Array<unknown>) => [useUsersServiceGetAllUsersKey, ...(queryKey ?? [{ limit, page, search }])];
export type UsersServiceGetCurrentDefaultResponse = Awaited<ReturnType<typeof UsersService.getCurrent>>;
export type UsersServiceGetCurrentQueryResult<TData = UsersServiceGetCurrentDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useUsersServiceGetCurrentKey = "UsersServiceGetCurrent";
export const UseUsersServiceGetCurrentKeyFn = (queryKey?: Array<unknown>) => [useUsersServiceGetCurrentKey, ...(queryKey ?? [])];
export type UsersServiceGetOneUserByIdDefaultResponse = Awaited<ReturnType<typeof UsersService.getOneUserById>>;
export type UsersServiceGetOneUserByIdQueryResult<TData = UsersServiceGetOneUserByIdDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useUsersServiceGetOneUserByIdKey = "UsersServiceGetOneUserById";
export const UseUsersServiceGetOneUserByIdKeyFn = ({ id }: {
  id: number;
}, queryKey?: Array<unknown>) => [useUsersServiceGetOneUserByIdKey, ...(queryKey ?? [{ id }])];
export type UsersServiceGetPermissionsDefaultResponse = Awaited<ReturnType<typeof UsersService.getPermissions>>;
export type UsersServiceGetPermissionsQueryResult<TData = UsersServiceGetPermissionsDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useUsersServiceGetPermissionsKey = "UsersServiceGetPermissions";
export const UseUsersServiceGetPermissionsKeyFn = ({ id }: {
  id: number;
}, queryKey?: Array<unknown>) => [useUsersServiceGetPermissionsKey, ...(queryKey ?? [{ id }])];
export type UsersServiceGetAllWithPermissionDefaultResponse = Awaited<ReturnType<typeof UsersService.getAllWithPermission>>;
export type UsersServiceGetAllWithPermissionQueryResult<TData = UsersServiceGetAllWithPermissionDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useUsersServiceGetAllWithPermissionKey = "UsersServiceGetAllWithPermission";
export const UseUsersServiceGetAllWithPermissionKeyFn = ({ limit, page, permission }: {
  limit?: number;
  page?: number;
  permission?: "canManageResources" | "canManageSystemConfiguration" | "canManageUsers";
} = {}, queryKey?: Array<unknown>) => [useUsersServiceGetAllWithPermissionKey, ...(queryKey ?? [{ limit, page, permission }])];
export type SsoServiceGetAllSsoProvidersDefaultResponse = Awaited<ReturnType<typeof SsoService.getAllSsoProviders>>;
export type SsoServiceGetAllSsoProvidersQueryResult<TData = SsoServiceGetAllSsoProvidersDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useSsoServiceGetAllSsoProvidersKey = "SsoServiceGetAllSsoProviders";
export const UseSsoServiceGetAllSsoProvidersKeyFn = (queryKey?: Array<unknown>) => [useSsoServiceGetAllSsoProvidersKey, ...(queryKey ?? [])];
export type SsoServiceGetOneSsoProviderByIdDefaultResponse = Awaited<ReturnType<typeof SsoService.getOneSsoProviderById>>;
export type SsoServiceGetOneSsoProviderByIdQueryResult<TData = SsoServiceGetOneSsoProviderByIdDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useSsoServiceGetOneSsoProviderByIdKey = "SsoServiceGetOneSsoProviderById";
export const UseSsoServiceGetOneSsoProviderByIdKeyFn = ({ id }: {
  id: number;
}, queryKey?: Array<unknown>) => [useSsoServiceGetOneSsoProviderByIdKey, ...(queryKey ?? [{ id }])];
export type SsoServiceLoginWithOidcDefaultResponse = Awaited<ReturnType<typeof SsoService.loginWithOidc>>;
export type SsoServiceLoginWithOidcQueryResult<TData = SsoServiceLoginWithOidcDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useSsoServiceLoginWithOidcKey = "SsoServiceLoginWithOidc";
export const UseSsoServiceLoginWithOidcKeyFn = ({ providerId, redirectTo }: {
  providerId: string;
  redirectTo?: unknown;
}, queryKey?: Array<unknown>) => [useSsoServiceLoginWithOidcKey, ...(queryKey ?? [{ providerId, redirectTo }])];
export type SsoServiceOidcLoginCallbackDefaultResponse = Awaited<ReturnType<typeof SsoService.oidcLoginCallback>>;
export type SsoServiceOidcLoginCallbackQueryResult<TData = SsoServiceOidcLoginCallbackDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useSsoServiceOidcLoginCallbackKey = "SsoServiceOidcLoginCallback";
export const UseSsoServiceOidcLoginCallbackKeyFn = ({ code, iss, providerId, redirectTo, sessionState, state }: {
  code: unknown;
  iss: unknown;
  providerId: string;
  redirectTo: string;
  sessionState: unknown;
  state: unknown;
}, queryKey?: Array<unknown>) => [useSsoServiceOidcLoginCallbackKey, ...(queryKey ?? [{ code, iss, providerId, redirectTo, sessionState, state }])];
export type ResourcesServiceGetAllResourcesDefaultResponse = Awaited<ReturnType<typeof ResourcesService.getAllResources>>;
export type ResourcesServiceGetAllResourcesQueryResult<TData = ResourcesServiceGetAllResourcesDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourcesServiceGetAllResourcesKey = "ResourcesServiceGetAllResources";
export const UseResourcesServiceGetAllResourcesKeyFn = ({ limit, page, search }: {
  limit?: number;
  page?: number;
  search?: string;
} = {}, queryKey?: Array<unknown>) => [useResourcesServiceGetAllResourcesKey, ...(queryKey ?? [{ limit, page, search }])];
export type ResourcesServiceGetOneResourceByIdDefaultResponse = Awaited<ReturnType<typeof ResourcesService.getOneResourceById>>;
export type ResourcesServiceGetOneResourceByIdQueryResult<TData = ResourcesServiceGetOneResourceByIdDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourcesServiceGetOneResourceByIdKey = "ResourcesServiceGetOneResourceById";
export const UseResourcesServiceGetOneResourceByIdKeyFn = ({ id }: {
  id: number;
}, queryKey?: Array<unknown>) => [useResourcesServiceGetOneResourceByIdKey, ...(queryKey ?? [{ id }])];
export type ResourceUsageServiceGetHistoryOfResourceUsageDefaultResponse = Awaited<ReturnType<typeof ResourceUsageService.getHistoryOfResourceUsage>>;
export type ResourceUsageServiceGetHistoryOfResourceUsageQueryResult<TData = ResourceUsageServiceGetHistoryOfResourceUsageDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceUsageServiceGetHistoryOfResourceUsageKey = "ResourceUsageServiceGetHistoryOfResourceUsage";
export const UseResourceUsageServiceGetHistoryOfResourceUsageKeyFn = ({ limit, page, resourceId, userId }: {
  limit?: number;
  page?: number;
  resourceId: number;
  userId?: number;
}, queryKey?: Array<unknown>) => [useResourceUsageServiceGetHistoryOfResourceUsageKey, ...(queryKey ?? [{ limit, page, resourceId, userId }])];
export type ResourceUsageServiceGetActiveSessionDefaultResponse = Awaited<ReturnType<typeof ResourceUsageService.getActiveSession>>;
export type ResourceUsageServiceGetActiveSessionQueryResult<TData = ResourceUsageServiceGetActiveSessionDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceUsageServiceGetActiveSessionKey = "ResourceUsageServiceGetActiveSession";
export const UseResourceUsageServiceGetActiveSessionKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceUsageServiceGetActiveSessionKey, ...(queryKey ?? [{ resourceId }])];
export type ResourceIntroductionServiceGetAllResourceIntroductionsDefaultResponse = Awaited<ReturnType<typeof ResourceIntroductionService.getAllResourceIntroductions>>;
export type ResourceIntroductionServiceGetAllResourceIntroductionsQueryResult<TData = ResourceIntroductionServiceGetAllResourceIntroductionsDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroductionServiceGetAllResourceIntroductionsKey = "ResourceIntroductionServiceGetAllResourceIntroductions";
export const UseResourceIntroductionServiceGetAllResourceIntroductionsKeyFn = ({ limit, page, resourceId }: {
  limit: number;
  page: number;
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroductionServiceGetAllResourceIntroductionsKey, ...(queryKey ?? [{ limit, page, resourceId }])];
export type ResourceIntroductionServiceCheckStatusDefaultResponse = Awaited<ReturnType<typeof ResourceIntroductionService.checkStatus>>;
export type ResourceIntroductionServiceCheckStatusQueryResult<TData = ResourceIntroductionServiceCheckStatusDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroductionServiceCheckStatusKey = "ResourceIntroductionServiceCheckStatus";
export const UseResourceIntroductionServiceCheckStatusKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroductionServiceCheckStatusKey, ...(queryKey ?? [{ resourceId }])];
export type ResourceIntroductionServiceGetHistoryOfIntroductionDefaultResponse = Awaited<ReturnType<typeof ResourceIntroductionService.getHistoryOfIntroduction>>;
export type ResourceIntroductionServiceGetHistoryOfIntroductionQueryResult<TData = ResourceIntroductionServiceGetHistoryOfIntroductionDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroductionServiceGetHistoryOfIntroductionKey = "ResourceIntroductionServiceGetHistoryOfIntroduction";
export const UseResourceIntroductionServiceGetHistoryOfIntroductionKeyFn = ({ introductionId, resourceId }: {
  introductionId: number;
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroductionServiceGetHistoryOfIntroductionKey, ...(queryKey ?? [{ introductionId, resourceId }])];
export type ResourceIntroductionServiceCheckIsRevokedStatusDefaultResponse = Awaited<ReturnType<typeof ResourceIntroductionService.checkIsRevokedStatus>>;
export type ResourceIntroductionServiceCheckIsRevokedStatusQueryResult<TData = ResourceIntroductionServiceCheckIsRevokedStatusDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroductionServiceCheckIsRevokedStatusKey = "ResourceIntroductionServiceCheckIsRevokedStatus";
export const UseResourceIntroductionServiceCheckIsRevokedStatusKeyFn = ({ introductionId, resourceId }: {
  introductionId: number;
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroductionServiceCheckIsRevokedStatusKey, ...(queryKey ?? [{ introductionId, resourceId }])];
export type ResourceIntroductionServiceGetOneResourceIntroductionDefaultResponse = Awaited<ReturnType<typeof ResourceIntroductionService.getOneResourceIntroduction>>;
export type ResourceIntroductionServiceGetOneResourceIntroductionQueryResult<TData = ResourceIntroductionServiceGetOneResourceIntroductionDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroductionServiceGetOneResourceIntroductionKey = "ResourceIntroductionServiceGetOneResourceIntroduction";
export const UseResourceIntroductionServiceGetOneResourceIntroductionKeyFn = ({ introductionId, resourceId }: {
  introductionId: number;
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroductionServiceGetOneResourceIntroductionKey, ...(queryKey ?? [{ introductionId, resourceId }])];
export type ResourceIntroductionServiceCheckCanManagePermissionDefaultResponse = Awaited<ReturnType<typeof ResourceIntroductionService.checkCanManagePermission>>;
export type ResourceIntroductionServiceCheckCanManagePermissionQueryResult<TData = ResourceIntroductionServiceCheckCanManagePermissionDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroductionServiceCheckCanManagePermissionKey = "ResourceIntroductionServiceCheckCanManagePermission";
export const UseResourceIntroductionServiceCheckCanManagePermissionKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroductionServiceCheckCanManagePermissionKey, ...(queryKey ?? [{ resourceId }])];
export type ResourceIntroducersServiceGetAllResourceIntroducersDefaultResponse = Awaited<ReturnType<typeof ResourceIntroducersService.getAllResourceIntroducers>>;
export type ResourceIntroducersServiceGetAllResourceIntroducersQueryResult<TData = ResourceIntroducersServiceGetAllResourceIntroducersDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroducersServiceGetAllResourceIntroducersKey = "ResourceIntroducersServiceGetAllResourceIntroducers";
export const UseResourceIntroducersServiceGetAllResourceIntroducersKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroducersServiceGetAllResourceIntroducersKey, ...(queryKey ?? [{ resourceId }])];
export type ResourceIntroducersServiceCheckCanManagePermissionDefaultResponse = Awaited<ReturnType<typeof ResourceIntroducersService.checkCanManagePermission>>;
export type ResourceIntroducersServiceCheckCanManagePermissionQueryResult<TData = ResourceIntroducersServiceCheckCanManagePermissionDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useResourceIntroducersServiceCheckCanManagePermissionKey = "ResourceIntroducersServiceCheckCanManagePermission";
export const UseResourceIntroducersServiceCheckCanManagePermissionKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useResourceIntroducersServiceCheckCanManagePermissionKey, ...(queryKey ?? [{ resourceId }])];
export type MqttResourceConfigurationServiceGetOneMqttConfigurationDefaultResponse = Awaited<ReturnType<typeof MqttResourceConfigurationService.getOneMqttConfiguration>>;
export type MqttResourceConfigurationServiceGetOneMqttConfigurationQueryResult<TData = MqttResourceConfigurationServiceGetOneMqttConfigurationDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useMqttResourceConfigurationServiceGetOneMqttConfigurationKey = "MqttResourceConfigurationServiceGetOneMqttConfiguration";
export const UseMqttResourceConfigurationServiceGetOneMqttConfigurationKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useMqttResourceConfigurationServiceGetOneMqttConfigurationKey, ...(queryKey ?? [{ resourceId }])];
export type MqttServersServiceGetAllMqttServersDefaultResponse = Awaited<ReturnType<typeof MqttServersService.getAllMqttServers>>;
export type MqttServersServiceGetAllMqttServersQueryResult<TData = MqttServersServiceGetAllMqttServersDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useMqttServersServiceGetAllMqttServersKey = "MqttServersServiceGetAllMqttServers";
export const UseMqttServersServiceGetAllMqttServersKeyFn = (queryKey?: Array<unknown>) => [useMqttServersServiceGetAllMqttServersKey, ...(queryKey ?? [])];
export type MqttServersServiceGetOneMqttServerByIdDefaultResponse = Awaited<ReturnType<typeof MqttServersService.getOneMqttServerById>>;
export type MqttServersServiceGetOneMqttServerByIdQueryResult<TData = MqttServersServiceGetOneMqttServerByIdDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useMqttServersServiceGetOneMqttServerByIdKey = "MqttServersServiceGetOneMqttServerById";
export const UseMqttServersServiceGetOneMqttServerByIdKeyFn = ({ id }: {
  id: number;
}, queryKey?: Array<unknown>) => [useMqttServersServiceGetOneMqttServerByIdKey, ...(queryKey ?? [{ id }])];
export type MqttServersServiceGetStatusOfOneDefaultResponse = Awaited<ReturnType<typeof MqttServersService.getStatusOfOne>>;
export type MqttServersServiceGetStatusOfOneQueryResult<TData = MqttServersServiceGetStatusOfOneDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useMqttServersServiceGetStatusOfOneKey = "MqttServersServiceGetStatusOfOne";
export const UseMqttServersServiceGetStatusOfOneKeyFn = ({ id }: {
  id: number;
}, queryKey?: Array<unknown>) => [useMqttServersServiceGetStatusOfOneKey, ...(queryKey ?? [{ id }])];
export type MqttServersServiceGetStatusOfAllDefaultResponse = Awaited<ReturnType<typeof MqttServersService.getStatusOfAll>>;
export type MqttServersServiceGetStatusOfAllQueryResult<TData = MqttServersServiceGetStatusOfAllDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useMqttServersServiceGetStatusOfAllKey = "MqttServersServiceGetStatusOfAll";
export const UseMqttServersServiceGetStatusOfAllKeyFn = (queryKey?: Array<unknown>) => [useMqttServersServiceGetStatusOfAllKey, ...(queryKey ?? [])];
export type SseServiceSseControllerStreamEventsDefaultResponse = Awaited<ReturnType<typeof SseService.sseControllerStreamEvents>>;
export type SseServiceSseControllerStreamEventsQueryResult<TData = SseServiceSseControllerStreamEventsDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useSseServiceSseControllerStreamEventsKey = "SseServiceSseControllerStreamEvents";
export const UseSseServiceSseControllerStreamEventsKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useSseServiceSseControllerStreamEventsKey, ...(queryKey ?? [{ resourceId }])];
export type WebhooksServiceGetAllWebhookConfigurationsDefaultResponse = Awaited<ReturnType<typeof WebhooksService.getAllWebhookConfigurations>>;
export type WebhooksServiceGetAllWebhookConfigurationsQueryResult<TData = WebhooksServiceGetAllWebhookConfigurationsDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useWebhooksServiceGetAllWebhookConfigurationsKey = "WebhooksServiceGetAllWebhookConfigurations";
export const UseWebhooksServiceGetAllWebhookConfigurationsKeyFn = ({ resourceId }: {
  resourceId: number;
}, queryKey?: Array<unknown>) => [useWebhooksServiceGetAllWebhookConfigurationsKey, ...(queryKey ?? [{ resourceId }])];
export type WebhooksServiceGetOneWebhookConfigurationByIdDefaultResponse = Awaited<ReturnType<typeof WebhooksService.getOneWebhookConfigurationById>>;
export type WebhooksServiceGetOneWebhookConfigurationByIdQueryResult<TData = WebhooksServiceGetOneWebhookConfigurationByIdDefaultResponse, TError = unknown> = UseQueryResult<TData, TError>;
export const useWebhooksServiceGetOneWebhookConfigurationByIdKey = "WebhooksServiceGetOneWebhookConfigurationById";
export const UseWebhooksServiceGetOneWebhookConfigurationByIdKeyFn = ({ id, resourceId }: {
  id: number;
  resourceId: number;
}, queryKey?: Array<unknown>) => [useWebhooksServiceGetOneWebhookConfigurationByIdKey, ...(queryKey ?? [{ id, resourceId }])];
export type UsersServiceCreateOneUserMutationResult = Awaited<ReturnType<typeof UsersService.createOneUser>>;
export type UsersServiceVerifyEmailMutationResult = Awaited<ReturnType<typeof UsersService.verifyEmail>>;
export type UsersServiceBulkUpdatePermissionsMutationResult = Awaited<ReturnType<typeof UsersService.bulkUpdatePermissions>>;
export type AuthenticationServiceCreateSessionMutationResult = Awaited<ReturnType<typeof AuthenticationService.createSession>>;
export type SsoServiceCreateOneSsoProviderMutationResult = Awaited<ReturnType<typeof SsoService.createOneSsoProvider>>;
export type ResourcesServiceCreateOneResourceMutationResult = Awaited<ReturnType<typeof ResourcesService.createOneResource>>;
export type ResourceUsageServiceStartSessionMutationResult = Awaited<ReturnType<typeof ResourceUsageService.startSession>>;
export type ResourceIntroductionServiceMarkCompletedMutationResult = Awaited<ReturnType<typeof ResourceIntroductionService.markCompleted>>;
export type ResourceIntroductionServiceMarkRevokedMutationResult = Awaited<ReturnType<typeof ResourceIntroductionService.markRevoked>>;
export type ResourceIntroductionServiceMarkUnrevokedMutationResult = Awaited<ReturnType<typeof ResourceIntroductionService.markUnrevoked>>;
export type ResourceIntroducersServiceAddOneMutationResult = Awaited<ReturnType<typeof ResourceIntroducersService.addOne>>;
export type MqttResourceConfigurationServiceUpsertOneMutationResult = Awaited<ReturnType<typeof MqttResourceConfigurationService.upsertOne>>;
export type MqttResourceConfigurationServiceTestOneMutationResult = Awaited<ReturnType<typeof MqttResourceConfigurationService.testOne>>;
export type MqttServersServiceCreateOneMqttServerMutationResult = Awaited<ReturnType<typeof MqttServersService.createOneMqttServer>>;
export type MqttServersServiceTestConnectionMutationResult = Awaited<ReturnType<typeof MqttServersService.testConnection>>;
export type WebhooksServiceCreateOneWebhookConfigurationMutationResult = Awaited<ReturnType<typeof WebhooksService.createOneWebhookConfiguration>>;
export type WebhooksServiceTestMutationResult = Awaited<ReturnType<typeof WebhooksService.test>>;
export type WebhooksServiceRegenerateSecretMutationResult = Awaited<ReturnType<typeof WebhooksService.regenerateSecret>>;
export type SsoServiceUpdateOneSsoProviderMutationResult = Awaited<ReturnType<typeof SsoService.updateOneSsoProvider>>;
export type ResourcesServiceUpdateOneResourceMutationResult = Awaited<ReturnType<typeof ResourcesService.updateOneResource>>;
export type ResourceUsageServiceEndSessionMutationResult = Awaited<ReturnType<typeof ResourceUsageService.endSession>>;
export type MqttServersServiceUpdateOneMqttServerMutationResult = Awaited<ReturnType<typeof MqttServersService.updateOneMqttServer>>;
export type WebhooksServiceUpdateOneWebhookConfigurationMutationResult = Awaited<ReturnType<typeof WebhooksService.updateOneWebhookConfiguration>>;
export type WebhooksServiceUpdateStatusMutationResult = Awaited<ReturnType<typeof WebhooksService.updateStatus>>;
export type UsersServiceUpdatePermissionsMutationResult = Awaited<ReturnType<typeof UsersService.updatePermissions>>;
export type AuthenticationServiceEndSessionMutationResult = Awaited<ReturnType<typeof AuthenticationService.endSession>>;
export type SsoServiceDeleteOneSsoProviderMutationResult = Awaited<ReturnType<typeof SsoService.deleteOneSsoProvider>>;
export type ResourcesServiceDeleteOneResourceMutationResult = Awaited<ReturnType<typeof ResourcesService.deleteOneResource>>;
export type ResourceIntroducersServiceRemoveOneMutationResult = Awaited<ReturnType<typeof ResourceIntroducersService.removeOne>>;
export type MqttResourceConfigurationServiceDeleteOneMqttConfigurationMutationResult = Awaited<ReturnType<typeof MqttResourceConfigurationService.deleteOneMqttConfiguration>>;
export type MqttServersServiceDeleteOneMqttServerMutationResult = Awaited<ReturnType<typeof MqttServersService.deleteOneMqttServer>>;
export type WebhooksServiceDeleteOneWebhookConfigurationMutationResult = Awaited<ReturnType<typeof WebhooksService.deleteOneWebhookConfiguration>>;
