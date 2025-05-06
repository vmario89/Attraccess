import { Menu } from 'lucide-react';
import { Button } from '@heroui/react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-4 md:hidden">
      <Button variant="light" aria-label="Menu" isIconOnly onPress={toggleSidebar} className="focus:outline-none">
        <Menu className="h-6 w-6" />
      </Button>
      <div className="text-lg font-semibold">Attraccess</div>
    </header>
  );
}
