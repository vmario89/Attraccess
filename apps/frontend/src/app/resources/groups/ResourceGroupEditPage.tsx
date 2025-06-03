
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Textarea,
  Button,
  Spinner,
  Form
} from '@heroui/react';
import {
  useResourceGroupsServiceGetOneResourceGroupById,
  useResourceGroupsServiceUpdateOneResourceGroup,
} from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useQueryClient } from '@tanstack/react-query';

import * as en from './translations/resourceGroupEditPage.en.json';
import * as de from './translations/resourceGroupEditPage.de.json';
import { ResourceGroupIntroducerManagement } from './components/ResourceGroupIntroducerManagement';
import { ResourceGroupIntroductionGranting } from './components/ResourceGroupIntroductionGranting';
import { ResourceGroupIntroductionViewer } from './components/ResourceGroupIntroductionViewer';
import { useToastMessage } from '../../../components/toastProvider';
import { PageHeader } from 'apps/frontend/src/components/pageHeader';

export function ResourceGroupEditPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { t } = useTranslations('resourceGroupEditPage', { en, de });
  const queryClient = useQueryClient();

  const toast = useToastMessage();

  const handleIntroductionGranted = () => {
    if (groupId) {
      queryClient.invalidateQueries({
        queryKey: resourceGroupIntroductionsServiceQueryKeys.getResourceGroupIntroductions({ resourceGroupId: Number(groupId) })
      });
      // Also, potentially refetch introducers if granting an intro can make someone an introducer (not current logic, but good to keep in mind)
      // queryClient.invalidateQueries({
      //   queryKey: resourceGroupIntroductionsServiceQueryKeys.getResourceGroupIntroducers({ resourceGroupId: Number(groupId) })
      // });
    }
  };

  const { data: group, isLoading, error, refetch } = useResourceGroupsServiceGetOneResourceGroupById(
    {
      id: Number(groupId),
    },
    undefined,
    { enabled: !!groupId }
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
    }
  }, [group]);

  const updateMutation = useResourceGroupsServiceUpdateOneResourceGroup({
    onSuccess: () => {
      toast.success({
        title: t('updateSuccessMessage')
      });
      refetch();
    },
    onError: (err: Error) => {
      toast.error({ title: t('updateErrorMessage') + `: ${err.message}` });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    updateMutation.mutate({ id: Number(groupId), requestBody: { name, description } });
  };

  if (isLoading) {
    return (
        <Spinner label={t('loadingGroupDetails')} />
    );
  }

  if (error || !group) {
    return (
        <p className="text-danger-500">{t('errorLoadingGroup')}</p>
    );
  }

  return (
    <div>
      <PageHeader title={t('pageTitle', {groupName: group.name ?? ''})} />
      <div className="space-y-6">
        <Form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>{t('groupDetailsCardTitle')}</CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('groupNameLabel')}
                </label>
                <Input
                  id="groupName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('groupDescriptionLabel')}
                </label>
                <Textarea
                  id="groupDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full"
                  rows={3}
                />
              </div>
              <Button type="submit" color="primary" isLoading={updateMutation.isPending}>
                {t('saveChangesButton')}
              </Button>
            </CardBody>
          </Card>
        </Form>

        {/* Section for Managing Resources - Placeholder */}
        <Card>
          <CardHeader>{t('manageResourcesTitle')}</CardHeader>
          <CardBody>
            <p>{t('manageResourcesPlaceholder')}</p>
          </CardBody>
        </Card>

        {/* Section for Managing Introducers - Placeholder */}
        <Card>
          <CardHeader>{t('manageIntroducersTitle')}</CardHeader>
          <CardBody>
            <ResourceGroupIntroducerManagement groupId={Number(groupId)} />
          </CardBody>
        </Card>

        {/* Section for Granting Introductions - Placeholder */}
        <Card>
          <CardHeader>{t('grantIntroductionTitle')}</CardHeader>
          <CardBody>
            <ResourceGroupIntroductionGranting groupId={Number(groupId)} onIntroductionGranted={handleIntroductionGranted} />
          </CardBody>
        </Card>

        {/* Section for Viewing Introductions - Placeholder */}
        <Card>
          <CardHeader>{t('viewIntroductionsTitle')}</CardHeader>
          <CardBody>
            <ResourceGroupIntroductionViewer groupId={Number(groupId)} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
