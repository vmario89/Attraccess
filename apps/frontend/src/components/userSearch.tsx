import { useState } from 'react';
import { User } from '@attraccess/api-client';
import { Search } from 'lucide-react';
import { Autocomplete, AutocompleteItem } from '@heroui/autocomplete';
import { User as UserComponent } from '@heroui/user';
import { useSearchUsers } from '../api/hooks/users';
import { useTranslations } from '../i18n';

// Import translations
import * as en from './translations/userSearch.en';
import * as de from './translations/userSearch.de';

export type UserSearchProps = {
  /**
   * Custom label for the autocomplete input (overrides default translation)
   */
  label?: string;
  /**
   * Custom placeholder for the autocomplete input (overrides default translation)
   */
  placeholder?: string;
  /**
   * Whether to allow custom values (typing a username or email without selecting from dropdown)
   */
  allowsCustomValue?: boolean;
  /**
   * Whether the component is in a loading state (in addition to search loading)
   */
  isLoading?: boolean;
  /**
   * Callback when selection changes
   * @param userId - Selected user ID or null if selection is cleared
   * @param username - Selected username or null if selection is cleared
   */
  onSelectionChange?: (userId: number | null) => void;
  /**
   * Callback when input value changes
   * @param value - Current input value
   */
  onInputChange?: (value: string) => void;
  /**
   * Exclude users with these IDs from the results
   */
  excludeUserIds?: number[];
  /**
   * Initial input value
   */
  inputValue?: string;
};

export const UserSearch = ({
  label,
  placeholder,
  allowsCustomValue = false,
  onSelectionChange,
  onInputChange,
}: UserSearchProps) => {
  // Initialize translations
  const { t } = useTranslations('userSearch', {
    en,
    de,
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Get users based on search term with pagination
  const { data: users, isLoading: isLoadingUsers } = useSearchUsers(
    searchTerm,
    1,
    10
  );

  const handleSelectionChange = (key: React.Key | null) => {
    if (!onSelectionChange) {
      return;
    }

    if (key === null) {
      onSelectionChange(null);
      return;
    }

    const userId = Number(key);
    const selectedUser = users?.data.find((user) => user.id === userId);
    if (selectedUser) {
      onSelectionChange(userId);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    onInputChange?.(value);
  };

  return (
    <Autocomplete
      label={label || t('label')}
      placeholder={placeholder || t('placeholder')}
      isLoading={isLoadingUsers}
      onInputChange={handleInputChange}
      onSelectionChange={handleSelectionChange}
      menuTrigger="input"
      startContent={<Search className="w-4 h-4 text-gray-400" />}
      items={users?.data ?? []}
      listboxProps={{
        emptyContent: t('noUsersFound'),
      }}
    >
      {(user: User) => (
        <AutocompleteItem key={user.id} textValue={user.username}>
          <UserComponent name={user.username} />
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
