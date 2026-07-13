import { apiRequest } from '@/services/http';
import type { MachineDto } from './types';

export const machinesApi = { list: () => apiRequest<MachineDto[]>('/api/machines') };
