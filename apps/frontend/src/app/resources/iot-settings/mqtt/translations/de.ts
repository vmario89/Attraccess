export default {
  // MqttConfigurationPanel
  mqttTitle: 'MQTT-Integration',
  description:
    'Konfigurieren Sie die MQTT-Integration für Statusaktualisierungen, wenn diese Ressource verwendet wird oder nicht verwendet wird.',
  manageServers: 'Server verwalten',
  resetToDefaults: 'Auf Standardwerte zurücksetzen',
  inUse: 'In Benutzung',
  notInUse: 'Nicht in Benutzung',
  preview: 'Vorschau',
  documentation: 'Dokumentation',
  variables: {
    title: 'Verfügbare Variablen',
    id: 'Ressourcen-ID',
    name: 'Ressourcenname',
    status: 'Aktueller Status (in_use oder not_in_use)',
    timestamp: 'Aktueller Zeitstempel (ISO-Format)',
    user: {
      title: 'Benutzerinformationen',
      id: 'Benutzer-ID',
      username: 'Benutzername',
    },
  },

  // Action messages
  testSuccessful: 'Test erfolgreich',
  testFailed: 'Test fehlgeschlagen',
  configSaved: 'MQTT-Konfiguration gespeichert',
  configSavedDesc: 'Die MQTT-Konfiguration wurde erfolgreich gespeichert.',
  configDeleted: 'MQTT-Konfiguration gelöscht',
  configDeletedDesc: 'Die MQTT-Konfiguration wurde erfolgreich gelöscht.',
  error: 'Fehler',
  failedToSave: 'Fehler beim Speichern der MQTT-Konfiguration.',
  failedToDelete: 'Fehler beim Löschen der MQTT-Konfiguration.',
  failedToTest: 'Fehler beim Testen der MQTT-Konfiguration.',
  deleteConfirmation:
    'Sind Sie sicher, dass Sie diese MQTT-Konfiguration löschen möchten?',
};
