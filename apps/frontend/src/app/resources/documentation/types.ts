/**
 * Enum for documentation types
 */
export enum DocumentationType {
  MARKDOWN = 'markdown',
  URL = 'url',
}

/**
 * Interface for documentation data
 */
export interface DocumentationData {
  type: DocumentationType;
  content: string;
}

/**
 * Interface for documentation props
 */
export interface DocumentationProps {
  resourceId: number;
  resourceName: string;
}