import { SystemPermissions } from '@attraccess/database-entities';
import { PathRouteProps } from 'react-router-dom';

// Extended route type that includes sidebar options
export interface RouteConfig extends Omit<PathRouteProps, 'children'> {
  sidebar?: {
    label?: string;
    translationKey?: string; // Key for translation
    icon: React.ReactNode;
    order?: number; // Optional ordering for sidebar items
  };
  authRequired: boolean | keyof SystemPermissions | (keyof SystemPermissions)[];
}
