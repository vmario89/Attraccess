import { useState } from 'react';
import { Button } from '@heroui/button';
import { PlusCircle } from 'lucide-react';
import { UserSearch } from '../../../../../../components/userSearch';
import { useTranslations } from '../../../../../../i18n';

// Import translations
import * as en from './translations/addIntroducer.en';
import * as de from './translations/addIntroducer.de';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useAddIntroducer } from '@frontend/api/hooks/resourceIntroduction';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useToastMessage } from '@frontend/components';

interface AddIntroducerProps {
  resourceId: number;
}

export function AddIntroducer(props: AddIntroducerProps) {
  const { resourceId } = props;

  const { t } = useTranslations('addIntroducer', {
    en,
    de,
  });

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const addIntroducer = useAddIntroducer();
  const { success, error: showError } = useToastMessage();

  const handleAddIntroducer = async () => {
    if (!selectedUserId) {
      showError({
        title: t('error.noUserSelected.title'),
        description: t('error.noUserSelected.description'),
      });
      return;
    }

    try {
      await addIntroducer.mutateAsync({ resourceId, userId: selectedUserId });
      success({
        title: t('success.added.title'),
        description: t('success.added.description'),
      });

      setSelectedUserId(null);
    } catch (err) {
      showError({
        title: t('error.addFailed.title'),
        description: t('error.addFailed.description'),
      });
      console.error('Failed to add introducer:', err);
    }
  };

  return (
    <>
      <div className="relative">
        <UserSearch
          allowsCustomValue={false}
          onSelectionChange={setSelectedUserId}
        />
      </div>

      <Button
        onPress={handleAddIntroducer}
        isLoading={addIntroducer.isPending}
        color="primary"
        startContent={<PlusCircle className="w-4 h-4" />}
      >
        {t('addButton')}
      </Button>
    </>
  );
}
