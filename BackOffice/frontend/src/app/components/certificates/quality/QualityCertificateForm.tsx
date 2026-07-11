import React, { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar } from '../../ui/calendar';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { QmsDataGrid } from '../../ui/data-grid';
import { CalendarIcon, Save, FileOutput, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../ui/utils';
import type { ControleElebDetail } from '../../../../lib/controle-eleb';

export interface ClientOption {
  id: string;
  name: string;
  address: string;
}

export interface PartNumberOption {
  id: string;
  partNumber: string;
  description: string;
  revision: string;
  drawingRevision?: string;
}

export interface POOption {
  id: string;
  poNumber: string;
}

export interface AnalystOption {
  id: string;
  name: string;
}

const OPERATIONS = [
  "Recebimento",
  "Inspeção Dimensional",
  "Ensaio de Dureza",
  "Ensaio de Tração",
  "Decapagem",
  "Passivação",
  "Embalagem Final",
  "Expedição",
  "Tratamento Térmico",
  "Usinagem",
  "Rebarbação"
];

const certificateSchema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  orderNumber: z.string().min(1, "Número da Ordem obrigatório"),
  issueDate: z.date({ required_error: "Data de emissão obrigatória" }),
  ocNumber: z.string().min(1, "OC obrigatória"),
  
  clientId: z.string().min(1, "Cliente obrigatório"),
  clientCode: z.string().optional(),
  
  partNumberId: z.string().min(1, "Part Number obrigatório"),
  lotNumber: z.string().min(1, "Lote obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  
  productValue: z.string().optional(),
  poId: z.string().optional(),
  poAnalysis: z.string().optional(),
  item: z.string().optional(),
  
  hasCdOrTicket: z.boolean().default(false),
  
  drawingSheet: z.string().default("1"),
  revision: z.string().optional(),
  drawingLpRevision: z.string().optional(),
  
  strippingPerformed: z.boolean().default(false),
  strippingSerial: z.string().optional(),
  
  serialNumber: z.string().min(1, "Serial Peça obrigatório"),
  
  observations: z.string().optional(),
  supplier: z.string().optional(),
  inspectionReport: z.string().optional(),
  mpCertificate: z.string().optional(),
  
  analystId: z.string().min(1, "Analista obrigatório"),
  
  shipmentType: z.string().min(1, "Selecione o tipo de envio"),
  type: z.string().default("N/A"),
  
  operations: z.array(z.string()).default([]),
});

export type QualityCertificateFormValues = z.infer<typeof certificateSchema>;

interface QualityCertificateFormProps {
  initialData?: any;
  clients: ClientOption[];
  partNumbers: PartNumberOption[];
  pos: POOption[];
  analysts: AnalystOption[];
  orderOptions?: string[];
  operationsOptions?: string[];
  orderDetails?: ControleElebDetail[];
  isOrderDetailsLoading?: boolean;
  showOrderDetails?: boolean;
  onOrderLookup?: (orderNumber: string) => Promise<Partial<QualityCertificateFormValues> | null>;
  onSave: (data: QualityCertificateFormValues) => void;
  onSaveAndGenerate: (data: QualityCertificateFormValues) => void;
  onCancel: () => void;
}

export function QualityCertificateForm({
  initialData,
  clients,
  partNumbers,
  analysts,
  orderOptions,
  operationsOptions,
  orderDetails,
  isOrderDetailsLoading,
  showOrderDetails = false,
  onOrderLookup,
  onSave,
  onSaveAndGenerate,
  onCancel
}: QualityCertificateFormProps) {
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const lastLookupRef = useRef<string>("");

  const form = useForm<QualityCertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: initialData || {
      code: '',
      orderNumber: '',
      issueDate: new Date(),
      ocNumber: '',
      clientId: '',
      clientCode: '',
      partNumberId: '',
      lotNumber: '',
      quantity: 0,
      productValue: '',
      poId: '',
      poAnalysis: '',
      item: '',
      hasCdOrTicket: false,
      drawingSheet: '1',
      revision: '',
      drawingLpRevision: '',
      strippingPerformed: false,
      strippingSerial: '',
      serialNumber: '',
      observations: '',
      supplier: 'Digicon',
      inspectionReport: 'N/A',
      mpCertificate: 'N/A',
      analystId: '',
      shipmentType: '',
      type: 'N/A',
      operations: []
    },
  });

  const selectedPartNumberId = form.watch('partNumberId');
  const operations = form.watch('operations');

  const orderDetailRows = useMemo(() => {
    if (!showOrderDetails || !orderDetails) return [];
    return orderDetails.map((detail, index) => ({
      id: index + 1,
      ...detail,
    }));
  }, [orderDetails, showOrderDetails]);

  const formatDetailDate = React.useCallback((value?: string) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "dd/MM/yyyy");
  }, []);

  const orderDetailColumns = useMemo(() => [
    {
      field: "dataEnvio",
      headerName: "Data de Envio",
      width: 140,
      valueFormatter: (params: { value?: string }) => formatDetailDate(params.value),
    },
    { field: "notaFiscalFaturada", headerName: "Nota Fiscal Faturada", width: 180 },
    { field: "ordemProducao", headerName: "Ordem de Produção", width: 160 },
    { field: "codigoItem", headerName: "Código do Item", width: 160 },
    { field: "ordemCompra", headerName: "Ordem de Compra", width: 160 },
    { field: "qtdLote", headerName: "Qnt. Lote", width: 120 },
    { field: "qtdEnviada", headerName: "Qnt. Enviada", width: 120 },
    { field: "qtdSaldo", headerName: "Qnt. Saldo", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
  ], [formatDetailDate]);

  const selectedPartNumber = partNumbers.find(p => p.id === selectedPartNumberId);
  React.useEffect(() => {
    if (!selectedPartNumberId) {
      if (form.getValues('drawingLpRevision')) {
        form.setValue('drawingLpRevision', '', { shouldValidate: true });
      }
      if (form.getValues('revision')) {
        form.setValue('revision', '', { shouldValidate: true });
      }
      return;
    }

    const lpRevision = selectedPartNumber?.drawingRevision?.trim() ?? '';
    if (lpRevision !== form.getValues('drawingLpRevision')) {
      form.setValue('drawingLpRevision', lpRevision, { shouldValidate: true });
    }

    const partNumberRevision = selectedPartNumber?.revision?.trim() ?? '';
    if (partNumberRevision !== form.getValues('revision')) {
      form.setValue('revision', partNumberRevision, { shouldValidate: true });
    }
  }, [form, selectedPartNumber, selectedPartNumberId]);

  const operationsList = operationsOptions && operationsOptions.length > 0 ? operationsOptions : OPERATIONS;
  const orderList = orderOptions && orderOptions.length > 0 ? orderOptions : [];

  const applyAutoValues = (values: Partial<QualityCertificateFormValues>) => {
    Object.entries(values).forEach(([key, value]) => {
      form.setValue(key as keyof QualityCertificateFormValues, value as never, { shouldValidate: true });
    });
  };

  const handleOrderLookup = async (value: string) => {
    if (!onOrderLookup) return;
    const trimmed = value.trim();
    if (!trimmed || trimmed === lastLookupRef.current) return;

    const result = await onOrderLookup(trimmed);
    if (!result) {
      lastLookupRef.current = "";
      return;
    }

    const resolvedOrder = typeof result.orderNumber === "string" && result.orderNumber.trim()
      ? result.orderNumber.trim()
      : trimmed;
    lastLookupRef.current = resolvedOrder;
    applyAutoValues(result);
  };

  const handleAddOperation = () => {
    if (selectedOperation && !operations.includes(selectedOperation)) {
      form.setValue('operations', [...operations, selectedOperation]);
      setSelectedOperation("");
    }
  };

  const handleRemoveOperation = (op: string) => {
    form.setValue('operations', operations.filter(o => o !== op));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl text-red-700">Gerador de Certificado de Qualidade</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form className="space-y-8">
            
            {/* Bloco 1: Identificação do Certificado e Ordem */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Certificado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CERT-2024-..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem Número</FormLabel>
                    {orderList.length > 0 ? (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          void handleOrderLookup(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a OP" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderList.map((op) => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input
                          placeholder="ORD-..."
                          {...field}
                          onBlur={(event) => {
                            field.onBlur();
                            void handleOrderLookup(event.target.value);
                          }}
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="ocNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OC Número</FormLabel>
                    <FormControl>
                      <Input placeholder="OC-..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bloco 2: Cliente e Produto */}
            <div className="border rounded-md p-4 bg-slate-50/50 space-y-4">
               <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                 Dados do Cliente e Produto
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Cliente</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasCdOrTicket"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4 bg-white h-10 mt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Existe CD ou chamado?</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="partNumberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Number</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partNumbers.map((pn) => (
                              <SelectItem key={pn.id} value={pn.id}>
                                {pn.partNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2">
                     <FormLabel>Descrição</FormLabel>
                     <Input readOnly value={selectedPartNumber?.description || ''} className="bg-slate-100 mt-2" />
                  </div>
               </div>
            </div>

            {/* Bloco 3: Detalhes Técnicos e Desenhos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <FormField
                  control={form.control}
                  name="drawingSheet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desenho (2D/MBD) - Folha</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="revision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revisão</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drawingLpRevision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desenho (LP) - Revisão</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Serial Peça</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* Bloco 4: Produção e Lote */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <FormField
                  control={form.control}
                  name="lotNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lote Número</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* Bloco 5: Documentação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="poAnalysis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Análise PO</FormLabel>
                      <FormControl>
                        <Input placeholder="Conforme..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="inspectionReport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relatório Inspeção</FormLabel>
                      <FormControl>
                        <Input placeholder="N/A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mpCertificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificado MP</FormLabel>
                      <FormControl>
                        <Input placeholder="N/A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>

             {/* Bloco 6: Decapagem */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                <FormField
                    control={form.control}
                    name="strippingPerformed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Decapagem realizada?</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {form.watch('strippingPerformed') && (
                    <FormField
                      control={form.control}
                      name="strippingSerial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Decapagem</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
             </div>

             {/* Bloco 7: Operações */}
             <div className="space-y-4 border p-4 rounded-md bg-slate-50">
               <h3 className="font-semibold text-slate-700">Operações Realizadas</h3>
               <div className="flex gap-2">
                 <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                   <SelectTrigger className="w-full md:w-[300px]">
                     <SelectValue placeholder="Selecione uma operação" />
                   </SelectTrigger>
                   <SelectContent>
                     {operationsList.map(op => (
                       <SelectItem key={op} value={op}>{op}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 <Button type="button" onClick={handleAddOperation} variant="secondary">
                   <Plus className="h-4 w-4 mr-2" />
                   Adicionar
                 </Button>
               </div>
               
               <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 border rounded bg-white">
                 {operations.length === 0 && <span className="text-muted-foreground text-sm italic">Nenhuma operação adicionada.</span>}
                 {operations.map((op, index) => (
                   <Badge key={index} variant="secondary" className="px-3 py-1 text-sm flex gap-2 items-center">
                     {op}
                     <button type="button" onClick={() => handleRemoveOperation(op)} className="hover:text-red-500">
                       <X className="h-3 w-3" />
                     </button>
                   </Badge>
                 ))}
               </div>
             </div>

             {/* Bloco 8: Envio e Analista */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="shipmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Envio</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Lote Completo">Lote Completo</SelectItem>
                          <SelectItem value="Lote Parcial">Lote Parcial</SelectItem>
                          <SelectItem value="Lote Complementar">Lote Complementar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analystId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analista Responsável</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o Analista" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {analysts.map((analyst) => (
                            <SelectItem key={analyst.id} value={analyst.id}>
                              {analyst.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               </div>

               <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observações gerais sobre o certificado..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            {showOrderDetails && (
              <div className="space-y-3 border rounded-md bg-white p-4">
                <div>
                  <h3 className="font-semibold text-slate-700">Detalhes da Ordem</h3>
                  <p className="text-xs text-slate-500">
                    Informações do Controle ELEB conforme a ordem selecionada.
                  </p>
                </div>
                <QmsDataGrid
                  rows={orderDetailRows}
                  columns={orderDetailColumns}
                  loading={Boolean(isOrderDetailsLoading)}
                  showToolbar={false}
                  emptyMessage="Nenhuma informação encontrada para esta ordem."
                  loadingMessage="Carregando detalhes da ordem..."
                />
              </div>
            )}

            {initialData && initialData.createdAt && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500 pt-4 border-t">
                <div>
                  <span className="font-medium block">Criado por</span>
                  {initialData.createdBy} em {format(new Date(initialData.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
                <div>
                  <span className="font-medium block">Última atualização</span>
                  {initialData.updatedBy} em {initialData.updatedAt ? format(new Date(initialData.updatedAt), 'dd/MM/yyyy HH:mm') : '-'}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={form.handleSubmit(onSave)}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Certificado
              </Button>
              <Button 
                type="button" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={form.handleSubmit(onSaveAndGenerate)}
              >
                <FileOutput className="h-4 w-4 mr-2" />
                Salvar e Gerar PDF
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
