import { buildApiUrl, requestJson } from "./api";

export type PartNumber = {
  id: string;
  partNumber: string;
  description: string;
  revision: string;
  drawingRevision?: string;
  clientId?: string;
  clientName?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

export type PartNumberHistoryItem = {
  id: string;
  partNumberId: string;
  changes?: string;
  observation?: string;
  changedBy: string;
  changedAt: string;
};

type PartNumberApiModel = {
  Id?: number;
  PartNumber?: string;
  Descricao?: string;
  Revision?: string | null;
  DrawingRevision?: string | null;
  ClienteId?: number | null;
  ClienteNome?: string | null;
  IsActive?: boolean | null;
  CreateBy?: string;
  UpdateBy?: string;
  CreateDate?: string;
  LastUpdated?: string | null;
  IsDeleted?: boolean;
  id?: number;
  partNumber?: string;
  descricao?: string;
  description?: string;
  revision?: string | null;
  drawingRevision?: string | null;
  clienteId?: number | null;
  clienteNome?: string | null;
  isActive?: boolean | null;
  createBy?: string;
  updateBy?: string;
  createDate?: string;
  lastUpdated?: string | null;
};

type PartNumberApiResponse = {
  success?: boolean;
  message?: string;
  partNumber?: PartNumberApiModel;
};

type PartNumberImportResponse = {
  success?: boolean;
  message?: string;
  result?: {
    totalRows?: number;
    inserted?: number;
    updated?: number;
    skipped?: number;
    errors?: string[];
  };
};

type PartNumberTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";

function mapPartNumberFromApi(payload: PartNumberApiModel): PartNumber {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const partNumber = String(raw.PartNumber ?? raw.partNumber ?? "");
  const description = String(raw.Descricao ?? raw.descricao ?? raw.description ?? "");
  const revision = String(raw.Revision ?? raw.revision ?? "");
  const drawingRevision = String(raw.DrawingRevision ?? raw.drawingRevision ?? "");
  const clientIdValue = raw.ClienteId ?? raw.clienteId;
  const clientId = clientIdValue != null ? String(clientIdValue) : undefined;
  const clientNameValue = raw.ClienteNome ?? raw.clienteNome;
  const clientName = clientNameValue ? String(clientNameValue) : undefined;
  const isActiveValue = raw.IsActive ?? raw.isActive;
  const isActive = typeof isActiveValue === "boolean" ? isActiveValue : true;
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? createdBy);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdated ?? raw.lastUpdated ?? createdAt);

  return {
    id,
    partNumber,
    description,
    revision,
    drawingRevision,
    clientId,
    clientName,
    isActive,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
  };
}

function buildPayload(
  partNumber: string,
  description: string,
  revision: string,
  drawingRevision: string | undefined,
  clientId: string | undefined,
  isActive: boolean,
  createdBy?: string,
  id?: string,
  observation?: string
) {
  const payload: Record<string, unknown> = {
    PartNumber: partNumber.trim(),
    Descricao: description.trim(),
    Revision: revision.trim(),
    DrawingRevision: drawingRevision?.trim() || null,
    ClienteId: clientId ? Number(clientId) : null,
    IsActive: isActive,
  };

  if (createdBy) {
    payload.CreateBy = createdBy;
    payload.UpdateBy = createdBy;
  }

  if (observation) {
    payload.Observation = observation.trim();
  }

  if (id) {
    payload.Id = Number(id);
  }

  return payload;
}

export async function fetchPartNumbers(): Promise<PartNumber[]> {
  const list = await requestJson<PartNumberApiModel[]>("/api/PartNumber");
  if (!Array.isArray(list)) return [];
  return list.map(mapPartNumberFromApi);
}

export async function fetchPartNumber(id: string): Promise<PartNumber> {
  const response = await requestJson<PartNumberApiResponse>(`/api/PartNumber/${id}`);
  if (!response?.partNumber) {
    throw new Error(response?.message || "Part Number não encontrado.");
  }
  return mapPartNumberFromApi(response.partNumber);
}

export async function createPartNumber(
  partNumber: string,
  description: string,
  revision: string,
  drawingRevision?: string,
  clientId?: string,
  isActive = true,
  createdBy?: string
) {
  const payload = buildPayload(partNumber, description, revision, drawingRevision, clientId, isActive, createdBy);
  const response = await requestJson<PartNumberApiResponse>("/api/PartNumber", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.partNumber) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapPartNumberFromApi(response.partNumber);
}

export async function fetchPartNumberHistory(partNumberId: string): Promise<PartNumberHistoryItem[]> {
  const list = await requestJson<Record<string, unknown>[]>(`/api/PartNumber/${partNumberId}/history`);
  if (!Array.isArray(list)) return [];
  return list.map(item => {
    const raw = item as Record<string, unknown>;
    return {
      id: String(raw.Id ?? raw.id ?? ""),
      partNumberId: String(raw.PartNumberId ?? raw.partNumberId ?? partNumberId),
      changes: raw.Changes ? String(raw.Changes) : raw.changes ? String(raw.changes) : undefined,
      observation: raw.Observation ? String(raw.Observation) : raw.observation ? String(raw.observation) : undefined,
      changedBy: String(raw.ChangedBy ?? raw.changedBy ?? DEFAULT_USER),
      changedAt: String(raw.ChangedAt ?? raw.changedAt ?? new Date().toISOString()),
    };
  });
}

export async function updatePartNumber(
  id: string,
  partNumber: string,
  description: string,
  revision: string,
  drawingRevision?: string,
  clientId?: string,
  isActive = true,
  createdBy?: string,
  observation?: string
) {
  const payload = buildPayload(partNumber, description, revision, drawingRevision, clientId, isActive, createdBy, id, observation);
  const response = await requestJson<PartNumberApiResponse>("/api/PartNumber", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.partNumber) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapPartNumberFromApi(response.partNumber);
}

export async function deletePartNumber(id: string) {
  await requestJson<PartNumberApiResponse>(`/api/PartNumber/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadPartNumberTemplate(): Promise<PartNumberTemplate> {
  const response = await fetch(buildApiUrl("/api/PartNumber/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "part_numbers_template.xlsx";

  return { blob, filename };
}

export async function importPartNumbers(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/PartNumber/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as PartNumberImportResponse;
  return payload;
}
