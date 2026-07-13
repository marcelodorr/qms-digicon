import { Machine } from '@/app/data/mockData';
import { useMachines } from '@/features/machines/hooks';
import { Card, CardContent } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { cn } from '@/app/utils';
import { Monitor, AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';

interface MachineSelectionViewProps {
  onSelect: (machine: Machine) => void;
}

export function MachineSelectionView({ onSelect }: MachineSelectionViewProps) {
  const { machines, isLoading, error, reload } = useMachines();
  const [sector, setSector] = useState('all');
  const sectors = useMemo(() => [...new Set(machines.map(machine => machine.sector).filter(Boolean))].sort((a,b) => a.localeCompare(b)), [machines]);
  const filteredMachines = useMemo(() => sector === 'all' ? machines : machines.filter(machine => machine.sector === sector), [machines, sector]);
  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <h2 className="text-3xl font-bold mb-8 text-slate-800 border-l-8 border-primary pl-4">Selecione a Máquina</h2>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="sector-filter" className="font-semibold text-slate-700">Setor</label>
        <select id="sector-filter" value={sector} onChange={event => setSector(event.target.value)} className="h-12 min-w-64 rounded-md border border-slate-300 bg-white px-4 text-base font-medium text-slate-800 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200">
          <option value="all">Todos os setores</option>
          {sectors.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <span className="text-sm text-slate-500">{filteredMachines.length} máquina(s)</span>
      </div>
      
      {isLoading && <p className="py-12 text-center text-xl text-slate-500">Carregando máquinas...</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="text-lg font-medium">{error}</p>
          <button onClick={() => void reload()} className="mt-3 font-semibold underline">Tentar novamente</button>
        </div>
      )}
      {!isLoading && !error && filteredMachines.length === 0 && (
        <p className="py-12 text-center text-xl text-slate-500">Nenhuma máquina ativa disponível.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredMachines.map((machine, index) => (
          <motion.div
            key={machine.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              onClick={() => machine.status !== 'stopped' && onSelect(machine)}
              className={cn(
                "cursor-pointer hover:shadow-xl transition-all h-64 border-2 flex flex-col overflow-hidden relative group",
                machine.status === 'stopped' ? "opacity-60 cursor-not-allowed bg-slate-100" : "hover:border-primary active:scale-95 bg-white"
              )}
            >
              <div className="h-32 bg-slate-200 w-full relative">
                {machine.imageUrl ? (
                  <img src={machine.imageUrl} alt={machine.name} className="w-full h-full object-cover mix-blend-multiply" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <Monitor className="h-14 w-14 text-slate-500" />
                  </div>
                )}
                <div className={cn(
                  "absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold uppercase",
                  machine.status === 'active' ? "bg-green-500 text-white" :
                  machine.status === 'maintenance' ? "bg-yellow-500 text-black" :
                  "bg-red-500 text-white"
                )}>
                  {machine.status === 'active' ? 'Ativa' : 
                   machine.status === 'maintenance' ? 'Manutenção' : 'Parada'}
                </div>
              </div>
              
              <CardContent className="flex-1 flex flex-col justify-center items-center p-4 text-slate-900">
                <h3 className="text-xl font-bold text-center text-slate-900 mb-1">{machine.name}</h3>
                <p className="text-slate-700 font-mono text-lg">{machine.code}</p>
                {machine.sector && (
                  <p className="mt-1 text-sm font-semibold text-slate-600">Setor: {machine.sector}</p>
                )}
              </CardContent>
              
              {machine.status === 'active' && (
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-primary text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">Selecionar</span>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
