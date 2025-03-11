import React from 'react';
import { X, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslations } from '../../i18n';
import * as en from './translations/header.en';
import * as de from './translations/header.de';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Link,
} from '@heroui/react';
import { routes, de as routesDe, en as routesEn } from '../routes';
import { SystemPermissions } from '@attraccess/api-client';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { logout, user } = useAuth();
  const { t } = useTranslations('header', {
    en: en,
    de: de,
  });

  const { t: tRoutes } = useTranslations('routes', {
    en: routesEn,
    de: routesDe,
  });

  // Get navigation items from routes that have sidebar config
  const navigationItems = React.useMemo(() => {
    return routes
      .filter((route) => {
        if (!route.sidebar) {
          return false;
        }

        if (!route.authRequired) {
          return true;
        }

        if (!user) {
          return false;
        }

        if (route.authRequired === true) {
          return true;
        }

        const requiredPermissions = (
          Array.isArray(route.authRequired)
            ? route.authRequired
            : [route.authRequired]
        ) as (keyof SystemPermissions)[];

        const userHasAllRequiredPermissions = requiredPermissions.every(
          (permission) => user.systemPermissions[permission] === true
        );

        return userHasAllRequiredPermissions;
      })
      .sort((a, b) => {
        // Sort by order if available, otherwise alphabetically by translation key
        const orderA = a.sidebar?.order || 0;
        const orderB = b.sidebar?.order || 0;

        if (orderA === orderB) {
          return (a.sidebar?.translationKey || '').localeCompare(
            b.sidebar?.translationKey || ''
          );
        }

        return orderA - orderB;
      });
  }, [user]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 dark:border-gray-700 shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="text-xl font-semibold"
            color="foreground"
            underline="none"
          >
            Attraccess
          </Link>
          <Button
            variant="light"
            aria-label="Close sidebar"
            isIconOnly
            className="md:hidden"
            onPress={toggleSidebar}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-grow overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navigationItems.map((route, index) => (
              <Link
                key={index}
                href={route.path as string}
                className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                color="foreground"
                underline="none"
              >
                {route.sidebar?.icon}
                {tRoutes(route.sidebar?.translationKey || '')}
              </Link>
            ))}
          </nav>
        </div>

        {/* User section at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2" />
                <span>{user.username}</span>
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" aria-label="Settings" isIconOnly>
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="logout"
                    onPress={() => logout.mutateAsync()}
                    startContent={<LogOut />}
                  >
                    {t('logout')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
