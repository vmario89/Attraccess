import { AttraccessUser, UserSearch, useTranslations } from '@attraccess/plugins-frontend-ui';
import { User } from '@attraccess/react-query-client';
import {
  Button,
  ButtonProps,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableProps,
  TableRow,
} from '@heroui/react';

import de from './de.json';
import en from './en.json';
import { ReactNode, useCallback, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { EmptyState } from '../EmptyState';

interface Action<TUser> extends Omit<ButtonProps, 'onClick' | 'children' | 'key'> {
  label?: string;
  onClick: (user: TUser) => void;
}

export interface Column<TUser> {
  key: string;
  label: string;
  value: ReactNode | ((user: TUser) => ReactNode);
}

interface Props<TUser> {
  selectedUsers?: TUser[];
  selectedUserIsLoading?: boolean;
  onAddToSelection: (user: User) => void;
  addToSelectionIsLoading?: boolean;
  actions?: Action<TUser>[] | ((user: TUser) => Action<TUser>[]);
  tableProps?: TableProps;
  additionalColumns?: Column<TUser>[];
}

export function UserSelectionList<TUser extends User = User>(props: Readonly<Props<TUser>>) {
  const {
    selectedUsers,
    selectedUserIsLoading,
    onAddToSelection,
    addToSelectionIsLoading,
    actions,
    tableProps,
    additionalColumns,
  } = props;

  const { t } = useTranslations('userSelectionList', {
    de,
    en,
  });

  const [userSearchSelection, setUserSearchSelection] = useState<User | null>(null);

  const onAddUser = useCallback(() => {
    if (userSearchSelection) {
      onAddToSelection(userSearchSelection);
    }
  }, [userSearchSelection, onAddToSelection]);

  const parseActions = (user: TUser) => {
    if (!actions) {
      return [];
    }

    if (typeof actions === 'function') {
      return actions(user);
    }

    return actions;
  };

  return (
    <div className="flex flex-col gap-2">
      <UserSearch
        wrapperProps={{ className: 'w-full' }}
        onSelectionChange={setUserSearchSelection}
        autocompleteProps={{ size: 'sm' }}
        afterSelection={
          userSearchSelection && (
            <Button
              onPress={onAddUser}
              color="primary"
              isLoading={addToSelectionIsLoading}
              isIconOnly
              endContent={<PlusIcon className="w-4 h-4" />}
            />
          )
        }
      />

      <Table {...tableProps}>
        <TableHeader>
          <TableColumn>{t('selectedUsers.columns.user')}</TableColumn>
          {(additionalColumns ?? []).map((col) => <TableColumn key={col.key}>{col.label}</TableColumn>) as any}
          <TableColumn>{t('selectedUsers.columns.actions')}</TableColumn>
        </TableHeader>
        <TableBody items={selectedUsers ?? []} isLoading={selectedUserIsLoading} emptyContent={<EmptyState />}>
          {(user) => (
            <TableRow key={user.id}>
              <TableCell className="w-full">
                <AttraccessUser user={user} />
              </TableCell>

              {
                (additionalColumns ?? []).map((col) => (
                  <TableCell key={col.key}>{typeof col.value === 'function' ? col.value(user) : col.value}</TableCell>
                )) as any
              }

              <TableCell>
                <div className="flex gap-4 flex-row flex-wrap md:flex-nowrap">
                  {parseActions(user).map((action) => (
                    <Button
                      {...{ ...action, label: undefined, onClick: undefined }}
                      key={action.label}
                      onPress={() => action.onClick(user)}
                      className="flex"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
