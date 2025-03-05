import { Menu, Settings, LogOut, User } from 'lucide-react';
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

export function Header() {
  const { logout, user } = useAuth();
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
            <Link
              href="/"
              className="ml-4 text-xl font-semibold"
              color="foreground"
              underline="none"
            >
              Attraccess
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4 mr-1" />
                <span>{user.username}</span>
              </div>
            )}
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
