import { Machine } from '@/app/data/mockData';
import { motion } from 'motion/react';
import { Ruler, AlertOctagon } from 'lucide-react';

export type ActiveModule = 'measurement' | 'nc';

interface ModuleSelectionViewProps {
  machine: Machine;
  onSelect: (module: ActiveModule) => void;
}

const modules = [
  {
    id: 'measurement' as ActiveModule,
    label: 'MEDIÇÃO',
    sublabel: 'Registrar medidas das cotas da peça',
    Icon: Ruler,
    colors: 'bg-blue-600 hover:bg-blue-700 shadow-blue-300',
  },
  {
    id: 'nc' as ActiveModule,
    label: 'NÃO CONFORMIDADE',
    sublabel: 'Registrar defeito e emitir etiqueta de NC',
    Icon: AlertOctagon,
    colors: 'bg-primary hover:bg-red-700 shadow-red-300',
  },
];

export function ModuleSelectionView({ machine, onSelect }: ModuleSelectionViewProps) {
  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <div className="mb-8">
        <p className="text-slate-500 text-lg font-medium mb-1">Máquina selecionada</p>
        <h2 className="text-3xl font-bold text-slate-800 border-l-8 border-primary pl-4">
          {machine.name}{' '}
          <span className="font-mono text-slate-400 text-2xl">({machine.code})</span>
        </h2>
      </div>

      <p className="text-2xl font-semibold text-slate-700 mb-6">O que deseja registrar?</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {modules.map((mod, i) => (
          <motion.button
            key={mod.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            onClick={() => onSelect(mod.id)}
            className={`w-full flex items-center gap-6 px-6 py-6 md:px-8 md:py-7 rounded-2xl text-white text-left shadow-2xl active:scale-95 transition-all duration-150 ${mod.colors}`}
          >
            <div className="bg-white/20 rounded-xl p-4 flex-shrink-0">
              <mod.Icon className="w-12 h-12 text-white" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-wide leading-tight">{mod.label}</p>
              <p className="text-lg text-white/80 mt-1 font-medium">{mod.sublabel}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
