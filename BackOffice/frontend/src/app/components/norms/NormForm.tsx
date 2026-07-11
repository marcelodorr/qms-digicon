import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SelectAutocomplete, type SelectAutocompleteOption } from '../ui/select';
import type { Operation } from '../../../lib/operations';
import type { Client } from '../../../lib/clients';
import { format } from 'date-fns';

const normSchema = z.object({
  client: z.string().min(2, 'Cliente é obrigatório'),
  process: z.string().min(1, 'Processo é obrigatório'),
  standard: z.string(),
  revision: z.string(),
});

export type NormFormValues = z.infer<typeof normSchema>;

interface NormFormProps {
  initialData?: { 
    id: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
  } & NormFormValues;
  operations?: Operation[];
  clients?: Client[];
  onSubmit: (data: NormFormValues) => void;
  onCancel: () => void;
}

export function NormForm({ initialData, operations = [], clients = [], onSubmit, onCancel }: NormFormProps) {
  const form = useForm<NormFormValues>({
    resolver: zodResolver(normSchema),
    defaultValues: initialData || {
      client: '',
      process: '',
      standard: '',
      revision: '',
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Norma' : 'Nova Norma'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => {
                const clientOptions: SelectAutocompleteOption[] = clients.map(client => ({
                  label: client.name,
                  value: client.name,
                }));
                
                const selectedOption = clientOptions.find(opt => opt.value === field.value) || null;

                return (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <SelectAutocomplete
                        options={clientOptions}
                        value={selectedOption}
                        onChange={(_, newValue) => field.onChange(newValue?.value ?? '')}
                        placeholder="Selecione um cliente"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="process"
              render={({ field }) => {
                const processOptions: SelectAutocompleteOption[] = operations.map(op => ({
                  label: op.description,
                  value: op.description,
                }));
                
                const selectedOption = processOptions.find(opt => opt.value === field.value) || null;

                return (
                  <FormItem>
                    <FormLabel>Processo</FormLabel>
                    <FormControl>
                      <SelectAutocomplete
                        options={processOptions}
                        value={selectedOption}
                        onChange={(_, newValue) => field.onChange(newValue?.value ?? '')}
                        placeholder="Selecione uma operação"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="standard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Norma</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ISO 9001, ASTM E1417" {...field} />
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
                      <Input placeholder="Ex: Rev. A, 02" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {initialData && initialData.createdAt && (
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 pt-4 border-t">
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
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Salvar Norma
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
