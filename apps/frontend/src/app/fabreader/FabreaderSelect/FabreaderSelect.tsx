import { useFabReaderServiceGetReaders } from '@fabaccess/react-query-client';
import { Select, SelectItem } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';

interface Props {
  selection: number | null | undefined;
  onSelectionChange: (selection: number) => void;
  label?: string;
  placeholder?: string;
}

export function FabreaderSelect(props: Props) {
  const { data: readers } = useFabReaderServiceGetReaders();

  const selectionToSet = useCallback((selection: Props['selection']) => {
    return new Set(selection ? [selection] : []);
  }, []);

  const [value, setValue] = useState(selectionToSet(props.selection));

  useEffect(() => {
    setValue(selectionToSet(props.selection));
  }, [props, selectionToSet]);

  useEffect(() => {
    props.onSelectionChange(value.values().next().value as number);
    // eslint-disable-next-line
  }, [value]);

  return (
    <Select
      items={readers ?? []}
      label={props.label}
      placeholder={readers?.find((r) => r.id === props.selection)?.name ?? props.placeholder}
      selectedKeys={value}
      onSelectionChange={(keys) => setValue(keys as Set<number>)}
      data-cy="fabreader-select"
    >
      {(reader) => (
        <SelectItem
          aria-disabled={!reader.connected}
          aria-label={reader.name}
          key={reader.id}
          data-cy={`fabreader-select-item-${reader.id}`}
        >
          {reader.name} ({reader.id})
        </SelectItem>
      )}
    </Select>
  );
}
