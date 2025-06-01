import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { LoginFormData } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useLogin } from '../services/queries';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const login = useLogin();

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    await login.mutateAsync({
      password: data.password,
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  return (
    <motion.form
      className="space-y-6 w-full max-w-md"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-4">
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter admin password"
            fullWidth
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {login.error && (
        <motion.div className="text-red-500 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {login.error.message}
        </motion.div>
      )}

      <Button type="submit" fullWidth isLoading={login.isPending}>
        Sign In
      </Button>
    </motion.form>
  );
};
