import { useParams } from 'react-router-dom';
import { useResourcesServiceResourceGroupsGetOne } from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { PageHeader } from '../../components/pageHeader';
import { GroupDetailsForm } from './components/GroupDetailsForm';
import { IntroducerManagement } from './components/IntroducerManagement';
import { IntroductionsManagement } from './components/IntroductionsManagement';
import { Spinner } from '@heroui/react';
import * as en from './en.json';
import * as de from './de.json';
import { GroupIcon } from 'lucide-react';

export function ResourceGroupEditPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { t } = useTranslations('resourceGroupEditPage', { en, de });
  const numericGroupId = Number(groupId);

  const {
    data: group,
    isLoading,
    error,
  } = useResourcesServiceResourceGroupsGetOne({ id: numericGroupId }, undefined, { enabled: !!groupId });

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  if (error || !group) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ color: 'red', fontWeight: '500', fontSize: '18px' }}>{t('loadError')}</p>
        <p style={{ opacity: 0.7, marginTop: '8px' }}>{t('loadErrorDescription')}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={group.name} subtitle={t('page.subtitle')} icon={<GroupIcon />} />

      <div className="flex flex-row flex-wrap gap-4">
        <GroupDetailsForm groupId={numericGroupId} className="flex-grow" />
        <IntroducerManagement groupId={numericGroupId} className="flex-grow" />

        <IntroductionsManagement groupId={numericGroupId} className="flex-grow" />
      </div>
    </div>
  );
}
