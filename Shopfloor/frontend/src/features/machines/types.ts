export interface MachineDto {
  id: string;
  name: string;
  code: string;
  sector: string;
  status: 'active' | 'maintenance' | 'stopped';
  imageUrl: string;
}
