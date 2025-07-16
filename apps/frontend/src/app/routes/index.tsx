import { Navigate } from 'react-router-dom';
import { ResourceDetails } from '../resources/details/resourceDetails';
import { IoTSettings } from '../resources/iot-settings/iotSettings';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MqttServersPage, CreateMqttServerPage, EditMqttServerPage } from '../mqtt';
import { SSOProvidersPage } from '../sso/SSOProvidersPage';
import { UserManagementPage } from '../user-management';
import { usePluginStore } from 'react-pluggable';
import { RouteConfig } from '@fabaccess/plugins-frontend-sdk';
import { PluginsList } from '../plugins/PluginsList';
import usePluginState, { PluginManifestWithPlugin } from '../plugins/plugin.state';
import { FabreaderList } from '../fabreader/FabreaderList/FabreaderList';
import { NfcCardList } from '../fabreader/NfcCardList/NfcCardList';
import { CsvExport } from '../csv-export/csv-export';
import { CreateMqttConfig, EditMqttConfig, TestMqttConfig } from '../resources/iot-settings/mqtt';
import { DocumentationEditor, DocumentationView } from '../resources/documentation';
import { EmailTemplatesPage } from '../email-templates/EmailTemplatesPage'; // Placeholder - to be created
import { EditEmailTemplatePage } from '../email-templates/EditEmailTemplatePage'; // Placeholder - to be created
import { ResourceGroupEditPage } from '../resource-groups';
import { ResourceOverview } from '../resourceOverview';
import { Dependencies } from '../dependencies';
import { UserManagementDetailsPage } from '../user-management/details';
import { AccountSettingsPage } from '../account-settings';
import { ConfirmEmailChange } from '../confirm-email-change';

const coreRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/resources" replace />,
    authRequired: true,
  },
  {
    path: '/dependencies',
    element: <Dependencies />,
    authRequired: false,
  },
  {
    path: '/resources',
    element: <ResourceOverview />,
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
    path: '/resources/:resourceId/iot/mqtt/create',
    element: <CreateMqttConfig />,
    authRequired: 'canManageResources',
  },
  {
    path: '/resources/:resourceId/iot/mqtt/:configId',
    element: <EditMqttConfig />,
    authRequired: 'canManageResources',
  },
  {
    path: '/resources/:resourceId/iot/mqtt/test/:configId',
    element: <TestMqttConfig />,
    authRequired: 'canManageResources',
  },
  {
    path: '/resources/:id/documentation',
    element: <DocumentationView />,
    authRequired: true,
  },
  {
    path: '/resources/:id/documentation/edit',
    element: <DocumentationEditor />,
    authRequired: 'canManageResources',
  },
  {
    path: '/resource-groups/:groupId',
    element: <ResourceGroupEditPage />,
    authRequired: true,
  },
  {
    path: '/mqtt/servers',
    element: <MqttServersPage />,
    authRequired: 'canManageResources',
  },
  {
    path: '/mqtt/servers/create',
    element: <CreateMqttServerPage />,
    authRequired: 'canManageResources',
  },
  {
    path: '/mqtt/servers/:serverId',
    element: <EditMqttServerPage />,
    authRequired: 'canManageResources',
  },
  {
    path: '/sso/providers',
    element: <SSOProvidersPage />,
    authRequired: 'canManageSystemConfiguration',
  },
  {
    path: '/users',
    element: <UserManagementPage />,
    authRequired: 'canManageUsers',
  },
  {
    path: '/users/:id',
    element: <UserManagementDetailsPage />,
    authRequired: 'canManageUsers',
  },
  {
    path: '/nfc-cards',
    element: <NfcCardList />,
    authRequired: true,
  },
  {
    path: '/fabreader',
    element: <FabreaderList />,
    authRequired: 'canManageSystemConfiguration',
  },
  {
    path: '/csv-export',
    element: <CsvExport />,
    authRequired: 'canManageResources',
  },
  {
    path: '/plugins',
    element: <PluginsList />,
    authRequired: 'canManageSystemConfiguration',
  },
  {
    path: '/email-templates',
    element: <EmailTemplatesPage />,
    authRequired: 'canManageSystemConfiguration',
  },
  {
    path: '/email-templates/:type',
    element: <EditEmailTemplatePage />,
    authRequired: 'canManageSystemConfiguration',
  },
  {
    path: '/account-settings',
    element: <AccountSettingsPage />,
    authRequired: true,
  },
  {
    path: '/confirm-email-change',
    element: <ConfirmEmailChange />,
    authRequired: false,
  },
];

export function useAllRoutes() {
  const { plugins: pluginManifests } = usePluginState();
  const pluginStore = usePluginStore();

  const [pluginRoutes, setPluginRoutes] = useState<RouteConfig[]>([]);

  const getRoutesOfPlugin = useCallback(
    (pluginManifest: PluginManifestWithPlugin) => {
      const pluginRoutes = pluginStore.executeFunction(
        `${pluginManifest.plugin.getPluginName()}.GET_ROUTES`,
        pluginManifest
      );

      return pluginRoutes;
    },
    [pluginStore]
  );

  useEffect(() => {
    const routesOfAllPlugins = pluginManifests.map((pluginManifest) => getRoutesOfPlugin(pluginManifest)).flat();
    setPluginRoutes(routesOfAllPlugins);
  }, [pluginManifests, getRoutesOfPlugin]);

  return useMemo(() => [...coreRoutes, ...pluginRoutes], [pluginRoutes]);
}
