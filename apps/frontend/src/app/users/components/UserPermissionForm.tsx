import React, { useEffect, useState } from 'react';
import { Checkbox, Button, Card } from '@heroui/react';
import { useTranslations } from '../../../i18n';

import { useToastMessage } from '../../../components/toastProvider';
import * as en from '../translations/en';
import * as de from '../translations/de';
import { AttraccessUser } from '../../../components/AttraccessUser';
import { User, useUsersServiceGetPermissions, useUsersServiceUpdatePermissions } from '@attraccess/react-query-client';

interface UserPermissionFormProps {
  user: User;
}

export const UserPermissionForm: React.FC<UserPermissionFormProps> = ({
  user,
}) => {
  const { t } = useTranslations('userPermissionForm', { en, de });
  const { showToast } = useToastMessage();

  const { data: userPermissions, isLoading } = useUsersServiceGetPermissions({id: user.id});
  const updatePermissions = useUsersServiceUpdatePermissions();

  const [permissions, setPermissions] = useState({
    canManageResources: false,
    canManageSystemConfiguration: false,
    canManageUsers: false,
  });

  // Update local state when permissions data is loaded
  useEffect(() => {
    if (userPermissions) {
      setPermissions({
        canManageResources: userPermissions.canManageResources || false,
        canManageSystemConfiguration:
          userPermissions.canManageSystemConfiguration || false,
        canManageUsers: userPermissions.canManageUsers || false,
      });
    }
  }, [userPermissions]);

  const handlePermissionChange = (permission: string) => (checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: checked,
    }));
  };

  const handleSave = async () => {
    try {
      await updatePermissions.mutateAsync({
        id: user.id,
        requestBody: permissions,
      });
      showToast({
        title: t('userPermissionsSaved'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      showToast({
        title: t('errorUpdatingPermissions'),
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading permissions...</div>
    );
  }

  return (
    <Card className="p-6 w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{t('managingUser')}</h3>
        <AttraccessUser user={user} />
      </div>

      <div className="border-t pt-4 my-4">
        <h3 className="text-lg font-semibold mb-4">{t('permissions')}</h3>

        <div className="space-y-4">
          <div className="flex items-center">
            <Checkbox
              isSelected={permissions.canManageResources}
              onValueChange={handlePermissionChange('canManageResources')}
              color="primary"
              className="mr-2"
            />
            <span>{t('canManageResources')}</span>
          </div>

          <div className="flex items-center">
            <Checkbox
              isSelected={permissions.canManageSystemConfiguration}
              onValueChange={handlePermissionChange(
                'canManageSystemConfiguration'
              )}
              color="primary"
              className="mr-2"
            />
            <span>{t('canManageSystemConfiguration')}</span>
          </div>

          <div className="flex items-center">
            <Checkbox
              isSelected={permissions.canManageUsers}
              onValueChange={handlePermissionChange('canManageUsers')}
              color="primary"
              className="mr-2"
            />
            <span>{t('canManageUsers')}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={updatePermissions.isPending}
        >
          {t('saveChanges')}
        </Button>
      </div>
    </Card>
  );
};
