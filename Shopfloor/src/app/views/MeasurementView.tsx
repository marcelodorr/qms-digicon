import { useState, useMemo } from 'react';
import {
  Quota,
  QuotaMeasurement,
  QuotaSampleResult,
  MOCK_QUOTAS,
  MOCK_DEFECTS,
  MOCK_CAUSES,
  Defect,
  Cause,
} from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Button as AstraButton, InputField, TextareaField } from '@figma/astraui';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Printer,
  Search,
  X,
  Ruler,
} from 'lucide-react';
import { cn } from '@/app/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NcData {
  defect: Defect;
  cause: Cause;
  qty: string;
  observation: string;
  printed: boolean;
}

export interface NcCreatedPayload {
  defectCode: string;
  causeCode: string;
  qty: number;
  quotaNumber: string;
  observation: string;
  printed: boolean;
}

interface MeasurementViewProps {
  userName: string;
  machineName: string;
  poCode: string;
  opCode: string;
  operationId: string;
  onBack: () => void;
  onSubmit: (measurements: QuotaMeasurement[], overall: 'ok' | 'nok') => void;
  onNcCreated: (payload: NcCreatedPayload) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inTolerance(q: Quota, value: number): boolean {
  const nominal = q.nominal ?? 0;
  const toleranceMinus = q.toleranceMinus ?? 0;
  const tolerancePlus = q.tolerancePlus ?? 0;
  return value >= nominal - toleranceMinus && value <= nominal + tolerancePlus;
}

function getSampleStatus(q: Quota, raw: string): 'ok' | 'nok' | 'pending' {
  if (raw === '') return 'pending';
  if (q.responseType === 'numeric') {
    const n = parseFloat(raw);
    if (isNaN(n)) return 'pending';
    return inTolerance(q, n) ? 'ok' : 'nok';
  }
  if (q.responseType === 'text') return raw.trim() ? 'ok' : 'pending';
  const selected = raw.split('|').filter(Boolean);
  if (selected.length === 0) return 'pending';
  return selected.some((value) => q.options?.find((o) => o.value === value)?.status === 'nok') ? 'nok' : 'ok';
}

// ─── Selection Sheet (used inside NC dialog) ──────────────────────────────────

function SelectionSheet({
  title,
  items,
  onSelect,
  onClose,
}: {
  title: string;
  items: { code: string; description: string }[];
  onSelect: (item: Defect | Cause) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[96vw] max-h-[82vh] flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b flex justify-between items-center bg-slate-50">
          <h4 className="text-xl font-bold">{title}</h4>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full">
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="overflow-y-auto p-3 flex-1 space-y-2">
          {items.map((item) => (
            <button
              key={item.code}
              onClick={() => onSelect(item)}
              className="w-full text-left p-4 rounded-lg border-2 border-slate-200 hover:border-primary hover:bg-red-50 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-mono font-bold text-slate-500 mr-2">{item.code}</span>
                <span className="text-lg font-medium text-slate-800">{item.description}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Embedded NC Dialog ───────────────────────────────────────────────────────

function NcDialog({
  quota,
  measuredValue,
  sampleLabel,
  onIgnore,
  onConfirm,
}: {
  quota: Quota;
  measuredValue: number;
  sampleLabel: string;
  onIgnore: () => void;
  onConfirm: (data: NcData) => void;
}) {
  const [defect, setDefect] = useState<Defect | null>(
    MOCK_DEFECTS.find((d) => d.code === 'D06') ?? null
  );
  const [cause, setCause] = useState<Cause | null>(null);
  const [qty, setQty] = useState('1');
  const [observation, setObservation] = useState('');
  const [sheet, setSheet] = useState<'defect' | 'cause' | null>(null);
  const [showPrint, setShowPrint] = useState(false);

  const nominal = quota.nominal ?? 0;
  const unit = quota.unit ?? "";
  const toleranceMinus = quota.toleranceMinus ?? 0;
  const tolerancePlus = quota.tolerancePlus ?? 0;
  const deviation = measuredValue - nominal;
  const devStr = (deviation > 0 ? '+' : '') + deviation.toFixed(3);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[96vw] flex flex-col overflow-hidden max-h-[92vh]"
      >
        {/* Red header with deviation info */}
        <div className="bg-primary p-5 text-white flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-7 h-7 flex-shrink-0" />
            <h3 className="text-xl md:text-2xl font-black">Medida Fora da Tolerância!</h3>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-3 font-mono text-sm leading-relaxed space-y-0.5">
            <p>
              <strong>Cota {quota.number}</strong> — {quota.description}
            </p>
            <p>
              Medido:{' '}
              <strong>
                {measuredValue.toFixed(3)} {unit}
              </strong>{' '}
              | Desvio: <strong>{devStr} {unit}</strong>
            </p>
            <p>
              Limites: [{(nominal - toleranceMinus).toFixed(3)} ~{' '}
              {(nominal + tolerancePlus).toFixed(3)}] {unit} —{' '}
              {sampleLabel}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <p className="text-lg font-bold text-slate-700">
            Registrar Não Conformidade:
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-base">Qtd. NC</Label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="h-14 text-2xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">Nº Cota</Label>
              <div className="h-14 flex items-center border-2 border-slate-100 rounded-lg px-4 bg-slate-50">
                <span className="text-2xl font-mono font-bold text-slate-600">
                  {quota.number}
                </span>
              </div>
            </div>
          </div>

          {/* Defect */}
          <div className="space-y-1">
            <Label className="text-base">Defeito</Label>
            <div
              onClick={() => setSheet('defect')}
              className={cn(
                'h-16 w-full rounded-lg border-2 bg-white flex items-center px-4 cursor-pointer hover:border-primary transition-colors',
                defect ? 'border-slate-300' : 'border-dashed border-slate-300 text-slate-400'
              )}
            >
              {defect ? (
                <span>
                  <span className="font-mono font-bold text-slate-500 mr-2">{defect.code}</span>
                  <span className="text-lg font-bold text-slate-800">{defect.description}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5" /> Selecione...
                </span>
              )}
            </div>
          </div>

          {/* Cause */}
          <div className="space-y-1">
            <Label className="text-base">Causa</Label>
            <div
              onClick={() => setSheet('cause')}
              className={cn(
                'h-16 w-full rounded-lg border-2 bg-white flex items-center px-4 cursor-pointer hover:border-primary transition-colors',
                cause ? 'border-slate-300' : 'border-dashed border-slate-300 text-slate-400'
              )}
            >
              {cause ? (
                <span>
                  <span className="font-mono font-bold text-slate-500 mr-2">{cause.code}</span>
                  <span className="text-lg font-bold text-slate-800">{cause.description}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5" /> Selecione...
                </span>
              )}
            </div>
          </div>

          {/* Observation */}
          <div className="space-y-1">
            <Label className="text-base">
              Observação{' '}
              <span className="text-slate-400 font-normal text-sm">(opcional)</span>
            </Label>
            <textarea
              rows={2}
              placeholder="Descreva detalhes adicionais..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-200 p-3 text-base resize-none focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="p-5 border-t grid grid-cols-2 gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="lg"
            onClick={onIgnore}
            className="border-2 text-slate-600 text-lg"
          >
            IGNORAR
          </Button>
          <Button
            size="lg"
            disabled={!defect || !cause || !qty}
            onClick={() => setShowPrint(true)}
            className="font-bold text-lg gap-2"
          >
            REGISTRAR NC
          </Button>
        </div>
      </motion.div>

      {/* Sub-selection sheets */}
      <AnimatePresence>
        {sheet === 'defect' && (
          <SelectionSheet
            title="Selecione o Defeito"
            items={MOCK_DEFECTS}
            onSelect={(d) => { setDefect(d as Defect); setSheet(null); }}
            onClose={() => setSheet(null)}
          />
        )}
        {sheet === 'cause' && (
          <SelectionSheet
            title="Selecione a Causa"
            items={MOCK_CAUSES}
            onSelect={(c) => { setCause(c as Cause); setSheet(null); }}
            onClose={() => setSheet(null)}
          />
        )}
      </AnimatePresence>

      {/* Print confirm */}
      <AnimatePresence>
        {showPrint && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[92vw] p-6 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl md:text-2xl font-black mb-2">NC Registrada!</h4>
              <p className="text-lg text-slate-600 mb-6">Deseja imprimir a etiqueta?</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onConfirm({ defect: defect!, cause: cause!, qty, observation, printed: false })}
                  className="border-2 text-lg"
                >
                  NÃO
                </Button>
                <Button
                  size="lg"
                  onClick={() => onConfirm({ defect: defect!, cause: cause!, qty, observation, printed: true })}
                  className="gap-2 text-lg"
                >
                  <Printer className="w-5 h-5" /> SIM
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main MeasurementView ─────────────────────────────────────────────────────

export function MeasurementView({
  userName,
  machineName,
  poCode,
  opCode,
  operationId,
  onBack,
  onSubmit,
  onNcCreated,
}: MeasurementViewProps) {
  const quotas = useMemo(
    () => MOCK_QUOTAS.filter((q) => q.operationId === operationId),
    [operationId]
  );

  // sampleValues[quotaIdx][sampleIdx] = raw string
  const [sampleValues, setSampleValues] = useState<string[][]>(
    () => quotas.map((q) => Array(q.sampleCount).fill(''))
  );

  const [currentIdx, setCurrentIdx] = useState(0);

  // Which sample triggered an NC dialog
  const [pendingNc, setPendingNc] = useState<{
    quotaIdx: number;
    sampleIdx: number;
    value: number;
  } | null>(null);

  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  // Per-quota status
  const quotaStatuses: ('ok' | 'nok' | 'pending')[] = useMemo(() => {
    return quotas.map((q, qi) => {
      const vals = sampleValues[qi];
      if (vals.some((v) => v === '')) return 'pending';
      return vals.every((v) => getSampleStatus(q, v) === 'ok') ? 'ok' : 'nok';
    });
  }, [quotas, sampleValues]);

  const completedCount = quotaStatuses.filter((s) => s !== 'pending').length;
  const allComplete = completedCount === quotas.length;

  const buildMeasurements = (): QuotaMeasurement[] =>
    quotas.map((q, qi) => {
      const samples: QuotaSampleResult[] = sampleValues[qi].map((v, si) => {
        const value = q.responseType === 'multiple' ? v.split('|').filter(Boolean) : q.responseType === 'numeric' ? parseFloat(v) : v;
        return {
          sampleIndex: si,
          value: q.responseType === 'numeric' && isNaN(value as number) ? 0 : value,
          status: getSampleStatus(q, v) === 'ok' ? 'ok' : 'nok',
        };
      });
      const allOk = samples.every((s) => s.status === 'ok');
      const hasPending = sampleValues[qi].some((v) => getSampleStatus(q, v) === 'pending');
      return {
        quotaId: q.id,
        quotaNumber: q.number,
        description: q.description,
        responseType: q.responseType,
        nominal: q.nominal,
        tolerancePlus: q.tolerancePlus,
        toleranceMinus: q.toleranceMinus,
        unit: q.unit,
        samples,
        overallStatus: hasPending ? 'pending' : allOk ? 'ok' : 'nok',
      };
    });

  const handleSampleChange = (qi: number, si: number, raw: string) => {
    setSampleValues((prev) => {
      const next = prev.map((row) => [...row]);
      next[qi][si] = raw;
      return next;
    });
  };

  const handleSampleBlur = (qi: number, si: number, raw: string) => {
    const quota = quotas[qi];
    if (quota.responseType !== 'numeric') return;
    const value = parseFloat(raw);
    if (isNaN(value) || raw === '') return;
    if (!inTolerance(quota, value)) {
      setPendingNc({ quotaIdx: qi, sampleIdx: si, value });
    }
  };

  const handleNcConfirm = (data: NcData) => {
    if (!pendingNc) return;
    onNcCreated({
      defectCode: data.defect.code,
      causeCode: data.cause.code,
      qty: parseInt(data.qty),
      quotaNumber: quotas[pendingNc.quotaIdx].number,
      observation: data.observation,
      printed: data.printed,
    });
    setPendingNc(null);
  };

  const handleFinalSubmit = () => {
    const measurements = buildMeasurements();
    const overall = measurements.every((m) => m.overallStatus === 'ok') ? 'ok' : 'nok';
    onSubmit(measurements, overall);
  };

  if (quotas.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 py-4">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 text-lg font-medium underline mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
        <div className="text-center py-20 text-slate-400">
          <Ruler className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-2xl font-semibold">
            Nenhuma cota cadastrada para esta operação.
          </p>
        </div>
      </div>
    );
  }

  const currentQuota = quotas[currentIdx];
  const currentSamples = sampleValues[currentIdx];

  return (
    <div className="w-full px-3 sm:px-5 py-3 pb-6">
      {/* Context bar */}
      <div className="bg-surface-bg text-text-primary p-lg rounded-corner-lg mb-lg grid grid-cols-2 md:grid-cols-4 gap-lg text-label-sm">
        <div>
          <span className="block text-text-secondary text-label-sm uppercase">Operador</span>
          <span className="font-medium truncate">{userName}</span>
        </div>
        <div>
          <span className="block text-text-secondary text-label-sm uppercase">Máquina</span>
          <span className="font-medium truncate">{machineName}</span>
        </div>
        <div>
          <span className="block text-text-secondary text-label-sm uppercase">OP</span>
          <span className="font-medium truncate">{poCode}</span>
        </div>
        <div>
          <span className="block text-text-secondary text-label-sm uppercase">Operação</span>
          <span className="font-medium truncate">{opCode}</span>
        </div>
      </div>

      {/* Title + global progress */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-text-secondary hover:text-text-primary text-label font-semibold underline flex items-center gap-xs"
        >
          <ChevronLeft className="w-5 h-5" /> Sair
        </button>
        <h2 className="text-title text-text-primary font-semibold border-l-4 border-brand-primary pl-lg">
          Medições
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-text-secondary text-label-sm font-semibold">
            {completedCount}/{quotas.length} cotas
          </span>
          {/* Mini progress bar */}
          <div className="w-24 h-3 bg-bg-faint rounded-corner-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                completedCount === quotas.length ? 'bg-success' : 'bg-brand-primary'
              )}
              style={{ width: `${(completedCount / quotas.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quota navigation dots */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {quotas.map((q, i) => {
          const st = quotaStatuses[i];
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              title={`Cota ${q.number} — ${q.description}`}
              className={cn(
                'flex items-center justify-center w-11 h-11 rounded-full font-bold text-sm border-2 transition-all',
                i === currentIdx ? 'outline outline-2 outline-brand-primary scale-110' : '',
                st === 'ok'
                  ? 'bg-success border-success text-on-brand'
                  : st === 'nok'
                  ? 'bg-danger border-danger text-on-brand'
                  : 'bg-surface-bg border-border-primary text-text-secondary hover:border-border-selected'
              )}
            >
              {st === 'ok' ? (
                <CheckCircle className="w-5 h-5" />
              ) : st === 'nok' ? (
                <XCircle className="w-5 h-5" />
              ) : (
                q.number
              )}
            </button>
          );
        })}
      </div>

      {/* Current quota card — animates on change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.18 }}
          className="bg-surface-bg rounded-corner-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl bg-surface-bg rounded-corner-lg p-xl">
            <div className="lg:col-span-2 flex flex-col gap-lg min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-lg">
                <div className="min-w-0">
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="bg-brand-tertiary text-brand-primary rounded-corner-full px-lg py-xs text-label-sm font-semibold">
                      Cota {currentQuota.number}
                    </span>
                    <span className="text-label-sm text-text-secondary">
                      {currentIdx + 1} de {quotas.length}
                    </span>
                  </div>
                  <div className="text-heading text-text-primary font-semibold break-words">{currentQuota.description}</div>
                </div>

                <div className="bg-bg-faint rounded-corner-md px-lg py-md text-label-sm text-text-secondary shrink-0">
                  {currentQuota.responseType === 'numeric' ? (
                    <>
                      <div>
                        Nominal: <span className="text-text-primary font-semibold">{(currentQuota.nominal ?? 0).toFixed(3)} {currentQuota.unit}</span>
                      </div>
                      <div>+{(currentQuota.tolerancePlus ?? 0).toFixed(3)} / -{(currentQuota.toleranceMinus ?? 0).toFixed(3)}</div>
                    </>
                  ) : (
                    <div>
                      Tipo: <span className="text-text-primary font-semibold">{currentQuota.responseType === 'binary' ? 'OK / NOK' : currentQuota.responseType === 'multiple' ? 'Múltipla' : currentQuota.responseType === 'list' ? 'Lista' : 'Texto'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-corner-md bg-bg-subtle p-lg">
                <div className="text-label text-text-primary font-semibold">O que fazer agora</div>
                <div className="text-label-sm text-text-secondary mt-xs">{currentQuota.instruction}</div>
              </div>

              <div className="flex flex-col gap-lg">
                <div className="text-label text-text-primary font-semibold">
                  {currentQuota.responseType === 'numeric'
                    ? currentQuota.sampleCount === 1
                      ? 'Digite a dimensão medida'
                      : `Digite as ${currentQuota.sampleCount} medidas`
                    : currentQuota.responseType === 'text'
                    ? 'Digite a resposta'
                    : currentQuota.responseType === 'multiple'
                    ? 'Selecione uma ou mais respostas'
                    : 'Selecione a resposta'}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-lg">
                  {Array.from({ length: currentQuota.sampleCount }).map((_, si) => {
                    const raw = currentSamples[si] ?? '';
                    const status = getSampleStatus(currentQuota, raw);
                    const ok = status === 'pending' ? null : status === 'ok';
                    const selected = raw.split('|').filter(Boolean);

                    const setChoice = (value: string) => {
                      if (currentQuota.responseType === 'multiple') {
                        const next = selected.includes(value)
                          ? selected.filter((item) => item !== value)
                          : [...selected, value];
                        handleSampleChange(currentIdx, si, next.join('|'));
                        return;
                      }
                      handleSampleChange(currentIdx, si, value);
                    };

                    return (
                      <div key={si} className="bg-bg-faint rounded-corner-md p-lg flex flex-col gap-md min-w-0">
                        {currentQuota.sampleCount > 1 && (
                          <div className="text-label-sm text-text-secondary font-semibold">Amostra {si + 1}</div>
                        )}

                        {currentQuota.responseType === 'numeric' && (
                          <InputField
                            type="number"
                            step="0.001"
                            inputMode="decimal"
                            label={currentQuota.sampleCount > 1 ? undefined : 'Medido'}
                            placeholder={(currentQuota.nominal ?? 0).toFixed(3)}
                            suffix={currentQuota.unit}
                            value={raw}
                            onChange={(value) => handleSampleChange(currentIdx, si, value)}
                            onBlur={(e) => handleSampleBlur(currentIdx, si, e.currentTarget.value)}
                            className={cn(ok === false ? 'border-danger' : ok === true ? 'border-success' : '')}
                          />
                        )}

                        {currentQuota.responseType === 'text' && (
                          <TextareaField
                            rows={2}
                            placeholder="Digite aqui..."
                            value={raw}
                            onChange={(value) => handleSampleChange(currentIdx, si, value)}
                          />
                        )}

                        {(currentQuota.responseType === 'list' || currentQuota.responseType === 'multiple' || currentQuota.responseType === 'binary') && (
                          <div className={cn('grid gap-sm', currentQuota.responseType === 'binary' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
                            {currentQuota.options?.map((option) => {
                              const active = selected.includes(option.value);
                              const bad = option.status === 'nok';
                              return (
                                <AstraButton
                                  key={option.value}
                                  type="button"
                                  variant={active ? 'primary' : 'neutral'}
                                  size="small"
                                  onClick={() => setChoice(option.value)}
                                  iconStart={active ? (bad ? <XCircle size={16} /> : <CheckCircle size={16} />) : undefined}
                                  className={cn('justify-center', active && bad ? 'bg-danger text-on-brand' : '')}
                                >
                                  {option.label}
                                </AstraButton>
                              );
                            })}
                          </div>
                        )}

                        <div className="min-h-lg flex items-center gap-xs text-label-sm font-semibold">
                          {ok === true && <><CheckCircle size={16} className="text-success" /><span className="text-success">Resposta OK</span></>}
                          {ok === false && <><XCircle size={16} className="text-danger" /><span className="text-danger">Resposta NOK</span></>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="lg:order-last order-first flex flex-col gap-md min-w-0">
              <div className="aspect-square w-full overflow-hidden rounded-corner-lg bg-bg-faint">
                <img
                  src={currentQuota.measureImageUrl}
                  alt={`Como medir: ${currentQuota.description}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="bg-bg-faint rounded-corner-md p-md text-label-sm text-text-secondary">
                Imagem de apoio para medir a cota {currentQuota.number}.
              </div>
            </aside>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-3">
        <Button
          variant="outline"
          size="lg"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
          className="gap-2 text-lg border-2"
        >
          <ChevronLeft className="w-5 h-5" /> Anterior
        </Button>

        {currentIdx < quotas.length - 1 ? (
          <Button
            size="lg"
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="gap-2 text-lg flex-1 bg-brand-primary hover:bg-brand-hover"
          >
            Próxima <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={!allComplete}
            onClick={() => setShowFinalConfirm(true)}
            className="gap-2 text-lg flex-1 font-bold"
          >
            FINALIZAR <CheckCircle className="w-5 h-5" />
          </Button>
        )}
      </div>

      {!allComplete && currentIdx === quotas.length - 1 && (
        <p className="text-text-secondary text-center mt-md text-label-sm">
          Preencha todas as {quotas.length} cotas para finalizar.
        </p>
      )}

      {/* Final confirm modal */}
      <AnimatePresence>
        {showFinalConfirm && (() => {
          const measurements = buildMeasurements();
          const nokCount = measurements.filter((m) => m.overallStatus === 'nok').length;
          const overall = nokCount === 0 ? 'ok' : 'nok';
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[92vw] overflow-hidden"
              >
                <div
                  className={cn(
                    'p-8 text-center',
                    overall === 'ok' ? 'bg-green-50' : 'bg-red-50'
                  )}
                >
                  {overall === 'ok' ? (
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  ) : (
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                  )}
                  <h3
                    className={cn(
                      'text-3xl font-black mb-2',
                      overall === 'ok' ? 'text-green-700' : 'text-red-700'
                    )}
                  >
                    {overall === 'ok' ? 'Peça Aprovada' : 'Peça Reprovada'}
                  </h3>
                  <p className="text-slate-600 text-lg">
                    {nokCount > 0
                      ? `${nokCount} cota(s) com desvio registrado`
                      : 'Todas as cotas dentro da tolerância'}
                  </p>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFinalConfirm(false)}
                    className="border-2 text-lg"
                  >
                    CORRIGIR
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleFinalSubmit}
                    className={cn(
                      'font-bold text-lg gap-2',
                      overall === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''
                    )}
                  >
                    SALVAR
                  </Button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Out-of-tolerance NC dialog */}
      <AnimatePresence>
        {pendingNc && (
          <NcDialog
            quota={quotas[pendingNc.quotaIdx]}
            measuredValue={pendingNc.value}
            sampleLabel={
              quotas[pendingNc.quotaIdx].sampleCount > 1
                ? `Amostra ${pendingNc.sampleIdx + 1}`
                : 'Medida única'
            }
            onIgnore={() => setPendingNc(null)}
            onConfirm={handleNcConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
