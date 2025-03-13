import React from 'react';
import { Accordion, AccordionItem, Alert, Skeleton, Chip } from '@heroui/react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useWebhookConfigs } from '@frontend/api/hooks/webhookConfig';
import * as en from '../translations/en';
import * as de from '../translations/de';
import WebhookForm from './WebhookForm';

// Types
interface WebhookListProps {
  resourceId: number;
}

/**
 * Self-contained component for managing a list of webhooks
 * Handles its own data fetching, state management, and UI
 */
const WebhookList: React.FC<WebhookListProps> = ({ resourceId }) => {
  // Hooks
  const { t } = useTranslations('webhooksList', { en, de });
  const { data: webhooks = [], isLoading: isLoadingWebhooks } =
    useWebhookConfigs(resourceId);

  // Loading state
  if (isLoadingWebhooks) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  return webhooks.length > 0 ? (
    <Accordion className="flex flex-col gap-2">
      {webhooks.map((webhook) => {
        const webhookKey = `webhook-${webhook.id}`;

        return (
          <AccordionItem
            key={webhookKey}
            aria-label={`Webhook ${webhook.name}`}
            title={
              <div className="flex justify-between items-center w-full gap-2">
                <span className="font-medium">{webhook.name}</span>
                <Chip color={webhook.active ? 'success' : 'danger'}>
                  {webhook.active ? t('active') : t('inactive')}
                </Chip>
              </div>
            }
          >
            <WebhookForm webhookId={webhook.id} resourceId={resourceId} />
          </AccordionItem>
        );
      })}
    </Accordion>
  ) : (
    <Alert color="warning">
      <p>{t('noWebhooksConfigured')}</p>
      <p className="text-sm">{t('noWebhooksDescription')}</p>
    </Alert>
  );
};

export default WebhookList;
