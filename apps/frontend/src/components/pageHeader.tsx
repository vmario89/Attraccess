import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: ReactNode;
  badges?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  backTo,
  actions,
  badges,
  icon,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-gray-500 dark:text-gray-400">{icon}</span>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {badges && <div className="flex items-center mt-2">{badges}</div>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  );
}
