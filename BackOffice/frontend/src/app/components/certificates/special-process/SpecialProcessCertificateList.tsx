import React from 'react';
import { QmsDataGrid } from '../../ui/data-grid';
import { Button } from '../../ui/button';
import { Edit2, Trash2, Plus, Search, FileOutput } from 'lucide-react';
import { Input } from '../../ui/input';
import { format } from 'date-fns';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

export interface SpecialProcessCertificate {
  id: string;
  code: string;
  issueDate: string; // ISO string
  clientId: string;
  partNumberId: string;
  approverId: string;
  poId: string;
  item: string;
  lotNumber: string;
  quantity: number;
  processId: string; // This is actually the Norm ID in our simplified model
  foundHardness?: string;
  heatTreatmentLot?: string;
  observations?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface SpecialProcessCertificateListProps {
  data: SpecialProcessCertificate[];
  clients: { id: string; name: string }[];
  partNumbers: { id: string; partNumber: string }[];
  norms: { id: string; specialProcess: string }[];
  purchaseOrders: { id: string; poNumber: string; item?: string | null }[];
  onEdit: (cert: SpecialProcessCertificate) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onNew: () => void;
  onGeneratePDF: (cert: SpecialProcessCertificate) => void;
  onGenerateCombinedPDF?: (ids: string[]) => void | Promise<void>;
  canEdit?: boolean;
}

export function SpecialProcessCertificateList({ 
  data, 
  clients,
  partNumbers,
  norms,
  purchaseOrders,
  onEdit, 
  onDelete, 
  onDeleteSelected,
  onNew,
  onGeneratePDF,
  onGenerateCombinedPDF,
  canEdit = true
}: SpecialProcessCertificateListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const canManage = canEdit;
  const allowSelection = Boolean(onGenerateCombinedPDF || canManage);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';
  const getPartNumber = (id: string) => partNumbers.find(p => p.id === id)?.partNumber || 'Unknown';
  const getProcessName = (id: string) => norms.find(n => n.id === id)?.specialProcess || 'Unknown';
  const getPurchaseOrder = (id: string) => purchaseOrders.find(po => po.id === id)?.poNumber || '-';

  const filteredData = data.filter(cert => 
    cert.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(cert.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedIds = React.useMemo(() => {
    if (!allowSelection) return [];
    if (selectionModel.type === "exclude") {
      const excluded = selectionModel.ids;
      return filteredData
        .map(cert => cert.id)
        .filter(id => id && !excluded.has(id));
    }
    return Array.from(selectionModel.ids).map(id => String(id));
  }, [allowSelection, filteredData, selectionModel]);

  const handleGenerateCombined = async () => {
    if (!onGenerateCombinedPDF) return;
    const uniqueIds = Array.from(new Set(selectedIds));
    if (uniqueIds.length < 2) return;
    await onGenerateCombinedPDF(uniqueIds);
  };


  const columns = React.useMemo<GridColDef<SpecialProcessCertificate>[]>(() => [
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
      field: 'clientId',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <span>{getClientName(params.row.clientId)}</span>
      ),
    },
    {
      field: 'partNumberId',
      headerName: 'Part Number',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <span>{getPartNumber(params.row.partNumberId)}</span>
      ),
    },
    {
      field: 'poId',
      headerName: 'PO',
      width: 140,
      renderCell: (params) => (
        <span>{getPurchaseOrder(params.row.poId)}</span>
      ),
    },
    {
      field: 'item',
      headerName: 'Item',
      width: 120,
      renderCell: (params) => (
        <span>{params.row.item || '-'}</span>
      ),
    },
    {
      field: 'processId',
      headerName: 'Processo',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <span>{getProcessName(params.row.processId)}</span>
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
  ], [onEdit, onDelete, onGeneratePDF, clients, partNumbers, norms, purchaseOrders, canManage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Certificados de Processo Especial</h2>
          <p className="text-slate-500">Gerencie e emita certificados de conformidade.</p>
        </div>
        <div className="flex items-center gap-2">
          {onGenerateCombinedPDF && (
            <Button
              variant="outline"
              onClick={handleGenerateCombined}
              disabled={selectedIds.length < 2}
              title={selectedIds.length < 2 ? "Selecione ao menos 2 certificados" : "Gerar PDF combinado"}
            >
              <FileOutput className="h-4 w-4 mr-2" />
              Gerar PDF combinado
            </Button>
          )}
          {canManage && (
            <Button onClick={onNew} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Certificado
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-md border max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Buscar por Código ou Cliente..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 h-8"
        />
      </div>

      <div className="rounded-md border bg-white">
        <QmsDataGrid
          rows={filteredData}
          columns={columns}
          emptyMessage="Nenhum certificado encontrado."
          enableSelection={allowSelection}
          rowSelectionModel={allowSelection ? selectionModel : undefined}
          onRowSelectionModelChange={allowSelection ? setSelectionModel : undefined}
          onDeleteSelected={canManage ? (ids) => onDeleteSelected(ids.map(String)) : undefined}
        />
      </div>
    </div>
  );
}
