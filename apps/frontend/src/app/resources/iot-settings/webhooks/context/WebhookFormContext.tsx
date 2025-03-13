import React, {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';
import { WebhookFormValues } from '../types';

interface WebhookFormContextType {
  values: WebhookFormValues;
  setValues: Dispatch<SetStateAction<WebhookFormValues>>;
  resourceId: number;
  webhookId?: number;
  isExistingWebhook: boolean;
  isSubmitting: boolean;
}

const WebhookFormContext = createContext<WebhookFormContextType | undefined>(
  undefined
);

export const WebhookFormProvider: React.FC<{
  children: React.ReactNode;
  value: WebhookFormContextType;
}> = ({ children, value }) => {
  return (
    <WebhookFormContext.Provider value={value}>
      {children}
    </WebhookFormContext.Provider>
  );
};

export const useWebhookForm = (): WebhookFormContextType => {
  const context = useContext(WebhookFormContext);
  if (context === undefined) {
    throw new Error('useWebhookForm must be used within a WebhookFormProvider');
  }
  return context;
};
