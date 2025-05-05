import { PropsWithChildren } from 'react';
import { queryClient } from '../queryClient';
import { QueryClientProvider } from '@tanstack/react-query';

export function Providers(props: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}
