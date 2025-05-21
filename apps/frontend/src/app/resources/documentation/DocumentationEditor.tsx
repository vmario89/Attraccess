import { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Tab,
  Tabs,
  Textarea,
} from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useToastMessage } from '../../../components/toastProvider';
import { PageHeader } from '../../../components/pageHeader';
import { 
  useResourcesServiceGetOneResourceById, 
  useResourcesServiceUpdateOneResource 
} from '@attraccess/react-query-client';
import { DocumentationType } from './types';
import ReactMarkdown from 'react-markdown';
import en from './documentationEditor.en.json';
import de from './documentationEditor.de.json';

function DocumentationEditorComponent() {
  const { id } = useParams<{ id: string }>();
  const resourceId = parseInt(id || '', 10);
  const navigate = useNavigate();
  const { success, error: showError } = useToastMessage();
  
  const { t } = useTranslations('documentationEditor', {
    en,
    de,
  });

  const [documentationType, setDocumentationType] = useState<DocumentationType | ''>('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [selectedTab, setSelectedTab] = useState('edit');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: resource,
    isLoading: isLoadingResource,
  } = useResourcesServiceGetOneResourceById({ id: resourceId });

  const updateResource = useResourcesServiceUpdateOneResource();

  // Initialize form with resource data
  useEffect(() => {
    if (resource) {
      setDocumentationType(resource.documentationType || '');
      setMarkdownContent(resource.documentationMarkdown || '');
      setUrlContent(resource.documentationUrl || '');
    }
  }, [resource]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (documentationType === DocumentationType.URL && !urlContent) {
      errors.url = t('validation.urlRequired');
    }

    if (documentationType === DocumentationType.URL && urlContent) {
      try {
        new URL(urlContent);
      } catch (e) {
        errors.url = t('validation.invalidUrl');
      }
    }

    if (documentationType === DocumentationType.MARKDOWN && !markdownContent) {
      errors.markdown = t('validation.markdownRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [documentationType, markdownContent, urlContent, t]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateResource.mutateAsync({
        id: resourceId,
        formData: {
          documentationType: documentationType || null,
          documentationMarkdown: documentationType === DocumentationType.MARKDOWN ? markdownContent : null,
          documentationUrl: documentationType === DocumentationType.URL ? urlContent : null,
        },
      });

      success({
        title: t('notifications.saveSuccess.title'),
        description: t('notifications.saveSuccess.description'),
      });

      navigate(`/resources/${resourceId}`);
    } catch (err) {
      showError({
        title: t('notifications.saveError.title'),
        description: t('notifications.saveError.description'),
      });
      console.error('Failed to save documentation:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    documentationType,
    markdownContent,
    navigate,
    resourceId,
    showError,
    success,
    t,
    updateResource,
    urlContent,
    validateForm,
  ]);

  if (isLoadingResource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Resource not found</h2>
          <p className="text-gray-500 mb-4">The requested resource could not be found.</p>
          <Button onPress={() => navigate('/resources')} variant="light" startContent={<ArrowLeft className="w-4 h-4" />}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title={t('title')}
        subtitle={resource.name}
        backTo={`/resources/${resourceId}`}
        actions={
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={isSubmitting}
            startContent={<Save className="w-4 h-4" />}
          >
            {t('actions.save')}
          </Button>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <RadioGroup
            label={t('documentationType.label')}
            orientation="horizontal"
            value={documentationType}
            onValueChange={setDocumentationType as (value: string) => void}
          >
            <Radio value={DocumentationType.MARKDOWN}>{t('documentationType.markdown')}</Radio>
            <Radio value={DocumentationType.URL}>{t('documentationType.url')}</Radio>
          </RadioGroup>
        </CardHeader>
        <CardBody>
          {documentationType === DocumentationType.MARKDOWN && (
            <div className="space-y-4">
              <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab as (key: string) => void}>
                <Tab key="edit" title={t('edit')}>
                  <Textarea
                    label={t('markdownContent.label')}
                    placeholder={t('markdownContent.placeholder')}
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    minRows={15}
                    className="w-full"
                    isInvalid={!!validationErrors.markdown}
                    errorMessage={validationErrors.markdown}
                  />
                </Tab>
                <Tab key="preview" title={t('preview')}>
                  <div className="border rounded-md p-4 min-h-[300px] prose prose-sm md:prose-base lg:prose-lg max-w-none">
                    {markdownContent ? (
                      <ReactMarkdown>{markdownContent}</ReactMarkdown>
                    ) : (
                      <div className="text-gray-400 italic">{t('markdownContent.placeholder')}</div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
          )}

          {documentationType === DocumentationType.URL && (
            <Input
              label={t('urlContent.label')}
              placeholder={t('urlContent.placeholder')}
              value={urlContent}
              onChange={(e) => setUrlContent(e.target.value)}
              isInvalid={!!validationErrors.url}
              errorMessage={validationErrors.url}
            />
          )}
        </CardBody>
        <CardFooter>
          <div className="flex justify-end space-x-2">
            <Button
              variant="light"
              onPress={() => navigate(`/resources/${resourceId}`)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={isSubmitting}
            >
              {t('actions.save')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export const DocumentationEditor = memo(DocumentationEditorComponent);