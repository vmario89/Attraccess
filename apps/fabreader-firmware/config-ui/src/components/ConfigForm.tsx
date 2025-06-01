import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Settings, Save, Eye, EyeOff, Shield } from 'lucide-react';
import { ConfigData } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ConfigFormProps {
  config: ConfigData | null;
  onSave: (data: ConfigData) => Promise<void>;
  isLoading: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ config, onSave, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConfigData>({
    defaultValues: config || {
      apiHostname: '',
      apiPort: '',
      configPagePassword: '',
    },
  });

  React.useEffect(() => {
    if (config) {
      reset(config);
    }
  }, [config, reset]);

  const onSubmit = async (data: ConfigData) => {
    await onSave(data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Input
              label="API Hostname"
              placeholder="e.g., api.example.com"
              fullWidth
              {...register('apiHostname', { required: 'API hostname is required' })}
              error={errors.apiHostname?.message}
            />

            <Input
              label="API Port"
              placeholder="e.g., 8080"
              fullWidth
              {...register('apiPort')}
              error={errors.apiPort?.message}
            />
          </motion.div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <Input
                label="Admin Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new admin password"
                fullWidth
                {...register('configPagePassword', {
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                error={errors.configPagePassword?.message}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4 mt-6">
        {saveSuccess && (
          <motion.div
            className="text-green-600 dark:text-green-400 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Settings saved successfully!
          </motion.div>
        )}
        <Button type="submit" isLoading={isLoading} disabled={isLoading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </form>
  );
};
