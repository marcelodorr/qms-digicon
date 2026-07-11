import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { HomeView } from './components/home/HomeView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';
import { PeopleView } from './components/people/PeopleView';
import { OperationsView } from './components/operations/OperationsView';
import { NormsView } from './components/norms/NormsView';
import { ClientsView } from './components/clients/ClientsView';
import { PartNumbersView } from './components/part-numbers/PartNumbersView';
import { SpecialNormsView } from './components/special-norms/SpecialNormsView';
import { ParametersView } from './components/parameters/ParametersView';
import { PurchaseOrdersView } from './components/purchase-orders/PurchaseOrdersView';
import { SpecialProcessCertificateView } from './components/certificates/special-process/SpecialProcessCertificateView';
import { ProductCertificateView } from './components/certificates/product/ProductCertificateView';
import { QualityCertificateView } from './components/certificates/quality/QualityCertificateView';
import { RncDashboardView } from './components/quality/RncDashboardView';
import { ShippingLabelsView } from './components/shipping-labels/ShippingLabelsView';
import { AccessDenied } from './components/common/AccessDenied';
import { ModulePermissionsProvider } from './permissions/ModulePermissionsContext';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import '../lib/i18n';
import { logoutSession, pingSession, type AuthSession } from '../lib/users';
import { logErrorFromUnknown, addErrorLog } from '../lib/error-log';
import {
  buildPermissionMap,
  fetchUserModulePermissions,
  MODULE_KEYS,
  type ModuleKey,
} from '../lib/module-permissions';

function App() {
  const storageKey = 'digicon-qms-auth';
  const defaultUser = {
    name: 'Jane Doe',
    email: 'jane@digicon.com',
    role: 'Admin',
    avatar: undefined as string | undefined,
    username: undefined as string | undefined,
  };
  const getStoredAuth = () => {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, user: defaultUser, sessionId: null as string | null };
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return { isAuthenticated: false, user: defaultUser, sessionId: null as string | null };
      }

      const parsed = JSON.parse(raw);
      const storedUser = parsed?.user;
      const storedSessionId = typeof parsed?.sessionId === 'string' && parsed.sessionId.trim().length > 0
        ? parsed.sessionId
        : null;
      if (!storedUser || typeof storedUser.name !== 'string' || typeof storedUser.email !== 'string' || !storedSessionId) {
        return { isAuthenticated: false, user: defaultUser, sessionId: null as string | null };
      }

      return {
        isAuthenticated: true,
        user: {
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role || 'User',
          avatar: typeof storedUser.avatar === 'string' ? storedUser.avatar : undefined,
          username: storedUser.username || storedUser.name,
        },
        sessionId: storedSessionId,
      };
    } catch {
      return { isAuthenticated: false, user: defaultUser, sessionId: null as string | null };
    }
  };

  const [auth, setAuth] = useState(() => getStoredAuth());
  const { isAuthenticated, user, sessionId } = auth;
  const [modulePermissions, setModulePermissions] = useState(() => buildPermissionMap());
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleNavigate = (path: string) => {
    if (path !== currentPath) {
      setIsNavigating(true);
      setPendingPath(path);
      navigate(path);
    }
  };

  const handleLogin = (account: AuthSession) => {
    const nextUser = {
      name: account.user.fullName,
      email: account.user.email,
      role: account.user.type,
      avatar: account.user.image ?? undefined,
      username: account.user.username,
    };

    setAuth({ isAuthenticated: true, user: nextUser, sessionId: account.sessionId });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify({ user: nextUser, sessionId: account.sessionId }));
    }
  };

  const handleLogout = async () => {
    if (sessionId) {
      try {
        await logoutSession();
      } catch (error) {
        console.warn("Erro ao encerrar sessão:", error);
      }
    }

    navigate('/');
    setAuth({ isAuthenticated: false, user: defaultUser, sessionId: null });
    setModulePermissions(buildPermissionMap());
    setIsPermissionsLoading(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !sessionId) {
      return;
    }

    let isActive = true;
    const runPing = async () => {
      if (!isActive) return;
      try {
        await pingSession();
      } catch (error) {
        console.warn("Erro ao atualizar sessão:", error);
      }
    };

    runPing();
    const intervalId = window.setInterval(runPing, 60_000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, sessionId]);

  useEffect(() => {
    if (!pendingPath) {
      return;
    }

    if (location.pathname === pendingPath) {
      const timer = window.setTimeout(() => {
        setIsNavigating(false);
        setPendingPath(null);
      }, 350);

      return () => window.clearTimeout(timer);
    }
  }, [location.pathname, pendingPath]);

  useEffect(() => {
    if (!isAuthenticated) {
      setModulePermissions(buildPermissionMap());
      setIsPermissionsLoading(false);
      return;
    }

    const username = user.username || user.name;
    if (!username) {
      setModulePermissions(buildPermissionMap());
      setIsPermissionsLoading(false);
      return;
    }

    let isActive = true;
    setIsPermissionsLoading(true);

    fetchUserModulePermissions(username)
      .then((permissions) => {
        if (!isActive) return;
        setModulePermissions(buildPermissionMap(permissions));
      })
      .catch((error) => {
        if (!isActive) return;
        console.error("Erro ao carregar permissoes:", error);
        setModulePermissions(buildPermissionMap());
      })
      .finally(() => {
        if (!isActive) return;
        setIsPermissionsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, user.username, user.name]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addErrorLog({
        message: event.message || 'Erro nao tratado',
        detail: event.error ? String(event.error.stack ?? event.error) : undefined,
        source: event.filename
          ? `${event.filename}:${event.lineno ?? 0}:${event.colno ?? 0}`
          : 'window.error',
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      logErrorFromUnknown(event.reason, 'unhandledrejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const renderContent = () => {
    const routes: { path: string; element: React.ReactElement; moduleKey?: ModuleKey }[] = [
      { path: '/', element: <HomeView /> },
      { path: '/dashboard', element: <Navigate to="/dashboard-certificado" replace /> },
      { path: '/dashboard-certificado', element: <DashboardView />, moduleKey: MODULE_KEYS.dashboard },
      { path: '/qualidade/dashboard-rnc', element: <RncDashboardView />, moduleKey: MODULE_KEYS.rncDashboard },
      { path: '/settings', element: <SettingsView user={user} />, moduleKey: MODULE_KEYS.settings },
      { path: '/cadastro/pessoas', element: <PeopleView />, moduleKey: MODULE_KEYS.people },
      { path: '/cadastro/operacoes', element: <OperationsView />, moduleKey: MODULE_KEYS.operations },
      { path: '/cadastro/normas', element: <NormsView />, moduleKey: MODULE_KEYS.norms },
      { path: '/cadastro/clientes', element: <ClientsView />, moduleKey: MODULE_KEYS.clients },
      { path: '/cadastro/part-number', element: <PartNumbersView />, moduleKey: MODULE_KEYS.partNumbers },
      { path: '/cadastro/normas-processo-especial', element: <SpecialNormsView />, moduleKey: MODULE_KEYS.specialNorms },
      { path: '/cadastro/parametros', element: <ParametersView />, moduleKey: MODULE_KEYS.parameters },
      { path: '/cadastro/ordens-compra', element: <PurchaseOrdersView />, moduleKey: MODULE_KEYS.purchaseOrders },
      { path: '/certificados/qualidade', element: <QualityCertificateView />, moduleKey: MODULE_KEYS.qualityCertificates },
      { path: '/certificados/processo-especial', element: <SpecialProcessCertificateView />, moduleKey: MODULE_KEYS.specialProcessCertificates },
      { path: '/certificados/conformidade-produto', element: <ProductCertificateView />, moduleKey: MODULE_KEYS.productComplianceCertificates },
      { path: '/etiquetas/etiqueta-embarque', element: <ShippingLabelsView />, moduleKey: MODULE_KEYS.shippingLabels },
    ];

    const fallbackView = (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800">Em Desenvolvimento</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          A página <strong>{currentPath}</strong> está sendo construída. 
          Retorne em breve para acessar esta funcionalidade.
        </p>
        <button 
          onClick={() => handleNavigate('/dashboard-certificado')}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );

    return (
      <Routes>
        {routes.map((route) => {
          const access = route.moduleKey ? modulePermissions[route.moduleKey] : undefined;
          const canView = access?.canView ?? true;
          const element = canView
            ? route.element
            : <AccessDenied onBack={() => handleNavigate('/')} />;

          return (
            <Route key={route.path} path={route.path} element={element} />
          );
        })}
        <Route path="*" element={fallbackView} />
      </Routes>
    );
  };

  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/reset-password" element={<ResetPasswordView />} />
          <Route path="*" element={<LoginView onLogin={handleLogin} />} />
        </Routes>
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <ModulePermissionsProvider permissions={modulePermissions} isLoading={isPermissionsLoading}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
            <Sidebar 
              currentPath={currentPath} 
              onNavigate={handleNavigate} 
            />
          </div>
          
          <main className="flex-1 min-w-0 max-w-full md:ml-72 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
            <Header 
              currentPath={currentPath} 
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              user={user}
            />
            <div className="module-content flex-1 min-w-0 overflow-x-hidden overflow-y-auto relative">
              {isNavigating && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-[2px] dark:bg-slate-900/70">
                  <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                    </span>
                    <span className="text-sm font-medium">Carregando modulo...</span>
                  </div>
                </div>
              )}
              {renderContent()}
            </div>
          </main>
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    </ModulePermissionsProvider>
  );
}

export default App;
