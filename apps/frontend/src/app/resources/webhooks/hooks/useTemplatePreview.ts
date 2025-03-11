import { useResource } from '../../../../api/hooks/resources';

/**
 * A hook that provides template preview functionality for webhook templates
 * Creates a preview context and returns a function to preview templates
 */
export const useTemplatePreview = (resourceId: number) => {
  // Fetch the resource data
  const { data: resource } = useResource(resourceId);

  // Create a preview context for rendering templates
  const previewContext = resource
    ? {
        id: resource.id,
        name: resource.name,
        timestamp: new Date().toISOString(),
        user: { id: 123, username: 'johndoe' },
      }
    : null;

  /**
   * Generate a preview of a template by replacing variables
   */
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
    } catch {
      return 'Error previewing template';
    }
  };

  return {
    previewTemplate,
    previewContext,
  };
};

export default useTemplatePreview;
