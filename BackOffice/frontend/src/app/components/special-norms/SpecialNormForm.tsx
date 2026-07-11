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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { History } from 'lucide-react';
import { fetchSpecialNormHistory, type SpecialNormHistoryItem } from '../../../lib/special-norms';
import { format } from 'date-fns';

const specialNormSchema = z.object({
  specialProcess: z.string().min(2, 'Processo Especial é obrigatório'),
  specification: z.string().min(2, 'Especificação é obrigatória'),
  revision: z.string().min(1, 'Revisão é obrigatória'),
  comment: z.string().optional(),
});

export type SpecialNormFormValues = z.infer<typeof specialNormSchema>;

interface SpecialNormFormProps {
  initialData?: { 
    id: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
  } & SpecialNormFormValues;
  onSubmit: (data: SpecialNormFormValues, observation?: string) => void;
  onCancel: () => void;
}

export function SpecialNormForm({ initialData, onSubmit, onCancel }: SpecialNormFormProps) {
  const form = useForm<SpecialNormFormValues>({
    resolver: zodResolver(specialNormSchema),
    defaultValues: initialData || {
      specialProcess: '',
      specification: '',
      revision: '',
      comment: '',
    },
  });

  const [observationOpen, setObservationOpen] = React.useState(false);
  const [observation, setObservation] = React.useState('');
  const [pendingValues, setPendingValues] = React.useState<SpecialNormFormValues | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyItems, setHistoryItems] = React.useState<SpecialNormHistoryItem[]>([]);
  const [historyStatus, setHistoryStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');

  const isEditing = Boolean(initialData?.id);

  const handleSubmit = (values: SpecialNormFormValues) => {
    if (!isEditing) {
      onSubmit(values);
      return;
    }
    setPendingValues(values);
    setObservationOpen(true);
  };

  const handleConfirmObservation = () => {
    if (!pendingValues) {
      setObservationOpen(false);
      return;
    }
    const note = observation.trim();
    onSubmit(pendingValues, note || undefined);
    setObservation('');
    setPendingValues(null);
    setObservationOpen(false);
  };

  const handleCancelObservation = () => {
    setObservation('');
    setPendingValues(null);
    setObservationOpen(false);
  };

  const handleObservationOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelObservation();
      return;
    }
    setObservationOpen(true);
  };

  const handleHistoryToggle = async (open: boolean) => {
    setHistoryOpen(open);
    if (!open || !initialData?.id) {
      return;
    }

    setHistoryStatus('loading');
    try {
      const items = await fetchSpecialNormHistory(initialData.id);
      setHistoryItems(items);
      setHistoryStatus('idle');
    } catch (error) {
      console.error("Erro ao carregar histórico da Norma Processo Especial:", error);
      setHistoryItems([]);
      setHistoryStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{initialData ? 'Editar Norma Processo Especial' : 'Nova Norma Processo Especial'}</CardTitle>
          {isEditing && (
            <Sheet open={historyOpen} onOpenChange={handleHistoryToggle}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  Historico
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 sm:max-w-[520px]">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle>Historico da Norma</SheetTitle>
                  <SheetDescription>
                    Acompanhe as alteracoes, observacoes e quem realizou cada edicao.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-6 pb-6 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
                  {historyStatus === 'loading' && (
                    <p className="text-sm text-slate-500">Carregando historico...</p>
                  )}
                  {historyStatus === 'error' && (
                    <p className="text-sm text-red-600">Falha ao carregar o historico.</p>
                  )}
                  {historyStatus === 'idle' && historyItems.length === 0 && (
                    <p className="text-sm text-slate-500">Nenhuma alteracao registrada.</p>
                  )}
                  {historyStatus === 'idle' && historyItems.length > 0 && (
                    <div className="space-y-3">
                      {historyItems.map((item) => (
                        <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                          <div className="text-sm font-medium text-slate-900">
                            {item.changes || 'Sem detalhes informados.'}
                          </div>
                          {item.observation && (
                            <p className="mt-2 text-xs text-slate-500">
                              Observacao: {item.observation}
                            </p>
                          )}
                          <div className="mt-3 text-xs text-slate-500">
                            {format(new Date(item.changedAt), 'dd/MM/yyyy HH:mm')} por {item.changedBy}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="specialProcess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processo Especial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tratamento Térmico, Pintura..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="specification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especificação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: AMS 2750" {...field} />
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
                      <Input placeholder="Ex: Rev. E" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
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
      <Dialog open={observationOpen} onOpenChange={handleObservationOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observacao da edicao</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Observacao (opcional)</label>
            <Textarea
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Descreva o que foi alterado..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCancelObservation}>
              Cancelar
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmObservation}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
