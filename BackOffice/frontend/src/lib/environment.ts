export type AppEnvironment = 'QA' | 'PD';

const ENV_STORAGE_KEY = 'digicon-qms-environment';
const DEFAULT_ENV: AppEnvironment = 'PD';
const ENV_CHANGE_EVENT = 'digicon:qms-environment-change';

const normalizeEnvironment = (value?: string): AppEnvironment => {
  if (value === 'QA' || value === 'PD') {
    return value;
  }
  return DEFAULT_ENV;
};

export const getEnvironment = (): AppEnvironment => {
  if (typeof window === 'undefined') {
    return DEFAULT_ENV;
  }
  return normalizeEnvironment(window.localStorage.getItem(ENV_STORAGE_KEY) ?? undefined);
};

export const getEnvironmentLabel = (value?: AppEnvironment) =>
  normalizeEnvironment(value) === 'QA' ? 'QA' : 'PD';

export const setEnvironment = (value: AppEnvironment) => {
  if (typeof window === 'undefined') {
    return;
  }
  const normalized = normalizeEnvironment(value);
  window.localStorage.setItem(ENV_STORAGE_KEY, normalized);
  window.dispatchEvent(new CustomEvent(ENV_CHANGE_EVENT, { detail: normalized }));
};

export const subscribeEnvironment = (handler: (value: AppEnvironment) => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ENV_STORAGE_KEY) {
      handler(normalizeEnvironment(event.newValue ?? undefined));
    }
  };

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<AppEnvironment>).detail;
    handler(normalizeEnvironment(detail));
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(ENV_CHANGE_EVENT, onCustom as EventListener);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(ENV_CHANGE_EVENT, onCustom as EventListener);
  };
};
