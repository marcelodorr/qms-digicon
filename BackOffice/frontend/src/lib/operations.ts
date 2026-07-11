import { buildApiUrl, requestJson } from "./api";

export type Operation = {
  id: string;
  code: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

type OperationApiModel = {
  Id?: number;
  OperationQuantity?: string;
  OperationDescription?: string;
  CreateBy?: string;
  UpdateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsActivated?: boolean;
  IsDeleted?: boolean;
  id?: number;
  operationQuantity?: string;
  operationDescription?: string;
  createBy?: string;
  updateBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
};

type OperationApiResponse = {
  success?: boolean;
  message?: string;
  operacao?: OperationApiModel;
};

type OperationImportResponse = {
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

type OperationTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";

function mapOperationFromApi(payload: OperationApiModel): Operation {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const code = String(raw.OperationQuantity ?? raw.operationQuantity ?? "");
  const description = String(raw.OperationDescription ?? raw.operationDescription ?? "");
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? createdBy);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  return {
    id,
    code,
    description,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
  };
}

function buildPayload(code: string, description: string, createdBy?: string, id?: string) {
  const payload: Record<string, unknown> = {
    OperationQuantity: code.trim(),
    OperationDescription: description.trim(),
  };

  if (createdBy) {
    payload.CreateBy = createdBy;
    payload.UpdateBy = createdBy;
  }

  if (id) {
    payload.Id = Number(id);
  }

  return payload;
}

export async function fetchOperations(): Promise<Operation[]> {
  const list = await requestJson<OperationApiModel[]>("/api/Operacao");
  if (!Array.isArray(list)) return [];
  return list.map(mapOperationFromApi);
}

export async function createOperation(code: string, description: string, createdBy?: string) {
  const payload = buildPayload(code, description, createdBy);
  const response = await requestJson<OperationApiResponse>("/api/Operacao", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.operacao) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapOperationFromApi(response.operacao);
}

export async function updateOperation(id: string, code: string, description: string, createdBy?: string) {
  const payload = buildPayload(code, description, createdBy, id);
  const response = await requestJson<OperationApiResponse>("/api/Operacao", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.operacao) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapOperationFromApi(response.operacao);
}

export async function deleteOperation(id: string) {
  await requestJson<OperationApiResponse>(`/api/Operacao/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadOperationTemplate(): Promise<OperationTemplate> {
  const response = await fetch(buildApiUrl("/api/Operacao/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "operacoes_template.xlsx";

  return { blob, filename };
}

export async function importOperations(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/Operacao/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as OperationImportResponse;
  return payload;
}
