import {
  Card,
  Accordion,
  AccordionItem,
  CardBody,
  Button,
} from '@heroui/react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import * as en from './translations/en';
import * as de from './translations/de';
import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import MqttServerSelector from './components/MqttServerSelector';
import MqttTemplateSettings from './components/MqttTemplateSettings';
import MqttActions from './components/MqttActions';
import MqttDocumentation from './components/MqttDocumentation';
import { useMqttResourceConfigurationServiceGetOneMqttConfiguration } from '@attraccess/react-query-client';

interface MqttConfigurationPanelProps {
  resourceId: number;
}

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

// Default templates that will be used for new configurations
const defaultTemplates = {
  inUse: {
    topic: 'resources/{{id}}/status',
    message:
      '{"status": "in-use", "resourceId": {{id}}, "resourceName": "{{name}}", "timestamp": "{{timestamp}}", "user": "{{user.username}}"}',
  },
  notInUse: {
    topic: 'resources/{{id}}/status',
    message:
      '{"status": "available", "resourceId": {{id}}, "resourceName": "{{name}}", "timestamp": "{{timestamp}}", "user": "{{user.username}}"}',
  },
};

export function MqttConfigurationPanel(props: MqttConfigurationPanelProps) {
  const { resourceId } = props;
  const { t } = useTranslations('mqtt', { en, de });
  const [isOpen, setIsOpen] = useState(false);
  const { data: mqttConfig } = useMqttResourceConfigurationServiceGetOneMqttConfiguration({resourceId});
  const [formData, setFormData] = useState<MqttFormData>({
    serverId: '',
    inUse: {
      topicTemplate: defaultTemplates.inUse.topic,
      messageTemplate: defaultTemplates.inUse.message,
    },
    notInUse: {
      topicTemplate: defaultTemplates.notInUse.topic,
      messageTemplate: defaultTemplates.notInUse.message,
    },
  });

  // When the config loads, update form values
  useEffect(() => {
    if (mqttConfig) {
      setFormData({
        serverId: mqttConfig.serverId.toString(),
        inUse: {
          topicTemplate: mqttConfig.inUseTopic || defaultTemplates.inUse.topic,
          messageTemplate:
            mqttConfig.inUseMessage || defaultTemplates.inUse.message,
        },
        notInUse: {
          topicTemplate:
            mqttConfig.notInUseTopic || defaultTemplates.notInUse.topic,
          messageTemplate:
            mqttConfig.notInUseMessage || defaultTemplates.notInUse.message,
        },
      });
    }
  }, [mqttConfig]);

  const handleReset = () => {
    setFormData({
      serverId: '',
      inUse: {
        topicTemplate: defaultTemplates.inUse.topic,
        messageTemplate: defaultTemplates.inUse.message,
      },
      notInUse: {
        topicTemplate: defaultTemplates.notInUse.topic,
        messageTemplate: defaultTemplates.notInUse.message,
      },
    });
  };

  return (
    <Card>
      <Accordion
        selectedKeys={isOpen ? ['mqtt'] : []}
        onSelectionChange={(keys) => {
          // @ts-expect-error - The types are incorrect for the Accordion component
          setIsOpen(keys.size > 0 && keys.has('mqtt'));
        }}
      >
        <AccordionItem
          key="mqtt"
          aria-label="MQTT Configuration"
          title={
            <div className="flex justify-between items-center w-full px-4">
              <span>{t('mqttTitle')}</span>
              {isOpen && (
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={handleReset}
                  title={t('resetToDefaults')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          }
        >
          <CardBody className="pt-4">
            <div className="flex flex-col gap-6">
              <p className="text-gray-600">{t('description')}</p>

              <MqttServerSelector
                resourceId={resourceId}
                value={formData.serverId}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, serverId: value }))
                }
              />

              <div className="space-y-6">
                <MqttTemplateSettings
                  resourceId={resourceId}
                  formData={formData}
                  onChange={setFormData}
                />
                <MqttDocumentation />
              </div>

              <MqttActions
                resourceId={resourceId}
                formData={formData}
                onReset={handleReset}
              />
            </div>
          </CardBody>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
