import { Input, Textarea, Snippet } from '@heroui/react';
import { Code } from 'lucide-react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import { useMemo } from 'react';
import * as en from './translations/template-form/en';
import * as de from './translations/template-form/de';
import { useResourcesServiceGetOneResourceById } from '@attraccess/react-query-client';

interface MqttTemplateFormProps {
  topicTemplate: string;
  messageTemplate: string;
  onTopicChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  resourceId: number;
}

export default function MqttTemplateForm({
  topicTemplate,
  messageTemplate,
  onTopicChange,
  onMessageChange,
  resourceId,
}: MqttTemplateFormProps) {
  const { t } = useTranslations('mqttTemplateForm', { en, de });
  const { data: resource } = useResourcesServiceGetOneResourceById({id: resourceId});

  // Create a preview context for rendering templates
  const previewContext = useMemo(() => {
    if (!resource) return null;

    return {
      id: resource.id,
      name: resource.name,
      timestamp: new Date().toISOString(),
      user: { id: 123, username: 'johndoe' },
    };
  }, [resource]);

  // Preview template helper that ensures output is valid
  const previewTemplate = (template: string, formatJson = false) => {
    if (!previewContext) {
      return 'Loading preview...';
    }

    try {
      // Clone the template for manipulation
      let processedTemplate = template;

      // Replace all variables in the template
      Object.entries(previewContext).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            processedTemplate = processedTemplate.replace(
              new RegExp(`{{${key}.${nestedKey}}}`, 'g'),
              String(nestedValue)
            );
          });
        } else {
          processedTemplate = processedTemplate.replace(
            new RegExp(`{{${key}}}`, 'g'),
            String(value)
          );
        }
      });

      // If it's a JSON message, format it
      if (formatJson) {
        try {
          const jsonObj = JSON.parse(processedTemplate);
          return JSON.stringify(jsonObj, null, 2);
        } catch {
          return processedTemplate;
        }
      }

      return processedTemplate;
    } catch (error) {
      console.error('Error processing template:', error);
      return 'Error processing template';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('topicTemplate')}
        </label>
        <Input
          value={topicTemplate}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder={t('topicTemplatePlaceholder')}
          startContent={<Code className="h-4 w-4" />}
        />
        <div className="mt-2">
          <span className="text-sm text-gray-500 block">{t('preview')}:</span>
          <Snippet className="mt-1" variant="flat">
            {previewTemplate(topicTemplate)}
          </Snippet>
        </div>
      </div>

      <div className="pt-8">
        <label className="block text-sm font-medium mb-2">
          {t('messageTemplate')}
        </label>
        <Textarea
          value={messageTemplate}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={t('messageTemplatePlaceholder')}
          startContent={<Code className="h-4 w-4" />}
        />
        <div className="mt-2">
          <span className="text-sm text-gray-500">{t('preview')}:</span>
          <Snippet className="mt-1" variant="flat" hideSymbol>
            {previewTemplate(messageTemplate, true)
              .split('\n')
              .map((line, lineIndex) => (
                <div className="whitespace-pre-wrap">{line}</div>
              ))}
          </Snippet>
        </div>
      </div>
    </div>
  );
}
