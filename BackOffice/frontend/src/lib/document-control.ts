import { requestJson } from "./api";

export type DocumentControl = {
  id: string;
  documentNumber: string;
  documentRevision: string;
  documentDate: string;
  inspectedAccording: string;
  createDate: string;
  lastUpdate: string;
};

type DocumentControlApi = {
  Id?: number;
  DocumentNumber?: string;
  DocumentRevision?: string;
  DocumentDate?: string;
  InspectedAccording?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  id?: number;
  documentNumber?: string;
  documentRevision?: string;
  documentDate?: string;
  inspectedAccording?: string;
  createDate?: string;
  lastUpdate?: string | null;
};

type DocumentControlResponse = {
  success?: boolean;
  message?: string;
  documentControl?: DocumentControlApi;
};

const DEFAULT_DATE = new Date(2025, 10, 25).toISOString();

function mapDocumentControl(payload: DocumentControlApi): DocumentControl {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const documentNumber = String(raw.DocumentNumber ?? raw.documentNumber ?? "");
  const documentRevision = String(raw.DocumentRevision ?? raw.documentRevision ?? "");
  const documentDate = String(raw.DocumentDate ?? raw.documentDate ?? DEFAULT_DATE);
  const inspectedAccording = String(raw.InspectedAccording ?? raw.inspectedAccording ?? "");
  const createDate = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const lastUpdate = String(raw.LastUpdate ?? raw.lastUpdate ?? createDate);

  return {
    id,
    documentNumber,
    documentRevision,
    documentDate,
    inspectedAccording,
    createDate,
    lastUpdate,
  };
}

export async function fetchDocumentControl(): Promise<DocumentControl> {
  const payload = await requestJson<DocumentControlApi>("/api/ProductDocumentControl");
  return mapDocumentControl(payload ?? {});
}

type SaveDocumentControlInput = {
  documentNumber: string;
  documentRevision: string;
  documentDate: string;
  inspectedAccording: string;
};

export async function saveDocumentControl(payload: SaveDocumentControlInput): Promise<DocumentControl> {
  const response = await requestJson<DocumentControlResponse>("/api/ProductDocumentControl", {
    method: "PUT",
    body: JSON.stringify({
      DocumentNumber: payload.documentNumber,
      DocumentRevision: payload.documentRevision,
      DocumentDate: payload.documentDate,
      InspectedAccording: payload.inspectedAccording,
    }),
  });

  if (!response?.documentControl) {
    throw new Error(response?.message || "Resposta inválida do servidor.");
  }

  return mapDocumentControl(response.documentControl);
}
