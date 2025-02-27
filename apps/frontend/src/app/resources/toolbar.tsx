import { Search, Plus, Filter } from 'lucide-react';
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
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div className="relative flex-1 max-w-md">
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search resources..."
          className={searchIsLoading ? 'animate-pulse' : ''}
          startContent={<Search />}
        />
      </div>
      <div className="flex items-center space-x-4">
        {canManageResources && (
          <ResourceCreateModal>
            {(onOpen) => (
              <Button onPress={onOpen} startContent={<Plus />} color="primary">
                Add Resource
              </Button>
            )}
          </ResourceCreateModal>
        )}
        <button
          className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Filter resources"
        >
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
