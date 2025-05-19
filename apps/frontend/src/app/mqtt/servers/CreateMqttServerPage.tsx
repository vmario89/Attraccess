import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { Button, Card, CardHeader, Input, Checkbox, Form } from '@heroui/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToastMessage } from '../../../components/toastProvider';
import en from './translations/create/en.json';
import de from './translations/create/de.json';
import { useCallback, useState } from 'react';
import {
  useMqttServersServiceCreateOneMqttServer,
  CreateMqttServerDto,
  UseMqttServersServiceGetAllMqttServersKeyFn,
  MqttServer,
} from '@attraccess/react-query-client';
import { useQueryClient } from '@tanstack/react-query';

interface CreateMqttServerPageProps {
  onSuccess?: (createdServer: MqttServer) => void;
  onCancel?: () => void;
}

export function CreateMqttServerForm(props?: CreateMqttServerPageProps) {
  const { onSuccess } = props || {};
  const { t } = useTranslations('mqttServerCreate', { en, de });
  const navigate = useNavigate();
  const { success, error: showError } = useToastMessage();
  const queryClient = useQueryClient();

  const [formValues, setFormValues] = useState<CreateMqttServerDto>({
    name: '',
    host: '',
    port: 1883,
    clientId: '',
    username: '',
    password: '',
    useTls: false,
  });

  const createMqttServer = useMqttServersServiceCreateOneMqttServer({
    onSuccess: (server) => {
      success({
        title: t('serverCreated'),
        description: t('serverCreatedDesc'),
      });
      queryClient.invalidateQueries({
        queryKey: [UseMqttServersServiceGetAllMqttServersKeyFn()[0]],
      });
      if (onSuccess) {
        onSuccess(server);
      } else {
        navigate('/mqtt/servers');
      }
    },
    onError: (err: Error) => {
      showError({
        title: t('errorGeneric'),
        description: err.message || t('failedToCreate'),
      });
    },
  });

  const handleCancel = useCallback(() => {
    if (props?.onCancel) {
      props.onCancel();
    } else {
      navigate('/mqtt/servers');
    }
  }, [props, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMqttServer.mutate({ requestBody: formValues });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        id="name"
        name="name"
        label={t('nameLabel')}
        placeholder={t('namePlaceholder')}
        value={formValues.name}
        onChange={handleInputChange}
        required
        fullWidth
      />

      <Input
        label={t('hostLabel')}
        id="host"
        name="host"
        placeholder={t('hostPlaceholder')}
        value={formValues.host}
        onChange={handleInputChange}
        required
        fullWidth
      />

      <Input
        label={t('portLabel')}
        id="port"
        name="port"
        type="number"
        placeholder={t('portPlaceholder')}
        value={String(formValues.port || 1883)}
        onChange={handleInputChange}
        required
        fullWidth
      />

      <Input
        label={t('clientIdLabel')}
        id="clientId"
        name="clientId"
        placeholder={t('clientIdPlaceholder')}
        value={formValues.clientId}
        onChange={handleInputChange}
        fullWidth
      />

      <Input
        label={t('usernameLabel')}
        id="username"
        name="username"
        placeholder={t('usernamePlaceholder')}
        value={formValues.username}
        onChange={handleInputChange}
        fullWidth
      />

      <Input
        label={t('passwordLabel')}
        id="password"
        name="password"
        type="password"
        placeholder={t('passwordPlaceholder')}
        value={formValues.password}
        onChange={handleInputChange}
        fullWidth
      />

      <Checkbox
        id="useTls"
        name="useTls"
        isSelected={formValues.useTls}
        onValueChange={(checked) => setFormValues((prev) => ({ ...prev, useTls: checked }))}
      >
        {t('useTls')}
      </Checkbox>

      <div className="flex justify-end space-x-3 mt-4">
        <Button color="default" variant="flat" onPress={handleCancel}>
          {t('cancel')}
        </Button>
        <Button color="primary" type="submit" isLoading={createMqttServer.isPending}>
          {t('create')}
        </Button>
      </div>
    </Form>
  );
}

export function CreateMqttServerPage(props?: CreateMqttServerPageProps) {
  const navigate = useNavigate();

  const { t } = useTranslations('mqttServerCreatePage', { en, de });

  const handleCancel = useCallback(() => {
    if (props?.onCancel) {
      props.onCancel();
    } else {
      navigate('/mqtt/servers');
    }
  }, [props, navigate]);

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button isIconOnly variant="light" onPress={handleCancel} aria-label={t('back')}>
              <ArrowLeft size={20} />
            </Button>
            <h2>{t('addNewMqttServer')}</h2>
          </div>
        </div>
      </CardHeader>
      <div style={{ padding: '1rem' }}>
        <CreateMqttServerForm {...props} onCancel={handleCancel} />
      </div>
    </Card>
  );
}
