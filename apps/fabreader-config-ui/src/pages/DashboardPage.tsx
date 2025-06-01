import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ConfigData } from '../types';
import { StatusCard } from '../components/StatusCard';
import { ConfigForm } from '../components/ConfigForm';
import { useConfig, useSaveConfig } from '../services/queries';

export const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const { data: config, isLoading: isConfigLoading } = useConfig();

  const { mutateAsync: saveConfigMutation, isPending: isConfigSaving } = useSaveConfig();

  const handleSaveConfig = async (data: ConfigData) => {
    try {
      await saveConfigMutation(data);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login\" replace />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.h1
        className="text-2xl font-bold text-gray-900 dark:text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Device Dashboard
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StatusCard />

        <ConfigForm config={config || null} onSave={handleSaveConfig} isLoading={isConfigLoading || isConfigSaving} />
      </motion.div>
    </div>
  );
};
