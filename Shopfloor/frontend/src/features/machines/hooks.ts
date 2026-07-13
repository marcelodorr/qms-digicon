import { useCallback, useEffect, useState } from 'react';
import { machinesApi } from './api';
import type { MachineDto } from './types';

export function useMachines() {
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setMachines(await machinesApi.list()); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Falha ao carregar máquinas.'); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { machines, isLoading, error, reload };
}
