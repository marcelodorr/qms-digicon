import { buildApiUrl, requestJson } from "./api";

export type QualityCertificateListItem = {
  id: string;
  numero: string;
  cliente?: string;
  partNumber?: string;
  ordem?: string;
  oc?: string;
  lote?: string;
  data?: string;
  createBy?: string;
  createDate?: string;
  updateBy?: string;
};

export type QualityCertificateApi = {
  Id?: number;
  NumeroCertificado?: string;
  Ordem?: string;
  OC?: string;
  Lote?: string;
  CodigoCliente?: string;
  PartNumber?: string;
  ValorPeca?: string;
  AnalisePo?: string;
  RevisaoDesenho?: string;
  Quantidade?: string;
  Decapagem?: string;
  SNDecapagem?: string;
  CDChamado?: string;
  Cliente?: string;
  Fornecedor?: string;
  RelatorioInspecao?: string;
  CertificadoMP?: string;
  Responsavel?: string;
  AnalystId?: number | null;
  AnalystName?: string;
  DesenhoLP?: string;
  Observacoes?: string;
  SNPeca?: string;
  TipoEnvio?: string;
  DescricaoOperacao?: string;
  Data?: string;
  CreateDate?: string;
  UpdateBy?: string;
  id?: number;
  numeroCertificado?: string;
  ordem?: string;
  oc?: string;
  lote?: string;
  codigoCliente?: string;
  partNumber?: string;
  valorPeca?: string;
  analisePo?: string;
  revisaoDesenho?: string;
  quantidade?: string;
  decapagem?: string;
  snDecapagem?: string;
  cdChamado?: string;
  cliente?: string;
  fornecedor?: string;
  relatorioInspecao?: string;
  certificadoMP?: string;
  responsavel?: string;
  analystId?: number | null;
  analystName?: string;
  desenhoLP?: string;
  observacoes?: string;
  snPeca?: string;
  tipoEnvio?: string;
  descricaoOperacao?: string;
  data?: string;
  createDate?: string;
  updateBy?: string;
};

export type QualityCertificatePayload = {
  ControleElebId?: number | null;
  NumeroCertificado?: string | null;
  Ordem?: string | null;
  OC?: string | null;
  Lote?: string | null;
  CodigoCliente?: string | null;
  PartNumber?: string | null;
  ValorPeca?: string | null;
  AnalisePo?: string | null;
  RevisaoDesenho?: string | null;
  Quantidade?: string | null;
  Decapagem?: string | null;
  SNDecapagem?: string | null;
  CDChamado?: string | null;
  Cliente?: string | null;
  Fornecedor?: string | null;
  RelatorioInspecao?: string | null;
  CertificadoMP?: string | null;
  Responsavel?: string | null;
  AnalystId?: number | null;
  AnalystName?: string | null;
  DesenhoLP?: string | null;
  Observacoes?: string | null;
  SNPeca?: string | null;
  TipoEnvio?: string | null;
  DescricaoOperacao?: string | null;
  OperacoesExecutadas?: string[] | null;
  Data?: string | null;
  UpdateBy?: string | null;
};

type NextNumberResponse = {
  numero?: string;
};

type PdfDownload = {
  blob: Blob;
  filename: string;
};

function mapListItem(payload: Record<string, unknown>): QualityCertificateListItem {
  return {
    id: String(payload.id ?? payload.Id ?? ""),
    numero: String(payload.numero ?? payload.Numero ?? payload.NumeroCertificado ?? ""),
    cliente: payload.cliente ? String(payload.cliente) : payload.Cliente ? String(payload.Cliente) : undefined,
    partNumber: payload.partNumber ? String(payload.partNumber) : payload.PartNumber ? String(payload.PartNumber) : undefined,
    ordem: payload.ordem ? String(payload.ordem) : payload.Ordem ? String(payload.Ordem) : undefined,
    oc: payload.oc ? String(payload.oc) : payload.OC ? String(payload.OC) : undefined,
    lote: payload.lote ? String(payload.lote) : payload.Lote ? String(payload.Lote) : undefined,
    data: payload.data ? String(payload.data) : payload.Data ? String(payload.Data) : undefined,
    createBy: payload.createBy
      ? String(payload.createBy)
      : payload.CreateBy
        ? String(payload.CreateBy)
        : payload.CreatedBy
          ? String(payload.CreatedBy)
          : undefined,
    updateBy: payload.updateBy
      ? String(payload.updateBy)
      : payload.UpdateBy
        ? String(payload.UpdateBy)
        : payload.CreateBy
          ? String(payload.CreateBy)
          : payload.createBy
            ? String(payload.createBy)
            : undefined,
    createDate: payload.createDate
      ? String(payload.createDate)
      : payload.CreateDate
        ? String(payload.CreateDate)
        : payload.CreatedAt
          ? String(payload.CreatedAt)
          : undefined,
  };
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchQualityCertificateList(): Promise<QualityCertificateListItem[]> {
  const list = await requestJson<Record<string, unknown>[]>("/api/QualityCertificate/lista");
  if (!Array.isArray(list)) return [];
  return list.map(mapListItem);
}

export async function fetchQualityCertificateById(id: string): Promise<QualityCertificateApi | null> {
  const payload = await requestJson<QualityCertificateApi>(`/api/QualityCertificate/${id}`);
  return payload ?? null;
}

export async function createQualityCertificate(payload: QualityCertificatePayload): Promise<QualityCertificateApi> {
  const response = await requestJson<QualityCertificateApi>("/api/QualityCertificate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response;
}

export async function updateQualityCertificate(id: string, payload: QualityCertificatePayload): Promise<QualityCertificateApi> {
  const response = await requestJson<QualityCertificateApi>(`/api/QualityCertificate/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response;
}

export async function deleteQualityCertificate(id: string): Promise<void> {
  await requestJson<void>(`/api/QualityCertificate/${id}`, {
    method: "DELETE",
  });
}

export async function fetchNextQualityCertificateNumber(issueDate?: Date): Promise<string> {
  const query = issueDate ? `?data=${encodeURIComponent(issueDate.toISOString())}` : "";
  const response = await requestJson<NextNumberResponse>(`/api/QualityCertificate/novo-certificado${query}`);
  return String(response?.numero ?? "");
}

export async function downloadQualityCertificatePdf(numero: string, options?: { saveOnServer?: boolean; disposition?: string }): Promise<PdfDownload> {
  const body = {
    Numero: numero,
    SaveOnServer: options?.saveOnServer ?? false,
    Disposition: options?.disposition ?? "attachment",
  };

  const response = await fetch(buildApiUrl("/api/QualityCertificate/gerar-pdf"), {
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
  const now = new Date();
  const fallbackDate = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()}`;
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    `Certificado_Qualidade_${numero}_NA_NA_${fallbackDate}.pdf`;

  return { blob, filename };
}
