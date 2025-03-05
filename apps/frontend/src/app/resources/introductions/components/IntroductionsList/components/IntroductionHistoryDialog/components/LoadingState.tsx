import { Spinner } from '@heroui/react';

export type LoadingStateProps = {
  className?: string;
};

export const LoadingState = ({ className = 'py-8' }: LoadingStateProps) => (
  <div className={`flex justify-center ${className}`}>
    <Spinner size="lg" />
  </div>
);
