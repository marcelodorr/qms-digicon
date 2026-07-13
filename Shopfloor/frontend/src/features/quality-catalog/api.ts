import { apiRequest } from '@/services/http';
export interface QualityCodeDto { id:string; code:string; description:string; }
export const qualityCatalogApi = {
  defects: () => apiRequest<QualityCodeDto[]>('/api/defects'),
  causes: () => apiRequest<QualityCodeDto[]>('/api/causes'),
};
