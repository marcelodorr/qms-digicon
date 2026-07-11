import { buildApiUrl, requestJson } from "./api";

export type Client = {
  id: string;
  name: string;
  address: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

type ClientApiModel = {
  Id?: number;
  Cliente?: string;
  Endereco?: string | null;
  CreateBy?: string;
  UpdateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  IsDeleted?: boolean;
  id?: number;
  cliente?: string;
  endereco?: string | null;
  createBy?: string;
  updateBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
};

type ClientApiResponse = {
  success?: boolean;
  message?: string;
  cliente?: ClientApiModel;
};

type ClientImportResponse = {
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

type ClientTemplate = {
  blob: Blob;
  filename: string;
};

const DEFAULT_USER = "Sistema";

function mapClientFromApi(payload: ClientApiModel): Client {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const name = String(raw.Cliente ?? raw.cliente ?? "");
  const address = String(raw.Endereco ?? raw.endereco ?? "");
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
  const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? createdBy);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  return {
    id,
    name,
    address,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
  };
}

function buildPayload(name: string, address: string, createdBy?: string, id?: string) {
  const payload: Record<string, unknown> = {
    Cliente: name.trim(),
    Endereco: address.trim(),
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

export async function fetchClients(): Promise<Client[]> {
  const list = await requestJson<ClientApiModel[]>("/api/Cliente");
  if (!Array.isArray(list)) return [];
  return list.map(mapClientFromApi);
}

export async function createClient(name: string, address: string, createdBy?: string) {
  const payload = buildPayload(name, address, createdBy);
  const response = await requestJson<ClientApiResponse>("/api/Cliente", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.cliente) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapClientFromApi(response.cliente);
}

export async function updateClient(id: string, name: string, address: string, createdBy?: string) {
  const payload = buildPayload(name, address, createdBy, id);
  const response = await requestJson<ClientApiResponse>("/api/Cliente", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response?.cliente) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapClientFromApi(response.cliente);
}

export async function deleteClient(id: string) {
  await requestJson<ClientApiResponse>(`/api/Cliente/${id}`, {
    method: "DELETE",
  });
}

function readFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function downloadClientTemplate(): Promise<ClientTemplate> {
  const response = await fetch(buildApiUrl("/api/Cliente/template"));
  if (!response.ok) {
    throw new Error("Falha ao baixar o template.");
  }

  const blob = await response.blob();
  const filename =
    readFileNameFromDisposition(response.headers.get("content-disposition")) ||
    "clientes_template.xlsx";

  return { blob, filename };
}

export async function importClients(file: File, createdBy?: string) {
  const formData = new FormData();
  formData.append("file", file);
  if (createdBy) {
    formData.append("createdBy", createdBy);
  }

  const response = await fetch(buildApiUrl("/api/Cliente/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha ao importar o arquivo.");
  }

  const payload = (await response.json()) as ClientImportResponse;
  return payload;
}
