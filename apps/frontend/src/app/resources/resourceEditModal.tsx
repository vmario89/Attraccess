import { useCallback, useEffect, useRef, useState } from 'react';
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
  Switch,
} from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './resourceEditModal.en.json';
import * as de from './resourceEditModal.de.json';
import {
  useResourcesServiceUpdateOneResource, // Changed
  UpdateResourceDto, // Changed
  UseResourcesServiceGetAllResourcesKeyFn,
  Resource,
} from '@attraccess/react-query-client';
import { useQueryClient } from '@tanstack/react-query';
import { FileUpload } from '../../components/fileUpload';
import { useToastMessage } from '../../components/toastProvider';

interface ResourceEditModalProps {
  resource: Resource; // Add resource prop
  isOpen?: boolean; // Added for external control
  onOpenChange?: (isOpen: boolean) => void; // Added for external control
  children?: (onOpen: () => void) => React.ReactNode;
  onUpdated?: (resource: Resource) => void; // Rename onCreated to onUpdated
}

type PostUpdateAction = 'close' | 'clear'; // Renamed and removed 'open'

export function ResourceEditModal(props: ResourceEditModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { t } = useTranslations('resourceEditModal', {
    en,
    de,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<UpdateResourceDto>(() => ({ // Changed to UpdateResourceDto
    name: props.resource.name,
    description: props.resource.description || '',
    allowTakeOver: props.resource.allowTakeOver || false,
    // Note: image is handled separately by selectedImage state
  }));

  useEffect(() => {
    if (props.resource && isOpen) {
      setFormData({
        name: props.resource.name,
        description: props.resource.description || '',
        allowTakeOver: props.resource.allowTakeOver || false,
      });
      // If you want to show the existing image, you would set it here.
      // For now, we clear any newly selected image if the resource changes or modal reopens.
      setSelectedImage(null); 
    }
  }, [props.resource, isOpen, setFormData, setSelectedImage]);
  const { success, error } = useToastMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postUpdateAction, setPostUpdateAction] = useState<PostUpdateAction>('close');
  const modalCloseFn = useRef<(() => void) | null>(null);

  const updateResource = useResourcesServiceUpdateOneResource();
  const queryClient = useQueryClient();
  const clearForm = useCallback(() => {
    if (props.resource) {
      setFormData({
        name: props.resource.name,
        description: props.resource.description || '',
        allowTakeOver: props.resource.allowTakeOver || false,
      });
    } else {
      // Fallback if resource is somehow not available, though it's a required prop
      setFormData({
        name: '',
        description: '',
        allowTakeOver: false,
      });
    }
    setSelectedImage(null);
  }, [props.resource, setFormData, setSelectedImage]);

  useEffect(() => {
    if (updateResource.isSuccess && isSubmitting) {
      const updatedResource = updateResource.data;
      success({
        title: t('updateSuccessTitle', 'Resource Updated'), // Changed translation key
        description: t('updateSuccessDescription', { name: formData.name }), // Changed translation key
      });

      if (typeof props.onUpdated === 'function') { // Changed prop name
        if (updatedResource) {
          props.onUpdated(updatedResource); // Changed prop name
        } else {
          console.error('Resource data is missing after successful update.'); // Changed message
        }
      }

      if (postUpdateAction === 'close') { // Changed variable name
        if (modalCloseFn.current) {
          modalCloseFn.current();
        }
        clearForm(); // For 'close' action, reset the form based on original props.resource.
      } else if (postUpdateAction === 'clear') { // Changed variable name
        // Form remains open. If data was returned, update the form with it.
        if (updatedResource) {
          setFormData({
            name: updatedResource.name,
            description: updatedResource.description || '',
            allowTakeOver: updatedResource.allowTakeOver || false,
          });
          setSelectedImage(null); // Clear any newly selected image, as it's now part of the updatedResource
        }
        // If no updatedResource data, the form keeps the current (edited) values.
      }

      setIsSubmitting(false);
      // setPostUpdateAction('close'); // No need to reset, it's set per action button click

      queryClient.invalidateQueries({
        queryKey: [UseResourcesServiceGetAllResourcesKeyFn()[0]],
      });
      // Optionally, invalidate specific resource query
      if (updatedResource?.id) {
        queryClient.invalidateQueries({ queryKey: ['ResourcesServiceGetOneResourceById', updatedResource.id] });
      }
    }
  }, [
    isSubmitting,
    updateResource.isSuccess,
    updateResource.data,
    formData.name, // Keep for messages
    props,
    success,
    t,
    queryClient,
    postUpdateAction, // Changed variable name
    clearForm,
    setFormData, // Added setFormData
    setSelectedImage // Added setSelectedImage
  ]);

  useEffect(() => {
    if (isSubmitting && updateResource.isError) { // Changed to updateResource
      error({
        title: t('updateErrorTitle', 'Error Updating Resource'), // Changed translation key
        description: t('updateErrorDescription', 'Could not update the resource.'), // Changed translation key
      });
      console.error('Failed to update resource:', {
        resourceId: props.resource.id,
        error: updateResource.error,
        requestData: formData
      }); // Changed to updateResource

      setIsSubmitting(false);
    }
  }, [updateResource.isError, updateResource.error, error, isSubmitting, t, formData, props.resource.id]); // Changed to updateResource

  const handleUpdate = useCallback( // Renamed from handleCreate
    async (action: PostUpdateAction, closeFn: () => void) => { // Renamed PostCreateAction
      if (!formData.name) {
        error({
          title: t('validationErrorTitle', 'Validation Error'),
          description: t('nameRequiredError', 'Name is required.'),
        });
        return;
      }

      modalCloseFn.current = closeFn;
      setPostUpdateAction(action); // Renamed setPostCreateAction
      setIsSubmitting(true);

      const dtoPart: UpdateResourceDto = {
        name: formData.name,
        description: formData.description,
        allowTakeOver: formData.allowTakeOver,
      };

      // The mutation expects an object with 'id' and 'formData'
      // 'formData' itself will contain the DTO fields and the optional image
      const mutationPayload = { // Let type inference work here or be more specific if needed
        id: props.resource.id,
        formData: {
          ...dtoPart,
          ...(selectedImage && { image: selectedImage }),
        },
      };

      updateResource.mutate(mutationPayload);
    },
    [
      updateResource, 
      formData, 
      selectedImage, 
      setIsSubmitting, 
      setPostUpdateAction, 
      error, 
      t, 
      props.resource.id
    ] // Added props.resource.id, Renamed dependencies
  );

  return (
    <>
      {props.children && props.children(onOpen)}
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <ModalHeader>{t('modalTitle', 'Edit Resource')}</ModalHeader>

              <ModalBody className="w-full space-y-4">
                <Input
                  isRequired
                  label={t('nameLabel')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isDisabled={isSubmitting}
                  isInvalid={!formData.name}
                  errorMessage={!formData.name ? t('nameRequiredError', 'Name is required.') : ''}
                />
                <Input
                  label={t('descriptionLabel')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  isDisabled={isSubmitting}
                />

                <Switch
                  isSelected={formData.allowTakeOver}
                  onValueChange={(value) => setFormData({ ...formData, allowTakeOver: value })}
                  isDisabled={isSubmitting}
                >
                  <div className="flex flex-col">
                    <span className="text-small">{t('allowTakeOverLabel')}</span>
                    <span className="text-tiny text-default-400">{t('allowTakeOverDescription')}</span>
                  </div>
                </Switch>

                <FileUpload
                  label={t('imageLabel')}
                  id="image"
                  onChange={setSelectedImage}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </ModalBody>

              <ModalFooter className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                <Button
                  variant="bordered"
                  className="w-full sm:w-auto min-w-full sm:min-w-fit"
                  onPress={onClose} // Standard cancel button
                  isDisabled={isSubmitting}
                >
                  {t('cancelButton', 'Cancel')}
                </Button>
                <Button
                  color="primary"
                  variant="ghost"
                  className="w-full sm:w-auto min-w-full sm:min-w-fit"
                  onPress={() => handleUpdate('clear', onClose)} 
                  isLoading={isSubmitting && postUpdateAction === 'clear'} 
                  isDisabled={isSubmitting || !formData.name}
                >
                  {t('saveAndContinueButton', 'Save and Continue Editing')}
                </Button>
                <Button
                  color="primary"
                  className="w-full sm:w-auto min-w-full sm:min-w-fit"
                  onPress={() => handleUpdate('close', onClose)} 
                  isLoading={isSubmitting && postUpdateAction === 'close'} 
                  isDisabled={isSubmitting || !formData.name}
                >
                  {t('saveButton', 'Save Changes')}
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
