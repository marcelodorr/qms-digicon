import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LogOut,
  Settings,
  ChevronRight,
  FileText,
  Copy,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { MobileSidebar } from './Sidebar';
import {
  clearErrorLogs,
  removeErrorLog,
  useErrorLogs,
  type ErrorLogEntry
} from '../../../lib/error-log';
import { toast } from '../../../lib/toast';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const getPageTitleKey = (path: string): string => {
  switch (path) {
    case '/dashboard-certificado': return 'sidebar.dashboard';
    case '/cadastro/pessoas': return 'sidebar.people';
    case '/cadastro/operacoes': return 'sidebar.operations';
    case '/cadastro/ordens-compra': return 'sidebar.purchaseOrders';
    case '/cadastro/normas': return 'sidebar.norms';
    case '/cadastro/clientes': return 'sidebar.clients';
    case '/cadastro/part-number': return 'sidebar.partNumber';
    case '/cadastro/normas-processo-especial': return 'sidebar.specialNorms';
    case '/cadastro/parametros': return 'sidebar.parameters';
    case '/certificados/qualidade': return 'sidebar.quality';
    case '/certificados/processo-especial': return 'sidebar.specialProcess';
    case '/certificados/conformidade-produto': return 'sidebar.productCompliance';
    case '/qualidade/dashboard-rnc': return 'sidebar.rncDashboard';
    case '/settings': return 'sidebar.settings';
    default: return '';
  }
};

export function Header({ currentPath, onNavigate, onLogout, user }: HeaderProps) {
  const { t } = useTranslation();
  const [now, setNow] = React.useState(() => new Date());
  const [logOpen, setLogOpen] = React.useState(false);
  const logs = useErrorLogs();
  const titleKey = getPageTitleKey(currentPath);
  const title = titleKey ? t(titleKey) : 'Digicon QMS';
  const formattedNow = React.useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);
  }, [now]);

  const formatTimestamp = React.useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  }, []);

  const buildLogText = React.useCallback((entry: ErrorLogEntry) => {
    const parts = [
      `Mensagem: ${entry.message}`,
      `Data: ${formatTimestamp(entry.timestamp)}`,
    ];
    if (entry.source) parts.push(`Fonte: ${entry.source}`);
    if (entry.path) parts.push(`Rota: ${entry.path}`);
    if (entry.detail) parts.push(`Detalhe: ${entry.detail}`);
    return parts.join("\n");
  }, [formatTimestamp]);

  const handleCopyLog = async (entry: ErrorLogEntry) => {
    try {
      await navigator.clipboard.writeText(buildLogText(entry));
      toast.success("Log copiado.");
    } catch {
      toast.error("Falha ao copiar log.");
    }
  };

  const handleClearLogs = () => {
    if (logs.length === 0) return;
    clearErrorLogs();
    toast.success("Logs removidos.");
  };

  React.useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full min-w-0 max-w-full items-center gap-4 overflow-hidden border-b bg-white px-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 md:px-6">
      <MobileSidebar currentPath={currentPath} onNavigate={onNavigate} />
      
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-4">
        {currentPath !== '/' && (
          <nav className="hidden min-w-0 items-center text-sm text-slate-500 dark:text-slate-400 md:flex">
            <span className="font-medium text-slate-900 dark:text-slate-100">Digicon</span>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="truncate font-medium text-slate-900 dark:text-slate-100">{title}</span>
          </nav>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <div className="hidden text-right text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400 sm:block">
          {formattedNow}
        </div>
        <Dialog open={logOpen} onOpenChange={setLogOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setLogOpen(true)}
            aria-label="Abrir logs de erro"
            title="Logs de erro"
          >
            <FileText className="h-5 w-5" />
            {logs.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Logs de erro</DialogTitle>
              <DialogDescription>
                Erros registrados no sistema durante o uso.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="space-y-3">
                {logs.length === 0 && (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-slate-500">
                    Nenhum erro registrado.
                  </div>
                )}
                {logs.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-md border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {entry.message}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTimestamp(entry.timestamp)}
                        </div>
                        {entry.source && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Fonte: {entry.source}
                          </div>
                        )}
                        {entry.path && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Rota: {entry.path}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLog(entry)}
                          aria-label="Copiar log"
                          title="Copiar log"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeErrorLog(entry.id)}
                          aria-label="Excluir log"
                          title="Excluir log"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {entry.detail && (
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {entry.detail}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="destructive"
                onClick={handleClearLogs}
                disabled={logs.length === 0}
              >
                Excluir todos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        



        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-red-100 text-red-700 font-medium">
                  {user?.name?.slice(0, 2).toUpperCase() || 'JD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Jane Doe'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'jane@digicon.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('header.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('header.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
