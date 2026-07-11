import React from 'react';
import { QmsDataGrid } from '../../ui/data-grid';
import { Button } from '../../ui/button';
import { Edit2, Trash2, Plus, Search, FileOutput } from 'lucide-react';
import { Input } from '../../ui/input';
import { format } from 'date-fns';
import type { GridColDef } from '@mui/x-data-grid';

export interface QualityCertificate {
  id: string;
  code: string;
  issueDate: string; // ISO string
  partNumberId: string;
  partNumber?: string;
  clientId: string;
  clientName?: string;
  lotNumber: string;
  quantity: number;
  poId: string; // Assuming PO selection
  item: string;
  serialNumber: string;
  analystId: string;
  analystName?: string;
  type: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  // New fields
  orderNumber?: string;
  ocNumber?: string;
  clientCode?: string;
  productValue?: string;
  poAnalysis?: string;
  hasCdOrTicket?: boolean;
  drawingSheet?: string;
  revision?: string;
  drawingLpRevision?: string;
  strippingPerformed?: boolean;
  strippingSerial?: string;
  observations?: string;
  supplier?: string;
  inspectionReport?: string;
  mpCertificate?: string;
  shipmentType?: string;
  operations?: string[];
}

interface QualityCertificateListProps {
  data: QualityCertificate[];
  clients: { id: string; name: string }[];
  partNumbers: { id: string; partNumber: string }[];
  onEdit: (cert: QualityCertificate) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onNew: () => void;
  onGeneratePDF: (cert: QualityCertificate) => void;
  isLoading?: boolean;
  canEdit?: boolean;
}

export function QualityCertificateList({ 
  data, 
  clients,
  partNumbers,
  onEdit, 
  onDelete, 
  onDeleteSelected,
  onNew,
  onGeneratePDF,
  isLoading = false,
  canEdit = true
}: QualityCertificateListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const canManage = canEdit;

  const getClientName = (cert: QualityCertificate) => {
    if (cert.clientName) return cert.clientName;
    return clients.find(c => c.id === cert.clientId)?.name || 'Unknown';
  };
  const getPartNumber = (cert: QualityCertificate) => {
    if (cert.partNumber) return cert.partNumber;
    return partNumbers.find(p => p.id === cert.partNumberId)?.partNumber || 'Unknown';
  };

  const filteredData = data.filter(cert => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      cert.code.toLowerCase().includes(lowerSearch) ||
      getClientName(cert).toLowerCase().includes(lowerSearch) ||
      getPartNumber(cert).toLowerCase().includes(lowerSearch) ||
      cert.lotNumber.toLowerCase().includes(lowerSearch) ||
      cert.item.toLowerCase().includes(lowerSearch) ||
      (cert.ocNumber || '').toLowerCase().includes(lowerSearch) ||
      (cert.orderNumber || '').toLowerCase().includes(lowerSearch) ||
      (cert.analystName || '').toLowerCase().includes(lowerSearch) ||
      (cert.createdBy || '').toLowerCase().includes(lowerSearch) ||
      (cert.type || '').toLowerCase().includes(lowerSearch)
    );
  });

  const columns = React.useMemo<GridColDef<QualityCertificate>[]>(() => [
    {
      field: 'code',
      headerName: 'Código',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <span className="font-medium">{params.value}</span>
      ),
    },
    {
      field: 'issueDate',
      headerName: 'Data Emissão',
      width: 160,
      renderCell: (params) => (
        <span>{format(new Date(params.value), 'dd/MM/yyyy')}</span>
      ),
    },
    {
      field: 'partNumberId',
      headerName: 'Part Number',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <span>{getPartNumber(params.row)}</span>
      ),
    },
    {
      field: 'clientId',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <span>{getClientName(params.row)}</span>
      ),
    },
    {
      field: 'lotNumber',
      headerName: 'Lote',
      width: 140,
      renderCell: (params) => (
        <span>{params.value || '-'}</span>
      ),
    },
    {
      field: 'ocNumber',
      headerName: 'OC',
      width: 140,
      renderCell: (params) => (
        <span>{params.row.ocNumber || '-'}</span>
      ),
    },
    {
      field: 'item',
      headerName: 'Ordem',
      width: 140,
      renderCell: (params) => (
        <span>{params.value || '-'}</span>
      ),
    },
    {
      field: 'createdBy',
      headerName: 'Criado por',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <span>{params.value || '-'}</span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      width: 170,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <span>
            {Number.isNaN(date.getTime()) ? '-' : format(date, 'dd/MM/yyyy HH:mm')}
          </span>
        );
      },
    },
    {
      field: 'updatedAt',
      headerName: 'Última Atualização',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => {
        const date = new Date(params.row.updatedAt);
        return (
          <div className="flex flex-col text-xs text-slate-500">
            <span>{Number.isNaN(date.getTime()) ? '-' : format(date, 'dd/MM/yyyy HH:mm')}</span>
            <span>por {params.row.updatedBy || '-'}</span>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onGeneratePDF(params.row)} title="Gerar PDF">
            <FileOutput className="h-4 w-4 text-blue-600" />
          </Button>
          {canManage && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(params.row)}>
              <Edit2 className="h-4 w-4 text-slate-500" />
            </Button>
          )}
          {canManage && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(params.row.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ], [onEdit, onDelete, onGeneratePDF, clients, partNumbers, canManage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Certificados de Qualidade</h2>
          <p className="text-slate-500">Gerencie e emita certificados de qualidade completos.</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button onClick={onNew} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Certificado
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-md border max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Buscar em qualquer campo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 h-8"
        />
      </div>

      <div className="rounded-md border bg-white">
        <QmsDataGrid
          rows={filteredData}
          columns={columns}
          loading={isLoading}
          emptyMessage="Nenhum certificado encontrado."
          loadingMessage="Carregando certificados..."
          onDeleteSelected={canManage ? (ids) => onDeleteSelected(ids.map(String)) : undefined}
        />
      </div>
    </div>
  );
}
