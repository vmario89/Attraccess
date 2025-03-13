export default {
  // WebhookConfigurationPanel
  title: 'Webhook Integration',
  description:
    'Configure webhooks to receive notifications when the resource state changes. Webhooks allow you to integrate with external systems.',
  addWebhook: 'Add Webhook',
  errorLoading: 'Error loading webhook configurations.',

  // WebhookList
  noWebhooksConfigured: 'No webhooks configured',
  noWebhooksDescription:
    'Add a webhook to receive notifications when this resource changes state.',

  // WebhookListItem
  active: 'Active',
  inactive: 'Inactive',
  test: 'Test',
  edit: 'Edit',
  regenSecret: 'Regen Secret',
  enable: 'Enable',
  disable: 'Disable',
  delete: 'Delete',

  // WebhookForm - Main component only
  newWebhook: 'New Webhook',
  editWebhook: 'Edit Webhook',
  loadingWebhook: 'Loading webhook details...',

  // Form validation errors
  invalidUrl: 'Invalid URL',
  invalidUrlDesc: 'Please enter a valid URL.',
  invalidHeaders: 'Invalid Headers',
  invalidHeadersDesc: 'Headers must be a valid JSON object.',
  errorGeneric: 'Error',
  failedToSave: 'Failed to save webhook configuration.',

  // Toast messages
  webhookCreated: 'Webhook Created',
  webhookCreatedDesc: 'The webhook has been successfully created.',
  webhookUpdated: 'Webhook Updated',
  webhookUpdatedDesc: 'The webhook has been successfully updated.',
  webhookStatusUpdated: 'Webhook Status Updated',
  webhookEnabledDesc: 'Webhook enabled successfully.',
  webhookDisabledDesc: 'Webhook disabled successfully.',
  secretRegenerated: 'Secret Regenerated',
  secretRegeneratedDesc: 'Webhook secret has been regenerated successfully.',
  webhookDeleted: 'Webhook Deleted',
  webhookDeletedDesc: 'The webhook has been successfully deleted.',
  testSuccess: 'Test Successful',
  testFailed: 'Test Failed',

  // WebhookSecurityInfo
  securityTitle: 'Webhook Security',
  securityDescription:
    'All webhook requests include a signature header to verify the authenticity of the request. Use the secret to verify the signature on your server.',
  securityLink: 'Learn more about webhook security',

  // Confirmations
  regenerateSecretConfirmation:
    'Are you sure you want to regenerate the secret? This will invalidate all existing signatures.',

  // Other common messages
  failedToUpdate: 'Failed to update webhook status.',
  failedToRegenerate: 'Failed to regenerate webhook secret.',

  // Form fields
  nameLabel: 'Webhook Name',
  namePlaceholder: 'E.g., Slack Notification',
  urlLabel: 'Webhook URL',
  urlPlaceholder: 'https://example.com/webhook',
  methodLabel: 'HTTP Method',
  headersLabel: 'Headers (JSON object)',
  headersPlaceholder: '{"Content-Type": "application/json"}',
  headersHelp:
    'Specify headers as a JSON object. The Content-Type header will be automatically set to application/json if not specified.',
  activeLabel: 'Active',
  activeHelp: 'Enable or disable this webhook',
  retryLabel: 'Retry Settings',
  retryHelp: 'Configure automatic retries for failed webhook requests',
  maxRetriesLabel: 'Max Retries',
  maxRetriesHelp: 'Maximum 10 retries allowed',
  retryDelayLabel: 'Retry Delay (ms)',
  retryDelayHelp: 'Delay between retries (100-10000ms)',

  // Templates
  inUseTemplateLabel: 'In Use Payload Template',
  notInUseTemplateLabel: 'Not In Use Payload Template',
  previewLabel: 'Preview:',
  variablesLabel: 'Variables',
  variablesHelp: 'You can use the following variables in your templates:',

  // Buttons
  cancel: 'Cancel',
  save: 'Save',

  // Tabs
  inUseTab: 'In Use Template',
  notInUseTab: 'Not In Use Template',
  variablesTab: 'Variables',

  // Confirmations
  deleteConfirmation:
    'Are you sure you want to delete this webhook configuration?',

  // Error messages
  failedToDelete: 'Failed to delete webhook.',
  failedToTest: 'Failed to test webhook.',
  notImplemented: 'Not Implemented',
  notImplementedDesc: 'Testing unsaved webhooks is not yet supported.',
};
