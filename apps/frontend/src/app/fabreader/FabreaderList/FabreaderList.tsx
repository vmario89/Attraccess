import { useEffect, useState } from 'react';
import { Alert, Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { Cloud, CloudOff, CpuIcon } from 'lucide-react';
import { useDateTimeFormatter, useTranslations } from '@attraccess/plugins-frontend-ui';
import { FabreaderEditor } from '../FabreaderEditor/FabreaderEditor';
import de from './FabreaderList.de.json';
import en from './FabreaderList.en.json';
import { useFabReaderReadersServiceGetReaders } from '@attraccess/react-query-client';
import { useToastMessage } from '../../../components/toastProvider';
import { PageHeader } from '../../../components/pageHeader';
import { FabreaderFlashButton } from '../FabreaderFlashButton/FabreaderFlashButton';

export const FabreaderList = () => {
  const { t } = useTranslations('fabreader-list', {
    de,
    en,
  });

  const {
    data: readers,
    error: readersError,
    isLoading,
  } = useFabReaderReadersServiceGetReaders(undefined, {
    refetchInterval: 5000,
  });

  const toast = useToastMessage();

  const [openedReaderEditor, setOpenedReaderEditor] = useState<number | null>(null);

  useEffect(() => {
    if (readersError) {
      toast.error({
        title: t('error.fetchReaders'),
        description: (readersError as Error).message,
      });
    }
  }, [readersError, t, toast]);

  const formatDateTime = useDateTimeFormatter();

  return (
    <>
      <PageHeader
        title={t('page.title')}
        actions={
          <FabreaderFlashButton variant="light" startContent={<CpuIcon className="w-4 h-4" />}>
            {t('page.actions.openFlasher')}
          </FabreaderFlashButton>
        }
      />

      <Alert color="danger" className="mb-4">
        {t('workInProgress')}
      </Alert>

      <Table aria-label="Fabreaders">
        <TableHeader>
          <TableColumn>{t('table.columns.name')}</TableColumn>
          <TableColumn>{t('table.columns.lastConnection')}</TableColumn>
          <TableColumn>{t('table.columns.connected')}</TableColumn>
          <TableColumn>{t('table.columns.actions')}</TableColumn>
        </TableHeader>
        <TableBody items={readers ?? []} isLoading={isLoading} emptyContent={t('table.noData')}>
          {(reader) => (
            <TableRow key={reader.id}>
              <TableCell>{reader.name}</TableCell>
              <TableCell>{formatDateTime(reader.lastConnection)}</TableCell>
              <TableCell>
                <Chip color={reader.connected ? 'success' : 'danger'}>
                  {reader.connected ? <Cloud /> : <CloudOff />}
                </Chip>
              </TableCell>
              <TableCell>
                <FabreaderEditor
                  readerId={reader.id}
                  isOpen={openedReaderEditor === reader.id}
                  onCancel={() => setOpenedReaderEditor(null)}
                  onSave={() => setOpenedReaderEditor(null)}
                />

                <Button onPress={() => setOpenedReaderEditor(reader.id)}>{t('table.actions.editReader')}</Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
