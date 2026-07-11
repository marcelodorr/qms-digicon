import React from 'react';
import { format } from 'date-fns';
import type { GridColDef } from '@mui/x-data-grid';
import { Cog, Edit2, PackagePlus, Printer, Search, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { QmsDataGrid } from '../ui/data-grid';
import type { ShippingLabel } from '../../../lib/shipping-labels';

interface ShippingLabelsListProps {
  data: ShippingLabel[];
  onNew: () => void;
  onEdit: (label: ShippingLabel) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onPrint: (label: ShippingLabel) => void;
  onConfigure: () => void;
  isLoading?: boolean;
  canEdit?: boolean;
}

export function ShippingLabelsList({
  data,
  onNew,
  onEdit,
  onDelete,
  onDeleteSelected,
  onPrint,
  onConfigure,
  isLoading = false,
  canEdit = true,
}: ShippingLabelsListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const canManage = canEdit;

  const filteredData = React.useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return data;

    return data.filter((item) =>
      item.partNumber.toLowerCase().includes(normalized) ||
      item.labelModel.toLowerCase().includes(normalized) ||
      item.printerName.toLowerCase().includes(normalized) ||
      String(item.rangeStart).includes(normalized) ||
      String(item.rangeEnd).includes(normalized)
    );
  }, [data, searchTerm]);

  const columns = React.useMemo<GridColDef<ShippingLabel>[]>(() => {
    const baseColumns: GridColDef<ShippingLabel>[] = [
      {
        field: 'partNumber',
        headerName: 'Part Number',
        flex: 1.2,
        minWidth: 220,
        renderCell: (params) => (
          <span className="font-mono font-medium">{params.value}</span>
        ),
      },
      {
        field: 'referenceDate',
        headerName: 'Data',
        width: 120,
        renderCell: (params) => (
          <span>{format(new Date(params.value), 'MM/yyyy')}</span>
        ),
      },
      {
        field: 'range',
        headerName: 'Range',
        width: 150,
        sortable: false,
        filterable: false,
        valueGetter: (_value, row) => `${row.rangeStart} - ${row.rangeEnd}`,
        renderCell: (params) => (
          <span className="font-mono">{params.row.rangeStart} - {params.row.rangeEnd}</span>
        ),
      },
      {
        field: 'labelModel',
        headerName: 'Modelo',
        width: 140,
        renderCell: (params) => (
          <span>{params.value === 'ASSY' ? 'ASSY' : 'DEFAULT'}</span>
        ),
      },
      {
        field: 'quantity',
        headerName: 'Qtd.',
        width: 90,
      },
      {
        field: 'printerName',
        headerName: 'Impressora',
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <span>{params.value || '-'}</span>
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Última Atualização',
        width: 190,
        renderCell: (params) => (
          <span>{format(new Date(params.value), 'dd/MM/yyyy HH:mm')}</span>
        ),
      },
    ];

    return [
      ...baseColumns,
      {
        field: 'actions',
        headerName: 'Ações',
        width: 150,
        sortable: false,
        filterable: false,
        align: 'right',
        headerAlign: 'right',
        disableExport: true,
        renderCell: (params) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => onPrint(params.row)}>
              <Printer className="h-4 w-4 text-slate-500" />
            </Button>
            {canManage && (
              <>
                <Button variant="ghost" size="icon" onClick={() => onEdit(params.row)}>
                  <Edit2 className="h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(params.row.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ];
  }, [canManage, onDelete, onEdit, onPrint]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Etiqueta de Embarque</h2>
          <p className="text-slate-500">Gerencie os registros e a impressão das etiquetas.</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onConfigure}
              title="Configurar etiqueta"
            >
              <Cog className="h-4 w-4" />
            </Button>
            <Button onClick={onNew} className="bg-red-600 hover:bg-red-700 text-white">
              <PackagePlus className="h-4 w-4 mr-2" />
              Nova Etiqueta
            </Button>
          </div>
        )}
      </div>

      <Card className="rounded-md">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por Part Number, modelo, range ou impressora..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="border-0 focus-visible:ring-0 h-8"
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        <QmsDataGrid
          rows={filteredData}
          columns={columns}
          loading={isLoading}
          emptyMessage="Nenhuma etiqueta encontrada."
          loadingMessage="Carregando etiquetas..."
          onDeleteSelected={canManage ? (ids) => onDeleteSelected(ids.map(String)) : undefined}
        />
      </div>
    </div>
  );
}
