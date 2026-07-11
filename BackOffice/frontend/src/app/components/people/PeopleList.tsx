import React, { useCallback } from 'react';
import { QmsDataGrid } from '../ui/data-grid';
import { Button } from '../ui/button';
import { 
  Edit2, 
  Trash2, 
  FileDown, 
  Upload, 
  Plus, 
  Search,
  BadgeCheck
} from 'lucide-react';
import { Input } from '../ui/input';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import type { GridColDef } from '@mui/x-data-grid';
import type { Person } from '../../../lib/people';

interface PeopleListProps {
  data: Person[];
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onImport: (file: File) => void;
  onDownloadTemplate: () => void;
  onNew: () => void;
  isLoading?: boolean;
  canEdit?: boolean;
}

// Helper to map IDs to Labels (duplicating mock data for now, ideal to pass as prop)
const CERTIFICATE_LABELS: Record<string, string> = {
  '1': 'Qualidade',
  '2': 'Proc. Especial',
  '3': 'Conf. Produto',
};

export function PeopleList({ 
  data, 
  onEdit, 
  onDelete, 
  onDeleteSelected,
  onImport, 
  onDownloadTemplate,
  onNew,
  isLoading = false,
  canEdit = true
}: PeopleListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const canManage = canEdit;

  const filteredData = data.filter(person => {
    const email = person.email ?? '';
    return (
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
    noClick: true, // We'll trigger via button
    disabled: !canManage
  });

  const columns = React.useMemo<GridColDef<Person>[]>(() => {
    const baseColumns: GridColDef<Person>[] = [
      {
        field: 'name',
        headerName: 'Nome',
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <span className="font-medium">{params.value}</span>
        ),
      },
      {
        field: 'email',
        headerName: 'E-mail',
        flex: 1.2,
        minWidth: 220,
      },
      {
        field: 'signatureUrl',
        headerName: 'Assinatura',
        width: 150,
        sortable: false,
        renderCell: (params) =>
          params.value ? (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Cadastrada
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500 bg-slate-50">
              Pendente
            </Badge>
          ),
      },
      {
        field: 'certificates',
        headerName: 'Certificados',
        flex: 1.4,
        minWidth: 240,
        sortable: false,
        renderCell: (params) => (
          <div className="flex flex-wrap gap-1">
            {params.row.certificates.map((cert, idx) => (
              <Badge
                key={`${cert.certificateId}-${idx}`}
                variant="secondary"
                className={`text-xs ${cert.isDefault ? 'border-red-200 bg-red-50 text-red-700' : ''}`}
              >
                {CERTIFICATE_LABELS[cert.certificateId] || cert.certificateId}
                {cert.isDefault && " (Padrão)"}
              </Badge>
            ))}
          </div>
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cadastro de Pessoas</h2>
          <p className="text-slate-500">Gerencie assinaturas e permissões de certificados.</p>
        </div>
        {canManage && (
          <Button onClick={onNew} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nova Pessoa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Actions Card */}
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
                  <label htmlFor="file-upload" className="cursor-pointer">
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
          placeholder="Buscar por nome ou e-mail..." 
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
          emptyMessage="Nenhum registro encontrado."
          loadingMessage="Carregando pessoas..."
          onDeleteSelected={canManage ? (ids) => onDeleteSelected(ids.map(String)) : undefined}
        />
      </div>
    </div>
  );
}
