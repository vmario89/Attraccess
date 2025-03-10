import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  Card,
  CardBody,
  Skeleton,
  Accordion,
  AccordionItem,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
  Divider,
  Badge,
  Link,
  Alert,
  Select,
  SelectItem,
  Snippet,
} from '@heroui/react';
import {
  Server,
  Code,
  Save,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { useResource } from '../../../api/hooks/resources';
import { useToastMessage } from '../../../components/toastProvider';
import { useMqttServers } from '../../../api/hooks/mqttServers';
import {
  useMqttResourceConfig,
  useCreateOrUpdateMqttResourceConfig,
  useDeleteMqttResourceConfig,
  useTestMqttResourceConfig,
} from '../../../api/hooks/mqttResourceConfig';

// Template variables documentation
const templateVariables = [
  { name: 'id', description: 'Resource ID', example: '42' },
  { name: 'name', description: 'Resource name', example: '3D Printer' },
  {
    name: 'timestamp',
    description: 'Current timestamp in ISO format',
    example: '2023-05-01T12:34:56.789Z',
  },
  { name: 'user.id', description: 'User ID (if available)', example: '123' },
  {
    name: 'user.username',
    description: 'Username (if available)',
    example: 'johndoe',
  },
];

// Example templates
const exampleTemplates = {
  topic: 'resources/{{id}}/status',
  message:
    '{"status": "{{status}}", "resourceId": {{id}}, "resourceName": "{{name}}", "timestamp": "{{timestamp}}", "user": "{{user.username}}"}',
};

interface MqttConfigurationPanelProps {
  resourceId: number;
}

/**
 * Component for configuring MQTT settings for a resource
 * Only visible to users with canManageResources permission
 */
export const MqttConfigurationPanel: React.FC<MqttConfigurationPanelProps> = ({
  resourceId,
}) => {
  const { hasPermission } = useAuth();
  const canManageMqtt = hasPermission('canManageResources');
  const { data: resource, isLoading: isLoadingResource } =
    useResource(resourceId);
  const { data: mqttConfig, isLoading: isLoadingConfig } =
    useMqttResourceConfig(resourceId);
  const { data: servers, isLoading: isLoadingServers } = useMqttServers();
  const [isOpen, setIsOpen] = useState(false);

  const [formValues, setFormValues] = useState({
    serverId: '',
    inUseTopic: exampleTemplates.topic,
    inUseMessage: exampleTemplates.message.replace('{{status}}', 'in_use'),
    notInUseTopic: exampleTemplates.topic,
    notInUseMessage: exampleTemplates.message.replace(
      '{{status}}',
      'not_in_use'
    ),
  });

  const [isTesting, setIsTesting] = useState(false);

  const { success, error: showError } = useToastMessage();
  const createOrUpdateConfig = useCreateOrUpdateMqttResourceConfig();
  const deleteConfig = useDeleteMqttResourceConfig();
  const testConfig = useTestMqttResourceConfig();

  // Load existing config when available
  useEffect(() => {
    if (mqttConfig) {
      setFormValues({
        serverId: mqttConfig.serverId.toString(),
        inUseTopic: mqttConfig.inUseTopic,
        inUseMessage: mqttConfig.inUseMessage,
        notInUseTopic: mqttConfig.notInUseTopic,
        notInUseMessage: mqttConfig.notInUseMessage,
      });
    }
  }, [mqttConfig]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      serverId: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formValues.serverId) {
      showError({
        title: 'Validation Error',
        description: 'Please select an MQTT server.',
      });
      return;
    }

    try {
      const configData = {
        ...formValues,
        serverId: parseInt(formValues.serverId, 10),
      };

      await createOrUpdateConfig.mutateAsync({
        resourceId,
        data: configData,
      });

      success({
        title: 'MQTT Configuration Saved',
        description: 'The MQTT configuration has been successfully saved.',
      });
    } catch (error) {
      console.error('Failed to save MQTT configuration:', error);
      showError({
        title: 'Error',
        description: 'Failed to save MQTT configuration.',
      });
    }
  };

  const handleDelete = async () => {
    if (!mqttConfig) return;

    if (
      window.confirm('Are you sure you want to delete this MQTT configuration?')
    ) {
      try {
        await deleteConfig.mutateAsync(resourceId);
        success({
          title: 'MQTT Configuration Deleted',
          description: 'The MQTT configuration has been successfully deleted.',
        });

        // Reset form to defaults
        setFormValues({
          serverId: '',
          inUseTopic: exampleTemplates.topic,
          inUseMessage: exampleTemplates.message.replace(
            '{{status}}',
            'in_use'
          ),
          notInUseTopic: exampleTemplates.topic,
          notInUseMessage: exampleTemplates.message.replace(
            '{{status}}',
            'not_in_use'
          ),
        });
      } catch (error) {
        console.error('Failed to delete MQTT configuration:', error);
        showError({
          title: 'Error',
          description: 'Failed to delete MQTT configuration.',
        });
      }
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testConfig.mutateAsync(resourceId);
      if (result.success) {
        success({
          title: 'Test Successful',
          description: result.message,
        });
      } else {
        showError({
          title: 'Test Failed',
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Failed to test MQTT configuration:', error);
      showError({
        title: 'Error',
        description: 'Failed to test MQTT configuration.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Create a preview context for rendering templates
  const previewContext = resource
    ? {
        id: resource.id,
        name: resource.name,
        timestamp: new Date().toISOString(),
        user: { id: 123, username: 'johndoe' },
      }
    : null;

  // Simple template preview
  const previewTemplate = (template: string) => {
    if (!previewContext) return '';

    try {
      const result = template
        .replace(/\{\{id\}\}/g, String(previewContext.id))
        .replace(/\{\{name\}\}/g, previewContext.name)
        .replace(/\{\{timestamp\}\}/g, previewContext.timestamp)
        .replace(/\{\{user\.id\}\}/g, String(previewContext.user.id))
        .replace(/\{\{user\.username\}\}/g, previewContext.user.username);
      return result;
    } catch (error) {
      console.error('Error previewing template:', error);
      return 'Error previewing template';
    }
  };

  if (!canManageMqtt) {
    return null; // Do not render anything if user doesn't have permission
  }

  if (isLoadingResource || isLoadingConfig || isLoadingServers) {
    return (
      <Card>
        <CardBody>
          <Skeleton className="h-32 w-full" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <Accordion
        selectedKeys={isOpen ? ['mqtt'] : []}
        onSelectionChange={(keys) => {
          // @ts-expect-error - The types are incorrect for the Accordion component
          setIsOpen(keys.size > 0 && keys.has('mqtt'));
        }}
      >
        <AccordionItem
          key="mqtt"
          aria-label="MQTT Configuration"
          title={
            <div className="flex justify-between items-center w-full pr-4">
              <span className="text-lg font-semibold">MQTT Configuration</span>
              <div className="flex items-center gap-2">
                {isOpen && mqttConfig && (
                  <>
                    <Button
                      size="sm"
                      color="primary"
                      variant="light"
                      startContent={<RefreshCw size={16} />}
                      isLoading={isTesting}
                      onPress={handleTest}
                    >
                      Test
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={handleDelete}
                    >
                      Delete
                    </Button>
                  </>
                )}
                {isOpen && (
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<Save size={16} />}
                    onPress={handleSubmit}
                  >
                    Save
                  </Button>
                )}
                <Link
                  href="/mqtt/servers"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Server size={14} />
                  <span>Manage Servers</span>
                </Link>
              </div>
            </div>
          }
        >
          <CardBody className="pt-4">
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  MQTT Server
                </label>
                {servers && servers.length > 0 ? (
                  <Select
                    aria-label="MQTT Server"
                    placeholder="Select a server"
                    selectedKeys={
                      formValues.serverId ? [formValues.serverId] : []
                    }
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0]?.toString() || '';
                      handleSelectChange(selectedKey);
                    }}
                    className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    {servers.map((server) => (
                      <SelectItem key={server.id}>
                        {server.name} ({server.host}:{server.port})
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Alert color="warning">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} />
                      <span>
                        No MQTT servers configured. Please add a server first.
                      </span>
                    </div>
                  </Alert>
                )}
              </div>

              <Divider className="dark:bg-gray-700" />

              <Tabs variant="underlined">
                <Tab key="in-use" title="In Use Status">
                  <div className="grid gap-4 py-4">
                    <Input
                      label="Topic Template"
                      name="inUseTopic"
                      value={formValues.inUseTopic}
                      onChange={handleInputChange}
                      placeholder="resources/{{id}}/status"
                      startContent={<Code size={16} />}
                      classNames={{
                        label: 'dark:text-gray-300',
                      }}
                    />
                    <Textarea
                      label="Message Template"
                      name="inUseMessage"
                      value={formValues.inUseMessage}
                      onChange={handleInputChange}
                      placeholder={`{"status": "in_use", "resourceId": {{id}}}`}
                      minRows={3}
                      classNames={{
                        label: 'dark:text-gray-300',
                      }}
                    />
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold mb-2 dark:text-gray-300">
                        Preview:
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <strong className="text-sm dark:text-gray-300">
                            Topic:
                          </strong>
                          <Snippet
                            className="mt-1"
                            variant="bordered"
                            codeString={previewTemplate(formValues.inUseTopic)}
                          />
                        </div>
                        <div>
                          <strong className="text-sm dark:text-gray-300">
                            Message:
                          </strong>
                          <Snippet
                            className="mt-1"
                            variant="bordered"
                            codeString={previewTemplate(
                              formValues.inUseMessage
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>
                <Tab key="not-in-use" title="Not In Use Status">
                  <div className="grid gap-4 py-4">
                    <Input
                      label="Topic Template"
                      name="notInUseTopic"
                      value={formValues.notInUseTopic}
                      onChange={handleInputChange}
                      placeholder="resources/{{id}}/status"
                      startContent={<Code size={16} />}
                      classNames={{
                        label: 'dark:text-gray-300',
                      }}
                    />
                    <Textarea
                      label="Message Template"
                      name="notInUseMessage"
                      value={formValues.notInUseMessage}
                      onChange={handleInputChange}
                      placeholder={`{"status": "not_in_use", "resourceId": {{id}}}`}
                      minRows={3}
                      classNames={{
                        label: 'dark:text-gray-300',
                      }}
                    />
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold mb-2 dark:text-gray-300">
                        Preview:
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <strong className="text-sm dark:text-gray-300">
                            Topic:
                          </strong>
                          <Snippet
                            className="mt-1"
                            variant="bordered"
                            codeString={previewTemplate(
                              formValues.notInUseTopic
                            )}
                          />
                        </div>
                        <div>
                          <strong className="text-sm dark:text-gray-300">
                            Message:
                          </strong>
                          <Snippet
                            className="mt-1"
                            variant="bordered"
                            codeString={previewTemplate(
                              formValues.notInUseMessage
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>

              <Divider className="dark:bg-gray-700" />

              <Accordion>
                <AccordionItem
                  key="template-variables"
                  aria-label="Template Variables"
                  title={
                    <div className="flex items-center gap-2">
                      <HelpCircle size={16} />
                      <span className="dark:text-gray-200">
                        Template Variables Documentation
                      </span>
                    </div>
                  }
                >
                  <div className="grid gap-4 p-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You can use the following variables in your templates:
                    </p>
                    <div className="grid gap-2">
                      {templateVariables.map((variable) => (
                        <div
                          key={variable.name}
                          className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge color="primary" className="font-mono">
                              {`{{${variable.name}}}`}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {variable.description}
                            </span>
                          </div>
                          <div className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <span className="text-gray-500 dark:text-gray-400">
                              Example:
                            </span>{' '}
                            <span className="dark:text-gray-200">
                              {variable.example}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold mb-2 dark:text-gray-300">
                        Example Template:
                      </h4>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 font-mono text-xs dark:text-gray-200">
                        Topic: {exampleTemplates.topic}
                        <br />
                        Message: {exampleTemplates.message}
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </CardBody>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
