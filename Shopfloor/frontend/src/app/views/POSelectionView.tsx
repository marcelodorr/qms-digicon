import { ProductionOrder } from '@/app/data/mockData';
import { useProductionOrders } from '@/features/production/hooks';
import { Card, CardContent } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { FileText, Package } from 'lucide-react';

interface POSelectionViewProps {
  machineId: string;
  onSelect: (po: ProductionOrder) => void;
  onBack: () => void;
}

export function POSelectionView({ machineId, onSelect, onBack }: POSelectionViewProps) {
  const { items: pos, isLoading, error } = useProductionOrders(machineId);

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-lg font-medium underline">
          &larr; Voltar
        </button>
        <h2 className="text-3xl font-bold text-slate-800 border-l-8 border-primary pl-4">Selecione a Ordem de Produção (OP)</h2>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? <div className="p-10 text-center text-xl text-slate-500">Carregando ordens de produção...</div> : error ? <div className="p-10 text-center text-lg text-red-700">{error}</div> : pos.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 rounded-lg">
             <p className="text-2xl text-slate-400">Nenhuma OP encontrada para esta máquina.</p>
          </div>
        ) : (
          pos.map((po, index) => (
            <motion.div
              key={po.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                onClick={() => onSelect(po)}
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all border-2 active:scale-[0.99]"
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="bg-red-100 p-4 rounded-full text-red-600">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">{po.code}</h3>
                      <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <Package className="w-5 h-5" />
                        <span className="text-xl">{po.productName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-sm text-slate-400 font-medium uppercase tracking-wider">Quantidade</span>
                    <span className="text-3xl font-mono font-bold text-slate-700">{po.targetQuantity}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
