import React from 'react';
import { QmsDataGrid } from '../../ui/data-grid';
import { Button } from '../../ui/button';
import { Edit2, Trash2, Plus, Search, FileOutput, Settings } from 'lucide-react';
import { Input } from '../../ui/input';
import { format } from 'date-fns';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "../../ui/sheet";
import { Label } from "../../ui/label";
import { toast } from '../../../../lib/toast';
import { fetchDocumentControl, saveDocumentControl, type DocumentControl } from '../../../../lib/document-control';

export interface ProductCertificate {
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
  poNumber?: string;
  item: string;
  serialNumber: string;
  analystId: string;
  analystName?: string;
  type: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface ProductCertificateListProps {
  data: ProductCertificate[];
  clients: { id: string; name: string }[];
  partNumbers: { id: string; partNumber: string }[];
  onEdit: (cert: ProductCertificate) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onNew: () => void;
  onGeneratePDF: (cert: ProductCertificate) => void;
  isLoading?: boolean;
  canEdit?: boolean;
}

export function ProductCertificateList({ 
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
}: ProductCertificateListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const canManage = canEdit;
  const [documentControl, setDocumentControl] = React.useState({
    documentNumber: "",
    documentRevision: "",
    documentDate: "",
    inspectedAccording: "",
  });
  const [docStatus, setDocStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [isSavingDoc, setIsSavingDoc] = React.useState(false);

  const getClientName = (cert: ProductCertificate) => {
    if (cert.clientName) return cert.clientName;
    return clients.find(c => c.id === cert.clientId)?.name || 'Unknown';
  };

  const getPartNumber = (cert: ProductCertificate) => {
    if (cert.partNumber) return cert.partNumber;
    return partNumbers.find(p => p.id === cert.partNumberId)?.partNumber || 'Unknown';
  };

  const filteredData = data.filter(cert => 
    cert.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(cert).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPartNumber(cert).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = React.useMemo<GridColDef<ProductCertificate>[]>(() => [
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
      field: 'poNumber',
      headerName: 'PO',
      width: 140,
      renderCell: (params) => (
        <span>{params.row.poNumber || '-'}</span>
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
      field: 'lotNumber',
      headerName: 'Lote',
      width: 140,
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
      renderCell: (params) => (
        <div className="flex flex-col text-xs text-slate-500">
          <span>{format(new Date(params.row.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
          <span>por {params.row.updatedBy}</span>
        </div>
      ),
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

  const normalizeDateInput = (value?: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return format(parsed, "yyyy-MM-dd");
  };

  const applyDocumentControl = (payload: DocumentControl) => {
    setDocumentControl({
      documentNumber: payload.documentNumber || "",
      documentRevision: payload.documentRevision || "",
      documentDate: normalizeDateInput(payload.documentDate),
      inspectedAccording: payload.inspectedAccording || "",
    });
  };

  const loadDocumentControl = React.useCallback(async () => {
    setDocStatus('loading');
    try {
      const data = await fetchDocumentControl();
      applyDocumentControl(data);
      setDocStatus('ready');
    } catch (error) {
      console.error("Erro ao carregar controle de documento:", error);
      toast.error("Falha ao carregar controle de documento.");
      setDocStatus('error');
    }
  }, []);

  React.useEffect(() => {
    loadDocumentControl();
  }, [loadDocumentControl]);

  const handleSaveDocument = async () => {
    if (!canManage) {
      toast.error("Sem permissão para editar este módulo.");
      return;
    }
    const documentNumber = documentControl.documentNumber.trim();
    const documentRevision = documentControl.documentRevision.trim();
    const documentDate = documentControl.documentDate.trim();
    const inspectedAccording = documentControl.inspectedAccording.trim();

    if (!documentNumber || !documentRevision || !documentDate || !inspectedAccording) {
      toast.error("Preencha todos os campos do controle de documento.");
      return;
    }

    setIsSavingDoc(true);
    try {
      const saved = await saveDocumentControl({
        documentNumber,
        documentRevision,
        documentDate: `${documentDate}T00:00:00`,
        inspectedAccording,
      });
      applyDocumentControl(saved);
      toast.success("Dados do documento atualizados!");
    } catch (error) {
      console.error("Erro ao salvar controle de documento:", error);
      toast.error("Falha ao atualizar controle de documento.");
    } finally {
      setIsSavingDoc(false);
    }
  };

  const isDocDisabled = !canManage || docStatus === 'loading' || isSavingDoc;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Certificados de Produto</h2>
          <p className="text-slate-800">Gerencie e emita certificados de produto acabado.</p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Controle Documento
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-[600px]">
                <SheetHeader className="px-[30px] py-[16px]">
                  <SheetTitle>Gestão de Controle de Documento</SheetTitle>
                  <SheetDescription>
                    Atualize esses valores quando o documento for revisado.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-[16px] px-[20px]">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="doc-code" className="text-left px-[15px] py-[5px]">
                      Código Documento
                    </Label>
                    <Input
                      id="doc-code"
                      value={documentControl.documentNumber}
                      onChange={(event) =>
                        setDocumentControl(prev => ({ ...prev, documentNumber: event.target.value }))
                      }
                      disabled={isDocDisabled}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="revision" className="text-right px-[15px] py-[0px]">
                      Revisão
                    </Label>
                    <Input
                      id="revision"
                      value={documentControl.documentRevision}
                      onChange={(event) =>
                        setDocumentControl(prev => ({ ...prev, documentRevision: event.target.value }))
                      }
                      disabled={isDocDisabled}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right px-[15px] py-[0px]">
                      Data
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={documentControl.documentDate}
                      onChange={(event) =>
                        setDocumentControl(prev => ({ ...prev, documentDate: event.target.value }))
                      }
                      disabled={isDocDisabled}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="norm" className="text-left px-[15px] py-[0px]">
                      Norma de Inspeção
                    </Label>
                    <Input
                      id="norm"
                      value={documentControl.inspectedAccording}
                      onChange={(event) =>
                        setDocumentControl(prev => ({ ...prev, inspectedAccording: event.target.value }))
                      }
                      disabled={isDocDisabled}
                      className="col-span-3 px-[12px] py-[4px]"
                    />
                  </div>
                </div>
                <SheetFooter>
                  <Button 
                    type="submit" 
                    className="bg-red-800 hover:bg-red-900 text-white"
                    onClick={handleSaveDocument}
                    disabled={isSavingDoc}
                  >
                    Salvar Alterações
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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
          placeholder="Buscar por Código, Cliente ou PN..." 
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
