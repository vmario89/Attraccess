import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface DateTimeOptions {
  showTime?: boolean;
  showDate?: boolean;
}

export function useFormatDateTime(
  date?: Date | string | number | null,
  options: DateTimeOptions = {
    showTime: true,
    showDate: true,
  }
) {
  const { i18n } = useTranslation();

  const formatter = useMemo(() => {
    const formatOptions: Intl.DateTimeFormatOptions = {};

    if (options.showTime) {
      formatOptions.timeStyle = 'short';
    }

    if (options.showDate) {
      formatOptions.dateStyle = 'short';
    }

    return new Intl.DateTimeFormat(i18n.language, formatOptions);
  }, [options, i18n.language]);

  const formattedDate = useMemo(() => {
    if (date === null || date === undefined) {
      return '-';
    }

    const dateAsDate = new Date(date);
    if (isNaN(dateAsDate.getTime())) {
      return '-';
    }

    return formatter.format(dateAsDate);
  }, [formatter, date]);

  return formattedDate;
}
