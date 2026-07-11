import { buildApiUrl, requestJson } from "./api";

export type SpecialNorm = {
  id: string;
  specialProcess: string;
  specification: string;
  revision: string;
  comment?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

type SpecialNormApiModel = {
  Id?: number;
  SpecialProcess?: string;
  Specification?: string | null;
  Revision?: string | null;
  Comment?: string | null;
  CreateBy?: string;
  UpdateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsDeleted?: boolean;
  id?: number;
  specialProcess?: string;
  specification?: string | null;
  revision?: string | null;
  comment?: string | null;
  createBy?: string;
  updateBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
};

type SpecialNormApiResponse = {
  success?: boolean;
  message?: string;
  specialProcess?: SpecialNormApiModel;
};

type SpecialNormImportResponse = {
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

type SpecialNormTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";

function mapSpecialNormFromApi(payload: SpecialNormApiModel): SpecialNorm {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const specialProcess = String(raw.SpecialProcess ?? raw.specialProcess ?? "");
  const specification = String(raw.Specification ?? raw.specification ?? "");
  const revision = String(raw.Revision ?? raw.revision ?? "");
  const commentValue = raw.Comment ?? raw.comment;
  const comment = commentValue ? String(commentValue) : undefined;
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? createdBy);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  return {
    id,
    specialProcess,
    specification,
    revision,
    comment,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
  };
}

function buildPayload(
  specialProcess: string,
  specification: string,
  revision: string,
  comment?: string,
  createdBy?: string,
  id?: string
) {
  const payload: Record<string, unknown> = {
    SpecialProcess: specialProcess.trim(),
    Specification: specification.trim(),
    Revision: revision.trim(),
    Comment: comment?.trim() || null,
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

export async function fetchSpecialNorms(): Promise<SpecialNorm[]> {
  const list = await requestJson<SpecialNormApiModel[]>("/api/SpecialProcess");
  if (!Array.isArray(list)) return [];
  return list.map(mapSpecialNormFromApi);
}

export async function createSpecialNorm(
  specialProcess: string,
  specification: string,
  revision: string,
  comment?: string,
  createdBy?: string
) {
  const payload = buildPayload(specialProcess, specification, revision, comment, createdBy);
  const response = await requestJson<SpecialNormApiResponse>("/api/SpecialProcess", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.specialProcess) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapSpecialNormFromApi(response.specialProcess);
}

export async function updateSpecialNorm(
  id: string,
  specialProcess: string,
  specification: string,
  revision: string,
  comment?: string,
  createdBy?: string
) {
  const payload = buildPayload(specialProcess, specification, revision, comment, createdBy, id);
  const response = await requestJson<SpecialNormApiResponse>("/api/SpecialProcess", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.specialProcess) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapSpecialNormFromApi(response.specialProcess);
}

export async function deleteSpecialNorm(id: string) {
  await requestJson<SpecialNormApiResponse>(`/api/SpecialProcess/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadSpecialNormsTemplate(): Promise<SpecialNormTemplate> {
  const response = await fetch(buildApiUrl("/api/SpecialProcess/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "template_normas_especiais.xlsx";

  return { blob, filename };
}

export async function importSpecialNorms(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/SpecialProcess/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as SpecialNormImportResponse;
  return payload;
}
