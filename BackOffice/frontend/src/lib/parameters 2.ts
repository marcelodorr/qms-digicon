import { buildApiUrl, requestJson } from "./api";

export type Parameter = {
  id: string;
  partNumber: string;
  process: string;
  norm: string;
  normaRevision?: string;
  parameter: string;
  condition?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

type ParameterApiModel = {
  Id?: number;
  PartNumber?: string;
  Processo?: string;
  Norma?: string;
  NormaRevision?: string | null;
  Parameter?: string;
  Condition?: string | null;
  CreateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsDeleted?: boolean;
  id?: number;
  partNumber?: string;
  processo?: string;
  norma?: string;
  normaRevision?: string | null;
  parameter?: string;
  condition?: string | null;
  createBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
};

type ParameterApiResponse = {
  success?: boolean;
  message?: string;
  parameter?: ParameterApiModel;
};

type ParameterImportResponse = {
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

type ParameterTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";

function mapParameterFromApi(payload: ParameterApiModel): Parameter {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const partNumber = String(raw.PartNumber ?? raw.partNumber ?? "");
  const process = String(raw.Processo ?? raw.processo ?? "");
  const norm = String(raw.Norma ?? raw.norma ?? "");
  const normaRevisionValue = raw.NormaRevision ?? raw.normaRevision;
  const normaRevision = normaRevisionValue ? String(normaRevisionValue) : undefined;
  const parameter = String(raw.Parameter ?? raw.parameter ?? "");
  const conditionValue = raw.Condition ?? raw.condition;
  const condition = conditionValue ? String(conditionValue) : undefined;
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  return {
    id,
    partNumber,
    process,
    norm,
    normaRevision,
    parameter,
    condition,
    createdBy,
    createdAt,
    updatedBy: createdBy,
    updatedAt,
  };
}

function buildPayload(
  partNumber: string,
  process: string,
  norm: string,
  parameter: string,
  condition?: string,
  createdBy?: string,
  id?: string
) {
  const payload: Record<string, unknown> = {
    PartNumber: partNumber.trim(),
    Processo: process.trim(),
    Norma: norm.trim(),
    Parameter: parameter.trim(),
    Condition: condition?.trim() || null,
  };

  if (createdBy) {
    payload.CreateBy = createdBy;
  }

  if (id) {
    payload.Id = Number(id);
  }

  return payload;
}

export async function fetchParameters(): Promise<Parameter[]> {
  const list = await requestJson<ParameterApiModel[]>("/api/Parameter");
  if (!Array.isArray(list)) return [];
  return list.map(mapParameterFromApi);
}

export async function createParameter(
  partNumber: string,
  process: string,
  norm: string,
  parameter: string,
  condition?: string,
  createdBy?: string
) {
  const payload = buildPayload(partNumber, process, norm, parameter, condition, createdBy);
  const response = await requestJson<ParameterApiResponse>("/api/Parameter", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.parameter) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapParameterFromApi(response.parameter);
}

export async function updateParameter(
  id: string,
  partNumber: string,
  process: string,
  norm: string,
  parameter: string,
  condition?: string,
  createdBy?: string
) {
  const payload = buildPayload(partNumber, process, norm, parameter, condition, createdBy, id);
  const response = await requestJson<ParameterApiResponse>("/api/Parameter", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.parameter) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapParameterFromApi(response.parameter);
}

export async function deleteParameter(id: string) {
  await requestJson<ParameterApiResponse>(`/api/Parameter/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadParametersTemplate(): Promise<ParameterTemplate> {
  const response = await fetch(buildApiUrl("/api/Parameter/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "parametros_template.xlsx";

  return { blob, filename };
}

export async function importParameters(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/Parameter/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as ParameterImportResponse;
  return payload;
}
