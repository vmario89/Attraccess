export default {
  // MqttConfigurationPanel
  mqttTitle: 'MQTT Integration',
  description:
    'Configure MQTT integration for status updates when this resource is in use or not in use.',
  manageServers: 'Manage Servers',
  resetToDefaults: 'Reset to defaults',
  inUse: 'In Use',
  notInUse: 'Not In Use',
  preview: 'Preview',
  documentation: 'Documentation',
  variables: {
    title: 'Available Variables',
    id: 'Resource ID',
    name: 'Resource Name',
    status: 'Current Status (in_use or not_in_use)',
    timestamp: 'Current Timestamp (ISO format)',
    user: {
      title: 'User Information',
      id: 'User ID',
      username: 'Username',
    },
  },

  // Action messages
  testSuccessful: 'Test Successful',
  testFailed: 'Test Failed',
  configSaved: 'MQTT Configuration Saved',
  configSavedDesc: 'The MQTT configuration has been successfully saved.',
  configDeleted: 'MQTT Configuration Deleted',
  configDeletedDesc: 'The MQTT configuration has been successfully deleted.',
  error: 'Error',
  failedToSave: 'Failed to save MQTT configuration.',
  failedToDelete: 'Failed to delete MQTT configuration.',
  failedToTest: 'Failed to test MQTT configuration.',
  deleteConfirmation:
    'Are you sure you want to delete this MQTT configuration?',
};
