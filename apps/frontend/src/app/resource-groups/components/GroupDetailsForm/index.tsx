import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Textarea, Button, Spinner, CardProps } from '@heroui/react';
import { Save, Edit3 } from 'lucide-react';
import {
  useResourcesServiceResourceGroupsGetOne,
  useResourcesServiceResourceGroupsUpdateOne,
  UseResourcesServiceResourceGroupsGetOneKeyFn,
} from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useToastMessage } from '../../../../components/toastProvider';
import { useQueryClient } from '@tanstack/react-query';
import * as en from './translations/en.json';
import * as de from './translations/de.json';
import { PageHeader } from '../../../../components/pageHeader';

interface GroupDetailsFormProps {
  groupId: number;
}

export function GroupDetailsForm(props: Readonly<GroupDetailsFormProps & Omit<CardProps, 'children'>>) {
  const { groupId, ...rest } = props;

  const { t } = useTranslations('groupDetailsForm', { en, de });
  const { success, error: showError } = useToastMessage();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: group, isLoading, error } = useResourcesServiceResourceGroupsGetOne({ id: groupId });

  const { mutateAsync: updateGroup, isPending: isUpdating } = useResourcesServiceResourceGroupsUpdateOne({
    onSuccess: () => {
      success({
        title: t('updateSuccessTitle'),
        description: t('updateSuccessDescription'),
      });
      queryClient.invalidateQueries({
        queryKey: UseResourcesServiceResourceGroupsGetOneKeyFn({ id: groupId }),
      });
    },
    onError: (err: Error) => {
      showError({
        title: t('updateErrorTitle'),
        description: t('updateErrorDescription', { error: err.message }),
      });
    },
  });

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateGroup({
      id: groupId,
      requestBody: { name: name.trim(), description: description.trim() || undefined },
    });
  };

  if (isLoading) {
    return (
      <Card {...rest}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
            <Spinner size="sm" />
            <span style={{ marginLeft: '8px', opacity: 0.7 }}>{t('loading')}</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error || !group) {
    return (
      <Card {...rest}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Edit3 size={20} color="red" />
            <div>
              <p style={{ color: 'red', fontWeight: '500' }}>{t('loadError')}</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>{t('loadErrorDescription')}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card {...rest}>
      <CardHeader>
        <PageHeader title={t('title')} subtitle={t('subtitle')} icon={<Edit3 size={20} />} noMargin={true} />
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label={t('nameLabel')}
            placeholder={t('namePlaceholder')}
            value={name}
            onValueChange={setName}
            isRequired
          />

          <Textarea
            label={t('descriptionLabel')}
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onValueChange={setDescription}
            minRows={3}
          />

          <Button
            type="submit"
            color="primary"
            startContent={<Save size={16} />}
            isLoading={isUpdating}
            isDisabled={!name.trim() || isUpdating}
          >
            {t('saveButton')}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
