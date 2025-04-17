import { useCallback, useEffect, useRef, useState } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useToastMessage } from '@frontend/components/toastProvider';
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { FileUpload } from '@frontend/components/fileUpload';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import * as en from './translations/resourceCreateModal.en';
import * as de from './translations/resourceCreateModal.de';
import {
  useResourcesServiceCreateOneResource,
  CreateResourceDto,
  UseResourcesServiceGetAllResourcesKeyFn,
} from '@attraccess/react-query-client';
import { useQueryClient } from '@tanstack/react-query';

interface ResourceCreateModalProps {
  children: (onOpen: () => void) => React.ReactNode;
  onCreated?: (resource: CreateResourceDto) => void;
}

export function ResourceCreateModal(props: ResourceCreateModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { t } = useTranslations('resourceCreateModal', {
    en,
    de,
  });

  const [formData, setFormData] = useState<CreateResourceDto>({
    name: '',
    description: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { success, error } = useToastMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalCloseFn = useRef<(() => void) | null>(null);

  const createResource = useResourcesServiceCreateOneResource();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (createResource.isSuccess && isSubmitting) {
      success({
        title: t('successTitle'),
        description: t('successDescription', { name: formData.name }),
      });

      if (typeof props.onCreated === 'function') {
        props.onCreated(createResource.data);
      }

      setFormData({ name: '', description: '' });
      setSelectedImage(null);

      setIsSubmitting(false);

      if (modalCloseFn.current) {
        modalCloseFn.current();
      }

      queryClient.invalidateQueries({
        queryKey: [UseResourcesServiceGetAllResourcesKeyFn()[0]],
      });
    }
  }, [
    isSubmitting,
    createResource.isSuccess,
    createResource.data,
    formData.name,
    props,
    success,
    t,
    queryClient,
  ]);

  useEffect(() => {
    if (isSubmitting && createResource.isError) {
      error({
        title: t('errorTitle'),
        description: t('errorDescription'),
      });
      console.error('Failed to create resource:', createResource.error);

      setIsSubmitting(false);
    }
  }, [createResource.isError, createResource.error, error, isSubmitting, t]);

  const handleSubmit = useCallback(
    async (closeFn: () => void) => {
      modalCloseFn.current = closeFn;
      setIsSubmitting(true);

      createResource.mutateAsync({formData: {
        name: formData.name,
        description: formData.description,
        image: selectedImage ?? undefined,
      }});
    },
    [createResource, formData, selectedImage, setIsSubmitting]
  );

  return (
    <>
      {props.children(onOpen)}
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleSubmit(onClose);
              }}
            >
              <ModalHeader>{t('modalTitle')}</ModalHeader>

              <ModalBody className="w-full">
                <Input
                  isRequired
                  label={t('nameLabel')}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label={t('descriptionLabel')}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <FileUpload
                  label={t('imageLabel')}
                  id="image"
                  onChange={setSelectedImage}
                  className="w-full"
                />
              </ModalBody>

              <ModalFooter>
                <Button color="primary" type="submit">
                  {t('createButton')}
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
