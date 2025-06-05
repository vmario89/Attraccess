import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toolbar } from './toolbar';
import { Accordion, AccordionItem, Selection, Button } from '@heroui/react';
import { Settings2Icon } from 'lucide-react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './resourceList.en.json';
import * as de from './resourceList.de.json';
import {
  useResourcesServiceResourceGroupsGetMany,
  useResourcesServiceGetAllResources,
} from '@attraccess/react-query-client';
import { ResourcesInGroupList } from './list.resources-in-group';

export function ResourceList() {
  const [searchInput, setSearchInput] = useState('');

  const { t } = useTranslations('resourceList', {
    en,
    de,
  });
  const navigate = useNavigate();

  const handleSearch = useCallback((searchValue: string) => {
    setSearchInput(searchValue);
  }, []);

  const { data: groups } = useResourcesServiceResourceGroupsGetMany();

  const resourceWithoutGroup = useResourcesServiceGetAllResources({
    groupId: -1,
    limit: 1,
  });

  const [userSelectedGroups, setUserSelectedGroups] = useState<Set<number>>(new Set([]));

  const selectedKeys = useMemo(() => {
    if (searchInput) {
      return new Set([-1, ...(groups ?? []).map((group) => group.id)].map(String));
    }

    return userSelectedGroups;
  }, [groups, userSelectedGroups, searchInput]);

  const onAccordionSelectionChange = useCallback(
    (keys: Selection) => {
      if (keys === 'all') {
        setUserSelectedGroups(new Set((groups ?? []).map((group) => group.id)));
      } else {
        setUserSelectedGroups(keys as Set<number>);
      }
    },
    [groups]
  );

  const allGroupLists = useMemo(() => {
    const groupLists: Array<{ name: string; id: number }> = [];

    if (resourceWithoutGroup.data?.total ?? 0 >= 1) {
      groupLists.push({ name: t('ungrouped'), id: -1 });
    }

    (groups ?? []).forEach((group) => {
      groupLists.push({ name: group.name, id: group.id });
    });

    return groupLists;
  }, [groups, t, resourceWithoutGroup.data?.total]);

  return (
    <>
      <Toolbar onSearch={handleSearch} data-cy="resource-list-toolbar" />

      <Accordion
        selectedKeys={selectedKeys}
        onSelectionChange={onAccordionSelectionChange}
        selectionMode={searchInput ? 'multiple' : 'single'}
        data-cy="resource-group-accordion"
      >
        {allGroupLists.map((group) => (
          <AccordionItem
            key={group.id}
            aria-label={group.name}
            title={
              <div className="flex justify-between items-center w-full">
                <span>{group.name}</span>
                {group.id !== -1 && (
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => navigate(`/resource-groups/${group.id}/edit`)}
                    aria-label={`Edit group ${group.name}`}
                  >
                    <Settings2Icon className="w-5 h-5" />
                  </Button>
                )}
              </div>
            }
            data-cy={`resource-group-item-${group.id}`}
          >
            <ResourcesInGroupList
              groupId={group.id}
              search={searchInput}
              data-cy={`resources-in-group-list-${group.id}`}
            />
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
