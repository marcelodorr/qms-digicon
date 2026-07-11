import { buildApiUrl, requestJson } from "./api";

export type Person = {
  id: string;
  name: string;
  email: string;
  signatureUrl?: string;
  certificates: PersonCertificate[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

export type PersonCertificate = {
  certificateId: string;
  isDefault: boolean;
};

type PersonApiModel = {
  Id?: number;
  Analyst?: string;
  Email?: string | null;
  Signature?: string | null;
  CreateBy?: string;
  UpdateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsDeleted?: boolean;
  Certificates?: PersonCertificateApi[];
  id?: number;
  analyst?: string;
  email?: string | null;
  signature?: string | null;
  createBy?: string;
  updateBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
  certificates?: PersonCertificateApi[];
};

type PersonCertificateApi = {
  Id?: number;
  Certificate?: number;
  IsDefault?: boolean;
  id?: number;
  certificate?: number;
  isDefault?: boolean;
};

type PersonApiResponse = {
  success?: boolean;
  message?: string;
  analyst?: PersonApiModel;
};

type PersonImportResponse = {
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

type PersonTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";

function mapCertificates(payload: unknown): PersonCertificate[] {
  if (!Array.isArray(payload)) return [];

  return payload
    .map(item => {
      const raw = item as Record<string, unknown>;
      const certificateId = String(raw.Certificate ?? raw.certificate ?? "").trim();
      if (!certificateId) return null;
      const isDefault = Boolean(raw.IsDefault ?? raw.isDefault ?? false);
      return { certificateId, isDefault };
    })
    .filter((cert): cert is PersonCertificate => Boolean(cert));
}

function mapPersonFromApi(payload: PersonApiModel): Person {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const name = String(raw.Analyst ?? raw.analyst ?? "");
  const email = String(raw.Email ?? raw.email ?? "");
  const signatureValue = raw.Signature ?? raw.signature;
  const signatureUrl = signatureValue ? String(signatureValue) : undefined;
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? createdBy);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);
  const certificates = mapCertificates(raw.Certificates ?? raw.certificates);

  return {
    id,
    name,
    email,
    signatureUrl,
    certificates,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
  };
}

function buildCertificatePayload(certificates?: PersonCertificate[]) {
  if (!certificates) return undefined;
  return certificates
    .map(cert => ({
      Certificate: Number(cert.certificateId),
      IsDefault: cert.isDefault,
    }))
    .filter(cert => Number.isFinite(cert.Certificate) && cert.Certificate > 0);
}

function buildPayload(
  name: string,
  email: string,
  signatureUrl?: string,
  createdBy?: string,
  id?: string,
  certificates?: PersonCertificate[]
) {
  const payload: Record<string, unknown> = {
    Analyst: name.trim(),
  };

  const trimmedEmail = email?.trim();
  if (trimmedEmail) {
    payload.Email = trimmedEmail;
  } else {
    payload.Email = null;
  }

  const trimmedSignature = signatureUrl?.trim();
  if (trimmedSignature) {
    payload.Signature = trimmedSignature;
  } else {
    payload.Signature = null;
  }

  if (createdBy) {
    payload.CreateBy = createdBy;
    payload.UpdateBy = createdBy;
  }

  if (id) {
    payload.Id = Number(id);
  }

  const certificatePayload = buildCertificatePayload(certificates);
  if (certificatePayload) {
    payload.Certificates = certificatePayload;
  }

  return payload;
}

export async function fetchPeople(): Promise<Person[]> {
  const list = await requestJson<PersonApiModel[]>("/api/Analyst");
  if (!Array.isArray(list)) return [];
  return list.map(mapPersonFromApi);
}

export async function createPerson(
  name: string,
  email: string,
  signatureUrl?: string,
  createdBy?: string,
  certificates?: PersonCertificate[]
) {
  const payload = buildPayload(name, email, signatureUrl, createdBy, undefined, certificates);
  const response = await requestJson<PersonApiResponse>("/api/Analyst", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.analyst) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapPersonFromApi(response.analyst);
}

export async function updatePerson(
  id: string,
  name: string,
  email: string,
  signatureUrl?: string,
  createdBy?: string,
  certificates?: PersonCertificate[]
) {
  const payload = buildPayload(name, email, signatureUrl, createdBy, id, certificates);
  const response = await requestJson<PersonApiResponse>("/api/Analyst", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.analyst) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapPersonFromApi(response.analyst);
}

export async function deletePerson(id: string) {
  await requestJson<PersonApiResponse>(`/api/Analyst/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadPeopleTemplate(): Promise<PersonTemplate> {
  const response = await fetch(buildApiUrl("/api/Analyst/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "analistas_template.xlsx";

  return { blob, filename };
}

export async function importPeople(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/Analyst/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as PersonImportResponse;
  return payload;
}
