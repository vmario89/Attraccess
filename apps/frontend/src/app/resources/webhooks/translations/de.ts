export default {
  // WebhookConfigurationPanel
  title: 'Webhook-Integration',
  description:
    'Konfigurieren Sie Webhooks, um Benachrichtigungen zu erhalten, wenn sich der Ressourcenzustand ändert. Webhooks ermöglichen die Integration mit externen Systemen.',
  addWebhook: 'Webhook hinzufügen',
  errorLoading: 'Fehler beim Laden der Webhook-Konfigurationen.',

  // WebhookList
  noWebhooksConfigured: 'Keine Webhooks konfiguriert',
  noWebhooksDescription:
    'Fügen Sie einen Webhook hinzu, um Benachrichtigungen zu erhalten, wenn sich der Status dieser Ressource ändert.',

  // WebhookListItem
  active: 'Aktiv',
  inactive: 'Inaktiv',
  test: 'Test',
  edit: 'Bearbeiten',
  regenSecret: 'Secret neu generieren',
  enable: 'Aktivieren',
  disable: 'Deaktivieren',
  delete: 'Löschen',

  // WebhookForm - Main component only
  newWebhook: 'Neuer Webhook',
  editWebhook: 'Webhook bearbeiten',
  loadingWebhook: 'Lade Webhook-Details...',

  // Form validation errors
  invalidUrl: 'Ungültige URL',
  invalidUrlDesc: 'Bitte geben Sie eine gültige URL ein.',
  invalidHeaders: 'Ungültige Header',
  invalidHeadersDesc: 'Header müssen ein gültiges JSON-Objekt sein.',
  errorGeneric: 'Fehler',
  failedToSave: 'Webhook-Konfiguration konnte nicht gespeichert werden.',

  // Toast messages
  webhookCreated: 'Webhook erstellt',
  webhookCreatedDesc: 'Der Webhook wurde erfolgreich erstellt.',
  webhookUpdated: 'Webhook aktualisiert',
  webhookUpdatedDesc: 'Der Webhook wurde erfolgreich aktualisiert.',
  webhookStatusUpdated: 'Webhook-Status aktualisiert',
  webhookEnabledDesc: 'Webhook erfolgreich aktiviert.',
  webhookDisabledDesc: 'Webhook erfolgreich deaktiviert.',
  secretRegenerated: 'Secret neu generiert',
  secretRegeneratedDesc: 'Webhook-Secret wurde erfolgreich neu generiert.',
  webhookDeleted: 'Webhook gelöscht',
  webhookDeletedDesc: 'Der Webhook wurde erfolgreich gelöscht.',
  testSuccess: 'Test erfolgreich',
  testFailed: 'Test fehlgeschlagen',
  notImplemented: 'Nicht implementiert',
  notImplementedDesc:
    'Das Testen von nicht gespeicherten Webhooks wird noch nicht unterstützt.',

  // WebhookSecurityInfo
  securityTitle: 'Webhook-Sicherheit',
  securityDescription:
    'Alle Webhook-Anfragen enthalten einen Signatur-Header, um die Authentizität der Anfrage zu überprüfen. Verwenden Sie das Secret, um die Signatur auf Ihrem Server zu verifizieren.',
  securityLink: 'Mehr über Webhook-Sicherheit erfahren',

  // Confirmations
  regenerateSecretConfirmation:
    'Sind Sie sicher, dass Sie das Secret neu generieren möchten? Dies wird alle bestehenden Signaturen ungültig machen.',

  // Other common messages
  failedToUpdate: 'Webhook-Status konnte nicht aktualisiert werden.',
  failedToRegenerate: 'Webhook-Secret konnte nicht neu generiert werden.',
  failedToDelete: 'Fehler beim Löschen des Webhooks.',
  failedToTest: 'Fehler beim Testen des Webhooks.',

  // Form fields
  nameLabel: 'Webhook-Name',
  namePlaceholder: 'z.B. Slack-Benachrichtigung',
  urlLabel: 'Webhook-URL',
  urlPlaceholder: 'https://example.com/webhook',
  methodLabel: 'HTTP-Methode',
  headersLabel: 'Header (JSON-Objekt)',
  headersPlaceholder: '{"Content-Type": "application/json"}',
  headersHelp:
    'Geben Sie Header als JSON-Objekt an. Der Content-Type-Header wird automatisch auf application/json gesetzt, wenn nicht anders angegeben.',
  activeLabel: 'Aktiv',
  activeHelp: 'Aktivieren oder deaktivieren Sie diesen Webhook',
  retryLabel: 'Wiederholungseinstellungen',
  retryHelp:
    'Konfigurieren Sie automatische Wiederholungen für fehlgeschlagene Webhook-Anfragen',
  maxRetriesLabel: 'Max. Wiederholungen',
  maxRetriesHelp: 'Maximal 10 Wiederholungen erlaubt',
  retryDelayLabel: 'Wiederholungsverzögerung (ms)',
  retryDelayHelp: 'Verzögerung zwischen Wiederholungen (100-10000 ms)',

  // Templates
  inUseTemplateLabel: 'In-Verwendung-Nutzlast-Vorlage',
  notInUseTemplateLabel: 'Nicht-in-Verwendung-Nutzlast-Vorlage',
  previewLabel: 'Vorschau:',
  variablesLabel: 'Variablen',
  variablesHelp:
    'Sie können die folgenden Variablen in Ihren Vorlagen verwenden:',

  // Buttons
  cancel: 'Abbrechen',
  save: 'Speichern',

  // Tabs
  inUseTab: 'In-Verwendung-Vorlage',
  notInUseTab: 'Nicht-in-Verwendung-Vorlage',
  variablesTab: 'Variablen',

  // Confirmations
  deleteConfirmation:
    'Sind Sie sicher, dass Sie diese Webhook-Konfiguration löschen möchten?',
};
