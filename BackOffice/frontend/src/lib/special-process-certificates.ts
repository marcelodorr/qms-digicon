import { buildApiUrl, requestJson } from "./api";

export type SpecialProcessCertificateApi = {
  Id?: number;
  CertificateCode?: string;
  ClienteId?: number | null;
  ClienteNome?: string | null;
  SpecialProcessId?: number | null;
  SpecialProcess?: string | null;
  Norma?: string | null;
  PartNumber?: string | null;
  EmissionDate?: string;
  Quantity?: number | string | null;
  LotNumber?: string | null;
  PurchasingOrder?: string | null;
  Item?: string | null;
  HardnessFound?: string | null;
  HeatTreatLot?: string | null;
  AnalystId?: number | null;
  AnalystName?: string | null;
  Observations?: string | null;
  CreateBy?: string;
  UpdateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsDeleted?: boolean;
  id?: number;
  certificateCode?: string;
  clienteId?: number | null;
  clienteNome?: string | null;
  specialProcessId?: number | null;
  specialProcess?: string | null;
  norma?: string | null;
  partNumber?: string | null;
  emissionDate?: string;
  quantity?: number | string | null;
  lotNumber?: string | null;
  purchasingOrder?: string | null;
  item?: string | null;
  hardnessFound?: string | null;
  heatTreatLot?: string | null;
  analystId?: number | null;
  analystName?: string | null;
  observations?: string | null;
  createBy?: string;
  updateBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
  isDeleted?: boolean;
};

export type SpecialProcessCertificatePayload = {
  ClienteId?: number | null;
  ClienteNome?: string | null;
  SpecialProcessId?: number | null;
  SpecialProcess?: string | null;
  Norma?: string | null;
  PartNumber?: string | null;
  EmissionDate?: string | null;
  Quantity?: string | null;
  LotNumber?: string | null;
  PurchasingOrder?: string | null;
  Item?: string | null;
  HardnessFound?: string | null;
  HeatTreatLot?: string | null;
  AnalystId?: number | null;
  AnalystName?: string | null;
  Observations?: string | null;
  CreateBy?: string;
  UpdateBy?: string;
};

export type SpecialProcessCertificateProcessPayload = {
  SpecialProcessId?: number | null;
  SpecialProcess?: string | null;
  Norma?: string | null;
  HardnessFound?: string | null;
  HeatTreatLot?: string | null;
};

export type SpecialProcessCertificateBatchPayload = {
  ClienteId?: number | null;
  ClienteNome?: string | null;
  PartNumber?: string | null;
  EmissionDate?: string | null;
  Quantity?: string | null;
  LotNumber?: string | null;
  PurchasingOrder?: string | null;
  Item?: string | null;
  AnalystId?: number | null;
  AnalystName?: string | null;
  Observations?: string | null;
  CreateBy?: string;
  UpdateBy?: string;
  Processes: SpecialProcessCertificateProcessPayload[];
};

type NextCodeResponse = {
  code?: string;
};

type PdfDownload = {
  blob: Blob;
  filename: string;
};

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchSpecialProcessCertificates(): Promise<SpecialProcessCertificateApi[]> {
  const list = await requestJson<SpecialProcessCertificateApi[]>("/api/SpecialProcessCertificate");
  if (!Array.isArray(list)) return [];
  return list;
}

export async function fetchSpecialProcessCertificateById(id: string): Promise<SpecialProcessCertificateApi | null> {
  const payload = await requestJson<SpecialProcessCertificateApi>(`/api/SpecialProcessCertificate/${id}`);
  return payload ?? null;
}

export async function fetchNextSpecialProcessCertificateCode(emissionDate?: Date): Promise<string> {
  const query = emissionDate ? `?emissionDate=${encodeURIComponent(emissionDate.toISOString())}` : "";
  const response = await requestJson<NextCodeResponse>(`/api/SpecialProcessCertificate/novo${query}`);
  return String(response?.code ?? "");
}

export async function createSpecialProcessCertificate(payload: SpecialProcessCertificatePayload): Promise<SpecialProcessCertificateApi> {
  const response = await requestJson<SpecialProcessCertificateApi>("/api/SpecialProcessCertificate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response;
}

export async function createSpecialProcessCertificatesBatch(
  payload: SpecialProcessCertificateBatchPayload
): Promise<SpecialProcessCertificateApi[]> {
  const response = await requestJson<SpecialProcessCertificateApi[]>("/api/SpecialProcessCertificate/batch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!Array.isArray(response)) return [];
  return response;
}

export async function updateSpecialProcessCertificate(
  id: string,
  payload: SpecialProcessCertificatePayload
): Promise<SpecialProcessCertificateApi> {
  const response = await requestJson<SpecialProcessCertificateApi>(`/api/SpecialProcessCertificate/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response;
}

export async function deleteSpecialProcessCertificate(id: string) {
  await requestJson<Record<string, unknown>>(`/api/SpecialProcessCertificate/${id}`, {
    method: "DELETE",
  });
}

export async function downloadSpecialProcessCertificatePdf(
  id: string,
  options?: { saveOnServer?: boolean; disposition?: string }
): Promise<PdfDownload> {
  const body = {
    Id: Number(id),
    SaveOnServer: options?.saveOnServer ?? false,
    Disposition: options?.disposition ?? "attachment",
  };

  const response = await fetch(buildApiUrl("/api/SpecialProcessCertificate/gerar-pdf"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const blob = await response.blob();
  const fallbackDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    `Certificate_Special_Process_NA-NANANA_${fallbackDate}.pdf`;

  return { blob, filename };
}

export async function downloadSpecialProcessCertificatesCombinedPdf(
  ids: string[],
  options?: { saveOnServer?: boolean; disposition?: string }
): Promise<PdfDownload> {
  const numericIds = ids
    .map(value => Number(value))
    .filter(value => Number.isFinite(value) && value > 0);

  if (numericIds.length === 0) {
    throw new Error("Nenhum certificado válido informado.");
  }

  const body = {
    Ids: numericIds,
    SaveOnServer: options?.saveOnServer ?? false,
    Disposition: options?.disposition ?? "attachment",
  };

  const response = await fetch(buildApiUrl("/api/SpecialProcessCertificate/gerar-pdf-combinado"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const blob = await response.blob();
  const fallbackDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    `Certificate_Special_Process_NA-NANANA_${fallbackDate}.pdf`;

  return { blob, filename };
}
