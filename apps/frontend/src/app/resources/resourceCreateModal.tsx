import { CreateResourceDto } from '@attraccess/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCreateResource } from '../../api/hooks';
import { useToastMessage } from '../../components';
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
import { FileUpload } from '../../components/fileUpload';

interface ResourceCreateModalProps {
  children: (onOpen: () => void) => React.ReactNode;
  onCreated?: (resource: CreateResourceDto) => void;
}

export function ResourceCreateModal(props: ResourceCreateModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [formData, setFormData] = useState<CreateResourceDto>({
    name: '',
    description: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { success, error } = useToastMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalCloseFn = useRef<(() => void) | null>(null);

  const createResource = useCreateResource();

  useEffect(() => {
    if (createResource.isSuccess && isSubmitting) {
      success({
        title: 'Resource created',
        description: `${formData.name} has been successfully created`,
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
    }
  }, [
    isSubmitting,
    createResource.isSuccess,
    createResource.data,
    formData.name,
    props,
    success,
  ]);

  useEffect(() => {
    if (isSubmitting && createResource.isError) {
      error({
        title: 'Failed to create resource',
        description:
          'An error occurred while creating the resource. Please try again.',
      });
      console.error('Failed to create resource:', createResource.error);

      setIsSubmitting(false);
    }
  }, [createResource.isError, createResource.error, error, isSubmitting]);

  const handleSubmit = useCallback(
    async (closeFn: () => void) => {
      modalCloseFn.current = closeFn;
      setIsSubmitting(true);
      createResource.mutateAsync({
        name: formData.name,
        description: formData.description,
        image: selectedImage || undefined,
      });
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
              <ModalHeader>Create a new Resource</ModalHeader>

              <ModalBody className="w-full">
                <Input
                  isRequired
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <FileUpload
                  label="Image"
                  id="image"
                  onChange={setSelectedImage}
                  className="w-full"
                />
              </ModalBody>

              <ModalFooter>
                <Button color="primary" type="submit">
                  Create
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
