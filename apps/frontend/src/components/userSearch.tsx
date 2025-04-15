import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import { useTranslations } from '../i18n';

// Import translations
import * as en from './translations/userSearch.en';
import * as de from './translations/userSearch.de';
import { AttraccessUser } from './AttraccessUser';
import { useUsersServiceGetAllUsers, useUsersServiceGetOneUserById } from '@attraccess/react-query-client';

interface UserSearchProps {
  label?: string;
  placeholder?: string;
  onSelectionChange?: (userId: number | null) => void;
}

export function UserSearch(props: UserSearchProps) {
  const { label, placeholder, onSelectionChange } = props;

  const { t } = useTranslations('userSearch', {
    en,
    de,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selectedUserId = useMemo(
    () => (selectedKey ? Number(selectedKey) : null),
    [selectedKey]
  );

  const searchUsers = useUsersServiceGetAllUsers({search: searchTerm, limit: 10, page: 1});

  const users = useMemo(() => {
    return searchUsers.data?.data ?? [];
  }, [searchUsers.data]);

  const selectedUserDetails = useUsersServiceGetOneUserById({id: selectedUserId as number}, undefined, {enabled: !!selectedUserId});

  const selectedUser = useMemo(() => {
    if (!selectedUserId) {
      return null;
    }

    if (selectedUserDetails.data?.id === selectedUserId) {
      return selectedUserDetails.data;
    }

    const userFromSearch = users.find((user) => user.id === selectedUserId);
    if (userFromSearch) {
      return userFromSearch;
    }

    return null;
  }, [selectedUserId, selectedUserDetails.data, users]);

  useEffect(() => {
    if (typeof onSelectionChange !== 'function') {
      return;
    }

    onSelectionChange(selectedUserId);
  }, [selectedUserId, onSelectionChange]);

  return (
    <>
      <Autocomplete
        inputValue={searchTerm}
        isLoading={searchUsers.isLoading}
        items={users}
        label={label ?? t('label')}
        placeholder={placeholder ?? t('placeholder')}
        onInputChange={setSearchTerm}
        selectedKey={selectedKey}
        onSelectionChange={(key) => setSelectedKey(key as string | null)}
        isClearable
        onClear={() => {
          setSelectedKey(null);
          setSearchTerm('');
        }}
      >
        {(item) => (
          <AutocompleteItem key={item.id}>
            <AttraccessUser user={item} />
          </AutocompleteItem>
        )}
      </Autocomplete>

      {selectedUser && (
        <AttraccessUser user={selectedUser} className="my-2 mx-2" />
      )}
    </>
  );
}
