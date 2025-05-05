import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Search, Plus } from 'lucide-react';
import { ResourceCreateModal } from './resourceCreateModal';
import { ResourceGroupUpsertModal } from './resourceGroupUpsertModal';
import { useAuth } from '../../hooks/useAuth';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './translations/toolbar.en';
import * as de from './translations/toolbar.de';

interface ToolbarProps {
  onSearch: (value: string) => void;
  searchIsLoading?: boolean;
}

export function Toolbar({ onSearch, searchIsLoading }: ToolbarProps) {
  const { hasPermission } = useAuth();
  const canManageResources = hasPermission('canManageResources');
  const [searchValue, setSearchValue] = useState('');

  const { t } = useTranslations('toolbar', {
    en,
    de,
  });

  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue, onSearch]);

  return (
    <div className="mb-6 flex flex-row w-full items-center justify-between gap-4 rounded-full bg-white p-2 shadow-sm dark:bg-zinc-800">
      <div className="relative flex-grow">
        <Input
          radius="full"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className={` ${searchIsLoading ? 'animate-pulse' : ''}`}
          startContent={<Search size={18} />}
          classNames={{
            inputWrapper: 'bg-transparent border-none shadow-none focus-within:ring-0 pl-2',
            input: 'text-sm',
          }}
        />
      </div>
      {canManageResources && (
        <div className="flex items-center gap-2 mr-1">
          <ResourceGroupUpsertModal>
            {(onOpen: () => void) => (
              <Button radius="full" onPress={onOpen} startContent={<Plus size={18} />} color="secondary" size="sm">
                {t('addGroup')}
              </Button>
            )}
          </ResourceGroupUpsertModal>
          <ResourceCreateModal>
            {(onOpen: () => void) => (
              <Button radius="full" onPress={onOpen} startContent={<Plus size={18} />} color="primary" size="sm">
                {t('addResource')}
              </Button>
            )}
          </ResourceCreateModal>
        </div>
      )}
    </div>
  );
}
