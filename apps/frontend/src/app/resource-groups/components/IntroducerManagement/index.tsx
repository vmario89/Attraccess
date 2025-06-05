import { useMemo } from 'react';
import { Card, CardHeader, CardBody, CardProps } from '@heroui/react';
import { Users, AlertCircle, Trash2Icon } from 'lucide-react';
import {
  useAccessControlServiceResourceGroupIntroducersGetMany,
  useAccessControlServiceResourceGroupIntroducersGrant,
  useAccessControlServiceResourceGroupIntroducersRevoke,
  UseAccessControlServiceResourceGroupIntroducersGetManyKeyFn,
  User,
} from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useToastMessage } from '../../../../components/toastProvider';
import { useQueryClient } from '@tanstack/react-query';
import { UserSelectionList } from '../../../../components/userSelectionList';
import * as en from './en.json';
import * as de from './de.json';
import { PageHeader } from '../../../../components/pageHeader';

interface IntroducerManagementProps {
  groupId: number;
}

export function IntroducerManagement(props: Readonly<IntroducerManagementProps & Omit<CardProps, 'children'>>) {
  const { groupId, ...rest } = props;

  const { t } = useTranslations('introducerManagement', { en, de });
  const { success, error: showError } = useToastMessage();
  const queryClient = useQueryClient();

  const {
    data: introducersData,
    isLoading,
    error,
  } = useAccessControlServiceResourceGroupIntroducersGetMany({ groupId });

  const { mutate: grantIntroducerMutation, isPending: isGranting } =
    useAccessControlServiceResourceGroupIntroducersGrant({
      onSuccess: () => {
        success({
          title: t('addSuccessTitle'),
          description: t('addSuccessDescription'),
        });
        queryClient.invalidateQueries({
          queryKey: UseAccessControlServiceResourceGroupIntroducersGetManyKeyFn({ groupId }),
        });
      },
      onError: (err: Error) => {
        showError({
          title: t('addErrorTitle'),
          description: t('addErrorDescription', { error: err.message }),
        });
      },
    });

  const grantIntroducer = (user: User) => {
    if (user?.id) {
      grantIntroducerMutation({ groupId, userId: user.id });
    }
  };

  const { mutate: revokeIntroducerMutation, isPending: isRevoking } =
    useAccessControlServiceResourceGroupIntroducersRevoke({
      onSuccess: () => {
        success({
          title: t('removeSuccessTitle'),
          description: t('removeSuccessDescription'),
        });
        queryClient.invalidateQueries({
          queryKey: UseAccessControlServiceResourceGroupIntroducersGetManyKeyFn({ groupId }),
        });
      },
      onError: (err: Error) => {
        showError({
          title: t('removeErrorTitle'),
          description: t('removeErrorDescription', { error: err.message }),
        });
      },
    });

  const revokeIntroducer = (user: User) => {
    if (user?.id) {
      revokeIntroducerMutation({ groupId, userId: user.id });
    }
  };

  const introducerUsers = useMemo(() => {
    return introducersData?.map((introducer) => introducer.user);
  }, [introducersData]);

  if (error) {
    return (
      <Card {...rest}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="red" />
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
        <PageHeader title={t('title')} subtitle={t('subtitle')} icon={<Users size={20} />} noMargin={true} />
      </CardHeader>
      <CardBody>
        <UserSelectionList
          selectedUsers={introducerUsers ?? []}
          onAddToSelection={grantIntroducer}
          addToSelectionIsLoading={isGranting}
          selectedUserIsLoading={isLoading}
          tableProps={{
            removeWrapper: true,
            shadow: 'none',
          }}
          actions={[
            {
              color: 'danger',
              isIconOnly: true,
              isLoading: isRevoking,
              startContent: <Trash2Icon className="w-4 h-4" />,
              onClick: (userToRevoke) => {
                revokeIntroducer(userToRevoke);
              },
            },
          ]}
        />
      </CardBody>
    </Card>
  );
}
