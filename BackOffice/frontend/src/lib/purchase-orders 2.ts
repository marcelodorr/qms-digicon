import { buildApiUrl, requestJson } from "./api";

export type PurchaseOrderStatus = "Cancelado" | "Em Processo" | "Enviado" | "Modificado";

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  clientId: string;
  clientName?: string;
  item?: string;
  status: PurchaseOrderStatus;
  comments?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

type PurchaseOrderApiModel = {
  Id?: number;
  PONumber?: string;
  ClienteId?: number;
  ClienteNome?: string | null;
  Item?: string;
  Status?: string;
  Comments?: string | null;
  CreateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsDeleted?: boolean;
  id?: number;
  poNumber?: string;
  clienteId?: number;
  clienteNome?: string | null;
  item?: string;
  status?: string;
  comments?: string | null;
  createBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
};

type PurchaseOrderApiResponse = {
  success?: boolean;
  message?: string;
  purchaseOrder?: PurchaseOrderApiModel;
};

type PurchaseOrderImportResponse = {
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

type PurchaseOrderTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";
const DEFAULT_STATUS: PurchaseOrderStatus = "Em Processo";
const VALID_STATUSES = new Set<PurchaseOrderStatus>([
  "Cancelado",
  "Em Processo",
  "Enviado",
  "Modificado",
]);

function normalizeStatus(value?: string): PurchaseOrderStatus {
  if (!value) return DEFAULT_STATUS;
  return VALID_STATUSES.has(value as PurchaseOrderStatus) ? (value as PurchaseOrderStatus) : DEFAULT_STATUS;
}

function mapPurchaseOrderFromApi(payload: PurchaseOrderApiModel): PurchaseOrder {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const poNumber = String(raw.PONumber ?? raw.poNumber ?? "");
  const clientId = String(raw.ClienteId ?? raw.clienteId ?? "");
  const clientNameValue = raw.ClienteNome ?? raw.clienteNome;
  const clientName = clientNameValue ? String(clientNameValue) : undefined;
  const itemValue = raw.Item ?? raw.item;
  const item = itemValue ? String(itemValue) : undefined;
  const statusRaw = raw.Status ?? raw.status;
  const status = normalizeStatus(typeof statusRaw === "string" ? statusRaw : undefined);
  const commentsValue = raw.Comments ?? raw.comments;
  const comments = commentsValue ? String(commentsValue) : undefined;
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  return {
    id,
    poNumber,
    clientId,
    clientName,
    item,
    status,
    comments,
    createdBy,
    createdAt,
    updatedBy: createdBy,
    updatedAt,
  };
}

function buildPayload(
  poNumber: string,
  clientId: string,
  item: string | undefined,
  status: PurchaseOrderStatus,
  comments?: string,
  createdBy?: string,
  id?: string
) {
  const payload: Record<string, unknown> = {
    PONumber: poNumber.trim(),
    ClienteId: Number(clientId),
    Item: item?.trim() || "",
    Status: status,
    Comments: comments?.trim() || null,
  };

  if (createdBy) {
    payload.CreateBy = createdBy;
  }

  if (id) {
    payload.Id = Number(id);
  }

  return payload;
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const list = await requestJson<PurchaseOrderApiModel[]>("/api/PurchaseOrder");
  if (!Array.isArray(list)) return [];
  return list.map(mapPurchaseOrderFromApi);
}

export async function createPurchaseOrder(
  poNumber: string,
  clientId: string,
  item: string | undefined,
  status: PurchaseOrderStatus,
  comments?: string,
  createdBy?: string
) {
  const payload = buildPayload(poNumber, clientId, item, status, comments, createdBy);
  const response = await requestJson<PurchaseOrderApiResponse>("/api/PurchaseOrder", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.purchaseOrder) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapPurchaseOrderFromApi(response.purchaseOrder);
}

export async function updatePurchaseOrder(
  id: string,
  poNumber: string,
  clientId: string,
  item: string | undefined,
  status: PurchaseOrderStatus,
  comments?: string,
  createdBy?: string
) {
  const payload = buildPayload(poNumber, clientId, item, status, comments, createdBy, id);
  const response = await requestJson<PurchaseOrderApiResponse>("/api/PurchaseOrder", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.purchaseOrder) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapPurchaseOrderFromApi(response.purchaseOrder);
}

export async function deletePurchaseOrder(id: string) {
  await requestJson<PurchaseOrderApiResponse>(`/api/PurchaseOrder/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadPurchaseOrderTemplate(): Promise<PurchaseOrderTemplate> {
  const response = await fetch(buildApiUrl("/api/PurchaseOrder/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "purchase_orders_template.xlsx";

  return { blob, filename };
}

export async function importPurchaseOrders(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/PurchaseOrder/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as PurchaseOrderImportResponse;
  return payload;
}
