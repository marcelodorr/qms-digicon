"use client";

import { useSyncExternalStore } from "react";

export type ErrorLogEntry = {
  id: string;
  message: string;
  detail?: string;
  source?: string;
  path?: string;
  timestamp: string;
};

type LogListener = () => void;

const STORAGE_KEY = "digicon-qms-error-logs";
const MAX_LOGS = 200;
const listeners = new Set<LogListener>();

const loadLogs = (): ErrorLogEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && typeof entry.message === "string");
  } catch {
    return [];
  }
};

let logEntries: ErrorLogEntry[] = loadLogs();

const saveLogs = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logEntries));
  } catch {
    // Ignore storage errors.
  }
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setLogs = (next: ErrorLogEntry[]) => {
  logEntries = next;
  saveLogs();
  emit();
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeError = (error: unknown): { message: string; detail?: string } => {
  if (error instanceof Error) {
    return { message: error.message || "Erro inesperado", detail: error.stack };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  if (error && typeof error === "object") {
    try {
      return { message: "Erro inesperado", detail: JSON.stringify(error) };
    } catch {
      return { message: "Erro inesperado" };
    }
  }
  return { message: "Erro inesperado" };
};

const resolvePath = () => {
  if (typeof window === "undefined") return undefined;
  return window.location?.pathname;
};

export const subscribeErrorLogs = (listener: LogListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getErrorLogs = () => logEntries;

export const useErrorLogs = () =>
  useSyncExternalStore(subscribeErrorLogs, getErrorLogs, getErrorLogs);

export const addErrorLog = (payload: {
  message: string;
  detail?: string;
  source?: string;
  path?: string;
}) => {
  const entry: ErrorLogEntry = {
    id: createId(),
    message: payload.message,
    detail: payload.detail,
    source: payload.source,
    path: payload.path ?? resolvePath(),
    timestamp: new Date().toISOString(),
  };
  setLogs([entry, ...logEntries].slice(0, MAX_LOGS));
};

export const logErrorFromUnknown = (error: unknown, source?: string) => {
  const normalized = normalizeError(error);
  addErrorLog({
    message: normalized.message,
    detail: normalized.detail,
    source,
  });
};

export const removeErrorLog = (id: string) => {
  setLogs(logEntries.filter((entry) => entry.id !== id));
};

export const clearErrorLogs = () => {
  setLogs([]);
};
