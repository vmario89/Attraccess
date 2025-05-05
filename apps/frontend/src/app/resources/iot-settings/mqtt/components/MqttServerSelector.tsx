import { Alert, Link } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useEffect } from 'react';
import * as en from './translations/server-selector/en';
import * as de from './translations/server-selector/de';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Select } from '@frontend/components/select';
import {
  useMqttResourceConfigurationServiceGetOneMqttConfiguration,
  useMqttServersServiceGetAllMqttServers,
} from '@attraccess/react-query-client';

interface MqttServerSelectorProps {
  resourceId: number;
  value: string;
  onChange: (serverId: string) => void;
}

export default function MqttServerSelector({ resourceId, value, onChange }: MqttServerSelectorProps) {
  const { t } = useTranslations('mqttServerSelector', { en, de });
  const { data: servers, isLoading: isLoadingServers } = useMqttServersServiceGetAllMqttServers();
  const { data: mqttConfig } = useMqttResourceConfigurationServiceGetOneMqttConfiguration({ resourceId });

  // When the config loads, update the selected server
  useEffect(() => {
    if (mqttConfig?.serverId && !value) {
      onChange(mqttConfig.serverId.toString());
    }
  }, [mqttConfig, value, onChange]);

  if (isLoadingServers) {
    return <div>Loading...</div>;
  }

  if (!servers?.length) {
    return (
      <Alert color="warning" startContent={<AlertTriangle className="h-4 w-4" />} className="mb-4">
        {t('noServers')}{' '}
        <Link href="/settings/mqtt-servers" className="font-medium">
          {t('addServer')}
        </Link>
      </Alert>
    );
  }

  const items = servers.map((server) => ({
    key: server.id.toString(),
    label: server.name,
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium dark:text-gray-200">{t('mqttServer')}</label>
      </div>
      <Select items={items} selectedKey={value} onSelectionChange={onChange} label={t('selectServer')} />
    </div>
  );
}
