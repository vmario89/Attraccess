import { Menu, Settings, LogOut } from 'lucide-react';
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
} from '@heroui/react';

export function Header() {
  const { logout } = useAuth();
  const { t } = useTranslations('header', {
    en,
    de,
  });

  const handleLogout = async () => {
    await logout.mutateAsync();
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button variant="light" aria-label="Menu" isIconOnly>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
              Resource Manager
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light" aria-label="Settings" isIconOnly>
                  <Settings className="h-6 w-6" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="logout"
                  onPress={handleLogout}
                  startContent={<LogOut />}
                >
                  {t('logout')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
