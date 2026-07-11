export interface User {
  id: string;
  matricula: string;
  name: string;
  password: string; // Plain text for mock, obviously hashed in real app
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'maintenance' | 'stopped';
  imageUrl: string;
}

export interface ProductionOrder {
  id: string;
  machineId: string;
  code: string; // e.g. OP-2023-001
  productName: string;
  targetQuantity: number;
}

export interface Operation {
  id: string;
  poId: string;
  name: string; // e.g., "Usinagem", "Acabamento"
  code: string;
}

export interface Defect {
  code: string;
  description: string;
}

export interface Cause {
  code: string;
  description: string;
}

export interface DefectRecord {
  id: string;
  userId: string;
  machineId: string;
  poId: string;
  operationId: string;
  defectCode: string;
  causeCode: string;
  quantity: number;
  quotaNumber: string;
  observation?: string;
  timestamp: string;
}

export type QuotaResponseType = 'numeric' | 'text' | 'list' | 'multiple' | 'binary';

export interface QuotaOption {
  value: string;
  label: string;
  status?: 'ok' | 'nok';
}

export interface Quota {
  id: string;
  operationId: string;
  number: string;
  description: string;
  responseType: QuotaResponseType;
  nominal?: number;
  tolerancePlus?: number;
  toleranceMinus?: number;
  unit?: string;
  sampleCount: number;
  measureImageUrl: string;
  instruction: string;
  options?: QuotaOption[];
}

export interface QuotaSampleResult {
  sampleIndex: number;
  value: string | number | string[];
  status: 'ok' | 'nok';
}

export interface QuotaMeasurement {
  quotaId: string;
  quotaNumber: string;
  description: string;
  responseType: QuotaResponseType;
  nominal?: number;
  tolerancePlus?: number;
  toleranceMinus?: number;
  unit?: string;
  samples: QuotaSampleResult[];
  overallStatus: 'ok' | 'nok' | 'pending';
}

export interface MeasurementRecord {
  id: string;
  userId: string;
  machineId: string;
  poId: string;
  operationId: string;
  measurements: QuotaMeasurement[];
  overallStatus: 'ok' | 'nok';
  timestamp: string;
}

export interface ScrapRecord {
  id: string;
  userId: string;
  machineId: string;
  poId: string;
  operationId: string;
  causeCode: string;
  quantity: number;
  observation: string;
  timestamp: string;
}

export const MOCK_USERS: User[] = [
  { id: 'u1', matricula: '12345', name: 'João Silva', password: '123' },
  { id: 'u2', matricula: '54321', name: 'Maria Santos', password: '123' },
];

export const MOCK_MACHINES: Machine[] = [
  { id: 'm1', name: 'Prensa Hidráulica 01', code: 'MQ-01', status: 'active', imageUrl: 'https://images.unsplash.com/photo-1733683296842-c5c32fe36a50?auto=format&fit=crop&w=600&q=80' },
  { id: 'm2', name: 'Torno CNC 03', code: 'MQ-02', status: 'active', imageUrl: 'https://images.unsplash.com/photo-1565439303660-2d3305541604?auto=format&fit=crop&w=600&q=80' },
  { id: 'm3', name: 'Injetora Plástica', code: 'MQ-03', status: 'maintenance', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80' },
  { id: 'm4', name: 'Robô de Solda', code: 'MQ-04', status: 'active', imageUrl: 'https://images.unsplash.com/photo-1531771686035-25f475954919?auto=format&fit=crop&w=600&q=80' },
];

export const MOCK_POS: ProductionOrder[] = [
  { id: 'po1', machineId: 'm1', code: 'OP-1001', productName: 'Painel Frontal A', targetQuantity: 500 },
  { id: 'po2', machineId: 'm1', code: 'OP-1002', productName: 'Suporte Lateral', targetQuantity: 200 },
  { id: 'po3', machineId: 'm2', code: 'OP-2001', productName: 'Eixo Principal', targetQuantity: 1000 },
  { id: 'po4', machineId: 'm4', code: 'OP-4001', productName: 'Chassi Base', targetQuantity: 50 },
];

export const MOCK_OPERATIONS: Operation[] = [
  { id: 'op1', poId: 'po1', name: 'Estampagem', code: '10' },
  { id: 'op2', poId: 'po1', name: 'Rebarbação', code: '20' },
  { id: 'op3', poId: 'po2', name: 'Corte', code: '10' },
  { id: 'op4', poId: 'po3', name: 'Torneamento', code: '10' },
  { id: 'op5', poId: 'po4', name: 'Soldagem', code: '10' },
];

export const MOCK_DEFECTS: Defect[] = [
  { code: 'D01', description: 'Risco Profundo' },
  { code: 'D02', description: 'Amassado' },
  { code: 'D03', description: 'Rebarba Excessiva' },
  { code: 'D04', description: 'Porosidade' },
  { code: 'D05', description: 'Falha de Pintura' },
  { code: 'D06', description: 'Medida Fora da Tol.' },
];

export const MOCK_QUOTAS: Quota[] = [
  { id: 'q1', operationId: 'op1', number: '1', description: 'Espessura da chapa', responseType: 'numeric', nominal: 3.00, tolerancePlus: 0.10, toleranceMinus: 0.10, unit: 'mm', sampleCount: 2, instruction: 'Encoste o paquímetro nas duas faces planas e digite o valor mostrado.', measureImageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80' },
  { id: 'q2', operationId: 'op1', number: '2', description: 'Aparência visual', responseType: 'binary', sampleCount: 1, instruction: 'Observe a peça inteira. Se houver amassado, risco forte ou trinca, marque NOK.', measureImageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', options: [{ value: 'OK', label: 'OK', status: 'ok' }, { value: 'NOK', label: 'NOK', status: 'nok' }] },
  { id: 'q3', operationId: 'op1', number: '3', description: 'Tipo de acabamento', responseType: 'list', sampleCount: 1, instruction: 'Compare a peça com o padrão aprovado e selecione o acabamento.', measureImageUrl: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=900&q=80', options: [{ value: 'fosco', label: 'Fosco', status: 'ok' }, { value: 'brilhante', label: 'Brilhante', status: 'ok' }, { value: 'manchado', label: 'Manchado', status: 'nok' }] },
  { id: 'q4', operationId: 'op2', number: '1', description: 'Raio de canto', responseType: 'numeric', nominal: 2.00, tolerancePlus: 0.30, toleranceMinus: 0.30, unit: 'mm', sampleCount: 1, instruction: 'Meça o raio no canto indicado pelo desenho.', measureImageUrl: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=900&q=80' },
  { id: 'q5', operationId: 'op2', number: '2', description: 'Observação da rebarba', responseType: 'text', sampleCount: 1, instruction: 'Digite uma observação curta. Exemplo: sem rebarba, pouca rebarba, muita rebarba.', measureImageUrl: 'https://images.unsplash.com/photo-1565439303660-2d3305541604?auto=format&fit=crop&w=900&q=80' },
  { id: 'q6', operationId: 'op4', number: '1', description: 'Diâmetro externo', responseType: 'numeric', nominal: 45.00, tolerancePlus: 0.02, toleranceMinus: 0.02, unit: 'mm', sampleCount: 3, instruction: 'Meça em três posições diferentes do eixo.', measureImageUrl: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=900&q=80' },
  { id: 'q7', operationId: 'op4', number: '2', description: 'Marcas encontradas', responseType: 'multiple', sampleCount: 1, instruction: 'Marque todas as condições que aparecem na peça.', measureImageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80', options: [{ value: 'sem_marca', label: 'Sem marca', status: 'ok' }, { value: 'risco', label: 'Risco', status: 'nok' }, { value: 'batida', label: 'Batida', status: 'nok' }, { value: 'oxido', label: 'Oxidação', status: 'nok' }] },
  { id: 'q8', operationId: 'op4', number: '3', description: 'Diâmetro furo central', responseType: 'numeric', nominal: 12.00, tolerancePlus: 0.01, toleranceMinus: 0.01, unit: 'mm', sampleCount: 1, instruction: 'Meça o furo com súbito ou paquímetro interno.', measureImageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80' },
  { id: 'q10', operationId: 'op5', number: '1', description: 'Comprimento do cordão', responseType: 'numeric', nominal: 80.00, tolerancePlus: 5.00, toleranceMinus: 5.00, unit: 'mm', sampleCount: 1, instruction: 'Meça do início ao fim do cordão de solda.', measureImageUrl: 'https://images.unsplash.com/photo-1531771686035-25f475954919?auto=format&fit=crop&w=900&q=80' },
  { id: 'q11', operationId: 'op5', number: '2', description: 'Cordão aprovado?', responseType: 'binary', sampleCount: 1, instruction: 'Compare com a peça padrão. Marque OK ou NOK.', measureImageUrl: 'https://images.unsplash.com/photo-1531771686035-25f475954919?auto=format&fit=crop&w=900&q=80', options: [{ value: 'OK', label: 'OK', status: 'ok' }, { value: 'NOK', label: 'NOK', status: 'nok' }] },
];

export const MOCK_CAUSES: Cause[] = [
  { code: 'C01', description: 'Desgaste da Ferramenta' },
  { code: 'C02', description: 'Matéria-prima com defeito' },
  { code: 'C03', description: 'Erro de Operação' },
  { code: 'C04', description: 'Falha na Máquina' },
  { code: 'C05', description: 'Temperatura Incorreta' },
];
