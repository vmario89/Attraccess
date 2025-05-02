import { Navigate, PathRouteProps } from 'react-router-dom';
import { ResourceList } from '../resources/list.group';
import { ResourceDetails } from '../resources/resourceDetails';
import { IoTSettings } from '../resources/iot-settings/iotSettings';
import { Database, ServerIcon, Key, Users } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MqttServersPage } from '../mqtt/MqttServersPage';
import { SSOProvidersPage } from '../sso/SSOProvidersPage';
import { SystemPermissions } from '@attraccess/react-query-client';
import { UserManagementPage } from '../users/UserManagementPage';
// eslint-disable-next-line @nx/enforce-module-boundaries
import usePluginState, { PluginManifestWithPlugin } from '@frontend/plugins/plugin.state';
import { usePluginStore } from 'react-pluggable';
export * as de from './translations/de';
export * as en from './translations/en';

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

const coreRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/resources" replace />,
    authRequired: true,
  },
  {
    path: '/resources',
    element: <ResourceList />,
    sidebar: {
      translationKey: 'resources',
      icon: <Database className="h-5 w-5" />,
      order: 1,
    },
    authRequired: true,
  },
  {
    path: '/resources/:id',
    element: <ResourceDetails />,
    authRequired: true,
  },
  {
    path: '/resources/:id/iot',
    element: <IoTSettings />,
    authRequired: 'canManageResources',
  },
  {
    path: '/mqtt/servers',
    element: <MqttServersPage />,
    sidebar: {
      translationKey: 'mqttServers',
      icon: <ServerIcon className="h-5 w-5" />,
      order: 2,
    },
    authRequired: 'canManageResources',
  },
  {
    path: '/sso/providers',
    element: <SSOProvidersPage />,
    sidebar: {
      translationKey: 'ssoProviders',
      icon: <Key className="h-5 w-5" />,
      order: 3,
    },
    authRequired: 'canManageSystemConfiguration',
  },
  {
    path: '/users/management',
    element: <UserManagementPage />,
    sidebar: {
      translationKey: 'userManagement',
      icon: <Users className="h-5 w-5" />,
      order: 4,
    },
    authRequired: 'canManageUsers',
  },
];

export function useAllRoutes() {
  const { plugins: pluginManifests } = usePluginState();
  const pluginStore = usePluginStore();

  const [pluginRoutes, setPluginRoutes] = useState<RouteConfig[]>([]);

  const addRoutesOfPlugin = useCallback(
    (pluginManifest: PluginManifestWithPlugin) => {
      const pluginRoutes = pluginStore.executeFunction(
        `${pluginManifest.plugin.getPluginName()}.GET_ROUTES`,
        pluginManifest
      );

      setPluginRoutes((prev) => [...prev, ...pluginRoutes]);
    },
    [pluginStore]
  );

  useEffect(() => {
    pluginManifests.forEach((pluginManifest) => addRoutesOfPlugin(pluginManifest));
  }, [pluginManifests, addRoutesOfPlugin]);

  return useMemo(() => [...coreRoutes, ...pluginRoutes], [pluginRoutes]);
}
