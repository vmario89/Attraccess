import React from 'react';
import { PageHeader } from '../../components/pageHeader';
import { MqttServersList, MqttServersListRef } from './servers/MqttServersList';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as serverListEn from './servers/translations/en';
import * as serverListDe from './servers/translations/de';

export const MqttServersPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canManageMqtt = hasPermission('canManageResources');
  const { t } = useTranslations('mqttServersPage', {
    en: serverListEn,
    de: serverListDe,
  });

  // Reference to the MqttServersList component
  const serverListRef = React.useRef<MqttServersListRef>(null);

  // Redirect if user doesn't have permission
  if (!canManageMqtt) {
    return <Navigate to="/" />;
  }

  const handleAddNewServer = () => {
    if (serverListRef.current) {
      serverListRef.current.handleAddNew();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="MQTT Servers"
        subtitle="Manage MQTT server connections for resource integration"
        backTo="/"
        actions={
          <Button color="primary" startContent={<Plus size={16} />} onPress={handleAddNewServer}>
            {t('addNewServer')}
          </Button>
        }
      />

      <div className="mt-6">
        <MqttServersList ref={serverListRef} />
      </div>
    </div>
  );
};
