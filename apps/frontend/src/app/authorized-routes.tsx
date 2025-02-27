import { Navigate, RouteProps } from 'react-router-dom';
import { ResourceList } from './resources/list';
import { ResourceDetails } from './resources/resourceDetails';

export const authorizedRoutes: RouteProps[] = [
  {
    path: '/',
    element: <Navigate to="/resources" replace />,
  },
  {
    path: '/resources',
    element: <ResourceList />,
  },
  {
    path: '/resources/:id',
    element: <ResourceDetails />,
  },
];
