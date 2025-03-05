import React from 'react';
import { Header } from './header';

interface LayoutProps {
  children: React.ReactNode;
  noLayout?: boolean;
}

export function Layout({ children, noLayout }: LayoutProps) {
  if (noLayout) {
    return children;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        {children}
      </main>
    </div>
  );
}
