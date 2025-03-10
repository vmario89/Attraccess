import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Checkbox,
} from '@heroui/react';
import { Pencil, Trash, Globe, Webhook, Shield, RefreshCw } from 'lucide-react';
import { useToastMessage } from '../../../components/toastProvider';
import {
  useMqttServers,
  useCreateMqttServer,
  useUpdateMqttServer,
  useDeleteMqttServer,
  useTestMqttServerConnection,
} from '../../../api/hooks/mqttServers';
import {
  CreateMqttServerDto,
  MqttServer,
  UpdateMqttServerDto,
} from '@attraccess/api-client';
import { useTranslations } from '../../../i18n';
import en from './translations/en';
import de from './translations/de';

const defaultServerValues: CreateMqttServerDto = {
  name: '',
  host: '',
  port: 1883,
  clientId: '',
  username: '',
  password: '',
  useTls: false,
};

export interface MqttServersListRef {
  handleAddNew: () => void;
}

export const MqttServersList = forwardRef<
  MqttServersListRef,
  React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const { t } = useTranslations('mqttServersList', { en, de });
  const { data: servers, isLoading, error } = useMqttServers();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [editingServer, setEditingServer] = useState<MqttServer | null>(null);
  const [formValues, setFormValues] = useState<CreateMqttServerDto>(
    defaultServerValues as CreateMqttServerDto
  );
  const [testingId, setTestingId] = useState<number | null>(null);

  const { success, error: showError } = useToastMessage();
  const createMqttServer = useCreateMqttServer();
  const updateMqttServer = useUpdateMqttServer();
  const deleteMqttServer = useDeleteMqttServer();
  const testConnection = useTestMqttServerConnection();

  const handleAddNew = () => {
    setEditingServer(null);
    setFormValues(defaultServerValues);
    onOpen();
  };

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleAddNew,
  }));

  const handleEdit = (server: MqttServer) => {
    setEditingServer(server);
    setFormValues({
      name: server.name,
      host: server.host,
      port: server.port,
      clientId: server.clientId || '',
      username: server.username || '',
      password: server.password || '',
      useTls: server.useTls,
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('deleteConfirmation'))) {
      try {
        await deleteMqttServer.mutateAsync(id);
        success({
          title: t('serverDeleted'),
          description: t('serverDeletedDesc'),
        });
      } catch (err) {
        showError({
          title: t('errorGeneric'),
          description: err instanceof Error ? err.message : t('failedToDelete'),
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue =
      type === 'checkbox'
        ? checked
        : type === 'number'
        ? parseInt(value, 10)
        : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingServer) {
        await updateMqttServer.mutateAsync({
          id: editingServer.id,
          data: formValues as UpdateMqttServerDto,
        });
        success({
          title: t('serverUpdated'),
          description: t('serverUpdatedDesc'),
        });
      } else {
        await createMqttServer.mutateAsync(formValues);
        success({
          title: t('serverCreated'),
          description: t('serverCreatedDesc'),
        });
      }
      onClose();
    } catch (err) {
      showError({
        title: t('errorGeneric'),
        description:
          err instanceof Error
            ? err.message
            : editingServer
            ? t('failedToUpdate')
            : t('failedToCreate'),
      });
    }
  };

  const handleTestConnection = async (id: number) => {
    setTestingId(id);

    try {
      const result = await testConnection.mutateAsync(id);

      if (result && typeof result.success === 'boolean') {
        if (result.success) {
          success({
            title: t('connectionSuccessful'),
            description: result.message || t('connectionSuccessfulDesc'),
          });
        } else {
          showError({
            title: t('connectionFailed'),
            description: result.message || t('failedToConnect'),
          });
        }
      } else {
        console.error('Unexpected test connection result format:', result);
        showError({
          title: t('connectionCheckError'),
          description: t('invalidResponseFormat'),
        });
      }
    } catch (err) {
      console.error('Test connection error:', err);
      showError({
        title: t('connectionTestError'),
        description: err instanceof Error ? err.message : t('failedToConnect'),
      });
    } finally {
      setTestingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{t('errorLoading')}</div>;
  }

  return (
    <>
      {servers && servers.length > 0 ? (
        <Table aria-label="MQTT Servers List">
          <TableHeader>
            <TableColumn>{t('name')}</TableColumn>
            <TableColumn>{t('host')}</TableColumn>
            <TableColumn>{t('port')}</TableColumn>
            <TableColumn>{t('tls')}</TableColumn>
            <TableColumn>{t('authentication')}</TableColumn>
            <TableColumn>{t('actions')}</TableColumn>
          </TableHeader>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id}>
                <TableCell>{server.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    {server.host}
                  </div>
                </TableCell>
                <TableCell>{server.port}</TableCell>
                <TableCell>
                  {server.useTls ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <Shield size={16} />
                      {t('enabled')}
                    </div>
                  ) : (
                    <div className="text-gray-500">{t('disabled')}</div>
                  )}
                </TableCell>
                <TableCell>
                  {server.username ? (
                    <div className="flex items-center gap-1 text-blue-500">
                      <Webhook size={16} />
                      {server.username}
                    </div>
                  ) : (
                    <div className="text-gray-500">{t('anonymous')}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip content={t('testConnection')}>
                      <Button
                        isIconOnly
                        variant="light"
                        color="primary"
                        onPress={() => handleTestConnection(server.id)}
                        isLoading={testingId === server.id}
                      >
                        <RefreshCw size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content={t('editServer')}>
                      <Button
                        isIconOnly
                        variant="light"
                        onPress={() => handleEdit(server)}
                      >
                        <Pencil size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content={t('deleteServer')}>
                      <Button
                        isIconOnly
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(server.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t('noServersConfigured')}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader>
            {editingServer ? t('editMqttServer') : t('addNewMqttServer')}
          </ModalHeader>
          <ModalBody>
            <div className="grid gap-4">
              <Input
                label={t('nameLabel')}
                placeholder={t('namePlaceholder')}
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                label={t('hostLabel')}
                placeholder={t('hostPlaceholder')}
                name="host"
                value={formValues.host}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                label={t('portLabel')}
                placeholder={t('portPlaceholder')}
                name="port"
                type="number"
                value={String(formValues.port)}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                label={t('clientIdLabel')}
                placeholder={t('clientIdPlaceholder')}
                name="clientId"
                value={formValues.clientId || ''}
                onChange={handleInputChange}
              />
              <Input
                label={t('usernameLabel')}
                placeholder={t('usernamePlaceholder')}
                name="username"
                value={formValues.username || ''}
                onChange={handleInputChange}
              />
              <Input
                label={t('passwordLabel')}
                placeholder={t('passwordPlaceholder')}
                name="password"
                type="password"
                value={formValues.password || ''}
                onChange={handleInputChange}
              />
              <Checkbox
                name="useTls"
                isSelected={Boolean(formValues.useTls)}
                onValueChange={(checked) =>
                  setFormValues((prev) => ({ ...prev, useTls: checked }))
                }
              >
                {t('useTls')}
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {t('cancel')}
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {editingServer ? t('update') : t('create')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});
