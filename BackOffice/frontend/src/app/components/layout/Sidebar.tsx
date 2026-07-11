import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  AlertTriangle, 
  FileText, 
  Settings, 
  ShoppingCart,
  Users, 
  BarChart3,
  HelpCircle,
  Menu,
  Database,
  Activity,
  BookOpen,
  ShieldCheck,
  SlidersHorizontal,
  Briefcase,
  Package,
  Award,
  FileBadge,
  FileCog,
  FileCheck,
  Tags,
  Tag,
  ChevronDown,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import { useModulePermissions } from '../../permissions/ModulePermissionsContext';
import { getModuleKeyByPath } from '../../../lib/module-permissions';
import { getEnvironment, getEnvironmentLabel, subscribeEnvironment } from '../../../lib/environment';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  children?: {
    label: string;
    path: string;
    icon?: React.ElementType;
  }[];
}

const menuItems: MenuItem[] = [
  { 
    icon: Database, 
    label: 'sidebar.registration', 
    children: [
      { icon: Activity, label: 'sidebar.operations', path: '/cadastro/operacoes' },
      { icon: ShoppingCart, label: 'sidebar.purchaseOrders', path: '/cadastro/ordens-compra' },
      { icon: BookOpen, label: 'sidebar.norms', path: '/cadastro/normas' },
      { icon: ShieldCheck, label: 'sidebar.specialNorms', path: '/cadastro/normas-processo-especial' },
      { icon: SlidersHorizontal, label: 'sidebar.parameters', path: '/cadastro/parametros' },
      { icon: Users, label: 'sidebar.people', path: '/cadastro/pessoas' },
      { icon: Briefcase, label: 'sidebar.clients', path: '/cadastro/clientes' },
      { icon: Package, label: 'sidebar.partNumber', path: '/cadastro/part-number' },
    ]
  },
  { 
    icon: Award, 
    label: 'sidebar.certificates', 
    children: [
      { icon: LayoutDashboard, label: 'sidebar.dashboard', path: '/dashboard-certificado' },
      { icon: FileBadge, label: 'sidebar.quality', path: '/certificados/qualidade' },
      { icon: FileCog, label: 'sidebar.specialProcess', path: '/certificados/processo-especial' },
      { icon: FileCheck, label: 'sidebar.productCompliance', path: '/certificados/conformidade-produto' },
    ]
  },
  {
    icon: AlertTriangle,
    label: 'sidebar.qualityMenu',
    children: [
      { icon: BarChart3, label: 'sidebar.rncDashboard', path: '/qualidade/dashboard-rnc' },
    ]
  },
  {
    icon: Tags,
    label: 'sidebar.labels',
    children: [
      { icon: Tag, label: 'sidebar.shippingLabel', path: '/etiquetas/etiqueta-embarque' },
    ]
  },
  { icon: Settings, label: 'sidebar.settings', path: '/settings' },
];

export function Sidebar({ className, currentPath, onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const { permissions } = useModulePermissions();
  const [menuQuery, setMenuQuery] = useState('');
  const [environment, setEnvironment] = useState(getEnvironment());
  // State to track open submenus. Key is the label of the parent menu item.
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'sidebar.registration': true, 
    'sidebar.certificates': false,
    'sidebar.qualityMenu': false,
    'sidebar.labels': false
  });
  const normalizedQuery = menuQuery
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const hasQuery = normalizedQuery.length > 0;

  const canViewPath = (path?: string) => {
    if (!path) return true;
    const moduleKey = getModuleKeyByPath(path);
    if (!moduleKey) return true;
    return permissions[moduleKey]?.canView ?? true;
  };

  const matchesLabel = (labelKey: string) => {
    if (!hasQuery) return true;
    const label = t(labelKey);
    const normalizedLabel = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return normalizedLabel.includes(normalizedQuery);
  };

  const filteredMenuItems = menuItems
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((child) => canViewPath(child.path));
        if (children.length === 0) {
          return null;
        }
        return { ...item, children };
      }
      return canViewPath(item.path) ? item : null;
    })
    .map((item) => {
      if (!item || !hasQuery) return item;
      if (item.children) {
        const parentMatches = matchesLabel(item.label);
        const children = parentMatches
          ? item.children
          : item.children.filter((child) => matchesLabel(child.label));
        if (children.length === 0 && !parentMatches) {
          return null;
        }
        return { ...item, children };
      }
      return matchesLabel(item.label) ? item : null;
    })
    .filter((item): item is MenuItem => Boolean(item));

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (item: MenuItem) => {
    return item.children?.some(child => child.path === currentPath);
  };

  useEffect(() => {
    const unsubscribe = subscribeEnvironment(setEnvironment);
    return unsubscribe;
  }, []);

  return (
    <div className={cn("pb-12 min-h-screen bg-slate-900 text-slate-100 flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1 rounded-tl-[0px] rounded-tr-[15px] rounded-bl-[0px] rounded-br-[0px]">
        <div className="px-6 py-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex flex-col items-end rounded-sm px-2 py-1 transition-colors hover:bg-slate-800/60"
            aria-label="Ir para a tela inicial"
          >
            <h2 className="text-xl font-bold tracking-tight text-white text-right">
              digicon<span className="text-red-500">QMS</span>
            </h2>
            <span className="text-[10px] tracking-wide text-slate-500">by TrackTy</span>
          </button>
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
            {getEnvironmentLabel(environment)}
          </span>
        </div>
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-2 py-1.5">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              value={menuQuery}
              onChange={(event) => setMenuQuery(event.target.value)}
              placeholder={t('sidebar.searchPlaceholder')}
              className="h-7 border-0 bg-transparent px-0 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-0"
              aria-label={t('sidebar.searchPlaceholder')}
            />
            {menuQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setMenuQuery('')}
                className="rounded-sm p-1 text-slate-400 hover:text-white"
                aria-label={t('sidebar.searchClear')}
                title={t('sidebar.searchClear')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {filteredMenuItems.length === 0 && (
              <div className="px-3 py-2 text-xs text-slate-500">
                {t('sidebar.searchEmpty')}
              </div>
            )}
            {filteredMenuItems.map((item, index) => {
              if (item.children) {
                // Determine if this group is active (contains the current path)
                const isActiveGroup = isChildActive(item);
                // Also open if it is in the openMenus state or if it contains the active item
                const isOpen = hasQuery || openMenus[item.label] || isActiveGroup;

                return (
                  <Collapsible
                    key={index}
                    open={isOpen}
                    onOpenChange={() => toggleMenu(item.label)}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between text-base font-medium text-slate-400 hover:text-white hover:bg-slate-800",
                          isActiveGroup && "text-white bg-slate-800"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {t(item.label)}
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-1 mt-1 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                      {item.children.map((child) => (
                        <Button
                          key={child.path}
                          variant="ghost"
                          onClick={() => onNavigate(child.path)}
                          className={cn(
                            "w-full justify-start text-sm font-normal h-9",
                            currentPath === child.path
                              ? "bg-red-600/10 text-red-400 hover:bg-red-600/20 hover:text-red-300"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          )}
                        >
                          {child.icon && <child.icon className="mr-3 h-4 w-4" />}
                          {t(child.label)}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <Button
                  key={item.path}
                  variant={currentPath === item.path ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-base font-medium",
                    currentPath === item.path 
                      ? "bg-slate-800 text-white hover:bg-slate-700 hover:text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                  onClick={() => onNavigate(item.path!)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {t(item.label)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer / Support section */}
      <div className="px-6 py-4 mt-auto border-t border-slate-800">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('sidebar.support')}
          </h3>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
              asChild
            >
              <a href="mailto:marcelo.dorr@trackty.com.br">
                <HelpCircle className="mr-3 h-5 w-5" />
                {t('sidebar.helpCenter')}
              </a>
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-center text-slate-500">
            <a 
              href="https://www.trackty.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-colors block"
            >
              © 2025 Trackty Tecnologia Ltda.
            </a>
            <span className="mt-1 block text-[10px] text-slate-600">v1.0.0</span>
          </div>
      </div>
    </div>
  );
}

export function MobileSidebar({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800 w-72 text-white">
        <Sidebar 
          currentPath={currentPath} 
          onNavigate={(path) => {
            onNavigate(path);
            setOpen(false);
          }} 
        />
      </SheetContent>
    </Sheet>
  );
}
