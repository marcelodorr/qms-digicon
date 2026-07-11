import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import { Textarea } from '../../ui/textarea';
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
import { CalendarIcon, Save, FileOutput } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../ui/utils';

// Interfaces for dependencies
export interface ClientOption {
  id: string;
  name: string;
  address: string;
}

export interface PartNumberOption {
  id: string;
  partNumber: string;
  description: string;
}

export interface POOption {
  id: string;
  poNumber: string;
  clientId: string;
  item?: string;
}

export interface ApproverOption {
  id: string;
  name: string;
}

export interface SpecialNormOption {
  id: string;
  specialProcess: string;
  specification: string;
  revision: string;
  linkedPartNumberIds?: string[]; // Mock link
  parameter?: string;
  condition?: string;
  parameterByPartNumberId?: Record<string, string>;
  conditionByPartNumberId?: Record<string, string>;
  revisionByPartNumberId?: Record<string, string>;
}

const processSchema = z.object({
  processId: z.string().min(1, "Processo obrigatório"),
  foundHardness: z.string().optional(),
  heatTreatmentLot: z.string().optional(),
});

const certificateSchema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  issueDate: z.date({ required_error: "Data de emissão obrigatória" }),
  clientId: z.string().min(1, "Cliente obrigatório"),
  partNumberId: z.string().min(1, "Part Number obrigatório"),
  approverId: z.string().min(1, "Aprovador obrigatório"),
  poId: z.string().min(1, "PO obrigatória"),
  item: z.string().default(''),
  lotNumber: z.string().min(1, "Lot Number obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  processes: z.array(processSchema).min(1, "Selecione pelo menos um processo"),
  observations: z.string().optional(),
});

export type SpecialProcessCertificateFormValues = z.infer<typeof certificateSchema>;

interface SpecialProcessCertificateFormProps {
  initialData?: any;
  clients: ClientOption[];
  partNumbers: PartNumberOption[];
  pos: POOption[];
  approvers: ApproverOption[];
  norms: SpecialNormOption[];
  allowMultipleProcesses?: boolean;
  onSave: (data: SpecialProcessCertificateFormValues) => void;
  onSaveAndGenerate: (data: SpecialProcessCertificateFormValues) => void;
  onSaveAndGenerateCombined: (data: SpecialProcessCertificateFormValues) => void;
  onCancel: () => void;
}

export function SpecialProcessCertificateForm({
  initialData,
  clients,
  partNumbers,
  pos,
  approvers,
  norms,
  allowMultipleProcesses = true,
  onSave,
  onSaveAndGenerate,
  onSaveAndGenerateCombined,
  onCancel
}: SpecialProcessCertificateFormProps) {
  const form = useForm<SpecialProcessCertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: initialData || {
      code: '',
      issueDate: new Date(),
      clientId: '',
      partNumberId: '',
      approverId: '',
      poId: '',
      item: '',
      lotNumber: '',
      quantity: 0,
      processes: [],
      observations: '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'processes',
  });

  const [selectedProcessToAdd, setSelectedProcessToAdd] = useState('');

  const selectedPartNumberId = form.watch('partNumberId');
  const selectedClientId = form.watch('clientId');
  const selectedPoId = form.watch('poId');
  const processes = useWatch({ control: form.control, name: 'processes' }) || [];

  // Filter norms based on selected Part Number
  const availableNorms = React.useMemo(() => {
    if (!selectedPartNumberId) return [];
    return norms.filter(n => n.linkedPartNumberIds?.includes(selectedPartNumberId));
  }, [norms, selectedPartNumberId]);

  const selectedProcessIds = React.useMemo(() => {
    const set = new Set<string>();
    processes.forEach(process => {
      if (process?.processId) set.add(process.processId);
    });
    return set;
  }, [processes]);

  const availableToAdd = React.useMemo(
    () => availableNorms.filter(norm => !selectedProcessIds.has(norm.id)),
    [availableNorms, selectedProcessIds]
  );

  const canAddProcess = allowMultipleProcesses || fields.length === 0;
  const processesErrorMessage =
    (form.formState.errors.processes as { message?: string } | undefined)?.message;

  useEffect(() => {
    if (!selectedPartNumberId) {
      if (processes.length > 0) {
        replace([]);
      }
      setSelectedProcessToAdd('');
      return;
    }

    const availableIds = new Set(availableNorms.map(norm => norm.id));
    const filtered = processes.filter(process => process?.processId && availableIds.has(process.processId));

    // Auto-add all available processes when Part Number is selected
    if (availableNorms.length > 0 && filtered.length === 0) {
      replace(
        availableNorms.map(norm => ({
          processId: norm.id,
          foundHardness: '',
          heatTreatmentLot: '',
        }))
      );
      return;
    }

    if (filtered.length !== processes.length) {
      replace(filtered);
    }

    if (selectedProcessToAdd && !availableIds.has(selectedProcessToAdd)) {
      setSelectedProcessToAdd('');
    }
  }, [availableNorms, processes, replace, selectedPartNumberId, selectedProcessToAdd]);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const filteredPos = React.useMemo(
    () => (selectedClientId ? pos.filter(po => po.clientId === selectedClientId) : []),
    [pos, selectedClientId]
  );
  const distinctPos = React.useMemo(() => {
    const seen = new Set<string>();
    return filteredPos.filter(po => {
      const key = po.poNumber.trim();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [filteredPos]);
  const selectedPo = React.useMemo(
    () => pos.find(po => po.id === selectedPoId),
    [pos, selectedPoId]
  );
  const selectedPoNumber = selectedPo?.poNumber.trim() ?? "";
  const itemOptions = React.useMemo(() => {
    if (!selectedPoNumber) return [];
    const items = filteredPos
      .filter(po => po.poNumber.trim() === selectedPoNumber)
      .map(po => po.item?.trim())
      .filter((item): item is string => Boolean(item));
    return Array.from(new Set(items));
  }, [filteredPos, selectedPoNumber]);
  const canCombinePdf = processes.length > 1;

  useEffect(() => {
    if (!selectedClientId) {
      if (selectedPoId) {
        form.setValue('poId', '');
      }
      if (form.getValues('item')) {
        form.setValue('item', '');
      }
      return;
    }

    if (selectedPoId && !filteredPos.some(po => po.id === selectedPoId)) {
      form.setValue('poId', '');
      form.setValue('item', '');
    }
  }, [filteredPos, form, selectedClientId, selectedPoId]);
  // Removed: do not auto-fill/auto-clear `item` from PO item options.

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Certificado' : 'Novo Certificado de Processo Especial'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Certificado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CERT-2023-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Emissão</FormLabel>
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
                              <span>Selecione uma data</span>
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
            </div>

            {/* Main Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
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
                    {selectedClient && (
                      <p className="text-xs text-slate-500 mt-1">{selectedClient.address}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partNumberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue('processId', ''); // Reset process when PN changes
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o Part Number" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partNumbers.map((pn) => (
                          <SelectItem key={pn.id} value={pn.id}>
                            {pn.partNumber} - {pn.description}
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
                name="poId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order (PO)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedClientId || distinctPos.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedClientId
                                ? "Selecione o cliente"
                                : distinctPos.length === 0
                                  ? "Nenhuma PO para este cliente"
                                  : "Selecione a PO"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {distinctPos.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.poNumber}
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
                name="approverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aprovador</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o aprovador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvers.map((appr) => (
                          <SelectItem key={appr.id} value={appr.id}>
                            {appr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <Input placeholder="Item (livre)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot. Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Lote..." {...field} />
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
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Processos */}
            <div className="border-t pt-4 space-y-4 bg-slate-50 p-4 rounded-md">
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <FormItem className="flex-1">
                  <FormLabel>Processo</FormLabel>
                  <Select
                    value={selectedProcessToAdd}
                    onValueChange={setSelectedProcessToAdd}
                    disabled={!selectedPartNumberId || availableToAdd.length === 0 || !canAddProcess}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedPartNumberId
                              ? "Selecione Part Number primeiro"
                              : availableToAdd.length === 0
                                ? "Todos os processos já foram adicionados"
                                : "Selecione o processo"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableToAdd.map((norm) => (
                        <SelectItem key={norm.id} value={norm.id}>
                          {norm.specialProcess}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!selectedProcessToAdd) return;
                    append({
                      processId: selectedProcessToAdd,
                      foundHardness: '',
                      heatTreatmentLot: '',
                    });
                    setSelectedProcessToAdd('');
                  }}
                  disabled={!selectedProcessToAdd || !canAddProcess}
                >
                  Adicionar
                </Button>
              </div>

              {processesErrorMessage && (
                <p className="text-sm text-red-600">{processesErrorMessage}</p>
              )}

              {fields.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum processo adicionado.</p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const processId = processes?.[index]?.processId || field.processId || '';
                    const normDetails = norms.find(n => n.id === processId);
                    const partNumberParam = selectedPartNumberId
                      ? normDetails?.parameterByPartNumberId?.[selectedPartNumberId]
                      : undefined;
                    const partNumberCondition = selectedPartNumberId
                      ? normDetails?.conditionByPartNumberId?.[selectedPartNumberId]
                      : undefined;
                    const partNumberRevision = selectedPartNumberId
                      ? normDetails?.revisionByPartNumberId?.[selectedPartNumberId]
                      : undefined;
                    const isHeatTreating = !!normDetails?.specialProcess
                      ?.toLowerCase()
                      .includes('heat treat');

                    return (
                      <div
                        key={field.id}
                        className="border border-slate-200 rounded-md p-4 bg-white space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-slate-800">
                              {normDetails?.specialProcess || 'Processo'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Norma: {normDetails?.specification || '-'} | Revisão: {partNumberRevision || normDetails?.revision || '-'}
                            </p>
                            {(partNumberParam || normDetails?.parameter) && (
                              <p className="text-xs text-slate-600 mt-1">
                                <span className="font-medium">Parâmetro:</span> {partNumberParam || normDetails?.parameter}
                              </p>
                            )}
                            {isHeatTreating && (partNumberCondition || normDetails?.condition) && (
                              <p className="text-xs text-orange-700 mt-1">
                                <span className="font-medium">Condição:</span> {partNumberCondition || normDetails?.condition}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => remove(index)}
                          >
                            Remover
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormItem>
                            <FormLabel>Norma</FormLabel>
                            <FormControl>
                              <Input
                                readOnly
                                value={normDetails?.specification || ''}
                                className="bg-slate-100"
                                placeholder="Automático"
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>Revisão</FormLabel>
                            <FormControl>
                              <Input
                                readOnly
                                value={partNumberRevision || normDetails?.revision || ''}
                                className="bg-slate-100"
                                placeholder="Automático"
                              />
                            </FormControl>
                          </FormItem>
                        </div>

                        {isHeatTreating && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-md border border-orange-100">
                            <div className="md:col-span-2">
                              <h4 className="text-sm font-semibold text-orange-800 mb-2">Dados do Tratamento Térmico</h4>
                            </div>
                            <FormField
                              control={form.control}
                              name={`processes.${index}.foundHardness`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dureza Encontrada</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: 45 HRC" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`processes.${index}.heatTreatmentLot`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Lote Tratamento Térmico</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: HT-2023-999" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-end gap-3 pt-4 border-t">
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
              <Button
                type="button"
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                onClick={form.handleSubmit(onSaveAndGenerateCombined)}
                disabled={!canCombinePdf}
                title={!canCombinePdf ? "Adicione pelo menos dois processos" : "Salvar e gerar PDF combinado"}
              >
                <FileOutput className="h-4 w-4 mr-2" />
                Salvar e Gerar PDF Combinado
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
