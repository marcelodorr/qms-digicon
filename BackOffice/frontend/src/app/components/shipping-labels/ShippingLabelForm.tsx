import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Check, ChevronsUpDown, Save, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { SHIPPING_LABEL_MODEL_OPTIONS, type ShippingLabelModelType } from '../../../lib/shipping-labels';

const shippingLabelSchema = z.object({
  partNumberId: z.string().min(1, 'Part Number é obrigatório'),
  labelModel: z.enum(['DEFAULT', 'ASSY'], { required_error: 'Modelo da etiqueta é obrigatório' }),
  referenceDate: z.date({ required_error: 'Data é obrigatória' }),
  rangeStart: z.string()
    .trim()
    .min(1, 'Número inicial é obrigatório')
    .regex(/^\d+$/, 'Informe um número inteiro válido'),
  rangeEnd: z.string()
    .trim()
    .min(1, 'Número final é obrigatório')
    .regex(/^\d+$/, 'Informe um número inteiro válido'),
}).refine((data) => Number(data.rangeEnd) >= Number(data.rangeStart), {
  message: 'O número final deve ser maior ou igual ao número inicial',
  path: ['rangeEnd'],
});

export type ShippingLabelFormValues = z.infer<typeof shippingLabelSchema>;
export type ShippingLabelSubmitAction = 'save' | 'saveAndClose' | 'saveAndPrint';

export interface ShippingLabelPartNumberOption {
  id: string;
  partNumber: string;
  description: string;
  revision: string;
}

export const DEFAULT_SHIPPING_LABEL_MODEL: ShippingLabelModelType = 'DEFAULT';

interface ShippingLabelFormProps {
  initialData?: {
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
  } & ShippingLabelFormValues;
  partNumbers: ShippingLabelPartNumberOption[];
  onSubmit: (data: ShippingLabelFormValues, action: ShippingLabelSubmitAction) => void | Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

type SearchableOption = {
  value: string;
  label: string;
  secondary?: string;
};

function SearchableSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  onChange,
  disabled = false,
}: {
  value: string;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate text-left">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.label} ${option.secondary ?? ''}`}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                <div className="min-w-0">
                  <div className="truncate">{option.label}</div>
                  {option.secondary ? (
                    <div className="truncate text-xs text-slate-500">{option.secondary}</div>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ShippingLabelForm({
  initialData,
  partNumbers,
  onSubmit,
  onCancel,
  isSaving = false,
}: ShippingLabelFormProps) {
  const form = useForm<ShippingLabelFormValues>({
    resolver: zodResolver(shippingLabelSchema),
    defaultValues: initialData || {
      partNumberId: '',
      labelModel: DEFAULT_SHIPPING_LABEL_MODEL,
      referenceDate: new Date(),
      rangeStart: '',
      rangeEnd: '',
    },
  });

  useEffect(() => {
    form.reset(initialData || {
      partNumberId: '',
      labelModel: DEFAULT_SHIPPING_LABEL_MODEL,
      referenceDate: new Date(),
      rangeStart: '',
      rangeEnd: '',
    });
  }, [form, initialData]);

  const selectedPartNumberId = form.watch('partNumberId');
  const rangeStart = form.watch('rangeStart');
  const rangeEnd = form.watch('rangeEnd');

  const selectedPartNumber = useMemo(
    () => partNumbers.find((item) => item.id === selectedPartNumberId),
    [partNumbers, selectedPartNumberId]
  );

  const partNumberOptions = useMemo<SearchableOption[]>(
    () => partNumbers.map((item) => ({
      value: item.id,
      label: item.partNumber,
      secondary: item.description || item.revision || undefined,
    })),
    [partNumbers]
  );

  const quantity = useMemo(() => {
    const start = Number(rangeStart);
    const end = Number(rangeEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end < start) {
      return '';
    }
    return String(end - start + 1);
  }, [rangeEnd, rangeStart]);

  const handleSubmit = (action: ShippingLabelSubmitAction) =>
    form.handleSubmit(async (values) => {
      await onSubmit(values, action);
    })();

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle>{initialData ? 'Editar Etiqueta de Embarque' : 'Nova Etiqueta de Embarque'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="partNumberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value}
                        options={partNumberOptions}
                        placeholder="Selecione o Part Number"
                        searchPlaceholder="Digite para filtrar..."
                        emptyMessage="Nenhum Part Number encontrado."
                        onChange={field.onChange}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labelModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo da Etiqueta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SHIPPING_LABEL_MODEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="referenceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn('w-full justify-between font-normal', !field.value && 'text-muted-foreground')}
                            disabled={isSaving}
                          >
                            {field.value ? format(field.value, 'MM/yyyy') : 'Selecione'}
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => date && field.onChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <Input
                  readOnly
                  value={selectedPartNumber?.description || ''}
                  className="mt-2 bg-slate-100"
                />
              </div>
              <div>
                <FormLabel>Revisão</FormLabel>
                <Input
                  readOnly
                  value={selectedPartNumber?.revision || ''}
                  className="mt-2 bg-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="rangeStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ex: 1"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rangeEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número Final</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ex: 20"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Quantidade</FormLabel>
                <Input readOnly value={quantity} className="mt-2 bg-slate-100 font-medium" />
              </div>
            </div>

            {initialData?.createdAt ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500 pt-4 border-t">
                <div>
                  <span className="font-medium block">Criado por</span>
                  {initialData.createdBy || 'Sistema'} em {format(new Date(initialData.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
                <div>
                  <span className="font-medium block">Última atualização</span>
                  {initialData.updatedAt ? format(new Date(initialData.updatedAt), 'dd/MM/yyyy HH:mm') : '-'}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="button" variant="outline" onClick={() => void handleSubmit('save')} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => void handleSubmit('saveAndClose')} disabled={isSaving}>
                <XCircle className="h-4 w-4 mr-2" />
                Salvar e Fechar
              </Button>
              <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => void handleSubmit('saveAndPrint')} disabled={isSaving}>
                Salvar e Imprimir
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
