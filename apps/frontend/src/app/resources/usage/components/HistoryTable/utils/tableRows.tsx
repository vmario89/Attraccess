import React, { ReactElement } from 'react';
import { TableCell, Chip, User as UserDisplay } from '@heroui/react';
import { ResourceUsage } from '@attraccess/api-client';
import { TFunction } from 'i18next';
import { DurationDisplay } from '../../../../../../components/DurationDisplay';

/**
 * Generates table row cells based on session data and user permissions
 */
export function generateRowCells(
  session: ResourceUsage,
  t: TFunction,
  showAllUsers: boolean,
  canManageResources: boolean
): ReactElement[] {
  const cells: ReactElement[] = [];

  // Only show user cell if we're showing all users (requires canManageResources)
  if (canManageResources && showAllUsers) {
    cells.push(
      <TableCell key={`user-${session.id}`}>
        <UserDisplay
          name={session.user?.username || t('unknownUser')}
          description={`ID: ${session.user?.username}`}
          avatarProps={{
            name: session.user?.username?.charAt(0) || '?',
            color: 'primary',
          }}
        />
      </TableCell>
    );
  }

  cells.push(
    <TableCell key={`start-${session.id}`}>
      {new Date(session.startTime).toLocaleString()}
    </TableCell>,
    <TableCell key={`end-${session.id}`}>
      {session.endTime ? new Date(session.endTime).toLocaleString() : '—'}
    </TableCell>,
    <TableCell key={`duration-${session.id}`}>
      <DurationDisplay
        minutes={session.usageInMinutes >= 0 ? session.usageInMinutes : null}
        alternativeText={t('inProgress')}
      />
    </TableCell>,
    <TableCell key={`status-${session.id}`}>
      {!session.endTime ? (
        <Chip color="primary" variant="flat">
          {t('active')}
        </Chip>
      ) : (
        <Chip color="success" variant="flat">
          {t('completed')}
        </Chip>
      )}
    </TableCell>
  );

  return cells;
}
