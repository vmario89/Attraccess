// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  DateTimeOptions,
  useFormatDateTime,
} from '@frontend/hooks/useFormatDateTime';

interface DateTimeDisplayProps {
  date?: Date | string | number | null;
  options?: DateTimeOptions;
}

export function DateTimeDisplay(
  props: DateTimeDisplayProps & React.HTMLAttributes<HTMLSpanElement>
) {
  const { date, options, ...spanProps } = props;

  const formattedDate = useFormatDateTime(date, options);

  return <span {...spanProps}>{formattedDate}</span>;
}
