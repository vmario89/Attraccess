import { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionItem, Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { Cloud, CloudOff } from 'lucide-react';
import { useDateTimeFormatter, useTranslations } from '@attraccess/plugins-frontend-ui';
import { FabreaderEditor } from '../FabreaderEditor/FabreaderEditor';
import de from './FabreaderList.de.json';
import en from './FabreaderList.en.json';
import { useFabReaderReadersServiceGetReaders } from '@attraccess/react-query-client';
import { useToastMessage } from '../../../components/toastProvider';
import { useAuth } from '../../../hooks/useAuth';

export const FabreaderList = () => {
  const { t } = useTranslations('fabreader-list', {
    de,
    en,
  });

  const { data: readers, error: readersError } = useFabReaderReadersServiceGetReaders(undefined, {
    refetchInterval: 5000,
  });

  const { user } = useAuth();

  const toast = useToastMessage();

  const [openedReaderEditor, setOpenedReaderEditor] = useState<number | null>(null);

  useEffect(() => {
    if (readersError) {
      toast.error({
        title: t('errorFetchReaders'),
        description: (readersError as Error).message,
      });
    }
  }, [readersError, t, toast]);

  const userCanManage = useMemo(() => {
    return !!user?.systemPermissions.canManageSystemConfiguration;
  }, [user]);

  const formatDateTime = useDateTimeFormatter();

  return (
    <Card>
      <CardHeader>
        <h1>{t('fabreaders')}</h1>
      </CardHeader>
      <CardBody>
        <Accordion>
          {(readers ?? []).map((reader) => (
            <AccordionItem
              key={reader.id}
              aria-label={reader.name}
              subtitle={t('lastConnection', { timestamp: formatDateTime(reader.lastConnection) })}
              title={reader.name}
              startContent={
                <Chip color={reader.connected ? 'success' : 'danger'}>
                  {reader.connected ? <Cloud /> : <CloudOff />}
                </Chip>
              }
            >
              <div className="flex gap-2">
                {userCanManage ? (
                  <Button onPress={() => setOpenedReaderEditor(reader.id)}>{t('editReader')}</Button>
                ) : null}
              </div>

              {userCanManage ? (
                <FabreaderEditor
                  readerId={reader.id}
                  isOpen={openedReaderEditor === reader.id}
                  onCancel={() => setOpenedReaderEditor(null)}
                  onSave={() => setOpenedReaderEditor(null)}
                />
              ) : null}
            </AccordionItem>
          ))}
        </Accordion>
      </CardBody>
    </Card>
  );
};
