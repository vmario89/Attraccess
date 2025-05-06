import {
  TableHeader,
  Table,
  TableBody,
  TableColumn,
  TableCell,
  TableRow,
  Alert,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
} from '@heroui/react';
import { Card } from '@heroui/react';
import { Cloud } from 'lucide-react';
import { useStore } from '../../store/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NFCCard, useCards } from '../../queries/cards.queries';
import { renderToString } from 'react-dom/server';
import { AttraccessUser, useTranslations } from '@attraccess/plugins-frontend-ui';
import { useUsersServiceGetOneUserById } from '@attraccess/react-query-client';
import de from './NfcCardList.de.json';
import en from './NfcCardList.en.json';
import { useResetNfcCard } from '../../queries/reader.queries';
import { FabreaderSelect } from '../FabreaderSelect/FabreaderSelect';

interface DeleteModalProps {
  show: boolean;
  close: () => void;
  cardId: number | null;
}

const NfcCardDeleteModal = (props: DeleteModalProps) => {
  const { t } = useTranslations('fabreader-delete-card-modal', {
    de,
    en,
  });

  const [readerId, setReaderId] = useState<number | null>(null);

  const { mutate: resetNfcCard } = useResetNfcCard();

  const deleteCard = useCallback(() => {
    if (!props.cardId || !readerId) {
      return;
    }

    resetNfcCard({ readerId, cardId: props.cardId });
  }, [props.cardId, resetNfcCard, readerId]);

  return (
    <Modal isOpen={props.show} onClose={() => props.close()} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <h1>{t('nfcCardsTable.deleteModal.title')}</h1>
        </ModalHeader>
        <ModalBody>
          <p>{t('nfcCardsTable.deleteModal.description', { id: props.cardId })}</p>
          <FabreaderSelect
            label={t('nfcCardsTable.deleteModal.readerLabel')}
            placeholder={t('nfcCardsTable.deleteModal.readerPlaceholder')}
            selection={readerId}
            onSelectionChange={(readerId) => setReaderId(readerId ?? null)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onPress={() => props.close()}>{t('nfcCardsTable.deleteModal.cancel')}</Button>
          <Button isDisabled={!readerId} onPress={deleteCard}>
            {t('nfcCardsTable.deleteModal.delete')} ID: {!readerId ? 'null' : readerId}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface NfcCardTableCellProps {
  header: string;
  card: NFCCard;
  onDeleteClick: () => void;
}

const NfcCardTableCell = (props: NfcCardTableCellProps) => {
  const { t } = useTranslations('nfccard-list-table-cell', {
    de,
    en,
  });

  const { data: user } = useUsersServiceGetOneUserById({ id: props.card.userId }, undefined, {
    enabled: props.header === 'userId',
  });

  if (props.header === 'userId') {
    return <AttraccessUser user={user} />;
  }

  if (props.header === 'actions') {
    return (
      <div>
        <Button onPress={() => props.onDeleteClick()}>{t('nfcCardsTable.actions.delete')}</Button>
      </div>
    );
  }

  return props.card[props.header as keyof NFCCard];
};

export function NfcCardList() {
  const { t } = useTranslations('nfccard-list', {
    de,
    en,
  });
  const { pluginStore, auth } = useStore();

  const { data: cards, error: cardsError } = useCards({
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (cardsError) {
      pluginStore.executeFunction('notificationToast', {
        title: t('errorFetchCards'),
        description: cardsError.message,
        type: 'error',
      });
    }
  }, [cardsError, pluginStore, t]);

  const userCanManage = useMemo(() => {
    return !!auth?.user?.systemPermissions.canManageSystemConfiguration;
  }, [auth]);

  const headers = useMemo(() => {
    const headers: Array<keyof NFCCard | 'actions'> = ['id', 'uid'];
    if (userCanManage) {
      headers.push('userId');
    }

    headers.push('createdAt', 'actions');

    return headers;
  }, [userCanManage]);

  const [cardToDeleteId, setCardToDeleteId] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <h1>{t('nfcCards')}</h1>
      </CardHeader>
      <CardBody>
        <Alert variant="faded" color="secondary" className="my-4">
          <div
            dangerouslySetInnerHTML={{
              __html: t('enrollInstructions', {
                cloud: renderToString(<Cloud style={{ display: 'inline' }} />),
              }),
            }}
          />
        </Alert>

        <NfcCardDeleteModal
          show={cardToDeleteId !== null}
          close={() => setCardToDeleteId(null)}
          cardId={cardToDeleteId}
        />

        <Table aria-label={t('nfcCards')} removeWrapper>
          <TableHeader>
            {headers.map((header) => (
              <TableColumn key={header}>{t('nfcCardsTable.headers.' + header)}</TableColumn>
            ))}
          </TableHeader>
          <TableBody emptyContent={t('noNfcCardsFound')}>
            {(cards ?? []).map((card) => (
              <TableRow key={card.id}>
                {headers.map((header) => (
                  <TableCell key={header}>
                    <NfcCardTableCell header={header} card={card} onDeleteClick={() => setCardToDeleteId(card.id)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
