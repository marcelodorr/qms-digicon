import { useState } from 'react';
import { Defect, Cause, MOCK_DEFECTS, MOCK_CAUSES } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, CheckCircle, X, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/app/utils';

export interface DefectSubmitData {
  qty: string;
  quota: string;
  defect: Defect;
  cause: Cause;
  observation: string;
  printed: boolean;
}

interface DefectEntryViewProps {
  onBack: () => void;
  onSubmit: (data: DefectSubmitData) => void;
  userName: string;
  machineName: string;
  opCode: string;
  poCode: string;
  initialQuota?: string;
}

function SelectionModal({
  isOpen, onClose, title, items, onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: { code: string; description: string }[];
  onSelect: (item: Defect | Cause) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-[96vw] max-h-[86vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-bold">{title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-12 w-12 rounded-full hover:bg-slate-200"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>
            <div className="overflow-y-auto p-4 flex-1 space-y-3">
              {items.map((item) => (
                <button
                  key={item.code}
                  onClick={() => onSelect(item)}
                  className="w-full text-left p-4 rounded-lg border-2 border-slate-200 hover:border-primary hover:bg-red-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-500 mr-3 text-lg">{item.code}</span>
                    <span className="text-xl font-medium text-slate-800">{item.description}</span>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DefectEntryView({
  onBack, onSubmit, userName, machineName, opCode, poCode, initialQuota = '',
}: DefectEntryViewProps) {
  const [qty, setQty] = useState('');
  const [quota, setQuota] = useState(initialQuota);
  const [defect, setDefect] = useState<Defect | null>(null);
  const [cause, setCause] = useState<Cause | null>(null);
  const [observation, setObservation] = useState('');

  const [defectOpen, setDefectOpen] = useState(false);
  const [causeOpen, setCauseOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const canSubmit = qty && quota && defect && cause;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowPrintModal(true);
  };

  const handleConfirmPrint = (printed: boolean) => {
    setShowPrintModal(false);
    onSubmit({ qty, quota, defect: defect!, cause: cause!, observation, printed });
  };

  return (
    <div className="w-full px-3 sm:px-5 py-3 pb-6">
      {/* Context bar */}
      <div className="bg-slate-800 text-slate-100 p-4 rounded-lg mb-6 shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="block text-slate-400 text-xs uppercase">Operador</span>
          <span className="font-medium truncate">{userName}</span>
        </div>
        <div>
          <span className="block text-slate-400 text-xs uppercase">Máquina</span>
          <span className="font-medium truncate">{machineName}</span>
        </div>
        <div>
          <span className="block text-slate-400 text-xs uppercase">OP</span>
          <span className="font-medium truncate">{poCode}</span>
        </div>
        <div>
          <span className="block text-slate-400 text-xs uppercase">Operação</span>
          <span className="font-medium truncate">{opCode}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 text-lg font-medium underline"
        >
          &larr; Cancelar
        </button>
        <h2 className="text-3xl font-bold text-slate-800 border-l-8 border-primary pl-4">
          Registrar Não Conformidade
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xl">Quantidade NC</Label>
            <Input
              type="number"
              className="h-20 text-3xl font-mono"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xl">Número da Cota</Label>
            <Input
              type="text"
              className="h-20 text-3xl font-mono"
              placeholder="Ex: 1"
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Defect picker */}
        <div className="space-y-2">
          <Label className="text-xl">Defeito</Label>
          <div
            onClick={() => setDefectOpen(true)}
            className={cn(
              'h-24 w-full rounded-lg border-2 bg-white flex items-center px-6 cursor-pointer hover:border-primary transition-colors',
              defect ? 'border-slate-300' : 'border-dashed border-slate-300 text-slate-400'
            )}
          >
            {defect ? (
              <div>
                <span className="font-mono font-bold text-slate-500 mr-2 text-lg">{defect.code}</span>
                <span className="text-2xl font-bold text-slate-800">{defect.description}</span>
              </div>
            ) : (
              <span className="text-2xl flex items-center gap-2">
                <Search className="w-6 h-6" /> Selecione o defeito...
              </span>
            )}
          </div>
        </div>

        {/* Cause picker */}
        <div className="space-y-2">
          <Label className="text-xl">Causa</Label>
          <div
            onClick={() => setCauseOpen(true)}
            className={cn(
              'h-24 w-full rounded-lg border-2 bg-white flex items-center px-6 cursor-pointer hover:border-primary transition-colors',
              cause ? 'border-slate-300' : 'border-dashed border-slate-300 text-slate-400'
            )}
          >
            {cause ? (
              <div>
                <span className="font-mono font-bold text-slate-500 mr-2 text-lg">{cause.code}</span>
                <span className="text-2xl font-bold text-slate-800">{cause.description}</span>
              </div>
            ) : (
              <span className="text-2xl flex items-center gap-2">
                <Search className="w-6 h-6" /> Selecione a causa...
              </span>
            )}
          </div>
        </div>

        {/* Observation */}
        <div className="space-y-2">
          <Label className="text-xl">
            Observação{' '}
            <span className="text-slate-400 font-normal text-base">(opcional)</span>
          </Label>
          <textarea
            rows={3}
            placeholder="Descreva detalhes adicionais sobre a não conformidade..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full rounded-lg border-2 border-slate-200 bg-white p-4 text-xl resize-none focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full mt-4 font-bold shadow-xl shadow-red-200"
          disabled={!canSubmit}
        >
          CONFIRMAR APONTAMENTO
        </Button>
      </form>

      <SelectionModal
        isOpen={defectOpen}
        onClose={() => setDefectOpen(false)}
        title="Selecione o Defeito"
        items={MOCK_DEFECTS}
        onSelect={(d) => { setDefect(d as Defect); setDefectOpen(false); }}
      />
      <SelectionModal
        isOpen={causeOpen}
        onClose={() => setCauseOpen(false)}
        title="Selecione a Causa"
        items={MOCK_CAUSES}
        onSelect={(c) => { setCause(c as Cause); setCauseOpen(false); }}
      />

      {/* Print confirm modal */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[92vw] overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Sucesso!</h3>
                <p className="text-xl text-slate-600 mb-8">Apontamento realizado.</p>
                <p className="text-2xl font-bold text-slate-800 mb-6">
                  Deseja imprimir a etiqueta?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => handleConfirmPrint(false)}
                    className="border-2 text-slate-600"
                  >
                    NÃO
                  </Button>
                  <Button
                    size="xl"
                    onClick={() => handleConfirmPrint(true)}
                    className="gap-2"
                  >
                    <Printer className="w-6 h-6" /> SIM
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
