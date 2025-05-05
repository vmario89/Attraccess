import { Card, Accordion, AccordionItem, CardBody, Button } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './translations/en';
import * as de from './translations/de';
import WebhookList from './components/WebhookList';
import WebhookSecurityInfo from './components/WebhookSecurityInfo';
import { WebhookCreateModal } from './components/WebhookCreateModal';
import { useState } from 'react';
import { Plus } from 'lucide-react';
interface WebhookConfigurationPanelProps {
  resourceId: number;
}

export function WebhookConfigurationPanel(props: WebhookConfigurationPanelProps) {
  const { resourceId } = props;
  const { t } = useTranslations('webhooksConfigurationPanel', { en, de });

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <Card>
      <WebhookCreateModal resourceId={resourceId} isOpen={showCreateModal} onOpenChange={setShowCreateModal} />
      <Accordion
        selectedKeys={isOpen ? ['webhooks'] : []}
        onSelectionChange={(keys) => {
          // @ts-expect-error - The types are incorrect for the Accordion component
          setIsOpen(keys.size > 0 && keys.has('webhooks'));
        }}
      >
        <AccordionItem
          key="webhooks"
          aria-label="Webhook Configuration"
          title={
            <div className="flex justify-between items-center w-full px-4">
              <span>{t('title')}</span>

              {isOpen && (
                <Button size="sm" color="primary" onPress={() => setShowCreateModal(true)} startContent={<Plus />}>
                  {t('addWebhook')}
                </Button>
              )}
            </div>
          }
        >
          <CardBody className="pt-4">
            <div className="flex flex-col gap-4">
              <p className="text-gray-600">{t('description')}</p>

              <WebhookList resourceId={resourceId} />
              <WebhookSecurityInfo />
            </div>
          </CardBody>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
