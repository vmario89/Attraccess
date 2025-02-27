/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateUserDto {
  /**
   * The username for the new user
   * @example "johndoe"
   */
  username: string;
  /**
   * The email address for the new user
   * @example "john.doe@example.com"
   */
  email: string;
  /**
   * The password for the new user
   * @example "password123"
   */
  password: string;
  /**
   * The authentication strategy to use
   * @example "local_password"
   */
  strategy: 'local_password' | 'google' | 'github';
}

export type SystemPermissions = object;

export interface User {
  /**
   * The unique identifier of the user
   * @example 1
   */
  id: number;
  /**
   * The username of the user
   * @example "johndoe"
   */
  username: string;
  /**
   * Whether the user has verified their email address
   * @example true
   */
  isEmailVerified: boolean;
  /**
   * System-wide permissions for the user
   * @example {"canManageResources":true,"canManageUsers":false}
   */
  systemPermissions: SystemPermissions;
  /**
   * When the user was created
   * @format date-time
   */
  createdAt: string;
  /**
   * When the user was last updated
   * @format date-time
   */
  updatedAt: string;
}

export interface VerifyEmailDto {
  /**
   * The token to verify the email
   * @example "1234567890"
   */
  token: string;
  /**
   * The email to verify
   * @example "john.doe@example.com"
   */
  email: string;
}

export type Object = object;

export interface PaginatedResponseDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSessionResponse {
  user: User;
  authToken: string;
}

export interface CreateResourceDto {
  /**
   * The name of the resource
   * @example "3D Printer"
   */
  name: string;
  /**
   * A detailed description of the resource
   * @example "Prusa i3 MK3S+ 3D printer with 0.4mm nozzle"
   */
  description?: string;
  /**
   * Resource image file
   * @format binary
   */
  image?: File;
}

export interface Resource {
  /**
   * The unique identifier of the resource
   * @example 1
   */
  id: number;
  /**
   * The name of the resource
   * @example "3D Printer"
   */
  name: string;
  /**
   * A detailed description of the resource
   * @example "Prusa i3 MK3S+ 3D printer with 0.4mm nozzle"
   */
  description?: string;
  /**
   * The filename of the resource image
   * @example "1234567890_abcdef.jpg"
   */
  imageFilename?: string;
  /**
   * Total hours the resource has been in use
   * @example 123.5
   */
  totalUsageHours: number;
  /**
   * When the resource was created
   * @format date-time
   */
  createdAt: string;
  /**
   * When the resource was last updated
   * @format date-time
   */
  updatedAt: string;
}

export interface PaginatedResourceResponseDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Resource[];
}

export interface UpdateResourceDto {
  /**
   * The name of the resource
   * @example "3D Printer"
   */
  name?: string;
  /**
   * A detailed description of the resource
   * @example "Prusa i3 MK3S+ 3D printer with 0.4mm nozzle"
   */
  description?: string;
  /**
   * New resource image file
   * @format binary
   */
  image?: File;
}

export interface StartUsageSessionDto {
  /**
   * Optional notes about the usage session
   * @example "Printing a prototype case"
   */
  notes?: string;
}

export interface ResourceUsage {
  /**
   * The unique identifier of the resource usage
   * @example 1
   */
  id: number;
  /**
   * The ID of the resource being used
   * @example 1
   */
  resourceId: number;
  /**
   * The ID of the user using the resource (null if user was deleted)
   * @example 1
   */
  userId?: number;
  /**
   * When the usage session started
   * @format date-time
   */
  startTime: string;
  /**
   * Notes provided when starting the session
   * @example "Starting prototype development for client XYZ"
   */
  startNotes?: string;
  /**
   * When the usage session ended
   * @format date-time
   */
  endTime?: string;
  /**
   * Notes provided when ending the session
   * @example "Completed initial prototype, material usage: 500g"
   */
  endNotes?: string;
  /**
   * Duration of the usage session in hours
   * @example 2.5
   */
  duration: number;
  /**
   * The user who used the resource
   * @example 1
   */
  user?: User;
}

export interface EndUsageSessionDto {
  /**
   * Additional notes about the completed session
   * @example "Print completed successfully"
   */
  notes?: string;
  /**
   * The end time of the session. If not provided, current time will be used.
   * @format date-time
   */
  endTime?: string;
}

export interface CompleteIntroductionDto {
  /**
   * User ID (deprecated, use userIdentifier instead)
   * @example 1
   */
  userId?: number;
  /**
   * Username or email of the user
   * @example "username or user@example.com"
   */
  userIdentifier?: string;
}

export interface ResourceIntroduction {
  /**
   * The unique identifier of the introduction
   * @example 1
   */
  id: number;
  /**
   * The ID of the resource
   * @example 1
   */
  resourceId: number;
  /**
   * The ID of the user who received the introduction
   * @example 1
   */
  receiverUserId: number;
  /**
   * The ID of the user who tutored the receiver
   * @example 2
   */
  tutorUserId: number;
  /**
   * When the introduction was completed
   * @format date-time
   * @example "2021-01-01T00:00:00.000Z"
   */
  completedAt: string;
  /**
   * When the introduction record was created
   * @format date-time
   * @example "2021-01-01T00:00:00.000Z"
   */
  createdAt: string;
  /** The user who received the introduction */
  receiverUser: User;
  /** The user who tutored the receiver */
  tutorUser: User;
}

export interface PaginatedResourceIntroductionResponseDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ResourceIntroduction[];
}

export interface ResourceIntroductionUser {
  /**
   * The unique identifier of the introduction permission
   * @example 1
   */
  id: number;
  /**
   * The ID of the resource
   * @example 1
   */
  resourceId: number;
  /**
   * The ID of the user who can give introductions
   * @example 1
   */
  userId: number;
  /**
   * When the permission was granted
   * @format date-time
   */
  grantedAt: string;
  /** The user who can give introductions */
  user: User;
}

export type AppControllerGetPingData = any;

export type UsersControllerCreateUserData = User;

export interface UsersControllerGetUsersParams {
  /** Page number (1-based) */
  page: Object;
  /** Number of items per page */
  limit: Object;
}

export type UsersControllerGetUsersData = PaginatedResponseDto;

export type UsersControllerVerifyEmailData = any;

export type UsersControllerGetMeData = User;

export interface AuthControllerPostSessionPayload {
  /** The username for authentication */
  username: string;
  /** The password for authentication */
  password: string;
}

export type AuthControllerPostSessionData = CreateSessionResponse;

export type AuthControllerDeleteSessionData = any;

export type ResourcesControllerCreateResourceData = Resource;

export interface ResourcesControllerGetResourcesParams {
  /**
   * Page number (1-based)
   * @min 1
   * @default 1
   */
  page?: number;
  /**
   * Number of items per page
   * @min 1
   * @default 10
   */
  limit?: number;
  /** Search term to filter resources */
  search?: string;
}

export type ResourcesControllerGetResourcesData = PaginatedResourceResponseDto;

export type ResourcesControllerGetResourceByIdData = Resource;

export type ResourcesControllerUpdateResourceData = Resource;

export type ResourcesControllerDeleteResourceData = any;

export type ResourceUsageControllerStartSessionData = ResourceUsage;

export type ResourceUsageControllerEndSessionData = ResourceUsage;

export interface ResourceUsageControllerGetResourceHistoryParams {
  /**
   * The page number to retrieve
   * @example 1
   */
  page?: number;
  /**
   * The number of items per page
   * @example 10
   */
  limit?: number;
  /**
   * The user ID to filter by
   * @example 1
   */
  userId?: number;
  resourceId: number;
}

export type ResourceUsageControllerGetResourceHistoryData = PaginatedResponseDto;

export type ResourceUsageControllerGetActiveSessionData = ResourceUsage;

export type ResourceIntroductionControllerCompleteIntroductionData = ResourceIntroduction;

export interface ResourceIntroductionControllerGetResourceIntroductionsParams {
  /**
   * Page number (1-based)
   * @min 1
   * @default 1
   */
  page: number;
  /**
   * Number of items per page
   * @min 1
   * @max 100
   * @default 10
   */
  limit: number;
  resourceId: number;
}

export type ResourceIntroductionControllerGetResourceIntroductionsData = PaginatedResourceIntroductionResponseDto;

export type ResourceIntroductionControllerCheckIntroductionStatusData = boolean;

export type ResourceIntroductionControllerAddIntroducerData = ResourceIntroductionUser;

export type ResourceIntroductionControllerRemoveIntroducerData = any;

export type ResourceIntroductionControllerGetResourceIntroducersData = ResourceIntroductionUser[];

export namespace App {
  /**
   * No description
   * @tags App
   * @name AppControllerGetPing
   * @request GET:/api/ping
   */
  export namespace AppControllerGetPing {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AppControllerGetPingData;
  }
}

export namespace Users {
  /**
   * No description
   * @tags users
   * @name UsersControllerCreateUser
   * @request POST:/api/users
   */
  export namespace UsersControllerCreateUser {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateUserDto;
    export type RequestHeaders = {};
    export type ResponseBody = UsersControllerCreateUserData;
  }

  /**
   * No description
   * @tags users
   * @name UsersControllerGetUsers
   * @request GET:/api/users
   * @secure
   */
  export namespace UsersControllerGetUsers {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Page number (1-based) */
      page: Object;
      /** Number of items per page */
      limit: Object;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UsersControllerGetUsersData;
  }

  /**
   * No description
   * @tags users
   * @name UsersControllerVerifyEmail
   * @request POST:/api/users/verify-email
   */
  export namespace UsersControllerVerifyEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifyEmailDto;
    export type RequestHeaders = {};
    export type ResponseBody = UsersControllerVerifyEmailData;
  }

  /**
   * No description
   * @tags users
   * @name UsersControllerGetMe
   * @request GET:/api/users/me
   * @secure
   */
  export namespace UsersControllerGetMe {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UsersControllerGetMeData;
  }

  /**
   * No description
   * @tags users
   * @name UsersControllerGetUserById
   * @request GET:/api/users/{id}
   * @secure
   */
  export namespace UsersControllerGetUserById {
    export type RequestParams = {
      id: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}

export namespace Auth {
  /**
   * No description
   * @tags Auth
   * @name AuthControllerPostSession
   * @request POST:/api/auth/session/local
   */
  export namespace AuthControllerPostSession {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AuthControllerPostSessionPayload;
    export type RequestHeaders = {};
    export type ResponseBody = AuthControllerPostSessionData;
  }

  /**
   * No description
   * @tags Auth
   * @name AuthControllerDeleteSession
   * @request DELETE:/api/auth/session
   * @secure
   */
  export namespace AuthControllerDeleteSession {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AuthControllerDeleteSessionData;
  }
}

export namespace Resources {
  /**
   * No description
   * @tags Resources
   * @name ResourcesControllerCreateResource
   * @summary Create a new resource
   * @request POST:/api/resources
   * @secure
   */
  export namespace ResourcesControllerCreateResource {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateResourceDto;
    export type RequestHeaders = {};
    export type ResponseBody = ResourcesControllerCreateResourceData;
  }

  /**
   * No description
   * @tags Resources
   * @name ResourcesControllerGetResources
   * @summary Get all resources
   * @request GET:/api/resources
   * @secure
   */
  export namespace ResourcesControllerGetResources {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Page number (1-based)
       * @min 1
       * @default 1
       */
      page?: number;
      /**
       * Number of items per page
       * @min 1
       * @default 10
       */
      limit?: number;
      /** Search term to filter resources */
      search?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourcesControllerGetResourcesData;
  }

  /**
   * No description
   * @tags Resources
   * @name ResourcesControllerGetResourceById
   * @summary Get a resource by ID
   * @request GET:/api/resources/{id}
   * @secure
   */
  export namespace ResourcesControllerGetResourceById {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourcesControllerGetResourceByIdData;
  }

  /**
   * No description
   * @tags Resources
   * @name ResourcesControllerUpdateResource
   * @summary Update a resource
   * @request PUT:/api/resources/{id}
   * @secure
   */
  export namespace ResourcesControllerUpdateResource {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateResourceDto;
    export type RequestHeaders = {};
    export type ResponseBody = ResourcesControllerUpdateResourceData;
  }

  /**
   * No description
   * @tags Resources
   * @name ResourcesControllerDeleteResource
   * @summary Delete a resource
   * @request DELETE:/api/resources/{id}
   * @secure
   */
  export namespace ResourcesControllerDeleteResource {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourcesControllerDeleteResourceData;
  }
}

export namespace ResourceUsage {
  /**
   * No description
   * @tags Resource Usage
   * @name ResourceUsageControllerStartSession
   * @summary Start a resource usage session
   * @request POST:/api/resources/{resourceId}/usage/start
   * @secure
   */
  export namespace ResourceUsageControllerStartSession {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = StartUsageSessionDto;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceUsageControllerStartSessionData;
  }

  /**
   * No description
   * @tags Resource Usage
   * @name ResourceUsageControllerEndSession
   * @summary End a resource usage session
   * @request PUT:/api/resources/{resourceId}/usage/end
   * @secure
   */
  export namespace ResourceUsageControllerEndSession {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = EndUsageSessionDto;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceUsageControllerEndSessionData;
  }

  /**
   * No description
   * @tags Resource Usage
   * @name ResourceUsageControllerGetResourceHistory
   * @summary Get usage history for a resource
   * @request GET:/api/resources/{resourceId}/usage/history
   * @secure
   */
  export namespace ResourceUsageControllerGetResourceHistory {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {
      /**
       * The page number to retrieve
       * @example 1
       */
      page?: number;
      /**
       * The number of items per page
       * @example 10
       */
      limit?: number;
      /**
       * The user ID to filter by
       * @example 1
       */
      userId?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceUsageControllerGetResourceHistoryData;
  }

  /**
   * No description
   * @tags Resource Usage
   * @name ResourceUsageControllerGetActiveSession
   * @summary Get active usage session for current user
   * @request GET:/api/resources/{resourceId}/usage/active
   * @secure
   */
  export namespace ResourceUsageControllerGetActiveSession {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceUsageControllerGetActiveSessionData;
  }
}

export namespace ResourceIntroductions {
  /**
   * @description Complete an introduction for a user identified by their user ID, username, or email.
   * @tags Resource Introductions
   * @name ResourceIntroductionControllerCompleteIntroduction
   * @summary Mark resource introduction as completed for a user
   * @request POST:/api/resources/{resourceId}/introductions/complete
   * @secure
   */
  export namespace ResourceIntroductionControllerCompleteIntroduction {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = CompleteIntroductionDto;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceIntroductionControllerCompleteIntroductionData;
  }

  /**
   * No description
   * @tags Resource Introductions
   * @name ResourceIntroductionControllerGetResourceIntroductions
   * @summary Get all introductions for a resource
   * @request GET:/api/resources/{resourceId}/introductions
   * @secure
   */
  export namespace ResourceIntroductionControllerGetResourceIntroductions {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {
      /**
       * Page number (1-based)
       * @min 1
       * @default 1
       */
      page: number;
      /**
       * Number of items per page
       * @min 1
       * @max 100
       * @default 10
       */
      limit: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceIntroductionControllerGetResourceIntroductionsData;
  }

  /**
   * No description
   * @tags Resource Introductions
   * @name ResourceIntroductionControllerCheckIntroductionStatus
   * @summary Check if current user has completed the introduction
   * @request GET:/api/resources/{resourceId}/introductions/status
   * @secure
   */
  export namespace ResourceIntroductionControllerCheckIntroductionStatus {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceIntroductionControllerCheckIntroductionStatusData;
  }

  /**
   * No description
   * @tags Resource Introductions
   * @name ResourceIntroductionControllerAddIntroducer
   * @summary Add a user as an authorized introducer
   * @request POST:/api/resources/{resourceId}/introductions/introducers/{userId}
   * @secure
   */
  export namespace ResourceIntroductionControllerAddIntroducer {
    export type RequestParams = {
      resourceId: number;
      userId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceIntroductionControllerAddIntroducerData;
  }

  /**
   * No description
   * @tags Resource Introductions
   * @name ResourceIntroductionControllerRemoveIntroducer
   * @summary Remove a user from authorized introducers
   * @request DELETE:/api/resources/{resourceId}/introductions/introducers/{userId}
   * @secure
   */
  export namespace ResourceIntroductionControllerRemoveIntroducer {
    export type RequestParams = {
      resourceId: number;
      userId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceIntroductionControllerRemoveIntroducerData;
  }

  /**
   * No description
   * @tags Resource Introductions
   * @name ResourceIntroductionControllerGetResourceIntroducers
   * @summary Get all authorized introducers for a resource
   * @request GET:/api/resources/{resourceId}/introductions/introducers
   * @secure
   */
  export namespace ResourceIntroductionControllerGetResourceIntroducers {
    export type RequestParams = {
      resourceId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResourceIntroductionControllerGetResourceIntroducersData;
  }
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Attraccess API
 * @version 1.0
 * @contact
 *
 * The Attraccess API used to manage machine and tool access in a Makerspace or FabLab
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  app = {
    /**
     * No description
     *
     * @tags App
     * @name AppControllerGetPing
     * @request GET:/api/ping
     */
    appControllerGetPing: (params: RequestParams = {}) =>
      this.request<AppControllerGetPingData, any>({
        path: `/api/ping`,
        method: 'GET',
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name UsersControllerCreateUser
     * @request POST:/api/users
     */
    usersControllerCreateUser: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<UsersControllerCreateUserData, any>({
        path: `/api/users`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersControllerGetUsers
     * @request GET:/api/users
     * @secure
     */
    usersControllerGetUsers: (query: UsersControllerGetUsersParams, params: RequestParams = {}) =>
      this.request<UsersControllerGetUsersData, void>({
        path: `/api/users`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersControllerVerifyEmail
     * @request POST:/api/users/verify-email
     */
    usersControllerVerifyEmail: (data: VerifyEmailDto, params: RequestParams = {}) =>
      this.request<UsersControllerVerifyEmailData, any>({
        path: `/api/users/verify-email`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersControllerGetMe
     * @request GET:/api/users/me
     * @secure
     */
    usersControllerGetMe: (params: RequestParams = {}) =>
      this.request<UsersControllerGetMeData, void>({
        path: `/api/users/me`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersControllerGetUserById
     * @request GET:/api/users/{id}
     * @secure
     */
    usersControllerGetUserById: (id: string, params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/api/users/${id}`,
        method: 'GET',
        secure: true,
        ...params,
      }),
  };
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerPostSession
     * @request POST:/api/auth/session/local
     */
    authControllerPostSession: (data: AuthControllerPostSessionPayload, params: RequestParams = {}) =>
      this.request<AuthControllerPostSessionData, any>({
        path: `/api/auth/session/local`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerDeleteSession
     * @request DELETE:/api/auth/session
     * @secure
     */
    authControllerDeleteSession: (params: RequestParams = {}) =>
      this.request<AuthControllerDeleteSessionData, void>({
        path: `/api/auth/session`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  resources = {
    /**
     * No description
     *
     * @tags Resources
     * @name ResourcesControllerCreateResource
     * @summary Create a new resource
     * @request POST:/api/resources
     * @secure
     */
    resourcesControllerCreateResource: (data: CreateResourceDto, params: RequestParams = {}) =>
      this.request<ResourcesControllerCreateResourceData, void>({
        path: `/api/resources`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resources
     * @name ResourcesControllerGetResources
     * @summary Get all resources
     * @request GET:/api/resources
     * @secure
     */
    resourcesControllerGetResources: (query: ResourcesControllerGetResourcesParams, params: RequestParams = {}) =>
      this.request<ResourcesControllerGetResourcesData, void>({
        path: `/api/resources`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resources
     * @name ResourcesControllerGetResourceById
     * @summary Get a resource by ID
     * @request GET:/api/resources/{id}
     * @secure
     */
    resourcesControllerGetResourceById: (id: number, params: RequestParams = {}) =>
      this.request<ResourcesControllerGetResourceByIdData, void>({
        path: `/api/resources/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resources
     * @name ResourcesControllerUpdateResource
     * @summary Update a resource
     * @request PUT:/api/resources/{id}
     * @secure
     */
    resourcesControllerUpdateResource: (id: number, data: UpdateResourceDto, params: RequestParams = {}) =>
      this.request<ResourcesControllerUpdateResourceData, void>({
        path: `/api/resources/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resources
     * @name ResourcesControllerDeleteResource
     * @summary Delete a resource
     * @request DELETE:/api/resources/{id}
     * @secure
     */
    resourcesControllerDeleteResource: (id: number, params: RequestParams = {}) =>
      this.request<ResourcesControllerDeleteResourceData, void>({
        path: `/api/resources/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  resourceUsage = {
    /**
     * No description
     *
     * @tags Resource Usage
     * @name ResourceUsageControllerStartSession
     * @summary Start a resource usage session
     * @request POST:/api/resources/{resourceId}/usage/start
     * @secure
     */
    resourceUsageControllerStartSession: (resourceId: number, data: StartUsageSessionDto, params: RequestParams = {}) =>
      this.request<ResourceUsageControllerStartSessionData, void>({
        path: `/api/resources/${resourceId}/usage/start`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Usage
     * @name ResourceUsageControllerEndSession
     * @summary End a resource usage session
     * @request PUT:/api/resources/{resourceId}/usage/end
     * @secure
     */
    resourceUsageControllerEndSession: (resourceId: number, data: EndUsageSessionDto, params: RequestParams = {}) =>
      this.request<ResourceUsageControllerEndSessionData, void>({
        path: `/api/resources/${resourceId}/usage/end`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Usage
     * @name ResourceUsageControllerGetResourceHistory
     * @summary Get usage history for a resource
     * @request GET:/api/resources/{resourceId}/usage/history
     * @secure
     */
    resourceUsageControllerGetResourceHistory: (
      { resourceId, ...query }: ResourceUsageControllerGetResourceHistoryParams,
      params: RequestParams = {},
    ) =>
      this.request<ResourceUsageControllerGetResourceHistoryData, void>({
        path: `/api/resources/${resourceId}/usage/history`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Usage
     * @name ResourceUsageControllerGetActiveSession
     * @summary Get active usage session for current user
     * @request GET:/api/resources/{resourceId}/usage/active
     * @secure
     */
    resourceUsageControllerGetActiveSession: (resourceId: number, params: RequestParams = {}) =>
      this.request<ResourceUsageControllerGetActiveSessionData, void>({
        path: `/api/resources/${resourceId}/usage/active`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  resourceIntroductions = {
    /**
     * @description Complete an introduction for a user identified by their user ID, username, or email.
     *
     * @tags Resource Introductions
     * @name ResourceIntroductionControllerCompleteIntroduction
     * @summary Mark resource introduction as completed for a user
     * @request POST:/api/resources/{resourceId}/introductions/complete
     * @secure
     */
    resourceIntroductionControllerCompleteIntroduction: (
      resourceId: number,
      data: CompleteIntroductionDto,
      params: RequestParams = {},
    ) =>
      this.request<ResourceIntroductionControllerCompleteIntroductionData, void>({
        path: `/api/resources/${resourceId}/introductions/complete`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Introductions
     * @name ResourceIntroductionControllerGetResourceIntroductions
     * @summary Get all introductions for a resource
     * @request GET:/api/resources/{resourceId}/introductions
     * @secure
     */
    resourceIntroductionControllerGetResourceIntroductions: (
      { resourceId, ...query }: ResourceIntroductionControllerGetResourceIntroductionsParams,
      params: RequestParams = {},
    ) =>
      this.request<ResourceIntroductionControllerGetResourceIntroductionsData, void>({
        path: `/api/resources/${resourceId}/introductions`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Introductions
     * @name ResourceIntroductionControllerCheckIntroductionStatus
     * @summary Check if current user has completed the introduction
     * @request GET:/api/resources/{resourceId}/introductions/status
     * @secure
     */
    resourceIntroductionControllerCheckIntroductionStatus: (resourceId: number, params: RequestParams = {}) =>
      this.request<ResourceIntroductionControllerCheckIntroductionStatusData, void>({
        path: `/api/resources/${resourceId}/introductions/status`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Introductions
     * @name ResourceIntroductionControllerAddIntroducer
     * @summary Add a user as an authorized introducer
     * @request POST:/api/resources/{resourceId}/introductions/introducers/{userId}
     * @secure
     */
    resourceIntroductionControllerAddIntroducer: (resourceId: number, userId: number, params: RequestParams = {}) =>
      this.request<ResourceIntroductionControllerAddIntroducerData, void>({
        path: `/api/resources/${resourceId}/introductions/introducers/${userId}`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Introductions
     * @name ResourceIntroductionControllerRemoveIntroducer
     * @summary Remove a user from authorized introducers
     * @request DELETE:/api/resources/{resourceId}/introductions/introducers/{userId}
     * @secure
     */
    resourceIntroductionControllerRemoveIntroducer: (resourceId: number, userId: number, params: RequestParams = {}) =>
      this.request<ResourceIntroductionControllerRemoveIntroducerData, void>({
        path: `/api/resources/${resourceId}/introductions/introducers/${userId}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Resource Introductions
     * @name ResourceIntroductionControllerGetResourceIntroducers
     * @summary Get all authorized introducers for a resource
     * @request GET:/api/resources/{resourceId}/introductions/introducers
     * @secure
     */
    resourceIntroductionControllerGetResourceIntroducers: (resourceId: number, params: RequestParams = {}) =>
      this.request<ResourceIntroductionControllerGetResourceIntroducersData, void>({
        path: `/api/resources/${resourceId}/introductions/introducers`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
