// generated with @7nohe/openapi-react-query-codegen@1.6.2 

import { type QueryClient } from "@tanstack/react-query";
import { ApplicationService, MqttResourceConfigurationService, MqttServersService, ResourceIntroducersService, ResourceIntroductionService, ResourceUsageService, ResourcesService, SseService, SsoService, UsersService, WebhooksService } from "../requests/services.gen";
import * as Common from "./common";
export const prefetchUseApplicationServicePing2 = (queryClient: QueryClient) => queryClient.prefetchQuery({ queryKey: Common.UseApplicationServicePing2KeyFn(), queryFn: () => ApplicationService.ping2() });
export const prefetchUseUsersServiceGetAllUsers = (queryClient: QueryClient, { limit, page, search }: {
  limit?: number;
  page?: number;
  search?: string;
} = {}) => queryClient.prefetchQuery({ queryKey: Common.UseUsersServiceGetAllUsersKeyFn({ limit, page, search }), queryFn: () => UsersService.getAllUsers({ limit, page, search }) });
export const prefetchUseUsersServiceGetCurrent = (queryClient: QueryClient) => queryClient.prefetchQuery({ queryKey: Common.UseUsersServiceGetCurrentKeyFn(), queryFn: () => UsersService.getCurrent() });
export const prefetchUseUsersServiceGetOneUserById = (queryClient: QueryClient, { id }: {
  id: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseUsersServiceGetOneUserByIdKeyFn({ id }), queryFn: () => UsersService.getOneUserById({ id }) });
export const prefetchUseUsersServiceGetPermissions = (queryClient: QueryClient, { id }: {
  id: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseUsersServiceGetPermissionsKeyFn({ id }), queryFn: () => UsersService.getPermissions({ id }) });
export const prefetchUseUsersServiceGetAllWithPermission = (queryClient: QueryClient, { limit, page, permission }: {
  limit?: number;
  page?: number;
  permission?: "canManageResources" | "canManageSystemConfiguration" | "canManageUsers";
} = {}) => queryClient.prefetchQuery({ queryKey: Common.UseUsersServiceGetAllWithPermissionKeyFn({ limit, page, permission }), queryFn: () => UsersService.getAllWithPermission({ limit, page, permission }) });
export const prefetchUseSsoServiceGetAllSsoProviders = (queryClient: QueryClient) => queryClient.prefetchQuery({ queryKey: Common.UseSsoServiceGetAllSsoProvidersKeyFn(), queryFn: () => SsoService.getAllSsoProviders() });
export const prefetchUseSsoServiceGetOneSsoProviderById = (queryClient: QueryClient, { id }: {
  id: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseSsoServiceGetOneSsoProviderByIdKeyFn({ id }), queryFn: () => SsoService.getOneSsoProviderById({ id }) });
export const prefetchUseSsoServiceLoginWithOidc = (queryClient: QueryClient, { providerId, redirectTo }: {
  providerId: string;
  redirectTo?: unknown;
}) => queryClient.prefetchQuery({ queryKey: Common.UseSsoServiceLoginWithOidcKeyFn({ providerId, redirectTo }), queryFn: () => SsoService.loginWithOidc({ providerId, redirectTo }) });
export const prefetchUseSsoServiceOidcLoginCallback = (queryClient: QueryClient, { code, iss, providerId, redirectTo, sessionState, state }: {
  code: unknown;
  iss: unknown;
  providerId: string;
  redirectTo: string;
  sessionState: unknown;
  state: unknown;
}) => queryClient.prefetchQuery({ queryKey: Common.UseSsoServiceOidcLoginCallbackKeyFn({ code, iss, providerId, redirectTo, sessionState, state }), queryFn: () => SsoService.oidcLoginCallback({ code, iss, providerId, redirectTo, sessionState, state }) });
export const prefetchUseResourcesServiceGetAllResources = (queryClient: QueryClient, { limit, page, search }: {
  limit?: number;
  page?: number;
  search?: string;
} = {}) => queryClient.prefetchQuery({ queryKey: Common.UseResourcesServiceGetAllResourcesKeyFn({ limit, page, search }), queryFn: () => ResourcesService.getAllResources({ limit, page, search }) });
export const prefetchUseResourcesServiceGetOneResourceById = (queryClient: QueryClient, { id }: {
  id: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourcesServiceGetOneResourceByIdKeyFn({ id }), queryFn: () => ResourcesService.getOneResourceById({ id }) });
export const prefetchUseResourceUsageServiceGetHistoryOfResourceUsage = (queryClient: QueryClient, { limit, page, resourceId, userId }: {
  limit?: number;
  page?: number;
  resourceId: number;
  userId?: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceUsageServiceGetHistoryOfResourceUsageKeyFn({ limit, page, resourceId, userId }), queryFn: () => ResourceUsageService.getHistoryOfResourceUsage({ limit, page, resourceId, userId }) });
export const prefetchUseResourceUsageServiceGetActiveSession = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceUsageServiceGetActiveSessionKeyFn({ resourceId }), queryFn: () => ResourceUsageService.getActiveSession({ resourceId }) });
export const prefetchUseResourceIntroductionServiceGetAllResourceIntroductions = (queryClient: QueryClient, { limit, page, resourceId }: {
  limit: number;
  page: number;
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroductionServiceGetAllResourceIntroductionsKeyFn({ limit, page, resourceId }), queryFn: () => ResourceIntroductionService.getAllResourceIntroductions({ limit, page, resourceId }) });
export const prefetchUseResourceIntroductionServiceCheckStatus = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroductionServiceCheckStatusKeyFn({ resourceId }), queryFn: () => ResourceIntroductionService.checkStatus({ resourceId }) });
export const prefetchUseResourceIntroductionServiceGetHistoryOfIntroduction = (queryClient: QueryClient, { introductionId, resourceId }: {
  introductionId: number;
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroductionServiceGetHistoryOfIntroductionKeyFn({ introductionId, resourceId }), queryFn: () => ResourceIntroductionService.getHistoryOfIntroduction({ introductionId, resourceId }) });
export const prefetchUseResourceIntroductionServiceCheckIsRevokedStatus = (queryClient: QueryClient, { introductionId, resourceId }: {
  introductionId: number;
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroductionServiceCheckIsRevokedStatusKeyFn({ introductionId, resourceId }), queryFn: () => ResourceIntroductionService.checkIsRevokedStatus({ introductionId, resourceId }) });
export const prefetchUseResourceIntroductionServiceGetOneResourceIntroduction = (queryClient: QueryClient, { introductionId, resourceId }: {
  introductionId: number;
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroductionServiceGetOneResourceIntroductionKeyFn({ introductionId, resourceId }), queryFn: () => ResourceIntroductionService.getOneResourceIntroduction({ introductionId, resourceId }) });
export const prefetchUseResourceIntroductionServiceCheckCanManagePermission = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroductionServiceCheckCanManagePermissionKeyFn({ resourceId }), queryFn: () => ResourceIntroductionService.checkCanManagePermission({ resourceId }) });
export const prefetchUseResourceIntroducersServiceGetAllResourceIntroducers = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroducersServiceGetAllResourceIntroducersKeyFn({ resourceId }), queryFn: () => ResourceIntroducersService.getAllResourceIntroducers({ resourceId }) });
export const prefetchUseResourceIntroducersServiceCheckCanManagePermission = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseResourceIntroducersServiceCheckCanManagePermissionKeyFn({ resourceId }), queryFn: () => ResourceIntroducersService.checkCanManagePermission({ resourceId }) });
export const prefetchUseMqttResourceConfigurationServiceGetOneMqttConfiguration = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseMqttResourceConfigurationServiceGetOneMqttConfigurationKeyFn({ resourceId }), queryFn: () => MqttResourceConfigurationService.getOneMqttConfiguration({ resourceId }) });
export const prefetchUseMqttServersServiceGetAllMqttServers = (queryClient: QueryClient) => queryClient.prefetchQuery({ queryKey: Common.UseMqttServersServiceGetAllMqttServersKeyFn(), queryFn: () => MqttServersService.getAllMqttServers() });
export const prefetchUseMqttServersServiceGetOneMqttServerById = (queryClient: QueryClient, { id }: {
  id: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseMqttServersServiceGetOneMqttServerByIdKeyFn({ id }), queryFn: () => MqttServersService.getOneMqttServerById({ id }) });
export const prefetchUseMqttServersServiceGetStatusOfOne = (queryClient: QueryClient, { id }: {
  id: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseMqttServersServiceGetStatusOfOneKeyFn({ id }), queryFn: () => MqttServersService.getStatusOfOne({ id }) });
export const prefetchUseMqttServersServiceGetStatusOfAll = (queryClient: QueryClient) => queryClient.prefetchQuery({ queryKey: Common.UseMqttServersServiceGetStatusOfAllKeyFn(), queryFn: () => MqttServersService.getStatusOfAll() });
export const prefetchUseSseServiceSseControllerStreamEvents = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseSseServiceSseControllerStreamEventsKeyFn({ resourceId }), queryFn: () => SseService.sseControllerStreamEvents({ resourceId }) });
export const prefetchUseWebhooksServiceGetAllWebhookConfigurations = (queryClient: QueryClient, { resourceId }: {
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseWebhooksServiceGetAllWebhookConfigurationsKeyFn({ resourceId }), queryFn: () => WebhooksService.getAllWebhookConfigurations({ resourceId }) });
export const prefetchUseWebhooksServiceGetOneWebhookConfigurationById = (queryClient: QueryClient, { id, resourceId }: {
  id: number;
  resourceId: number;
}) => queryClient.prefetchQuery({ queryKey: Common.UseWebhooksServiceGetOneWebhookConfigurationByIdKeyFn({ id, resourceId }), queryFn: () => WebhooksService.getOneWebhookConfigurationById({ id, resourceId }) });
