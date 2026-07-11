import { DefectRecord, MOCK_DEFECTS, MOCK_CAUSES, MOCK_POS, MOCK_MACHINES, MOCK_OPERATIONS } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Printer, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface ReprintViewProps {
  records: DefectRecord[];
  onBack: () => void;
  onReprint: (record: DefectRecord) => void;
}

export function ReprintView({ records, onBack, onReprint }: ReprintViewProps) {
  // Helper to resolve codes to names (simulating joins)
  const getMachineName = (id: string) => MOCK_MACHINES.find(m => m.id === id)?.name || id;
  const getPOCode = (id: string) => MOCK_POS.find(p => p.id === id)?.code || id;
  const getOpName = (id: string) => MOCK_OPERATIONS.find(o => o.id === id)?.name || id;
  const getDefectName = (code: string) => MOCK_DEFECTS.find(d => d.code === code)?.description || code;
  
  const sortedRecords = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="icon" className="h-12 w-12 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-3xl font-bold text-slate-800 border-l-8 border-primary pl-4">Reimpressão de Etiquetas</h2>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sortedRecords.length === 0 ? (
          <div className="text-center p-10 bg-slate-50 rounded-lg">
             <p className="text-2xl text-slate-400">Nenhum apontamento realizado hoje.</p>
          </div>
        ) : (
          sortedRecords.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-500 mb-2">
                      <span className="bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(record.timestamp), 'HH:mm')}
                      </span>
                      <span className="bg-slate-100 px-2 py-1 rounded">{getMachineName(record.machineId)}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded">{getPOCode(record.poId)}</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-red-600">{record.quantity} x</span>
                      <h3 className="text-xl font-bold text-slate-800">{getDefectName(record.defectCode)}</h3>
                    </div>
                    <p className="text-slate-600">Cota: {record.quotaNumber} • Operação: {getOpName(record.operationId)}</p>
                  </div>
                  
                  <Button 
                    onClick={() => onReprint(record)} 
                    size="lg" 
                    variant="outline"
                    className="shrink-0 gap-2 border-2"
                  >
                    <Printer className="w-5 h-5" /> REIMPRIMIR
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
