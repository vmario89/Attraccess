import React from 'react';

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Loading...
        </div>
      </div>
    </div>
  );
}
