import { apiRequest } from '@/services/http';
import type { OperationDto, ProductionOrderDto } from './types';
export const productionApi = {
  listOrders: (machineId:string, plannedDate:string, search:string) => apiRequest<ProductionOrderDto[]>(`/api/production-orders?machineId=${encodeURIComponent(machineId)}&plannedDate=${encodeURIComponent(plannedDate)}&search=${encodeURIComponent(search)}`),
  listOperations: (productionOrderId:string) => apiRequest<OperationDto[]>(`/api/operations?productionOrderId=${encodeURIComponent(productionOrderId)}`),
};
