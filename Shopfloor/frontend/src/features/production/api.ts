import { apiRequest } from '@/services/http';
import type { OperationDto, ProductionOrderDto } from './types';
export const productionApi = {
  listOrders: (machineId:string) => apiRequest<ProductionOrderDto[]>(`/api/production-orders?machineId=${encodeURIComponent(machineId)}`),
  listOperations: (productionOrderId:string) => apiRequest<OperationDto[]>(`/api/operations?productionOrderId=${encodeURIComponent(productionOrderId)}`),
};
