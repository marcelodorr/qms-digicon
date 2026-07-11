import React, { useCallback } from 'react';
import { QmsDataGrid } from '../ui/data-grid';
import { Button } from '../ui/button';
import { Edit2, Trash2, Plus, Search, Upload, FileDown } from 'lucide-react';
import { Input } from '../ui/input';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import type { GridColDef } from '@mui/x-data-grid';
import type { PartNumber } from '../../../lib/part-numbers';

interface PartNumbersListProps {
  data: PartNumber[];
  onEdit: (pn: PartNumber) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onNew: () => void;
  onImport: (file: File) => void;
  onDownloadTemplate: () => void;
  isLoading?: boolean;
  canEdit?: boolean;
}

export function PartNumbersList({ 
  data, 
  onEdit, 
  onDelete, 
  onDeleteSelected,
  onNew,
  onImport,
  onDownloadTemplate,
  isLoading = false,
  canEdit = true
}: PartNumbersListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const canManage = canEdit;

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

  const filteredData = data.filter(pn => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pn.partNumber.toLowerCase().includes(searchLower) ||
      pn.description.toLowerCase().includes(searchLower) ||
      pn.revision.toLowerCase().includes(searchLower) ||
      (pn.drawingRevision && pn.drawingRevision.toLowerCase().includes(searchLower)) ||
      (pn.clientName && pn.clientName.toLowerCase().includes(searchLower)) ||
      pn.updatedBy.toLowerCase().includes(searchLower)
    );
  });

  const columns = React.useMemo<GridColDef<PartNumber>[]>(() => {
    const baseColumns: GridColDef<PartNumber>[] = [
      {
        field: 'partNumber',
        headerName: 'Part Number',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <span className="font-mono font-medium">{params.value}</span>
        ),
      },
      {
        field: 'revision',
        headerName: 'Revisão',
        width: 140,
      },
      {
        field: 'drawingRevision',
        headerName: 'LP',
        width: 110,
        renderCell: (params) => (
          <span>{params.value || '-'}</span>
        ),
      },
      {
        field: 'clientName',
        headerName: 'Cliente',
        flex: 0.8,
        minWidth: 180,
        renderCell: (params) => (
          <span>{params.value || '-'}</span>
        ),
      },
      {
        field: 'description',
        headerName: 'Descrição',
        flex: 1.6,
        minWidth: 280,
        renderCell: (params) => (
          <span className="truncate" title={params.value}>
            {params.value}
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
  }, [onEdit, onDelete, canManage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cadastro de Part Number</h2>
          <p className="text-slate-500">Gerencie os Part Numbers e revisões.</p>
        </div>
        {canManage && (
          <Button onClick={onNew} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Part Number
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
                  {isDragActive ? "Solte o arquivo aqui..." : "Arraste o XML/XLSX aqui para importar"}
                </p>
                <div className="flex gap-2 mt-2">
                  <label htmlFor="pn-file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" className="pointer-events-none" disabled={!canManage}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar XML/XLSX
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
          placeholder="Buscar Part Number ou descrição..." 
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
          emptyMessage="Nenhum Part Number encontrado."
          loadingMessage="Carregando Part Numbers..."
          onDeleteSelected={canManage ? (ids) => onDeleteSelected(ids.map(String)) : undefined}
        />
      </div>
    </div>
  );
}
