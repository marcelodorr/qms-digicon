import { buildApiUrl, requestJson } from "./api";

export type Norm = {
  id: string;
  client: string;
  process: string;
  standard: string;
  revision: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

type NormApiModel = {
  Id?: number;
  Cliente?: string;
  Processo?: string;
  Norma?: string;
  Revision?: string | null;
  CreateBy?: string;
  UpdateBy?: string;
  CreateDate?: string;
  LastUpdated?: string | null;
  IsDeleted?: boolean;
  id?: number;
  cliente?: string;
  processo?: string;
  norma?: string;
  revision?: string | null;
  createBy?: string;
  updateBy?: string;
  createDate?: string;
  lastUpdated?: string | null;
};

type NormApiResponse = {
  success?: boolean;
  message?: string;
  norma?: NormApiModel;
};

type NormImportResponse = {
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

type NormTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";

function mapNormFromApi(payload: NormApiModel): Norm {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const client = String(raw.Cliente ?? raw.cliente ?? "");
  const process = String(raw.Processo ?? raw.processo ?? "");
  const standard = String(raw.Norma ?? raw.norma ?? "");
  const revision = String(raw.Revision ?? raw.revision ?? "");
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? createdBy);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdated ?? raw.lastUpdated ?? createdAt);

  return {
    id,
    client,
    process,
    standard,
    revision,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
  };
}

function buildPayload(
  client: string,
  process: string,
  standard: string,
  revision: string,
  createdBy?: string,
  id?: string
) {
  const normalizedStandard = standard.trim() === "" ? "-" : standard.trim();
  const normalizedRevision = revision.trim() === "" ? "-" : revision.trim();
  const payload: Record<string, unknown> = {
    Cliente: client.trim(),
    Processo: process.trim(),
    Norma: normalizedStandard,
    Revision: normalizedRevision,
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

export async function fetchNorms(): Promise<Norm[]> {
  const list = await requestJson<NormApiModel[]>("/api/Norma");
  if (!Array.isArray(list)) return [];
  return list.map(mapNormFromApi);
}

export async function createNorm(
  client: string,
  process: string,
  standard: string,
  revision: string,
  createdBy?: string
) {
  const payload = buildPayload(client, process, standard, revision, createdBy);
  const response = await requestJson<NormApiResponse>("/api/Norma", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.norma) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapNormFromApi(response.norma);
}

export async function updateNorm(
  id: string,
  client: string,
  process: string,
  standard: string,
  revision: string,
  createdBy?: string
) {
  const payload = buildPayload(client, process, standard, revision, createdBy, id);
  const response = await requestJson<NormApiResponse>("/api/Norma", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.norma) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapNormFromApi(response.norma);
}

export async function deleteNorm(id: string) {
  await requestJson<NormApiResponse>(`/api/Norma/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadNormsTemplate(): Promise<NormTemplate> {
  const response = await fetch(buildApiUrl("/api/Norma/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "normas_template.xlsx";

  return { blob, filename };
}

export async function importNorms(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/Norma/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as NormImportResponse;
  return payload;
}
