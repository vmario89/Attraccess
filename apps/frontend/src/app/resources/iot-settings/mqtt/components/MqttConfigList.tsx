import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { Accordion, AccordionItem, Alert, Button, Skeleton } from '@heroui/react';
import {
  useMqttResourceConfigurationServiceGetAllMqttConfigurations,
  useMqttResourceConfigurationServiceDeleteOneMqttConfiguration,
} from '@attraccess/react-query-client';
import { useNavigate } from 'react-router-dom';
import { useToastMessage } from '../../../../../components/toastProvider';
import en from '../translations/configList.en.json';
import de from '../translations/configList.de.json';

interface MqttConfigListProps {
  resourceId: number;
}

export function MqttConfigList({ resourceId }: MqttConfigListProps) {
  const { t } = useTranslations('mqttConfigList', { en, de });
  const navigate = useNavigate();
  const { success, error: showError } = useToastMessage();

  const {
    data: mqttConfigs = [],
    isLoading,
    refetch,
  } = useMqttResourceConfigurationServiceGetAllMqttConfigurations({
    resourceId,
  });

  const deleteConfig = useMqttResourceConfigurationServiceDeleteOneMqttConfiguration({
    onSuccess: () => {
      success({
        title: t('deleteSuccess'),
        description: t('deleteSuccessDetail'),
      });
      refetch();
    },
    onError: (err) => {
      showError({
        title: t('deleteError'),
        description: t('deleteErrorDetail'),
      });
      console.error('Failed to delete MQTT configuration:', err);
    },
  });

  const handleEdit = (configId: number) => {
    navigate(`/resources/${resourceId}/iot/mqtt/edit/${configId}`);
  };

  const handleDelete = async (configId: number) => {
    if (window.confirm(t('confirmDelete'))) {
      deleteConfig.mutate({
        resourceId,
        configId,
      });
    }
  };

  const handleTest = (configId: number) => {
    navigate(`/resources/${resourceId}/iot/mqtt/test/${configId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  if (mqttConfigs.length === 0) {
    return (
      <Alert color="warning">
        <p>{t('noConfigs')}</p>
        <p className="text-sm">{t('noConfigsDetail')}</p>
      </Alert>
    );
  }

  return (
    <Accordion className="flex flex-col gap-2">
      {mqttConfigs.map((config) => (
        <AccordionItem
          key={`mqtt-config-${config.id}`}
          aria-label={`MQTT Configuration: ${config.name}`}
          title={
            <div className="flex justify-between items-center w-full gap-2">
              <span className="font-medium">{config.name}</span>
              <span className="text-sm text-gray-500">Server ID: {config.serverId}</span>
            </div>
          }
        >
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold mb-2">{t('inUseSettings')}</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p>
                    <strong>{t('topic')}:</strong> {config.inUseTopic}
                  </p>
                  <p className="mt-2">
                    <strong>{t('message')}:</strong>
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-600 p-2 rounded mt-1 text-xs overflow-auto">
                    {config.inUseMessage}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('notInUseSettings')}</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p>
                    <strong>{t('topic')}:</strong> {config.notInUseTopic}
                  </p>
                  <p className="mt-2">
                    <strong>{t('message')}:</strong>
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-600 p-2 rounded mt-1 text-xs overflow-auto">
                    {config.notInUseMessage}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button color="secondary" size="sm" onPress={() => handleTest(config.id)}>
                {t('testButton')}
              </Button>
              <Button color="primary" size="sm" onPress={() => handleEdit(config.id)}>
                {t('editButton')}
              </Button>
              <Button
                color="danger"
                size="sm"
                onPress={() => handleDelete(config.id)}
                disabled={deleteConfig.isPending}
              >
                {deleteConfig.isPending ? t('deletingButton') : t('deleteButton')}
              </Button>
            </div>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
