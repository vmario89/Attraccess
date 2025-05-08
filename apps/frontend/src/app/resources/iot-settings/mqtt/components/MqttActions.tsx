import { Button, CardFooter } from '@heroui/react';
import { Save, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './translations/actions/en';
import * as de from './translations/actions/de';
import {
  useMqttResourceConfigurationServiceDeleteOneMqttConfiguration,
  useMqttResourceConfigurationServiceGetOneMqttConfiguration,
  useMqttResourceConfigurationServiceTestOne,
  useMqttResourceConfigurationServiceUpsertOne,
  UseMqttResourceConfigurationServiceGetOneMqttConfigurationKeyFn,
} from '@attraccess/react-query-client';
import { useQueryClient } from '@tanstack/react-query';
import { useToastMessage } from '../../../../../components/toastProvider';

interface MqttFormData {
  serverId: string;
  inUse: {
    topicTemplate: string;
    messageTemplate: string;
  };
  notInUse: {
    topicTemplate: string;
    messageTemplate: string;
  };
}

interface MqttActionsProps {
  resourceId: number;
  formData: MqttFormData;
  onReset: () => void;
}

export default function MqttActions({ resourceId, formData, onReset }: MqttActionsProps) {
  const { t } = useTranslations('mqttActions', { en, de });
  const { data: mqttConfig } = useMqttResourceConfigurationServiceGetOneMqttConfiguration({ resourceId });
  const [isTesting, setIsTesting] = useState(false);
  const queryClient = useQueryClient();

  const { success, error: showError } = useToastMessage();
  const createOrUpdateConfig = useMqttResourceConfigurationServiceUpsertOne();
  const deleteConfig = useMqttResourceConfigurationServiceDeleteOneMqttConfiguration();
  const testConfig = useMqttResourceConfigurationServiceTestOne();

  const handleSave = async () => {
    if (!formData.serverId) {
      showError({
        title: t('validationError'),
        description: t('serverRequired'),
      });
      return;
    }

    try {
      const configData = {
        serverId: parseInt(formData.serverId, 10),
        inUseTopic: formData.inUse.topicTemplate,
        inUseMessage: formData.inUse.messageTemplate,
        notInUseTopic: formData.notInUse.topicTemplate,
        notInUseMessage: formData.notInUse.messageTemplate,
      };

      await createOrUpdateConfig.mutateAsync({
        resourceId,
        requestBody: configData,
      });

      success({
        title: t('configSaved'),
        description: t('configSavedDesc'),
      });

      queryClient.invalidateQueries({
        queryKey: UseMqttResourceConfigurationServiceGetOneMqttConfigurationKeyFn({
          resourceId,
        }),
      });
    } catch (error) {
      console.error('Failed to save MQTT configuration:', error);
      showError({
        title: t('error'),
        description: t('failedToSave'),
      });
    }
  };

  const handleDelete = async () => {
    if (!mqttConfig) return;

    if (window.confirm(t('deleteConfirmation'))) {
      try {
        await deleteConfig.mutateAsync({ resourceId });
        onReset();
        success({
          title: t('configDeleted'),
          description: t('configDeletedDesc'),
        });

        queryClient.invalidateQueries({
          queryKey: UseMqttResourceConfigurationServiceGetOneMqttConfigurationKeyFn({
            resourceId,
          }),
        });
      } catch (error) {
        console.error('Failed to delete MQTT configuration:', error);
        showError({
          title: t('error'),
          description: t('failedToDelete'),
        });
      }
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testConfig.mutateAsync({ resourceId });
      if (result.success) {
        success({
          title: t('testSuccessful'),
          description: result.message,
        });
      } else {
        showError({
          title: t('testFailed'),
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Failed to test MQTT configuration:', error);
      showError({
        title: t('error'),
        description: t('failedToTest'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <CardFooter className="flex justify-end gap-2 px-0">
      {mqttConfig && (
        <>
          <Button
            size="sm"
            color="primary"
            variant="light"
            startContent={<RefreshCw size={16} />}
            isLoading={isTesting}
            onPress={handleTest}
          >
            {t('test')}
          </Button>
          <Button size="sm" color="danger" variant="light" startContent={<Trash2 size={16} />} onPress={handleDelete}>
            {t('delete')}
          </Button>
        </>
      )}

      <Button size="sm" color="primary" startContent={<Save size={16} />} onPress={handleSave}>
        {t('save')}
      </Button>
    </CardFooter>
  );
}
