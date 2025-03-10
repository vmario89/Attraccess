const translations = {
  title: 'MQTT-Server',
  addNewServer: 'Neuen Server hinzufügen',
  errorLoading: 'Fehler beim Laden der MQTT-Server.',
  noServersConfigured:
    'Noch keine MQTT-Server konfiguriert. Klicken Sie auf "Neuen Server hinzufügen", um einen zu erstellen.',

  // Table headers
  name: 'NAME',
  host: 'HOST',
  port: 'PORT',
  tls: 'TLS',
  authentication: 'AUTHENTIFIZIERUNG',
  actions: 'AKTIONEN',

  // TLS status
  enabled: 'Aktiviert',
  disabled: 'Deaktiviert',

  // Authentication status
  anonymous: 'Anonym',

  // Tooltips
  testConnection: 'Verbindung testen',
  editServer: 'Server bearbeiten',
  deleteServer: 'Server löschen',

  // Modal
  editMqttServer: 'MQTT-Server bearbeiten',
  addNewMqttServer: 'Neuen MQTT-Server hinzufügen',

  // Form labels
  nameLabel: 'Name',
  namePlaceholder: 'Mein MQTT-Server',
  hostLabel: 'Host',
  hostPlaceholder: 'mqtt.beispiel.de',
  portLabel: 'Port',
  portPlaceholder: '1883',
  clientIdLabel: 'Client-ID (Optional)',
  clientIdPlaceholder: 'attraccess-client',
  usernameLabel: 'Benutzername (Optional)',
  usernamePlaceholder: 'mqtt_benutzer',
  passwordLabel: 'Passwort (Optional)',
  passwordPlaceholder: '••••••••',
  useTls: 'TLS/SSL verwenden',

  // Buttons
  cancel: 'Abbrechen',
  update: 'Server aktualisieren',
  create: 'Server erstellen',

  // Confirmation
  deleteConfirmation:
    'Sind Sie sicher, dass Sie diesen MQTT-Server löschen möchten?',

  // Toast messages
  serverDeleted: 'MQTT-Server gelöscht',
  serverDeletedDesc: 'Der MQTT-Server wurde erfolgreich gelöscht.',
  serverUpdated: 'MQTT-Server aktualisiert',
  serverUpdatedDesc: 'Der MQTT-Server wurde erfolgreich aktualisiert.',
  serverCreated: 'MQTT-Server erstellt',
  serverCreatedDesc: 'Ein neuer MQTT-Server wurde erfolgreich erstellt.',
  connectionSuccessful: 'Verbindung erfolgreich',
  connectionSuccessfulDesc: 'Erfolgreich mit dem MQTT-Server verbunden',
  connectionFailed: 'Verbindung fehlgeschlagen',
  connectionCheckError: 'Verbindungsprüfungsfehler',
  invalidResponseFormat: 'Ungültiges Antwortformat vom Server erhalten',
  connectionTestError: 'Verbindungstestfehler',
  errorGeneric: 'Fehler',
  failedToDelete: 'Fehler beim Löschen des MQTT-Servers.',
  failedToUpdate: 'Fehler beim Aktualisieren des MQTT-Servers.',
  failedToCreate: 'Fehler beim Erstellen des MQTT-Servers.',
  failedToConnect: 'Fehler beim Verbinden mit dem MQTT-Server',
};

export default { default: translations };
