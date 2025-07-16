import {
  TableHeader,
  Table,
  TableBody,
  TableColumn,
  TableCell,
  TableRow,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Alert,
  Card,
} from '@heroui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FabAccessUser, useTranslations } from '@fabaccess/plugins-frontend-ui';
import {
  useFabReaderServiceGetAllCards,
  useFabReaderServiceResetNfcCard,
  NFCCard,
  useFabReaderServiceEnrollNfcCard,
  useUsersServiceGetOneUserById,
} from '@fabaccess/react-query-client';
import { FabreaderSelect } from '../FabreaderSelect/FabreaderSelect';
import { useToastMessage } from '../../../components/toastProvider';
import { useAuth } from '../../../hooks/useAuth';
import { TableDataLoadingIndicator } from '../../../components/tableComponents';
import { EmptyState } from '../../../components/emptyState';
import { useReactQueryStatusToHeroUiTableLoadingState } from '../../../hooks/useReactQueryStatusToHeroUiTableLoadingState';

import de from './NfcCardList.de.json';
import en from './NfcCardList.en.json';

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

  const { mutate: resetNfcCard } = useFabReaderServiceResetNfcCard();

  const deleteCard = useCallback(() => {
    if (!props.cardId || !readerId) {
      return;
    }

    resetNfcCard({ requestBody: { readerId, cardId: props.cardId } });
  }, [props.cardId, resetNfcCard, readerId]);

  return (
    <Modal isOpen={props.show} onClose={() => props.close()} scrollBehavior="inside" data-cy="nfc-card-delete-modal">
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
            data-cy="nfc-card-delete-modal-reader-select"
          />
        </ModalBody>
        <ModalFooter>
          <Button onPress={() => props.close()} data-cy="nfc-card-delete-modal-cancel-button">
            {t('nfcCardsTable.deleteModal.cancel')}
          </Button>
          <Button isDisabled={!readerId} onPress={deleteCard} data-cy="nfc-card-delete-modal-delete-button">
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
    return <FabAccessUser user={user} />;
  }

  if (props.header === 'actions') {
    return (
      <div>
        <Button onPress={() => props.onDeleteClick()} data-cy={`nfc-card-table-cell-delete-button-${props.card.id}`}>
          {t('nfcCardsTable.actions.delete')}
        </Button>
      </div>
    );
  }

  if (props.header === 'uid') {
    return props.card.uid;
  }

  if (props.header === 'id') {
    return props.card.id;
  }

  if (props.header === 'createdAt') {
    return new Date(props.card.createdAt).toLocaleDateString();
  }

  return props.card[props.header as keyof NFCCard] as React.ReactNode;
};

const EnrollNfcCardButton = () => {
  const { t } = useTranslations('fabreader-enroll-nfc-card-button', {
    de,
    en,
  });

  const [show, setShow] = useState(false);
  const [readerId, setReaderId] = useState<number | null>(null);

  const { mutate: enrollNfcCardMutation } = useFabReaderServiceEnrollNfcCard();

  const enrollNfcCard = useCallback(() => {
    if (!readerId) {
      return;
    }

    enrollNfcCardMutation({ requestBody: { readerId } });
  }, [readerId, enrollNfcCardMutation]);

  return (
    <>
      <Button color="primary" onPress={() => setShow(true)} data-cy="enroll-nfc-card-button-trigger">
        {t('enroll')}
      </Button>
      <Modal isOpen={show} onClose={() => setShow(false)} scrollBehavior="inside" data-cy="enroll-nfc-card-modal">
        <ModalContent>
          <ModalHeader>
            <h1>{t('enrollModal.title')}</h1>
          </ModalHeader>
          <ModalBody>
            <p>{t('enrollModal.description')}</p>
            <FabreaderSelect
              label={t('enrollModal.readerLabel')}
              placeholder={t('enrollModal.readerPlaceholder')}
              selection={readerId}
              onSelectionChange={(readerId) => setReaderId(readerId ?? null)}
              data-cy="enroll-nfc-card-modal-reader-select"
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setShow(false)} data-cy="enroll-nfc-card-modal-cancel-button">
              {t('enrollModal.cancel')}
            </Button>
            <Button isDisabled={!readerId} onPress={enrollNfcCard} data-cy="enroll-nfc-card-modal-enroll-button">
              {t('enrollModal.enroll')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export function NfcCardList() {
  const { t } = useTranslations('nfccard-list', {
    de,
    en,
  });

  const {
    data: cards,
    error: cardsError,
    status: fetchStatus,
  } = useFabReaderServiceGetAllCards(undefined, {
    refetchInterval: 5000,
  });

  const loadingState = useReactQueryStatusToHeroUiTableLoadingState(fetchStatus);

  const toast = useToastMessage();

  const { user } = useAuth();

  useEffect(() => {
    if (cardsError) {
      toast.error({
        title: t('errorFetchCards'),
        description: (cardsError as Error).message,
      });
    }
  }, [cardsError, toast, t]);

  const userCanManage = useMemo(() => {
    return !!user?.systemPermissions.canManageSystemConfiguration;
  }, [user]);

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
    <>
      <Alert color="danger" className="mb-4">
        {t('workInProgress')}
      </Alert>
      <Card data-cy="nfc-card-list-card">
        <CardHeader className="flex justify-between items-center">
          <h1>{t('nfcCards')}</h1>
          <EnrollNfcCardButton />
        </CardHeader>
        <CardBody>
          <NfcCardDeleteModal
            show={cardToDeleteId !== null}
            close={() => setCardToDeleteId(null)}
            cardId={cardToDeleteId}
          />

          <Table aria-label={t('nfcCards')} removeWrapper data-cy="nfc-card-list-table">
            <TableHeader>
              {headers.map((header) => (
                <TableColumn key={header}>{t('nfcCardsTable.headers.' + header)}</TableColumn>
              ))}
            </TableHeader>
            <TableBody
              items={cards ?? []}
              loadingState={loadingState}
              loadingContent={<TableDataLoadingIndicator />}
              emptyContent={<EmptyState />}
            >
              {(card) => (
                <TableRow key={card.id}>
                  {headers.map((header) => (
                    <TableCell key={header}>
                      <NfcCardTableCell header={header} card={card} onDeleteClick={() => setCardToDeleteId(card.id)} />
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}
