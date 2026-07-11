import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  fetchRncDashboardOverview,
  fetchRncDashboardEntries,
  fetchRncFilterOptions,
  type RncDashboardOverview,
  type RncDashboardQuery,
  type RncFilterOptions,
  type RncEntry,
} from '../../../lib/rnc-dashboard';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { QmsDataGrid } from "../ui/data-grid";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

const chartColors = ['#2563eb', '#f59e0b', '#16a34a', '#db2777', '#0ea5e9', '#14b8a6', '#7c3aed'];

const paretoLineColor = '#16a34a';
const gridColor = '#e2e8f0';
const labelColor = '#64748b';

const baseChartOptions: ApexOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    foreColor: labelColor,
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: gridColor,
    strokeDashArray: 4,
  },
  tooltip: {
    theme: 'light',
  },
  legend: {
    fontSize: '11px',
    labels: { colors: [labelColor] },
    itemMargin: { horizontal: 8, vertical: 4 },
  },
};

const fallbackPanel = (message: string) => (
  <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
    {message}
  </div>
);

const createInitialFilters = (): RncDashboardQuery => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  return { from, to };
};

const defaultFilterOptions: RncFilterOptions = {
  machines: [],
  operators: [],
  clients: [],
  reasons: [],
  causes: [],
  partNumbers: [],
  productionOrders: [],
  origins: [],
};

type FilterSelectProps = {
  label: string;
  value?: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

const FilterSelect = ({
  label,
  value,
  options,
  placeholder,
  onChange,
}: FilterSelectProps) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</p>
    <Select
      value={value ?? "__all__"}
      onValueChange={(val) => onChange(val === "__all__" ? "" : val)}
    >
      <SelectTrigger className="w-full border border-zinc-200 bg-white text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <SelectValue placeholder={placeholder ?? "Selecione ..."} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">Todos</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export function RncDashboardView() {
  const [overview, setOverview] = useState<RncDashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const summaryCards = useMemo(() => {
    if (!overview) return [];
    const items = [];
    if (overview.byMachine.length) {
      items.push({
        title: 'Máquina mais impactada',
        value: overview.byMachine[0].label,
        detail: `${overview.byMachine[0].count} itens`,
        color: chartColors[0],
      });
    }
    if (overview.byOperator.length) {
      items.push({
        title: 'Operador com mais registros',
        value: overview.byOperator[0].label,
        detail: `${overview.byOperator[0].count} itens`,
        color: chartColors[1],
      });
    }
    if (overview.byReason.length) {
      items.push({
        title: 'Motivo mais comum',
        value: overview.byReason[0].label,
        detail: `${overview.byReason[0].count} itens`,
        color: chartColors[2],
      });
    }
    return items;
  }, [overview]);

  const topCards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        title: 'Total de itens',
        value: String(overview.total ?? 0),
        detail: 'Total de não conformidades filtradas',
        color: chartColors[4],
      },
      ...summaryCards,
    ];
  }, [overview, summaryCards]);

  const causeChart = useMemo(() => {
    const list = overview?.byCause ?? [];
    if (!list.length) {
      return { series: [], labels: [] as string[] };
    }
    const sorted = [...list].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    if (rest.length) {
      const restTotal = rest.reduce((sum, item) => sum + item.count, 0);
      top.push({ label: 'Outros', count: restTotal });
    }
    return {
      series: top.map((item) => item.count),
      labels: top.map((item) => item.label),
    };
  }, [overview]);

  const machineChart = useMemo(() => {
    const data = (overview?.byMachine ?? []).slice(0, 10);
    return {
      series: [{ name: 'Itens', data: data.map((item) => item.count) }],
      categories: data.map((item) => item.label),
    };
  }, [overview]);

  const operatorChart = useMemo(() => {
    const data = (overview?.byOperator ?? []).slice(0, 10);
    return {
      series: [{ name: 'Itens', data: data.map((item) => item.count) }],
      categories: data.map((item) => item.label),
    };
  }, [overview]);

  const reasonChart = useMemo(() => {
    const data = (overview?.byReason ?? []).slice(0, 10);
    return {
      series: [{ name: 'Itens', data: data.map((item) => item.count) }],
      categories: data.map((item) => item.label),
    };
  }, [overview]);

  const paretoChart = useMemo(() => {
    const data = (overview?.paretoTop ?? []).slice(0, 10);
    return {
      series: [
        { name: 'Itens', type: 'column' as const, data: data.map((item) => item.count) },
        {
          name: 'Acumulado (%)',
          type: 'line' as const,
          data: data.map((item) => Number(item.cumulativePercent.toFixed(2))),
        },
      ],
      categories: data.map((item) => item.label),
    };
  }, [overview]);

  const [filters, setFilters] = useState<RncDashboardQuery>(createInitialFilters());
  const [pendingFilters, setPendingFilters] = useState<RncDashboardQuery>(createInitialFilters());
  const [filterOptions, setFilterOptions] = useState<RncFilterOptions>(defaultFilterOptions);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [rncRows, setRncRows] = useState<(RncEntry & { id: number })[]>([]);
  const [rncRowCount, setRncRowCount] = useState(0);
  const [rncPage, setRncPage] = useState(0);
  const [isRncLoading, setIsRncLoading] = useState(false);
  const rncPageSize = 10;

  const activeFilterCount = useMemo(() => {
    const defaults = createInitialFilters();
    const dateKey = (value?: Date) => value?.toISOString().split('T')[0] ?? '';
    const fields: Array<Exclude<keyof RncDashboardQuery, 'from' | 'to'>> = [
      'machine',
      'operator',
      'client',
      'reason',
      'cause',
      'partNumber',
      'productionOrder',
      'origin',
    ];

    return fields.reduce((count, field) => count + (filters[field] ? 1 : 0), 0)
      + (dateKey(filters.from) !== dateKey(defaults.from) ? 1 : 0)
      + (dateKey(filters.to) !== dateKey(defaults.to) ? 1 : 0);
  }, [filters]);

  const formatDateInput = (value?: Date) =>
    value ? value.toISOString().split('T')[0] : '';

  const formatDate = useCallback((value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('pt-BR');
  }, []);

  const handleFilterSelect = (
    field: Exclude<keyof RncDashboardQuery, 'from' | 'to'>,
    value: string
  ) => {
    setPendingFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setPendingFilters((prev) => ({
      ...prev,
      [field]: value ? new Date(value) : undefined,
    }));
  };

  const clearFilters = () => {
    const reset = createInitialFilters();
    setPendingFilters(reset);
    setFilters(reset);
  };

  const applyFilters = () => {
    setIsApplyingFilters(true);
    setFilters((prev) => ({
      ...prev,
      ...pendingFilters,
    }));
    setIsFiltersOpen(false);
  };

  const loadOverview = useCallback(async (query: RncDashboardQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRncDashboardOverview(query);
      setOverview(data);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao buscar o dashboard.');
    } finally {
      setIsLoading(false);
      setIsApplyingFilters(false);
    }
  }, []);

  useEffect(() => {
    loadOverview(filters);
  }, [filters, loadOverview]);

  useEffect(() => {
    setRncPage(0);
  }, [filters]);

  const rncColumns = useMemo(() => [
    { field: 'nonConformityDate', headerName: 'Data', width: 90, valueFormatter: (params: { value?: string }) => formatDate(params.value) },
    { field: 'machine', headerName: 'Máquina', flex: 0.9, minWidth: 80 },
    { field: 'operator', headerName: 'Operador', flex: 1, minWidth: 90 },
    { field: 'productionOrder', headerName: 'Ordem', flex: 0.9, minWidth: 85 },
    { field: 'partNumber', headerName: 'Part Number', flex: 1, minWidth: 100 },
    { field: 'nonConformityQuantity', headerName: 'Qtd.', width: 70 },
    { field: 'reason', headerName: 'Motivo', flex: 1.1, minWidth: 100 },
    { field: 'cause', headerName: 'Causa', flex: 1.1, minWidth: 100 },
    { field: 'client', headerName: 'Cliente', flex: 1, minWidth: 100 },
    { field: 'origin', headerName: 'Origem', flex: 1, minWidth: 90 },
  ], [formatDate]);

  const loadEntries = useCallback(async (query: RncDashboardQuery, page: number) => {
    setIsRncLoading(true);
    try {
      const data = await fetchRncDashboardEntries({
        ...query,
        page: page + 1,
        pageSize: rncPageSize,
      });
      setRncRowCount(data.total);
      setRncRows(
        data.items.map((item, index) => ({
          id: page * rncPageSize + index + 1,
          ...item,
        }))
      );
    } catch (err) {
      console.error("Erro ao carregar registros RNC:", err);
    } finally {
      setIsRncLoading(false);
    }
  }, [rncPageSize]);

  useEffect(() => {
    loadEntries(filters, rncPage);
  }, [filters, rncPage, loadEntries]);

  useEffect(() => {
    let active = true;
    const loadFilters = async () => {
      setIsFiltersLoading(true);
      try {
        const options = await fetchRncFilterOptions({
          from: pendingFilters.from,
          to: pendingFilters.to,
        });
        if (!active) return;
        setFilterOptions(options);
      } catch (err) {
        console.error("Erro ao carregar filtros:", err);
      } finally {
        if (active) {
          setIsFiltersLoading(false);
        }
      }
    };
    loadFilters();
    return () => {
      active = false;
    };
  }, [pendingFilters.from, pendingFilters.to]);

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden px-4 lg:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Qualidade</p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard RNC</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(true)}
          type="button"
          className="w-full justify-center gap-2 sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </header>

      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Configure e aplique para atualizar os gráficos e a tabela.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <span>De</span>
                <Input
                  type="date"
                  value={formatDateInput(pendingFilters.from)}
                  onChange={(event) => handleDateChange('from', event.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                <span>Até</span>
                <Input
                  type="date"
                  value={formatDateInput(pendingFilters.to)}
                  onChange={(event) => handleDateChange('to', event.target.value)}
                />
              </label>
            </div>

            {isFiltersLoading && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Carregando opções...</p>
            )}

            <div className="grid gap-3">
              <FilterSelect
                label="Máquina"
                value={pendingFilters.machine}
                options={filterOptions.machines}
                onChange={(value) => handleFilterSelect('machine', value)}
              />
              <FilterSelect
                label="Operador"
                value={pendingFilters.operator}
                options={filterOptions.operators}
                onChange={(value) => handleFilterSelect('operator', value)}
              />
              <FilterSelect
                label="Cliente"
                value={pendingFilters.client}
                options={filterOptions.clients}
                onChange={(value) => handleFilterSelect('client', value)}
              />
              <FilterSelect
                label="Motivo"
                value={pendingFilters.reason}
                options={filterOptions.reasons}
                onChange={(value) => handleFilterSelect('reason', value)}
              />
              <FilterSelect
                label="Causa"
                value={pendingFilters.cause}
                options={filterOptions.causes}
                onChange={(value) => handleFilterSelect('cause', value)}
              />
              <FilterSelect
                label="Part Number"
                value={pendingFilters.partNumber}
                options={filterOptions.partNumbers}
                onChange={(value) => handleFilterSelect('partNumber', value)}
              />
              <FilterSelect
                label="Ordem de Produção"
                value={pendingFilters.productionOrder}
                options={filterOptions.productionOrders}
                onChange={(value) => handleFilterSelect('productionOrder', value)}
              />
              <FilterSelect
                label="Origem"
                value={pendingFilters.origin}
                options={filterOptions.origins}
                onChange={(value) => handleFilterSelect('origin', value)}
              />
            </div>

            <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearFilters}
                type="button"
              >
                Limpar
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={applyFilters}
                type="button"
                disabled={isApplyingFilters || isLoading}
              >
                {isApplyingFilters ? "Aplicando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {isLoading && (
        <div className="rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Carregando indicadores…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-900/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {topCards.map((card) => (
              <div
                key={card.title}
                className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{card.title}</p>
                <p className="truncate text-xl font-semibold text-zinc-900 dark:text-zinc-100">{card.value}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{card.detail}</p>
                <div className="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: '100%', background: card.color }}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="min-w-0 space-y-4">
            <div className="min-w-0 space-y-4">
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Por máquina</p>
                {overview?.byMachine?.length ? (
                  <div className="min-w-0 overflow-hidden">
                    <Chart
                      type="bar"
                      height={220}
                      width="100%"
                      series={machineChart.series}
                      options={{
                        ...baseChartOptions,
                        colors: [chartColors[0]],
                        xaxis: {
                          categories: machineChart.categories,
                          labels: { rotate: -35, style: { fontSize: '11px' } },
                        },
                        yaxis: { labels: { style: { fontSize: '11px' } } },
                        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
                      }}
                    />
                  </div>
                ) : (
                  fallbackPanel("Nenhuma máquina com RNC.")
                )}
              </div>
              <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Por operador</p>
                {overview?.byOperator?.length ? (
                  <div className="min-w-0 overflow-hidden">
                    <Chart
                      type="bar"
                      height={220}
                      width="100%"
                      series={operatorChart.series}
                      options={{
                        ...baseChartOptions,
                        colors: [chartColors[1]],
                        xaxis: {
                          categories: operatorChart.categories,
                          labels: { rotate: -35, style: { fontSize: '11px' } },
                        },
                        yaxis: { labels: { style: { fontSize: '11px' } } },
                        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
                      }}
                    />
                  </div>
                ) : (
                  fallbackPanel("Dados de operadores indisponíveis.")
                )}
              </div>
            </div>

            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Principais razões</p>
                {overview?.byReason?.length ? (
                  <div className="min-w-0 overflow-hidden">
                    <Chart
                      type="bar"
                      height={240}
                      width="100%"
                      series={reasonChart.series}
                      options={{
                        ...baseChartOptions,
                        colors: [chartColors[2]],
                        xaxis: {
                          categories: reasonChart.categories,
                          labels: { rotate: -35, style: { fontSize: '11px' } },
                        },
                        yaxis: { labels: { style: { fontSize: '11px' } } },
                        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
                      }}
                    />
                  </div>
                ) : (
                  fallbackPanel("Nenhuma razão registrada.")
                )}
              </div>
              <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Causas</p>
                {overview?.byCause?.length ? (
                  <div className="min-w-0 overflow-hidden">
                    <Chart
                      type="donut"
                      height={240}
                      width="100%"
                      series={causeChart.series}
                      options={{
                        ...baseChartOptions,
                        labels: causeChart.labels,
                        colors: chartColors,
                        legend: {
                          ...baseChartOptions.legend,
                          position: 'bottom',
                          horizontalAlign: 'center',
                        },
                        plotOptions: {
                          pie: {
                            donut: { size: '60%' },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  fallbackPanel("Nenhuma causa registrada.")
                )}
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Top Pareto</p>
              {overview?.paretoTop?.length ? (
                <div className="min-w-0 overflow-hidden">
                  <Chart
                    type="line"
                    height={280}
                    width="100%"
                    series={paretoChart.series}
                    options={{
                      ...baseChartOptions,
                      colors: [chartColors[3], paretoLineColor],
                      xaxis: {
                        categories: paretoChart.categories,
                        labels: { rotate: -35, style: { fontSize: '11px' } },
                      },
                      yaxis: [
                        { labels: { style: { fontSize: '11px' } } },
                        {
                          opposite: true,
                          max: 100,
                          labels: {
                            style: { fontSize: '11px' },
                            formatter: (value) => `${value}%`,
                          },
                        },
                      ],
                      stroke: { width: [0, 3], curve: 'smooth' },
                      plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
                      markers: { size: 4, colors: [paretoLineColor], strokeColors: '#fff' },
                      legend: {
                        ...baseChartOptions.legend,
                        position: 'top',
                        horizontalAlign: 'right',
                      },
                    }}
                  />
                </div>
              ) : (
                fallbackPanel("Nenhum item no Pareto.")
              )}
            </div>
          </div>

          </section>

          <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="px-5 pt-4">
              <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Registros RNC</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Mostrando 10 registros por pagina.
              </p>
            </div>
            <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden">
              <QmsDataGrid
                rows={rncRows}
                columns={rncColumns}
                loading={isRncLoading}
                rowCount={rncRowCount}
                paginationMode="server"
                disableColumnMenu
                disableColumnSorting
                paginationModel={{ page: rncPage, pageSize: rncPageSize }}
                onPaginationModelChange={(model) => setRncPage(model.page)}
                showToolbar={false}
                emptyMessage="Nenhum registro de RNC encontrado."
                loadingMessage="Carregando registros..."
                sx={{
                  minWidth: 0,
                  width: "100%",
                  margin: 0,
                  "& .MuiDataGrid-main": {
                    minWidth: 0,
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    overflowX: "auto",
                  },
                }}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
