import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// Mock Certificate Types
const CERTIFICATE_TYPES = [
  { id: '1', label: 'Certificado de Qualidade' },
  { id: '2', label: 'Certificado de Processo Especial' },
  { id: '3', label: 'Certificado de Conformidade de Produto' },
];

const personSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  signatureUrl: z.string().optional(),
  certificates: z.array(
    z.object({
      certificateId: z.string().min(1, 'Selecione um certificado'),
      isDefault: z.boolean().default(false),
    })
  ).optional(),
});

export type PersonFormValues = z.infer<typeof personSchema>;

interface PersonFormProps {
  initialData?: { 
    id: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
  } & PersonFormValues;
  onSubmit: (data: PersonFormValues) => void;
  onCancel: () => void;
}

export function PersonForm({ initialData, onSubmit, onCancel }: PersonFormProps) {
  const [preview, setPreview] = useState<string | null>(initialData?.signatureUrl || null);

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      certificates: [],
      signatureUrl: undefined
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'certificates',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : null;
        if (!result) return;
        setPreview(result);
        form.setValue('signatureUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = (data: PersonFormValues) => {
    const finalData = { ...data, signatureUrl: preview ?? undefined };
    onSubmit(finalData);
  };

  const removeSignature = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    form.setValue('signatureUrl', undefined);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Pessoa' : 'Nova Pessoa'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="joao@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Signature Upload */}
            <div className="space-y-2">
              <FormLabel>Assinatura Digital</FormLabel>
              <div 
                {...getRootProps()} 
                className={`
                  border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}
                  ${preview ? 'border-solid border-slate-300' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                {preview ? (
                  <div className="relative w-full max-w-xs group">
                    <img 
                      src={preview} 
                      alt="Assinatura" 
                      className="h-32 object-contain mx-auto" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeSignature}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Clique ou arraste a imagem da assinatura</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG ou SVG (Max. 2MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Certificados Vinculados</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ certificateId: '', isDefault: false })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Certificado
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="text-sm text-slate-500 italic text-center py-4 border rounded-md bg-slate-50">
                  Nenhum certificado vinculado.
                </div>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-3 bg-slate-50 rounded-md border">
                    <FormField
                      control={form.control}
                      name={`certificates.${index}.certificateId`}
                      render={({ field }) => (
                        <FormItem className="flex-1 w-full">
                          <FormLabel className="text-xs">Tipo de Certificado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CERTIFICATE_TYPES.map(cert => (
                                <SelectItem key={cert.id} value={cert.id}>
                                  {cert.label}
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
                      name={`certificates.${index}.isDefault`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 space-y-0 gap-2 min-w-[140px] bg-white h-10">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs cursor-pointer">Assinante Padrão</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-500 h-10 w-10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
                Salvar Cadastro
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
