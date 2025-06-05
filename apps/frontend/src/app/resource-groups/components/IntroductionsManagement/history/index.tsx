import { DateTimeDisplay } from '@attraccess/plugins-frontend-ui';
import { useAccessControlServiceResourceGroupIntroductionsGetHistory } from '@attraccess/react-query-client';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { IntroductionStatusChip } from '../../../../../components/IntroductionStatusChip';
import { useMemo, useState } from 'react';

interface Props {
  groupId: number;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}
export function ResourceGroupIntroductionHistoryModal(props: Readonly<Props>) {
  const { groupId, userId, isOpen, onClose } = props;

  const { data: history, isLoading } = useAccessControlServiceResourceGroupIntroductionsGetHistory(
    {
      groupId,
      userId,
    },
    undefined,
    { enabled: isOpen && !!userId }
  );

  const orderedHistory = useMemo(() => {
    return [...(history ?? [])].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // descending order (newest first)
    });
  }, [history]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil(orderedHistory.length / rowsPerPage) || 1;
  }, [rowsPerPage, orderedHistory]);

  const currentPage = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return orderedHistory.slice(start, end);
  }, [orderedHistory, page, rowsPerPage]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Resource Group Introduction History</ModalHeader>
        <ModalBody>
          <Table
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination isCompact showControls page={page} total={totalPages} onChange={(page) => setPage(page)} />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>Date</TableColumn>
              <TableColumn>Action</TableColumn>
              <TableColumn>Comment</TableColumn>
            </TableHeader>
            <TableBody items={currentPage} isLoading={isLoading}>
              {(item) => (
                <TableRow>
                  <TableCell>
                    <DateTimeDisplay date={item.createdAt} />
                  </TableCell>
                  <TableCell>
                    <IntroductionStatusChip isValid={item.action === 'grant'} />
                  </TableCell>
                  <TableCell>
                    <blockquote className="text-sm whitespace-pre-wrap">{item.comment}</blockquote>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
