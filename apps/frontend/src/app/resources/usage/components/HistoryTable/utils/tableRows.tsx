import React, { ReactElement } from 'react';
import { TableCell, Chip } from '@heroui/react';
import { ResourceUsage } from '@attraccess/api-client';
import { TFunction } from 'i18next';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DurationDisplay } from '@frontend/components/DurationDisplay';
import { MessageSquareText } from 'lucide-react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AttraccessUser } from '@frontend/components/AttraccessUser';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DateTimeDisplay } from '@frontend/components/DateTimeDisplay';

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
        <AttraccessUser user={session.user} />
      </TableCell>
    );
  }

  const hasNotes =
    ((session.startNotes || '') + (session.endNotes || '')).trim().length > 0;

  cells.push(
    <TableCell key={`start-${session.id}`}>
      <DateTimeDisplay date={session.startTime} />
    </TableCell>,
    <TableCell key={`end-${session.id}`}>
      <DateTimeDisplay date={session.endTime} />
    </TableCell>,
    <TableCell key={`duration-${session.id}`}>
      <DurationDisplay
        minutes={session.usageInMinutes >= 0 ? session.usageInMinutes : null}
        alternativeText={t('inProgress')}
      />
    </TableCell>,
    <TableCell key={`status-${session.id}`} className="flex items-center gap-2">
      {!session.endTime ? (
        <Chip color="primary" variant="flat">
          {t('active')}
        </Chip>
      ) : (
        <Chip color="success" variant="flat">
          {t('completed')}
        </Chip>
      )}
      {hasNotes && <MessageSquareText />}
    </TableCell>
  );

  return cells;
}
