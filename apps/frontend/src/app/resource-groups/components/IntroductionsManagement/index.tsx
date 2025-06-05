import { useCallback, useMemo, useState } from 'react';
import { Card, CardHeader, CardBody, CardProps, useDisclosure, Chip } from '@heroui/react';
import { Users, AlertCircle, HistoryIcon } from 'lucide-react';
import {
  useAccessControlServiceResourceGroupIntroductionsGetMany,
  useAccessControlServiceResourceGroupIntroductionsGetManyKey,
  useAccessControlServiceResourceGroupIntroductionsGrant,
  useAccessControlServiceResourceGroupIntroductionsRevoke,
  User,
} from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useToastMessage } from '../../../../components/toastProvider';
import { useQueryClient } from '@tanstack/react-query';
import * as en from './en.json';
import * as de from './de.json';
import { PageHeader } from '../../../../components/pageHeader';
import { UserSelectionList } from '../../../../components/userSelectionList';
import { ResourceGroupIntroductionHistoryModal } from './history';
import { IntroductionStatusChip } from '../../../../components/IntroductionStatusChip';

interface UserWithIntroductionStatus extends User {
  hasValidIntroduction: boolean;
}

const StatusColumn = (user: UserWithIntroductionStatus) => {
  return <IntroductionStatusChip isValid={user.hasValidIntroduction} />;
};

interface IntroductionsManagementProps {
  groupId: number;
}

export function IntroductionsManagement(props: Readonly<IntroductionsManagementProps & Omit<CardProps, 'children'>>) {
  const { groupId, ...rest } = props;
  const { t } = useTranslations('introductionsManagement', { en, de });
  const toast = useToastMessage();
  const queryClient = useQueryClient();

  const [userIdForHistoryModal, setUserIdForHistoryModal] = useState<number | null>(null);
  const { isOpen: isHistoryModalOpen, onOpen: onHistoryModalOpen, onClose: onHistoryModalClose } = useDisclosure();

  const {
    data: introductions,
    isLoading,
    error,
  } = useAccessControlServiceResourceGroupIntroductionsGetMany({
    groupId,
  });

  const usersWithIntroductions = useMemo(() => {
    return (introductions ?? []).map((introduction) => introduction.receiverUser);
  }, [introductions]);

  const { mutate: grantIntroductionMutation, isPending: isGranting } =
    useAccessControlServiceResourceGroupIntroductionsGrant({
      onSuccess: () => {
        toast.success({
          title: t('createSuccessTitle'),
          description: t('createSuccessDescription'),
        });
        queryClient.invalidateQueries({
          queryKey: [useAccessControlServiceResourceGroupIntroductionsGetManyKey],
        });
      },
      onError: (err: Error) => {
        toast.error({
          title: t('createErrorTitle'),
          description: t('createErrorDescription', { error: err.message }),
        });
      },
    });

  const grantIntroduction = useCallback(
    (user: User, comment?: string) => {
      grantIntroductionMutation({
        groupId,
        userId: user.id,
        requestBody: {
          comment,
        },
      });
    },
    [grantIntroductionMutation, groupId]
  );

  const { mutate: revokeIntroductionMutation, isPending: isRevoking } =
    useAccessControlServiceResourceGroupIntroductionsRevoke({
      onSuccess: () => {
        toast.success({
          title: t('revokeSuccessTitle'),
          description: t('revokeSuccessDescription'),
        });
        queryClient.invalidateQueries({
          queryKey: [useAccessControlServiceResourceGroupIntroductionsGetManyKey],
        });
      },
      onError: (err: Error) => {
        toast.error({
          title: t('revokeErrorTitle'),
          description: t('revokeErrorDescription', { error: err.message }),
        });
      },
    });

  const revokeIntroduction = useCallback(
    (user: User, comment?: string) => {
      revokeIntroductionMutation({
        groupId,
        userId: user.id,
        requestBody: {
          comment,
        },
      });
    },
    [revokeIntroductionMutation, groupId]
  );

  const userHasValidIntroduction = useCallback(
    (user: User) => {
      const introductionOfUser = (introductions ?? []).find((intro) => intro.receiverUserId === user.id);

      if (!introductionOfUser) {
        return false;
      }

      const sortedHistory = [...introductionOfUser.history].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        return dateB.getTime() - dateA.getTime();
      });

      const lastHistoryItem = sortedHistory[0];

      return lastHistoryItem?.action === 'grant';
    },
    [introductions]
  );

  const UserListActions = useMemo(
    () => (user: UserWithIntroductionStatus) =>
      [
        {
          onClick: (user: UserWithIntroductionStatus) => {
            setUserIdForHistoryModal(user.id);
            onHistoryModalOpen();
          },
          isIconOnly: true,
          startContent: <HistoryIcon className="w-4 h-4" />,
        },
        {
          label: user.hasValidIntroduction ? t('actions.revoke') : t('actions.grant'),
          isLoading: isRevoking ?? isGranting,
          onClick: (user: UserWithIntroductionStatus) => {
            if (user.hasValidIntroduction) {
              revokeIntroduction(user);
              return;
            }

            grantIntroduction(user);
          },
        },
      ],
    [onHistoryModalOpen, revokeIntroduction, isRevoking, isGranting, t, grantIntroduction]
  );

  const userWithIntroductionStatus = useMemo((): UserWithIntroductionStatus[] => {
    return usersWithIntroductions.map((user) => {
      const hasValidIntroduction = userHasValidIntroduction(user);
      return {
        ...user,
        hasValidIntroduction,
      };
    });
  }, [usersWithIntroductions, userHasValidIntroduction]);

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
    <>
      <Card {...rest}>
        <CardHeader>
          <PageHeader title={t('title')} subtitle={t('subtitle')} icon={<Users size={20} />} noMargin={true} />
        </CardHeader>
        <CardBody>
          <UserSelectionList
            selectedUsers={userWithIntroductionStatus}
            onAddToSelection={grantIntroduction}
            addToSelectionIsLoading={isGranting}
            selectedUserIsLoading={isLoading}
            tableProps={{
              removeWrapper: true,
              shadow: 'none',
            }}
            additionalColumns={[
              {
                key: 'status',
                label: t('columns.status.label'),
                value: StatusColumn,
              },
            ]}
            actions={UserListActions}
          />
        </CardBody>
      </Card>

      <ResourceGroupIntroductionHistoryModal
        groupId={groupId}
        userId={userIdForHistoryModal ?? -1}
        isOpen={isHistoryModalOpen}
        onClose={onHistoryModalClose}
      />
    </>
  );
}
