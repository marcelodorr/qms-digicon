import React from 'react';
import { 
  Trophy, 
  FileCheck, 
  FileCog, 
  Files, 
  TrendingUp, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag, 
  BookOpen, 
  ShoppingCart, 
  Building2, 
  Target, 
  Search, 
  Info,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import { format, startOfYear, isSameDay, startOfWeek, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { QmsDataGrid } from '../ui/data-grid';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { cn } from "../ui/utils"
import { fetchDashboardOverview, type DashboardOverview, type DashboardRecentActivity } from '../../../lib/dashboard';
import type { GridColDef } from '@mui/x-data-grid';

export function DashboardView() {
  const today = new Date();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: today,
  });
  const [overview, setOverview] = React.useState<DashboardOverview | null>(null);
  const [statsStatus, setStatsStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const clearFilters = () => {
    setDate({
      from: startOfMonth(today),
      to: today,
    });
  };

  const setPreset = (preset: 'today' | 'week' | 'month' | 'year') => {
    switch (preset) {
      case 'today':
        setDate({ from: today, to: today });
        break;
      case 'week':
        // Semana atual (começando no domingo) até hoje
        setDate({ from: startOfWeek(today, { weekStartsOn: 0 }), to: today });
        break;
      case 'month':
        // Mês atual (1º dia até hoje)
        setDate({ from: startOfMonth(today), to: today });
        break;
      case 'year':
        // Ano atual (1º jan até hoje)
        setDate({ from: startOfYear(today), to: today });
        break;
    }
  };

  // Helper to check if current range matches a preset
  const isPresetActive = (preset: 'today' | 'week' | 'month' | 'year') => {
    if (!date?.from || !date?.to) return false;
    
    switch (preset) {
      case 'today':
        return isSameDay(date.from, today) && isSameDay(date.to, today);
      case 'week':
        const startWeek = startOfWeek(today, { weekStartsOn: 0 });
        return isSameDay(date.from, startWeek) && isSameDay(date.to, today);
      case 'month':
        const startMonth = startOfMonth(today);
        return isSameDay(date.from, startMonth) && isSameDay(date.to, today);
      case 'year':
        const startYear = startOfYear(today);
        return isSameDay(date.from, startYear) && isSameDay(date.to, today);
      default:
        return false;
    }
  };

  React.useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      setStatsStatus('loading');
      try {
        const from = date?.from;
        const to = date?.to ?? date?.from;
        const data = await fetchDashboardOverview({ from, to, take: 5 });
        if (!isActive) return;
        setOverview(data);
        setStatsStatus('ready');
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
        if (!isActive) return;
        setOverview(null);
        setStatsStatus('error');
      }
    };

    loadStats();

    return () => {
      isActive = false;
    };
  }, [date?.from, date?.to]);

  const formatCount = (value?: number) => {
    if (statsStatus === 'loading') return "...";
    if (statsStatus === 'error') return "--";
    return new Intl.NumberFormat("pt-BR").format(value ?? 0);
  };

  const periodLabel = date?.from
    ? date.to
      ? `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`
      : format(date.from, "dd/MM/yyyy")
    : "Total";

  const recentActivities = overview?.recentActivities ?? [];
  const statsRows = React.useMemo(() => ([
    {
      id: 'partNumbers',
      label: 'Part Numbers',
      count: formatCount(overview?.stats.partNumbers),
      icon: Tag,
    },
    {
      id: 'normas',
      label: 'Normas',
      count: formatCount(overview?.stats.normas),
      icon: BookOpen,
    },
    {
      id: 'specialProcesses',
      label: 'Proc. Especial',
      count: formatCount(overview?.stats.specialProcesses),
      icon: FileCog,
    },
    {
      id: 'purchaseOrders',
      label: 'Ordens Compra',
      count: formatCount(overview?.stats.purchaseOrders),
      icon: ShoppingCart,
    },
    {
      id: 'clientes',
      label: 'Clientes',
      count: formatCount(overview?.stats.clientes),
      icon: Building2,
    },
  ]), [overview, statsStatus]);

  const statsColumns = React.useMemo<GridColDef[]>(() => [
    {
      field: 'label',
      headerName: 'Categoria',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const Icon = params.row.icon as React.ElementType;
        return (
          <span className="flex items-center gap-2 font-medium">
            <Icon className="h-4 w-4 text-slate-500" /> {params.value}
          </span>
        );
      },
    },
    {
      field: 'count',
      headerName: 'Qtd',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: (params) => (
        <span className="font-bold">{params.value}</span>
      ),
    },
  ], []);

  const getActivityBadgeClass = (type: string) => {
    switch (type) {
      case "quality":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "specialProcess":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
      case "productConformity":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200";
    }
  };

  const renderActivityTime = (activity: DashboardRecentActivity) => {
    if (!activity.date) return "--";
    const parsed = new Date(activity.date);
    if (Number.isNaN(parsed.getTime())) return "--";
    return format(parsed, "dd/MM/yyyy 'às' HH:mm:ss");
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard de Certificados de Qualidade</h2>
          <p className="text-slate-500">Visão geral do sistema e indicadores de performance</p>
        </div>
        <div className="flex items-center space-x-2">
           <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
             <span className="flex items-center gap-1">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               Sistema Operacional
             </span>
           </Badge>
        </div>
      </div>

      {/* Global Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mr-2 shrink-0">
          <Filter className="h-4 w-4" />
          Filtros Globais:
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 flex-1 overflow-x-auto">
            {/* Date Range Picker */}
            <div className="grid gap-2 shrink-0">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                    date.to ? (
                        <>
                        {format(date.from, "dd/MM/yyyy")} -{" "}
                        {format(date.to, "dd/MM/yyyy")}
                        </>
                    ) : (
                        format(date.from, "dd/MM/yyyy")
                    )
                    ) : (
                    <span>Selecione uma data</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={ptBR}
                />
                </PopoverContent>
            </Popover>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPreset('today')}
                    className={cn(
                        "text-slate-600 transition-all",
                        isPresetActive('today') && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900"
                    )}
                >
                    Hoje
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPreset('week')}
                    className={cn(
                        "text-slate-600 transition-all",
                        isPresetActive('week') && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900"
                    )}
                >
                    Semana
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPreset('month')}
                    className={cn(
                        "text-slate-600 transition-all",
                        isPresetActive('month') && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900"
                    )}
                >
                    Mês
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPreset('year')}
                    className={cn(
                        "text-slate-600 transition-all",
                        isPresetActive('year') && "bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900"
                    )}
                >
                    Ano
                </Button>
            </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center ml-auto shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
            title="Resetar Filtro"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* KPIs Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Certificados de Qualidade</CardTitle>
             <Trophy className="h-4 w-4 text-yellow-600" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatCount(overview?.certificates.quality)}</div>
             <p className="text-xs text-slate-500 mt-1">Período: {periodLabel}</p>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Cert. Processo Especial</CardTitle>
             <FileCog className="h-4 w-4 text-blue-600" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatCount(overview?.certificates.specialProcess)}</div>
             <p className="text-xs text-slate-500 mt-1">Período: {periodLabel}</p>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Cert. Conformidade</CardTitle>
             <PackageCheck className="h-4 w-4 text-purple-600" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatCount(overview?.certificates.productConformity)}</div>
             <p className="text-xs text-slate-500 mt-1">Período: {periodLabel}</p>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total de Certificados</CardTitle>
             <Files className="h-4 w-4 text-slate-600" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatCount(overview?.certificates.total)}</div>
             <p className="text-xs text-slate-500 mt-1">Período: {periodLabel}</p>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        
        {/* Recent Activity Section */}
        <Card className="col-span-1 lg:col-span-4 flex flex-col">
          <CardHeader className="pb-3">
             <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
               <div>
                 <CardTitle>Últimas Atividades</CardTitle>
                 <CardDescription>Gerencie e visualize os certificados recentes.</CardDescription>
               </div>
             </div>
          </CardHeader>

          <CardContent className="flex-1">
             <div className="space-y-4">
                {statsStatus === "loading" && (
                  <div className="text-sm text-slate-500">Carregando atividades...</div>
                )}

                {statsStatus === "error" && (
                  <div className="text-sm text-red-500">Falha ao carregar atividades.</div>
                )}

                {statsStatus === "ready" && recentActivities.length === 0 && (
                  <div className="text-sm text-slate-500">Nenhuma atividade encontrada.</div>
                )}

                {statsStatus === "ready" && recentActivities.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <User className="h-8 w-8 text-slate-400 bg-slate-100 rounded-full p-1.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-semibold text-slate-900">
                            Certificado {activity.code || "--"}
                          </span>
                          <Badge
                            className={`${getActivityBadgeClass(activity.type)} shadow-none font-normal`}
                          >
                            {activity.label || "Certificado"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{activity.actor || "Sistema"}</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {renderActivityTime(activity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card className="col-span-1 lg:col-span-3">
           <CardHeader>
             <CardTitle>Estatísticas do Sistema</CardTitle>
             <CardDescription>Status dos cadastros principais</CardDescription>
           </CardHeader>
           <CardContent>
             <QmsDataGrid
               rows={statsRows}
               columns={statsColumns}
               emptyMessage="Sem dados."
             />
           </CardContent>
        </Card>

      </div>

      {/* System Info Alert */}
      <Alert className="bg-slate-50 border-slate-200">
        <Info className="h-4 w-4 text-slate-500" />
        <AlertTitle className="text-slate-700">Informações do Sistema</AlertTitle>
        <AlertDescription className="text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
          <span>
            Última atualização: {lastUpdated ? format(lastUpdated, "dd/MM/yyyy 'às' HH:mm:ss") : "--"}
          </span>
          <span className="text-xs bg-slate-200 px-2 py-1 rounded">Próxima atualização: 15 min</span>
        </AlertDescription>
      </Alert>

    </div>
  );
}
