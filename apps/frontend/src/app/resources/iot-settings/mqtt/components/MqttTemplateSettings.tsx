import { Tabs, Tab, Divider } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import MqttTemplateForm from './MqttTemplateForm';
import * as en from './translations/template-settings/en';
import * as de from './translations/template-settings/de';

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

interface MqttTemplateSettingsProps {
  resourceId: number;
  formData: MqttFormData;
  onChange: (formData: MqttFormData) => void;
}

export default function MqttTemplateSettings({ resourceId, formData, onChange }: MqttTemplateSettingsProps) {
  const { t } = useTranslations('mqttTemplateSettings', { en, de });

  const handleFormChange = (state: 'inUse' | 'notInUse', field: 'topicTemplate' | 'messageTemplate', value: string) => {
    onChange({
      ...formData,
      [state]: {
        ...formData[state],
        [field]: value,
      },
    });
  };

  if (!formData.serverId) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('selectServerFirst')}</div>;
  }

  return (
    <div>
      <Tabs aria-label="MQTT Template Settings" variant="underlined">
        <Tab key="in-use" title={t('inUseStatus')}>
          <div className="py-4">
            <MqttTemplateForm
              resourceId={resourceId}
              topicTemplate={formData.inUse.topicTemplate}
              messageTemplate={formData.inUse.messageTemplate}
              onTopicChange={(value) => handleFormChange('inUse', 'topicTemplate', value)}
              onMessageChange={(value) => handleFormChange('inUse', 'messageTemplate', value)}
            />
          </div>
        </Tab>
        <Tab key="not-in-use" title={t('notInUseStatus')}>
          <div className="py-4">
            <MqttTemplateForm
              resourceId={resourceId}
              topicTemplate={formData.notInUse.topicTemplate}
              messageTemplate={formData.notInUse.messageTemplate}
              onTopicChange={(value) => handleFormChange('notInUse', 'topicTemplate', value)}
              onMessageChange={(value) => handleFormChange('notInUse', 'messageTemplate', value)}
            />
          </div>
        </Tab>
      </Tabs>
      <Divider className="my-4" />
    </div>
  );
}
