import { useState } from 'react';
import {
  User,
  Machine,
  ProductionOrder,
  Operation,
  DefectRecord,
  MeasurementRecord,
  QuotaMeasurement,
} from '@/app/data/mockData';
import { LoginView } from '@/app/views/LoginView';
import { MachineSelectionView } from '@/app/views/MachineSelectionView';
import { ModuleSelectionView, ActiveModule } from '@/app/views/ModuleSelectionView';
import { POSelectionView } from '@/app/views/POSelectionView';
import { OperationSelectionView } from '@/app/views/OperationSelectionView';
import { DefectEntryView } from '@/app/views/DefectEntryView';
import { MeasurementView, NcCreatedPayload } from '@/app/views/MeasurementView';
import { ReprintView } from '@/app/views/ReprintView';
import { Button } from '@/app/components/ui/button';
import { LogOut, History, User as UserIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { ThemeProvider } from '@figma/astraui';

type ViewState =
  | 'login'
  | 'machine'
  | 'module'
  | 'po'
  | 'operation'
  | 'entry'
  | 'measurement'
  | 'reprint';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('login');

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveModule | null>(null);
  const [selectedPO, setSelectedPO] = useState<ProductionOrder | null>(null);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);

  const [defectRecords, setDefectRecords] = useState<DefectRecord[]>([]);
  const [measurementRecords, setMeasurementRecords] = useState<MeasurementRecord[]>([]);

  const resetFlow = () => {
    setSelectedPO(null);
    setSelectedOp(null);
    setActiveModule(null);
    setSelectedMachine(null);
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('machine');
    toast.success(`Bem-vindo, ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    resetFlow();
    setView('login');
  };

  // ─── Navigation ───────────────────────────────────────────────────────────

  const handleSelectMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setSelectedPO(null);
    setSelectedOp(null);
    setActiveModule(null);
    setView('module');
  };

  const handleSelectModule = (module: ActiveModule) => {
    setActiveModule(module);
    setView('po');
  };

  const handleSelectPO = (po: ProductionOrder) => {
    setSelectedPO(po);
    setView('operation');
  };

  const handleSelectOp = (op: Operation) => {
    setSelectedOp(op);
    setView(activeModule === 'measurement' ? 'measurement' : 'entry');
  };

  // ─── Submit handlers ──────────────────────────────────────────────────────

  const saveDefectRecord = (data: {
    qty: string;
    quota: string;
    defect: { code: string; description: string };
    cause: { code: string; description: string };
    observation: string;
    printed: boolean;
  }) => {
    if (!currentUser || !selectedMachine || !selectedPO || !selectedOp) return;
    const record: DefectRecord = {
      id: Math.random().toString(36).slice(2, 11),
      userId: currentUser.id,
      machineId: selectedMachine.id,
      poId: selectedPO.id,
      operationId: selectedOp.id,
      defectCode: data.defect.code,
      causeCode: data.cause.code,
      quantity: parseInt(data.qty),
      quotaNumber: data.quota,
      observation: data.observation,
      timestamp: new Date().toISOString(),
    };
    setDefectRecords((prev) => [record, ...prev]);
    return record;
  };

  const handleSubmitDefect = (data: {
    qty: string;
    quota: string;
    defect: { code: string; description: string };
    cause: { code: string; description: string };
    observation: string;
    printed: boolean;
  }) => {
    saveDefectRecord(data);
    if (data.printed) toast.success('Etiqueta enviada para impressão!');
    else toast.success('Não Conformidade registrada!');
    resetFlow();
    setView('machine');
  };

  const handleNcCreatedFromMeasurement = (payload: NcCreatedPayload) => {
    if (!currentUser || !selectedMachine || !selectedPO || !selectedOp) return;
    const record: DefectRecord = {
      id: Math.random().toString(36).slice(2, 11),
      userId: currentUser.id,
      machineId: selectedMachine.id,
      poId: selectedPO.id,
      operationId: selectedOp.id,
      defectCode: payload.defectCode,
      causeCode: payload.causeCode,
      quantity: payload.qty,
      quotaNumber: payload.quotaNumber,
      observation: payload.observation,
      timestamp: new Date().toISOString(),
    };
    setDefectRecords((prev) => [record, ...prev]);
    if (payload.printed) toast.success('NC registrada — etiqueta enviada!');
    else toast.success('NC registrada com sucesso!');
  };

  const handleSubmitMeasurement = (
    measurements: QuotaMeasurement[],
    overall: 'ok' | 'nok'
  ) => {
    if (!currentUser || !selectedMachine || !selectedPO || !selectedOp) return;
    const record: MeasurementRecord = {
      id: Math.random().toString(36).slice(2, 11),
      userId: currentUser.id,
      machineId: selectedMachine.id,
      poId: selectedPO.id,
      operationId: selectedOp.id,
      measurements,
      overallStatus: overall,
      timestamp: new Date().toISOString(),
    };
    setMeasurementRecords((prev) => [record, ...prev]);
    toast.success(
      overall === 'ok'
        ? 'Medições salvas — Peça aprovada!'
        : 'Medições salvas — Peça reprovada!',
      { duration: 4000 }
    );
    resetFlow();
    setView('machine');
  };

  const handleReprint = (record: DefectRecord) => {
    toast.success(`Reimprimindo etiqueta — ${record.quantity} peça(s).`);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ThemeProvider>
      <div className="min-h-screen w-full overflow-x-hidden bg-brand-tertiary text-text-primary">
        <Toaster position="top-center" richColors />

        {currentUser && (
          <header className="bg-surface-bg border-b border-border-primary sticky top-0 z-40 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="bg-bg-subtle p-2 rounded-full">
                <UserIcon className="w-6 h-6 text-text-secondary" />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary leading-tight">{currentUser.name}</p>
                <p className="text-sm text-text-secondary font-mono">MAT: {currentUser.matricula}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {view !== 'reprint' && (
                <Button
                  variant="outline"
                  onClick={() => setView('reprint')}
                  className="hidden gap-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:flex"
                >
                  <History className="w-4 h-4" /> Histórico / Reimpressão
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="gap-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </header>
        )}

      <main className="min-h-[calc(100vh-80px)]">
        {view === 'login' && <LoginView onLogin={handleLogin} />}

        {view === 'machine' && currentUser && (
          <>
            <div className="flex justify-end px-6 pt-4 md:hidden">
              <Button
                variant="outline"
                onClick={() => setView('reprint')}
                className="w-full gap-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <History className="w-4 h-4" /> Histórico / Reimpressão
              </Button>
            </div>
            <MachineSelectionView onSelect={handleSelectMachine} />
          </>
        )}

        {view === 'module' && currentUser && selectedMachine && (
          <ModuleSelectionView machine={selectedMachine} onSelect={handleSelectModule} />
        )}

        {view === 'po' && currentUser && selectedMachine && (
          <POSelectionView
            machineId={selectedMachine.id}
            onSelect={handleSelectPO}
            onBack={() => setView('module')}
          />
        )}

        {view === 'operation' && currentUser && selectedPO && (
          <OperationSelectionView
            poId={selectedPO.id}
            onSelect={handleSelectOp}
            onBack={() => { setSelectedPO(null); setView('po'); }}
          />
        )}

        {view === 'entry' && currentUser && selectedMachine && selectedPO && selectedOp && (
          <DefectEntryView
            userName={currentUser.name}
            machineName={selectedMachine.name}
            poCode={selectedPO.code}
            opCode={`${selectedOp.code} - ${selectedOp.name}`}
            onBack={() => { setSelectedOp(null); setView('operation'); }}
            onSubmit={handleSubmitDefect}
          />
        )}

        {view === 'measurement' && currentUser && selectedMachine && selectedPO && selectedOp && (
          <MeasurementView
            userName={currentUser.name}
            machineName={selectedMachine.name}
            poCode={selectedPO.code}
            opCode={`${selectedOp.code} - ${selectedOp.name}`}
            operationId={selectedOp.id}
            onBack={() => { setSelectedOp(null); setView('operation'); }}
            onSubmit={handleSubmitMeasurement}
            onNcCreated={handleNcCreatedFromMeasurement}
          />
        )}

        {view === 'reprint' && currentUser && (
          <ReprintView
            records={defectRecords.filter((r) => r.userId === currentUser.id)}
            onBack={() => setView('machine')}
            onReprint={handleReprint}
          />
        )}
      </main>
      </div>
    </ThemeProvider>
  );
}
