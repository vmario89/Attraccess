import { Search, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ResourceCreateModal } from './resourceCreateModal';
import { Button, Input } from '@heroui/react';
import { useEffect, useState } from 'react';

interface ToolbarProps {
  onSearch: (value: string) => void;
  searchIsLoading?: boolean;
}

export function Toolbar({ onSearch, searchIsLoading }: ToolbarProps) {
  const { hasPermission } = useAuth();
  const canManageResources = hasPermission('canManageResources');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue, onSearch]);

  return (
    <div className="mb-6 flex flex-col w-full gap-2">
      <div className="relative w-full">
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search resources..."
          className={`w-full ${searchIsLoading ? 'animate-pulse' : ''}`}
          startContent={<Search />}
        />
      </div>
      {canManageResources && (
        <div className="flex justify-end">
          <ResourceCreateModal>
            {(onOpen) => (
              <Button onPress={onOpen} startContent={<Plus />} color="primary">
                Add Resource
              </Button>
            )}
          </ResourceCreateModal>
        </div>
      )}
    </div>
  );
}
