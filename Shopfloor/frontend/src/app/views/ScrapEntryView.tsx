import { useState } from 'react';
import { MOCK_CAUSES, Cause } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ChevronLeft, ChevronRight, X, CheckCircle, Search } from 'lucide-react';
import { cn } from '@/app/utils';

interface ScrapEntryViewProps {
  userName: string;
  machineName: string;
  poCode: string;
  opCode: string;
  onBack: () => void;
  onSubmit: (data: { qty: number; causeCode: string; causeDescription: string; observation: string }) => void;
}

function CauseModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cause: Cause) => void;
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
              <h3 className="text-2xl font-bold">Selecione a Causa do Refugo</h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-full">
                <X className="w-7 h-7" />
              </Button>
            </div>
            <div className="overflow-y-auto p-4 flex-1 space-y-3">
              {MOCK_CAUSES.map(cause => (
                <button
                  key={cause.code}
                  onClick={() => onSelect(cause)}
                  className="w-full text-left p-4 rounded-lg border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-500 mr-3 text-lg">{cause.code}</span>
                    <span className="text-xl font-medium text-slate-800">{cause.description}</span>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-amber-500" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ScrapEntryView({ userName, machineName, poCode, opCode, onBack, onSubmit }: ScrapEntryViewProps) {
  const [qty, setQty] = useState('');
  const [cause, setCause] = useState<Cause | null>(null);
  const [observation, setObservation] = useState('');
  const [isCauseOpen, setIsCauseOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit = qty && parseInt(qty) > 0 && cause;

  const handleConfirm = () => {
    if (!cause) return;
    setShowConfirm(false);
    onSubmit({
      qty: parseInt(qty),
      causeCode: cause.code,
      causeDescription: cause.description,
      observation,
    });
  };

  return (
    <div className="w-full px-3 sm:px-5 py-3 pb-6">
      {/* Header context bar */}
      <div className="bg-slate-800 text-slate-100 p-4 rounded-lg mb-6 shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><span className="block text-slate-400 text-xs uppercase">Operador</span><span className="font-medium truncate">{userName}</span></div>
        <div><span className="block text-slate-400 text-xs uppercase">Máquina</span><span className="font-medium truncate">{machineName}</span></div>
        <div><span className="block text-slate-400 text-xs uppercase">OP</span><span className="font-medium truncate">{poCode}</span></div>
        <div><span className="block text-slate-400 text-xs uppercase">Operação</span><span className="font-medium truncate">{opCode}</span></div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-lg font-medium underline flex items-center gap-1">
          <ChevronLeft className="w-5 h-5" /> Cancelar
        </button>
        <h2 className="text-3xl font-bold text-slate-800 border-l-8 border-amber-500 pl-4">Registrar Refugo</h2>
      </div>

      <form
        onSubmit={e => { e.preventDefault(); if (canSubmit) setShowConfirm(true); }}
        className="space-y-6"
      >
        {/* Quantity */}
        <div className="space-y-2">
          <Label className="text-xl">Quantidade Refugada</Label>
          <Input
            type="number"
            min="1"
            placeholder="0"
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="h-20 text-4xl font-mono"
            required
          />
        </div>

        {/* Cause picker */}
        <div className="space-y-2">
          <Label className="text-xl">Causa do Refugo</Label>
          <div
            onClick={() => setIsCauseOpen(true)}
            className={cn(
              'h-24 w-full rounded-lg border-2 bg-white flex items-center px-6 cursor-pointer transition-colors',
              cause ? 'border-amber-400 hover:border-amber-500' : 'border-dashed border-slate-300 text-slate-400 hover:border-amber-400'
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

        {/* Optional observation */}
        <div className="space-y-2">
          <Label className="text-xl">Observação <span className="text-slate-400 font-normal text-base">(opcional)</span></Label>
          <Input
            type="text"
            placeholder="Descreva detalhes adicionais..."
            value={observation}
            onChange={e => setObservation(e.target.value)}
            className="h-16 text-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full mt-8 font-bold shadow-xl shadow-amber-200 bg-amber-500 hover:bg-amber-600 gap-3 h-16 text-xl"
        >
          <Trash2 className="w-6 h-6" /> CONFIRMAR REFUGO
        </Button>
      </form>

      <CauseModal
        isOpen={isCauseOpen}
        onClose={() => setIsCauseOpen(false)}
        onSelect={c => { setCause(c); setIsCauseOpen(false); }}
      />

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[92vw] overflow-hidden"
            >
              <div className="p-8 text-center bg-amber-50">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">Confirmar Refugo?</h3>
                <p className="text-xl text-slate-600">
                  <strong>{qty} peça(s)</strong> refugadas
                </p>
                {cause && (
                  <p className="text-lg text-slate-500 mt-1">Causa: {cause.description}</p>
                )}
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <Button variant="outline" size="xl" onClick={() => setShowConfirm(false)} className="border-2">
                  CANCELAR
                </Button>
                <Button size="xl" onClick={handleConfirm} className="bg-amber-500 hover:bg-amber-600 gap-2 font-bold">
                  <CheckCircle className="w-6 h-6" /> SALVAR
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
