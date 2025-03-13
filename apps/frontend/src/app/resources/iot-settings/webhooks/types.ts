import { WebhookConfigResponseDto } from '@attraccess/api-client';

// Define WebhookHttpMethod enum matching the backend
export enum WebhookHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

// Form values interface
export interface WebhookFormValues {
  name: string;
  url: string;
  method: WebhookHttpMethod;
  headers: string;
  inUseTemplate: string;
  notInUseTemplate: string;
  active: boolean;
  retryEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  signatureHeader: string;
}

// Example templates
export const exampleTemplates = {
  inUse:
    '{"status": "in_use", "resourceId": {{id}}, "resourceName": "{{name}}", "timestamp": "{{timestamp}}", "user": "{{user.username}}"}',
  notInUse:
    '{"status": "not_in_use", "resourceId": {{id}}, "resourceName": "{{name}}", "timestamp": "{{timestamp}}"}',
};

// Default form values
export const defaultFormValues: WebhookFormValues = {
  name: '',
  url: 'https://',
  method: WebhookHttpMethod.POST,
  headers: '{}',
  inUseTemplate: exampleTemplates.inUse,
  notInUseTemplate: exampleTemplates.notInUse,
  active: true,
  retryEnabled: false,
  maxRetries: 3,
  retryDelay: 1000,
  signatureHeader: 'X-Webhook-Signature',
};

// Template variables documentation
export const templateVariables = [
  { name: 'id', description: 'Resource ID', example: '42' },
  { name: 'name', description: 'Resource name', example: '3D Printer' },
  {
    name: 'timestamp',
    description: 'Current timestamp in ISO format',
    example: '2023-05-01T12:34:56.789Z',
  },
  { name: 'user.id', description: 'User ID (if available)', example: '123' },
  {
    name: 'user.username',
    description: 'Username (if available)',
    example: 'johndoe',
  },
];

/**
 * Helper to convert a webhook response to form values
 */
export const webhookToFormValues = (
  webhook: WebhookConfigResponseDto
): WebhookFormValues => {
  // Parse headers if it's a string
  let parsedHeaders = '{}';
  if (webhook.headers) {
    try {
      // If headers is already a string, use it as is
      if (typeof webhook.headers === 'string') {
        parsedHeaders = webhook.headers;
      } else {
        // If headers is an object, stringify it
        parsedHeaders = JSON.stringify(webhook.headers);
      }
    } catch (e) {
      console.error('Error parsing headers:', e);
    }
  }

  return {
    name: webhook.name,
    url: webhook.url,
    method: webhook.method as WebhookHttpMethod,
    headers: parsedHeaders,
    inUseTemplate: webhook.inUseTemplate,
    notInUseTemplate: webhook.notInUseTemplate,
    active: webhook.active,
    retryEnabled: webhook.retryEnabled,
    maxRetries: webhook.maxRetries,
    retryDelay: webhook.retryDelay,
    signatureHeader: webhook.signatureHeader || 'X-Webhook-Signature',
  };
};
