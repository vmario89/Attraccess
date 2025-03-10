import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Search, Plus } from 'lucide-react';
import { ResourceCreateModal } from './resourceCreateModal';
import { useAuth } from '../../hooks/useAuth';
import { useTranslations } from '../../i18n';
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
    <div className="mb-6 flex flex-col w-full gap-2">
      <div className="relative w-full">
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className={`w-full ${searchIsLoading ? 'animate-pulse' : ''}`}
          startContent={<Search />}
        />
      </div>
      {canManageResources && (
        <div className="flex justify-end">
          <ResourceCreateModal>
            {(onOpen) => (
              <Button onPress={onOpen} startContent={<Plus />} color="primary">
                {t('addResource')}
              </Button>
            )}
          </ResourceCreateModal>
        </div>
      )}
    </div>
  );
}
