import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEnrollNfcCard, useReaders } from '../../queries/reader.queries';
import { Accordion, AccordionItem, Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { useStore } from '../../store/store';
import { Cloud, CloudOff } from 'lucide-react';
import { useDateTimeFormatter, useTranslations } from '@attraccess/plugins-frontend-ui';
import { FabreaderEditor } from '../FabreaderEditor/FabreaderEditor';
import de from './FabreaderList.de.json';
import en from './FabreaderList.en.json';
import { NfcCardList } from '../NfcCardList/NfcCardList';

export const FabreaderList = () => {
  const { t } = useTranslations('fabreader-list', {
    de,
    en,
  });

  const { data: readers, error: readersError } = useReaders({
    refetchInterval: 5000,
  });
  const { pluginStore, auth } = useStore();
  const { mutate: enrollNfcCardMutation, error: enrollNfcCardError } = useEnrollNfcCard();

  const [openedReaderEditor, setOpenedReaderEditor] = useState<number | null>(null);

  const enrollNfcCard = useCallback(
    (readerId: number) => {
      enrollNfcCardMutation({ readerId });
      pluginStore.executeFunction('notificationToast', {
        title: t('nfcCardEnrollmentStarted'),
        description: t('nfcCardEnrollmentStartedDescription'),
        type: 'success',
      });
    },
    [enrollNfcCardMutation, pluginStore, t]
  );

  useEffect(() => {
    if (enrollNfcCardError) {
      pluginStore.executeFunction('notificationToast', {
        title: t('errorEnrollNfcCard'),
        description: enrollNfcCardError.message,
        type: 'error',
      });
    }
  }, [enrollNfcCardError, pluginStore, t]);

  useEffect(() => {
    if (readersError) {
      pluginStore.executeFunction('notificationToast', {
        title: t('errorFetchReaders'),
        description: readersError.message,
        type: 'error',
      });
    }
  }, [readersError, pluginStore, t]);

  const userCanManage = useMemo(() => {
    return !!auth?.user?.systemPermissions.canManageSystemConfiguration;
  }, [auth]);

  const formatDateTime = useDateTimeFormatter();

  return (
    <div className="flex flex-col gap-4">
      <NfcCardList />
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
                  <Button isDisabled={!reader.connected} onPress={() => enrollNfcCard(reader.id)}>
                    {t('enrollNewNfcCard')}
                  </Button>

                  {userCanManage ? (
                    <Button onPress={() => setOpenedReaderEditor(reader.id)}>{t('editReader')}</Button>
                  ) : null}
                </div>

                {userCanManage ? (
                  <FabreaderEditor
                    reader={reader}
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
    </div>
  );
};
