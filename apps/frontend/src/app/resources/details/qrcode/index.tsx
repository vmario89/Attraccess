import {
  Button,
  Card,
  CardBody,
  CardProps,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { PageHeader } from '../../../../components/pageHeader';
import { QrCodeIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Select } from '../../../../components/select';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { QrCodeAction } from './action';

import de from './de.json';
import en from './en.json';
import { nanoid } from 'nanoid';

interface Props {
  resourceId: number;
}

export function ResourceQrCode(props: Props & Omit<CardProps, 'children'>) {
  const { resourceId, ...rest } = props;

  const { t } = useTranslations('ResourceQrCode', { de, en });

  const id = useMemo(() => {
    return nanoid();
  }, []);

  const download = useCallback(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = `resource-${resourceId}-qrcode.png`;
    link.click();
  }, [id, resourceId]);

  const [action, setAction] = useState<QrCodeAction>(QrCodeAction.View);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const qrCodeUrl = useMemo(() => {
    const url = new URL(window.location.origin);
    url.pathname = `/resources/${resourceId}`;

    if (action !== QrCodeAction.View) {
      url.searchParams.set('action', action);
    }

    return url.toString();
  }, [resourceId, action]);

  return (
    <>
      <Card {...rest}>
        <CardBody className="flex flex-col items-center justify-center">
          <Button onPress={onOpen} startContent={<QrCodeIcon />}>
            {t('button.label')}
          </Button>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <PageHeader title={t('modal.title')} subtitle={t('modal.subtitle')} icon={<QrCodeIcon />} noMargin />
          </ModalHeader>

          <ModalBody>
            <Select
              selectedKey={action}
              onSelectionChange={(key) => setAction(key as QrCodeAction)}
              items={Object.values(QrCodeAction).map((val) => ({
                key: val,
                label: t(`modal.action.${val}`),
              }))}
              label={t('modal.action.label')}
            />
            <QRCode
              value={qrCodeUrl}
              size={300}
              logoHeight={100}
              logoWidth={50}
              logoPadding={10}
              logoPaddingStyle="square"
              logoImage="/logo.png"
              qrStyle="fluid"
              id={id}
            />
            <Link target="_blank" href={qrCodeUrl}>
              {qrCodeUrl}
            </Link>
          </ModalBody>

          <ModalFooter>
            <Button onPress={download}>{t('modal.download')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
