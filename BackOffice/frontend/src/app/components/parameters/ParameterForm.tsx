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

import {
  SelectAutocomplete,
  type SelectAutocompleteOption,
} from '../ui/select';

import { fetchPartNumbers, type PartNumber } from '../../../lib/part-numbers';
import { fetchSpecialNorms, type SpecialNorm } from '../../../lib/special-norms';

import { format } from 'date-fns';

const parameterSchema = z.object({
  partNumber: z.string().min(1, 'Part Number é obrigatório'),
  process: z.string().min(1, 'Processo é obrigatório'),
  norm: z.string().min(1, 'Norma é obrigatória'),
  parameter: z.string().min(1, 'Parâmetro é obrigatório'),
  condition: z.string().optional(),
});

export type ParameterFormValues = z.infer<typeof parameterSchema>;

interface ParameterFormProps {
  initialData?: { 
    id: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    normaRevision?: string;
  } & ParameterFormValues;
  onSubmit: (data: ParameterFormValues) => void;
  onCancel: () => void;
}

export function ParameterForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: ParameterFormProps) {
  const [partNumbers, setPartNumbers] = React.useState<PartNumber[]>([]);
  const [specialNorms, setSpecialNorms] = React.useState<SpecialNorm[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = React.useState(false);

  const form = useForm<ParameterFormValues>({
    resolver: zodResolver(parameterSchema),
    defaultValues: initialData || {
      partNumber: '',
      process: '',
      norm: '',
      parameter: '',
      condition: '',
    },
  });

  const processValue = form.watch('process');
  const normValue = form.watch('norm');
  const isHeatTreating = /heat|tratamento t(é|e)rmico/i.test(processValue);

  const normalizeKey = (value?: string) => value?.trim().toLowerCase() ?? "";

  const revisionValue = React.useMemo(() => {
    if (processValue && normValue) {
      const match = specialNorms.find(
        norm =>
          normalizeKey(norm.specialProcess) === normalizeKey(processValue) &&
          normalizeKey(norm.specification) === normalizeKey(normValue)
      );
      if (match?.revision) {
        return match.revision;
      }
    }

    const sameSelection = normalizeKey(processValue) === normalizeKey(initialData?.process)
      && normalizeKey(normValue) === normalizeKey(initialData?.norm);
    if (sameSelection && initialData?.normaRevision) {
      return initialData.normaRevision.trim();
    }

    return "";
  }, [
    processValue,
    normValue,
    specialNorms,
    initialData?.normaRevision,
    initialData?.process,
    initialData?.norm,
  ]);

  React.useEffect(() => {
    let isActive = true;
    const loadOptions = async () => {
      setIsOptionsLoading(true);
      try {
        const [partNumberList, specialNormList] = await Promise.all([
          fetchPartNumbers(),
          fetchSpecialNorms(),
        ]);
        if (!isActive) return;
        setPartNumbers(partNumberList);
        setSpecialNorms(specialNormList);
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      } finally {
        if (isActive) {
          setIsOptionsLoading(false);
        }
      }
    };

    loadOptions();
    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!isHeatTreating) {
      form.setValue('condition', '');
    }
  }, [isHeatTreating, form]);

  const processOptions = React.useMemo(() => {
    const unique = new Map<string, string>();
    specialNorms.forEach((norm) => {
      const value = norm.specialProcess?.trim();
      if (value) {
        unique.set(value.toLowerCase(), value);
      }
    });

    const options = Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
    if (processValue && !unique.has(processValue.toLowerCase())) {
      options.unshift(processValue);
    }
    return options;
  }, [specialNorms, processValue]);

  const partNumberOptions = React.useMemo(() => {
    const options = partNumbers.map((pn) => pn.partNumber).filter(Boolean);
    const currentValue = form.getValues('partNumber');
    if (currentValue && !options.includes(currentValue)) {
      options.unshift(currentValue);
    }
    return options;
  }, [partNumbers, form]);

  const normOptions = React.useMemo(() => {
    if (!processValue) return [];
    const unique = new Map<string, string>();
    specialNorms
      .filter((norm) => norm.specialProcess?.trim() === processValue)
      .forEach((norm) => {
        const specification = norm.specification?.trim();
        if (specification) {
          unique.set(specification.toLowerCase(), specification);
        }
      });

    const options = Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
    const currentNorm = form.getValues('norm');
    if (currentNorm && !unique.has(currentNorm.toLowerCase())) {
      options.unshift(currentNorm);
    }

    return options;
  }, [specialNorms, processValue, form]);

  React.useEffect(() => {
    const currentNorm = form.getValues('norm');
    if (!processValue) {
      if (currentNorm) {
        form.setValue('norm', '');
      }
      return;
    }

    const valid = normOptions.some((option) => option === currentNorm);
    if (!valid && currentNorm) {
      form.setValue('norm', '');
    }
  }, [processValue, normOptions, form]);

  React.useEffect(() => {
    if (!processValue) return;
    if (normOptions.length === 1) {
      const onlyOption = normOptions[0];
      if (onlyOption && form.getValues('norm') !== onlyOption) {
        form.setValue('norm', onlyOption);
      }
    }
  }, [processValue, normOptions, form]);

  // mapeia para opções do Autocomplete
  const partNumberAutocompleteOptions: SelectAutocompleteOption[] =
    React.useMemo(
      () => partNumberOptions.map((pn) => ({ label: pn, value: pn })),
      [partNumberOptions],
    );

  const processAutocompleteOptions: SelectAutocompleteOption[] =
    React.useMemo(
      () => processOptions.map((p) => ({ label: p, value: p })),
      [processOptions],
    );

  const normAutocompleteOptions: SelectAutocompleteOption[] =
    React.useMemo(
      () => normOptions.map((n) => ({ label: n, value: n })),
      [normOptions],
    );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Parâmetro' : 'Novo Parâmetro'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* PART NUMBER */}
            <FormField
  control={form.control}
  name="partNumber"
  render={({ field }) => {
    const partNumberAutocompleteOptions: SelectAutocompleteOption[] =
      partNumberOptions.map((pn) => ({ label: pn, value: pn }));

    const selected =
      partNumberAutocompleteOptions.find(
        (opt) => opt.value === field.value,
      ) ?? null;

    return (
      <FormItem>
        <FormLabel>Part Number</FormLabel>
        <FormControl>
          <SelectAutocomplete
            options={partNumberAutocompleteOptions}
            value={selected}
            onChange={(_, newValue) =>
              field.onChange(newValue?.value ?? '')
            }
            disabled={isOptionsLoading}
            placeholder={
              isOptionsLoading
                ? 'Carregando...'
                : 'Selecione o Part Number'
            }
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>


            {/* PROCESSO */}
            <FormField
  control={form.control}
  name="process"
  render={({ field }) => {
    const processAutocompleteOptions: SelectAutocompleteOption[] =
      processOptions.map((p) => ({ label: p, value: p }));

    const selected =
      processAutocompleteOptions.find(
        (opt) => opt.value === field.value,
      ) ?? null;

    return (
      <FormItem>
        <FormLabel>Processo</FormLabel>
        <FormControl>
          <SelectAutocomplete
            options={processAutocompleteOptions}
            value={selected}
            onChange={(_, newValue) => {
              const value = newValue?.value ?? '';
              field.onChange(value);
              form.setValue('norm', ''); // limpa norma quando muda o processo
            }}
            disabled={isOptionsLoading}
            placeholder={
              isOptionsLoading
                ? 'Carregando...'
                : 'Selecione o processo'
            }
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>


            {/* NORMA */}
            <FormField
  control={form.control}
  name="norm"
  render={({ field }) => {
    const normAutocompleteOptions: SelectAutocompleteOption[] =
      normOptions.map((n) => ({ label: n, value: n }));

    const selected =
      normAutocompleteOptions.find(
        (opt) => opt.value === field.value,
      ) ?? null;

    const isDisabled = isOptionsLoading || !processValue;

    return (
      <FormItem>
        <FormLabel>Norma</FormLabel>
        <FormControl>
          <SelectAutocomplete
            options={normAutocompleteOptions}
            value={selected}
            onChange={(_, newValue) =>
              field.onChange(newValue?.value ?? '')
            }
            disabled={isDisabled}
            placeholder={
              !processValue
                ? 'Selecione o processo primeiro'
                : isOptionsLoading
                  ? 'Carregando...'
                  : 'Selecione a norma'
            }
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>


            {/* REVISÃO */}
            <FormItem>
              <FormLabel>Revisão</FormLabel>
              <FormControl>
                <Input
                  readOnly
                  value={revisionValue}
                  className="bg-slate-100"
                  placeholder="Automático"
                />
              </FormControl>
            </FormItem>

            <FormField
              control={form.control}
              name="parameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parâmetro</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Temperatura, Dureza..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Condição 
                    {!isHeatTreating && (
                      <span className="text-xs font-normal text-slate-400 ml-2">
                        (Apenas para Heat Treating)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isHeatTreating ? 'Ex: 100°C +/- 5' : 'N/A'}
                      {...field}
                      disabled={!isHeatTreating}
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
                  {initialData.createdBy} em{' '}
                  {format(new Date(initialData.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
                <div>
                  <span className="font-medium block">Última atualização</span>
                  {initialData.updatedBy} em{' '}
                  {initialData.updatedAt
                    ? format(new Date(initialData.updatedAt), 'dd/MM/yyyy HH:mm')
                    : '-'}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Salvar Parâmetro
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
