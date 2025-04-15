import { useTranslations } from '../../../../../i18n';
import * as en from './translations/en';
import * as de from './translations/de';
import { Listbox, ListboxItem } from '@heroui/listbox';
import { IntroductionListItemContent } from './components/IntroductionListItemContent';
import { IntroductionListItemActions } from './components/IntroductionListItemActions';
import { useResourceIntroductionServiceGetAllResourceIntroductions } from '@attraccess/react-query-client';

interface IntroductionsListProps {
  resourceId: number;
}

export function IntroductionsList(props: IntroductionsListProps) {
  const { resourceId } = props;

  const { t } = useTranslations('introductionsList', {
    en,
    de,
  });

  // TODO: Add pagination
  const { data: introductions } = useResourceIntroductionServiceGetAllResourceIntroductions({resourceId, limit: 100, page: 1});

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{t('existingIntroductions')}</h3>

      {introductions?.data?.length ? (
        <Listbox aria-label={t('existingIntroductions')} variant="flat">
          {introductions.data.map((introduction) => (
            <ListboxItem
              key={introduction.id}
              textValue={
                introduction.receiverUser?.username ||
                `User ${introduction.receiverUserId}`
              }
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                  <IntroductionListItemContent
                    resourceId={resourceId}
                    introduction={introduction}
                  />
                </div>

                <div className="flex justify-end">
                  <IntroductionListItemActions
                    resourceId={resourceId}
                    introduction={introduction}
                  />
                </div>
              </div>
            </ListboxItem>
          ))}
        </Listbox>
      ) : (
        <p className="text-gray-500 py-4 text-center italic">
          {t('noIntroductions')}
        </p>
      )}
    </div>
  );
}
