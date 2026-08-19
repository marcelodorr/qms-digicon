import { Operation } from '@/app/data/mockData';
import { useOperations } from '@/features/production/hooks';
import { Card, CardContent } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Settings } from 'lucide-react';

interface OperationSelectionViewProps {
  poId: string;
  onSelect: (op: Operation) => void;
  onBack: () => void;
}

export function OperationSelectionView({ poId, onSelect, onBack }: OperationSelectionViewProps) {
  const { items: operations, isLoading, error } = useOperations(poId);

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-lg font-medium underline">
          &larr; Voltar
        </button>
        <h2 className="text-3xl font-bold text-slate-800 border-l-8 border-primary pl-4">Selecione a Operação</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? <div className="col-span-2 p-10 text-center text-xl text-slate-500">Carregando operações...</div> : error ? <div className="col-span-2 p-10 text-center text-lg text-red-700">{error}</div> : operations.length === 0 ? (
           <div className="col-span-2 text-center p-10 bg-slate-50 rounded-lg">
             <p className="text-2xl text-slate-400">Nenhuma operação cadastrada.</p>
           </div>
        ) : (
          operations.map((op, index) => (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                onClick={() => onSelect(op)}
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all border-2 active:scale-[0.99] h-40 flex items-center justify-center"
              >
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                    <Settings className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-center">{op.code} - {op.name}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
