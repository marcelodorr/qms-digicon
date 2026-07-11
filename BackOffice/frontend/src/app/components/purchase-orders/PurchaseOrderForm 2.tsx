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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';
import type { PurchaseOrder } from '../../../lib/purchase-orders';

const poSchema = z.object({
  poNumber: z.string().min(1, 'Número PO é obrigatório'),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  item: z.string().optional(),
  status: z.enum(['Cancelado', 'Em Processo', 'Enviado', 'Modificado']),
  comments: z.string().optional(),
});

export type PurchaseOrderFormValues = z.infer<typeof poSchema>;

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder;
  onSubmit: (data: PurchaseOrderFormValues) => void;
  onCancel: () => void;
  clients: { id: string; name: string }[];
}

export function PurchaseOrderForm({ initialData, onSubmit, onCancel, clients }: PurchaseOrderFormProps) {
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: initialData ? {
      poNumber: initialData.poNumber,
      clientId: initialData.clientId,
      item: initialData.item || '',
      status: initialData.status,
      comments: initialData.comments || '',
    } : {
      poNumber: '',
      clientId: '',
      item: '',
      status: 'Em Processo',
      comments: '',
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Ordem de Compra' : 'Nova Ordem de Compra'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="poNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número PO</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PO-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
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
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Item 001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Em Processo">Em Processo</SelectItem>
                      <SelectItem value="Enviado">Enviado</SelectItem>
                      <SelectItem value="Modificado">Modificado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Comentários adicionais..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {initialData && (
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 pt-4 border-t">
                <div>
                  <span className="font-medium block">Criado por</span>
                  {initialData.createdBy} em {format(new Date(initialData.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
                <div>
                  <span className="font-medium block">Última atualização</span>
                  {initialData.updatedBy} em {format(new Date(initialData.updatedAt), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Salvar PO
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
