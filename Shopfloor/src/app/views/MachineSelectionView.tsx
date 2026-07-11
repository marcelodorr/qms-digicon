import { Machine, MOCK_MACHINES } from '@/app/data/mockData';
import { Card, CardContent } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { cn } from '@/app/utils';
import { Monitor, AlertTriangle } from 'lucide-react';

interface MachineSelectionViewProps {
  onSelect: (machine: Machine) => void;
}

export function MachineSelectionView({ onSelect }: MachineSelectionViewProps) {
  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <h2 className="text-3xl font-bold mb-8 text-slate-800 border-l-8 border-primary pl-4">Selecione a Máquina</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_MACHINES.map((machine, index) => (
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
                <img 
                  src={machine.imageUrl} 
                  alt={machine.name} 
                  className="w-full h-full object-cover mix-blend-multiply" 
                />
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
              
              <CardContent className="flex-1 flex flex-col justify-center items-center p-4">
                <h3 className="text-xl font-bold text-center mb-1">{machine.name}</h3>
                <p className="text-slate-500 font-mono text-lg">{machine.code}</p>
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
