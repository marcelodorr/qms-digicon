import React, { useCallback } from 'react';
import { QmsDataGrid } from '../ui/data-grid';
import { Button } from '../ui/button';
import { Edit2, Trash2, Plus, Search, Upload, FileDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import type { PurchaseOrder } from '../../../lib/purchase-orders';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import type { GridColDef } from '@mui/x-data-grid';

interface PurchaseOrdersListProps {
  data: PurchaseOrder[];
  clients: { id: string; name: string }[];
  onEdit: (po: PurchaseOrder) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onNew: () => void;
  onImport: (file: File) => void;
  onDownloadTemplate: () => void;
  isLoading?: boolean;
  canEdit?: boolean;
}

export function PurchaseOrdersList({ 
  data, 
  clients,
  onEdit, 
  onDelete, 
  onDeleteSelected,
  onNew,
  onImport,
  onDownloadTemplate,
  isLoading = false,
  canEdit = true
}: PurchaseOrdersListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const canManage = canEdit;

  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.name || 'Cliente desconhecido';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!canManage) return;
    if (acceptedFiles.length > 0) {
      onImport(acceptedFiles[0]);
    }
  }, [onImport, canManage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    disabled: !canManage
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Cancelado': return 'destructive';
      case 'Enviado': return 'default';
      case 'Em Processo': return 'secondary';
      case 'Modificado': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColorClass = (status: string) => {
     switch (status) {
      case 'Enviado': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Modificado': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'Em Processo': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default: return '';
    }
  };

  const filteredData = data.filter(po => 
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (po.item || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (po.clientName || getClientName(po.clientId)).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = React.useMemo<GridColDef<PurchaseOrder>[]>(() => {
    const baseColumns: GridColDef<PurchaseOrder>[] = [
      {
        field: 'poNumber',
        headerName: 'Número PO',
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <span className="font-medium">{params.value}</span>
        ),
      },
      {
        field: 'clientId',
        headerName: 'Cliente',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <span>{params.row.clientName || getClientName(params.row.clientId)}</span>
        ),
      },
      {
        field: 'item',
        headerName: 'Item',
        flex: 1,
        minWidth: 160,
        renderCell: (params) => (
          <span>{params.value || '-'}</span>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 160,
        renderCell: (params) => (
          <Badge
            variant={getStatusBadgeVariant(params.value) as any}
            className={getStatusColorClass(params.value)}
          >
            {params.value}
          </Badge>
        ),
      },
      {
        field: 'comments',
        headerName: 'Comentário',
        flex: 1.2,
        minWidth: 220,
        renderCell: (params) => (
          <span className="truncate" title={params.value || '-'}>
            {params.value || '-'}
          </span>
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Última Atualização',
        flex: 1,
        minWidth: 220,
        renderCell: (params) => (
          <div className="flex flex-col text-xs text-slate-500">
            <span>{format(new Date(params.row.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
            <span>por {params.row.updatedBy}</span>
          </div>
        ),
      },
    ];

    if (!canManage) {
      return baseColumns;
    }

    return [
      ...baseColumns,
      {
        field: 'actions',
        headerName: 'Ações',
        width: 120,
        sortable: false,
        filterable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(params.row)}>
              <Edit2 className="h-4 w-4 text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(params.row.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ];
  }, [onEdit, onDelete, canManage, clients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ordens de Compra (PO)</h2>
          <p className="text-slate-500">Gerencie as ordens de compra dos clientes.</p>
        </div>
        {canManage && (
          <Button onClick={onNew} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nova PO
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3 bg-slate-50 border-dashed">
          <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div
                {...getRootProps()}
                className={`flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${isDragActive ? 'border-red-500 bg-red-100' : 'border-slate-300'} ${canManage ? '' : 'opacity-60'}`}
              >
                <input {...getInputProps()} />
                <p className="text-sm font-medium text-slate-700 text-center">
                  {isDragActive ? "Solte o arquivo aqui..." : "Arraste o XLSX aqui para importar"}
                </p>
                <div className="flex gap-2 mt-2">
                  <label htmlFor="po-file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" className="pointer-events-none" disabled={!canManage}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar XLSX
                    </Button>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="h-full border-l border-slate-300 hidden md:block" />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Modelos</span>
              <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
                <FileDown className="h-4 w-4 mr-2" />
                Baixar Template (XLSX)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-md border max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Buscar PO, cliente ou item..." 
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
          emptyMessage="Nenhuma PO encontrada."
          loadingMessage="Carregando POs..."
          onDeleteSelected={canManage ? (ids) => onDeleteSelected(ids.map(String)) : undefined}
        />
      </div>
    </div>
  );
}
