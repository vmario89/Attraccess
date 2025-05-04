import React from 'react';
import { Input, Textarea, Select, SelectItem } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useWebhookForm } from '../context/WebhookFormContext';
import { WebhookHttpMethod } from '../types';

// Translations for this component only
import * as enBasic from '../translations/components/basic-settings/en';
import * as deBasic from '../translations/components/basic-settings/de';

const WebhookBasicSettings: React.FC = () => {
  const { values, setValues } = useWebhookForm();
  const { t } = useTranslations('webhooks.basicSettings', {
    en: enBasic,
    de: deBasic,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'method') {
      // Validate that it's a valid webhook method
      if (Object.values(WebhookHttpMethod).includes(value as WebhookHttpMethod)) {
        setValues((prev) => ({
          ...prev,
          [name]: value as WebhookHttpMethod,
        }));
      }
    } else {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Name and URL */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('nameLabel')}
          name="name"
          value={values.name}
          onChange={handleInputChange}
          placeholder={t('namePlaceholder')}
          isRequired
        />
        <Input
          label={t('urlLabel')}
          name="url"
          value={values.url}
          onChange={handleInputChange}
          placeholder={t('urlPlaceholder')}
          isRequired
        />
      </div>

      {/* HTTP Method */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t('methodLabel')}
          selectedKeys={[values.method]}
          onChange={(e) => handleSelectChange('method', e.target.value)}
        >
          {Object.values(WebhookHttpMethod).map((method) => (
            <SelectItem key={method}>{method}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Headers */}
      <Textarea
        label={t('headersLabel')}
        name="headers"
        value={values.headers}
        onChange={handleInputChange}
        placeholder={t('headersPlaceholder')}
        description={t('headersHelp')}
      />
    </div>
  );
};

export default WebhookBasicSettings;
