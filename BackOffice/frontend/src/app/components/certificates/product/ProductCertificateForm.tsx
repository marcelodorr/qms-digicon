import React from 'react';
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
import { CalendarIcon, Save, FileOutput } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../ui/utils';

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
}

export interface POOption {
  id: string;
  poNumber: string;
  clientId: string;
  item?: string;
}

export interface AnalystOption {
  id: string;
  name: string;
}

const certificateSchema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  issueDate: z.date({ required_error: "Data de emissão obrigatória" }),
  partNumberId: z.string().min(1, "Part Number obrigatório"),
  clientId: z.string().min(1, "Cliente obrigatório"),
  lotNumber: z.string().min(1, "Lote obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0"),
  poId: z.string().min(1, "PO obrigatória"),
  item: z.string().default(''),
  serialNumber: z.string().min(1, "Serial Number obrigatório"),
  analystId: z.string().min(1, "Analista obrigatório"),
  type: z.string().default("N/A"),
});

export type ProductCertificateFormValues = z.infer<typeof certificateSchema>;

interface ProductCertificateFormProps {
  initialData?: any;
  clients: ClientOption[];
  partNumbers: PartNumberOption[];
  pos: POOption[];
  analysts: AnalystOption[];
  onSave: (data: ProductCertificateFormValues) => void;
  onSaveAndGenerate: (data: ProductCertificateFormValues) => void;
  onCancel: () => void;
}

export function ProductCertificateForm({
  initialData,
  clients,
  partNumbers,
  pos,
  analysts,
  onSave,
  onSaveAndGenerate,
  onCancel
}: ProductCertificateFormProps) {
  const form = useForm<ProductCertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: initialData || {
      code: '',
      issueDate: new Date(),
      partNumberId: '',
      clientId: '',
      lotNumber: '',
      quantity: 0,
      poId: '',
      item: '',
      serialNumber: '',
      analystId: '',
      type: 'N/A',
    },
  });

  const selectedPartNumberId = form.watch('partNumberId');
  const selectedClientId = form.watch('clientId');
  const selectedPoId = form.watch('poId');

  const selectedPartNumber = partNumbers.find(p => p.id === selectedPartNumberId);
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

  React.useEffect(() => {
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

  // Item should be a free-text field and must not be auto-filled from PO items.
  // Previously the form auto-selected/cleared `item` based on `itemOptions`.
  // That behavior was removed to allow arbitrary input.

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Certificado de Produto' : 'Novo Certificado de Produto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            
            {/* Bloco Código */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Certificado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CERT-PROD-2024-001" {...field} />
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

            {/* Bloco Part Number */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 bg-slate-50 p-4 rounded-md">
              <div className="md:col-span-3">
                <h3 className="font-semibold text-slate-700 mb-2">Dados do Produto</h3>
              </div>
              <FormField
                control={form.control}
                name="partNumberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o Part Number" />
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

              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input readOnly value={selectedPartNumber?.description || ''} className="bg-slate-100" />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Revisão</FormLabel>
                <FormControl>
                  <Input readOnly value={selectedPartNumber?.revision || ''} className="bg-slate-100" />
                </FormControl>
              </FormItem>
            </div>

            {/* Bloco Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="md:col-span-2">
                <h3 className="font-semibold text-slate-700 mb-2">Dados do Cliente</h3>
              </div>
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o Cliente" />
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

              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input readOnly value={selectedClient?.address || ''} className="bg-slate-100" />
                </FormControl>
              </FormItem>
            </div>

            {/* Bloco Dados do Pedido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div className="md:col-span-3">
                <h3 className="font-semibold text-slate-700 mb-2">Dados do Pedido</h3>
              </div>
              
              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: LOT-123" {...field} />
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

              <FormField
                control={form.control}
                name="poId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Cliente</FormLabel>
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
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SN-001 a SN-010" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Input placeholder="N/A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="analystId"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Analista (Responsável)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
