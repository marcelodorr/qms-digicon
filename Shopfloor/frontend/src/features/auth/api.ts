import { apiRequest } from '@/services/http';
import type { AuthDto } from './types';

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<AuthDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};
