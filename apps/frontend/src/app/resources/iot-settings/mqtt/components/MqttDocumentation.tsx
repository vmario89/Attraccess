import { Accordion, AccordionItem, Badge } from '@heroui/react';
import { HelpCircle } from 'lucide-react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './translations/documentation/en';
import * as de from './translations/documentation/de';

export default function MqttDocumentation() {
  const { t } = useTranslations('mqttDocumentation', { en, de });

  // Template variables documentation
  const templateVariables = [
    { name: 'id', description: t('resourceId'), example: '42' },
    { name: 'name', description: t('resourceName'), example: '3D Printer' },
    {
      name: 'timestamp',
      description: t('timestamp'),
      example: '2023-05-01T12:34:56.789Z',
    },
    { name: 'user.id', description: t('userId'), example: '123' },
    {
      name: 'user.username',
      description: t('username'),
      example: 'johndoe',
    },
    {
      name: 'status',
      description: t('status'),
      example: 'in_use / not_in_use',
    },
  ];

  return (
    <Accordion>
      <AccordionItem
        key="template-variables"
        aria-label="Template Variables"
        title={
          <div className="flex items-center gap-2">
            <HelpCircle size={16} />
            <span className="dark:text-gray-200">{t('templateVariablesTitle')}</span>
          </div>
        }
      >
        <div className="px-2 py-3 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('templateVariablesDescription')}</p>
          <div className="space-y-3">
            {templateVariables.map((variable) => (
              <div key={variable.name} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <Badge color="primary" className="font-mono text-xs break-all">
                    {`{{${variable.name}}}`}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{variable.description}</span>
                </div>
                <div className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <span className="text-gray-500 dark:text-gray-400">{t('example')}</span>{' '}
                  <span className="dark:text-gray-200 break-all">{variable.example}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <h4 className="text-sm font-semibold mb-2 dark:text-gray-300">{t('exampleTemplate')}</h4>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 font-mono text-xs dark:text-gray-200 overflow-x-auto">
              <p className="whitespace-pre-wrap break-words">{t('topic')} &nbsp;resources/42/status</p>
              <p className="whitespace-pre-wrap break-words">
                {t('message')} &nbsp;
                {
                  '{"status": "status_value", "resourceId": 42, "resourceName": "3D Printer", "timestamp": "2023-05-01T12:34:56.789Z", "user": "johndoe"}'
                }
              </p>
            </div>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
