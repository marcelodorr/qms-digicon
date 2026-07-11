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
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

import { format } from 'date-fns';

const clientSchema = z.object({
  name: z.string().min(2, 'Nome do cliente é obrigatório'),
  address: z.string().min(5, 'Endereço é obrigatório'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: { 
    id: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
  } & ClientFormValues;
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
}

export function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      name: '',
      address: '',
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Embraer, Boeing..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo..." 
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
                Salvar Cliente
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
