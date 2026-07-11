import { buildApiUrl, requestJson } from "./api";

export type ProductConformityCertificate = {
  id: string;
  certificateNumber: string;
  emissionDate: string;
  partNumberId?: string;
  partNumber?: string;
  partNumberDescription?: string;
  partNumberRevision?: string;
  lotNumber?: string;
  quantity?: string;
  customerPO?: string;
  type?: string;
  serialNumber?: string;
  inspectedAccording?: string;
  analystId?: string;
  analystName?: string;
  documentNumber?: string;
  documentRevision?: string;
  documentDate?: string;
  customerId?: string;
  customerName?: string;
  customerAddress?: string;
  createBy?: string;
  createDate?: string;
  lastUpdate?: string;
  isDeleted?: boolean;
};

type ProductConformityCertificateApi = {
  Id?: number;
  CertificateNumber?: string;
  EmissionDate?: string;
  PartNumberId?: number | null;
  PartNumber?: string;
  PartNumberDescription?: string | null;
  PartNumberRevision?: string | null;
  LotNumber?: string | null;
  Quantity?: string | null;
  CustomerPO?: string | null;
  Type?: string | null;
  SerialNumber?: string | null;
  InspectedAccording?: string | null;
  AnalystId?: number | null;
  AnalystName?: string | null;
  DocumentNumber?: string | null;
  DocumentRevision?: string | null;
  DocumentDate?: string;
  CustomerId?: number | null;
  CustomerName?: string | null;
  CustomerAddress?: string | null;
  CreateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsDeleted?: boolean;
  id?: number;
  certificateNumber?: string;
  emissionDate?: string;
  partNumberId?: number | null;
  partNumber?: string;
  partNumberDescription?: string | null;
  partNumberRevision?: string | null;
  lotNumber?: string | null;
  quantity?: string | null;
  customerPO?: string | null;
  type?: string | null;
  serialNumber?: string | null;
  inspectedAccording?: string | null;
  analystId?: number | null;
  analystName?: string | null;
  documentNumber?: string | null;
  documentRevision?: string | null;
  documentDate?: string;
  customerId?: number | null;
  customerName?: string | null;
  customerAddress?: string | null;
  createBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
  isDeleted?: boolean;
};

type ProductConformityCertificateResponse = {
  success?: boolean;
  message?: string;
  certificate?: ProductConformityCertificateApi;
};

type NextNumberResponse = {
  nextNumber?: string;
};

type PdfDownload = {
  blob: Blob;
  filename: string;
};

function mapCertificateFromApi(payload: ProductConformityCertificateApi): ProductConformityCertificate {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const certificateNumber = String(raw.CertificateNumber ?? raw.certificateNumber ?? "");
  const emissionDate = String(raw.EmissionDate ?? raw.emissionDate ?? "");
  const partNumberIdValue = raw.PartNumberId ?? raw.partNumberId;
  const analystIdValue = raw.AnalystId ?? raw.analystId;
  const customerIdValue = raw.CustomerId ?? raw.customerId;
  const partNumberId = partNumberIdValue != null ? String(partNumberIdValue) : undefined;
  const analystId = analystIdValue != null ? String(analystIdValue) : undefined;
  const customerId = customerIdValue != null ? String(customerIdValue) : undefined;

  return {
    id,
    certificateNumber,
    emissionDate,
    partNumberId,
    partNumber: raw.PartNumber ? String(raw.PartNumber) : String(raw.partNumber ?? ""),
    partNumberDescription: raw.PartNumberDescription
      ? String(raw.PartNumberDescription)
      : String(raw.partNumberDescription ?? ""),
    partNumberRevision: raw.PartNumberRevision
      ? String(raw.PartNumberRevision)
      : String(raw.partNumberRevision ?? ""),
    lotNumber: String(raw.LotNumber ?? raw.lotNumber ?? ""),
    quantity: String(raw.Quantity ?? raw.quantity ?? ""),
    customerPO: String(raw.CustomerPO ?? raw.customerPO ?? ""),
    type: String(raw.Type ?? raw.type ?? ""),
    serialNumber: String(raw.SerialNumber ?? raw.serialNumber ?? ""),
    inspectedAccording: String(raw.InspectedAccording ?? raw.inspectedAccording ?? ""),
    analystId,
    analystName: String(raw.AnalystName ?? raw.analystName ?? ""),
    documentNumber: String(raw.DocumentNumber ?? raw.documentNumber ?? ""),
    documentRevision: String(raw.DocumentRevision ?? raw.documentRevision ?? ""),
    documentDate: String(raw.DocumentDate ?? raw.documentDate ?? ""),
    customerId,
    customerName: String(raw.CustomerName ?? raw.customerName ?? ""),
    customerAddress: String(raw.CustomerAddress ?? raw.customerAddress ?? ""),
    createBy: String(raw.CreateBy ?? raw.createBy ?? ""),
    createDate: String(raw.CreateDate ?? raw.createDate ?? ""),
    lastUpdate: String(raw.LastUpdate ?? raw.lastUpdate ?? ""),
    isDeleted: Boolean(raw.IsDeleted ?? raw.isDeleted ?? false),
  };
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchProductConformityCertificates(): Promise<ProductConformityCertificate[]> {
  const list = await requestJson<ProductConformityCertificateApi[]>("/api/ProductConformityCertificate");
  if (!Array.isArray(list)) return [];
  return list.map(mapCertificateFromApi);
}

export async function fetchProductConformityCertificate(id: string): Promise<ProductConformityCertificate | null> {
  const payload = await requestJson<ProductConformityCertificateApi>(`/api/ProductConformityCertificate/${id}`);
  if (!payload) return null;
  return mapCertificateFromApi(payload);
}

type SaveCertificatePayload = {
  CertificateNumber?: string;
  EmissionDate?: string;
  PartNumberId?: number | null;
  PartNumber?: string;
  PartNumberDescription?: string | null;
  PartNumberRevision?: string | null;
  LotNumber?: string | null;
  Quantity?: string | null;
  CustomerPO?: string | null;
  Type?: string | null;
  SerialNumber?: string | null;
  InspectedAccording?: string | null;
  AnalystId?: number | null;
  AnalystName?: string | null;
  DocumentNumber?: string | null;
  DocumentRevision?: string | null;
  DocumentDate?: string;
  CustomerId?: number | null;
  CustomerName?: string | null;
  CustomerAddress?: string | null;
  CreateBy?: string;
};

export async function createProductConformityCertificate(payload: SaveCertificatePayload) {
  const response = await requestJson<ProductConformityCertificateResponse>("/api/ProductConformityCertificate", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.certificate) {
    throw new Error(response?.message || "Resposta inválida do servidor.");
  }

  return mapCertificateFromApi(response.certificate);
}

export async function updateProductConformityCertificate(id: string, payload: SaveCertificatePayload) {
  const response = await requestJson<ProductConformityCertificateResponse>(`/api/ProductConformityCertificate/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.certificate) {
    throw new Error(response?.message || "Resposta inválida do servidor.");
  }

  return mapCertificateFromApi(response.certificate);
}

export async function deleteProductConformityCertificate(id: string) {
  await requestJson<ProductConformityCertificateResponse>(`/api/ProductConformityCertificate/${id}`, {
    method: "DELETE",
  });
}

export async function fetchNextProductConformityNumber(emissionDate?: Date): Promise<string> {
  const query = emissionDate ? `?emissionDate=${encodeURIComponent(emissionDate.toISOString())}` : "";
  const response = await requestJson<NextNumberResponse>(`/api/ProductConformityCertificate/next-number${query}`);
  return response?.nextNumber ?? "";
}

export async function downloadProductConformityPdf(id: string, saveOnServer = false): Promise<PdfDownload> {
  const query = saveOnServer ? "?saveOnServer=true" : "";
  const response = await fetch(buildApiUrl(`/api/ProductConformityCertificate/${id}/pdf${query}`));
  if (!response.ok) {
    throw new Error("Falha ao gerar o PDF.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    `certificado_conformidade_${id}.pdf`;

  return { blob, filename };
}
