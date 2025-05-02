import React from 'react';
import { useReaders } from '../queries/reader.queries';
import { Accordion, AccordionItem } from '@heroui/react';

export const FabreaderList = () => {
  const { data: readers } = useReaders();

  return (
    <div>
      <Accordion>
        {(readers ?? []).map((reader) => (
          <AccordionItem key="1" aria-label="Accordion 1" subtitle="Press to expand" title="Accordion 1">
            {reader.name}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
