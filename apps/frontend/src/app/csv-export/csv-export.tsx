import { useDateTimeFormatter, useTranslations } from '@fabaccess/plugins-frontend-ui';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DateValue,
  Modal,
  ModalContent,
  ModalHeader,
  RangeCalendar,
  RangeValue,
} from '@heroui/react';
import de from './de.json';
import en from './en.json';
import { useCallback, useMemo, useState } from 'react';
import { getLocalTimeZone } from '@internationalized/date';
import { ResourceUsageExport } from './resource-usage/resourceUsageExport';

export function CsvExport() {
  const { t } = useTranslations('csv-export', {
    de,
    en,
  });

  const [dateRange, setDateRange] = useState<RangeValue<DateValue>>();
  const [activeExport, setActiveExport] = useState<string>('');
  const [showExport, setShowExport] = useState(false);

  const formatDateTime = useDateTimeFormatter({ showTime: false });

  const openExport = useCallback((exportName: string) => {
    setActiveExport(exportName);
    setShowExport(true);
  }, []);

  const dateRangeStartFormatted = useMemo(
    () => formatDateTime(dateRange?.start?.toDate(getLocalTimeZone())),
    [formatDateTime, dateRange]
  );

  const dateRangeEndFormatted = useMemo(
    () => formatDateTime(dateRange?.end?.toDate(getLocalTimeZone())),
    [formatDateTime, dateRange]
  );

  return (
    <>
      <Card>
        <CardHeader>{t('title')}</CardHeader>
        <CardBody>
          <span className="font-bold">{t('rangeCalendar.selection.label')}</span>
          <div className="flex gap-4 flex-row flex-wrap">
            <RangeCalendar
              onChange={(value) => setDateRange(value)}
              id="date-range"
              showMonthAndYearPickers
              aria-label={t('rangeCalendar.label')}
              data-cy="csv-export-range-calendar"
            />
            <p>
              <br />
              {t('rangeCalendar.selection.start', {
                date: dateRangeStartFormatted,
              })}
              <br />
              {t('rangeCalendar.selection.end', { date: dateRangeEndFormatted })}
            </p>
          </div>
        </CardBody>
        <CardFooter>
          <Button
            isDisabled={!dateRange}
            onPress={() => {
              openExport('resourceUsageHours');
            }}
            data-cy="csv-export-resource-usage-hours-button"
          >
            {t('exports.resourceUsageHours.button')}
          </Button>
        </CardFooter>
      </Card>

      <Modal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        scrollBehavior="inside"
        size="5xl"
        data-cy="csv-export-modal"
      >
        <ModalContent>
          <ModalHeader>
            <div>
              {t(`exports.${activeExport}.title`)}
              <br />
              <small>
                {t(t('exports.modal.subtitle', { start: dateRangeStartFormatted, end: dateRangeEndFormatted }))}
              </small>
            </div>
          </ModalHeader>

          {activeExport === 'resourceUsageHours' && (
            <ResourceUsageExport
              start={dateRange?.start?.toDate(getLocalTimeZone()) ?? new Date()}
              end={dateRange?.end?.toDate(getLocalTimeZone()) ?? new Date()}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
