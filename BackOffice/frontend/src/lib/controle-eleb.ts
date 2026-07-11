import { requestJson } from "./api";

export type ControleEleb = {
  id: string;
  opEleb?: string;
  opDigicon?: string;
  poEleb?: string;
  codEleb?: string;
  partNumber?: string;
  valorPeca?: string;
  analisePo?: string;
  revisaoDesenho?: string;
  qtdSaldo?: string;
  qtdLote?: string;
  qtdSaldo1?: string;
  dataEnvioParaEleb?: string;
  nfFaturada?: string;
  decapagem?: string;
  snDecap?: string;
  cd?: string;
  snPeca?: string;
  cliente?: string;
  situacao?: string;
  lote?: string;
  numCertificado?: string;
};

type ControleElebApi = {
  ID?: number;
  OpEleb?: string;
  OpDigicon?: string;
  PoEleb?: string;
  CodEleb?: string;
  PartNumber?: string;
  ValorPeca?: string;
  AnalisePo?: string;
  RevisaoDesenho?: string;
  QtdSaldo?: string;
  QtdLote?: string;
  QtdSaldo1?: string;
  DataEnvioParaEleb?: string;
  NfFaturada?: string;
  Decapagem?: string;
  SnDecap?: string;
  Cd?: string;
  SnPeca?: string;
  Cliente?: string;
  Situacao?: string;
  lote?: string;
  NumCertificado?: string;
  id?: number;
  opEleb?: string;
  opDigicon?: string;
  poEleb?: string;
  codEleb?: string;
  partNumber?: string;
  valorPeca?: string;
  analisePo?: string;
  revisaoDesenho?: string;
  qtdSaldo?: string;
  qtdLote?: string;
  qtdSaldo1?: string;
  dataEnvioParaEleb?: string;
  nfFaturada?: string;
  decapagem?: string;
  snDecap?: string;
  cd?: string;
  snPeca?: string;
  cliente?: string;
  situacao?: string;
  Lote?: string;
  numCertificado?: string;
};

export type ControleElebDetail = {
  dataEnvio?: string;
  notaFiscalFaturada?: string;
  ordemProducao?: string;
  codigoItem?: string;
  ordemCompra?: string;
  qtdLote?: string;
  qtdEnviada?: string;
  qtdSaldo?: string;
  status?: string;
};

type ControleElebDetailApi = {
  DataEnvio?: string;
  NotaFiscalFaturada?: string;
  OrdemProducao?: string;
  CodigoItem?: string;
  OrdemCompra?: string;
  QtdLote?: string;
  QtdEnviada?: string;
  QtdSaldo?: string;
  Status?: string;
  dataEnvio?: string;
  notaFiscalFaturada?: string;
  ordemProducao?: string;
  codigoItem?: string;
  ordemCompra?: string;
  qtdLote?: string;
  qtdEnviada?: string;
  qtdSaldo?: string;
  status?: string;
};

type LiberarResponse = {
  success?: boolean;
  message?: string;
};

function mapControleEleb(payload: ControleElebApi): ControleEleb {
  const raw = payload as Record<string, unknown>;
  return {
    id: String(raw.ID ?? raw.id ?? ""),
    opEleb: raw.OpEleb ? String(raw.OpEleb) : raw.opEleb ? String(raw.opEleb) : undefined,
    opDigicon: raw.OpDigicon ? String(raw.OpDigicon) : raw.opDigicon ? String(raw.opDigicon) : undefined,
    poEleb: raw.PoEleb ? String(raw.PoEleb) : raw.poEleb ? String(raw.poEleb) : undefined,
    codEleb: raw.CodEleb ? String(raw.CodEleb) : raw.codEleb ? String(raw.codEleb) : undefined,
    partNumber: raw.PartNumber ? String(raw.PartNumber) : raw.partNumber ? String(raw.partNumber) : undefined,
    valorPeca: raw.ValorPeca ? String(raw.ValorPeca) : raw.valorPeca ? String(raw.valorPeca) : undefined,
    analisePo: raw.AnalisePo ? String(raw.AnalisePo) : raw.analisePo ? String(raw.analisePo) : undefined,
    revisaoDesenho: raw.RevisaoDesenho
      ? String(raw.RevisaoDesenho)
      : raw.revisaoDesenho
        ? String(raw.revisaoDesenho)
        : undefined,
    qtdSaldo: raw.QtdSaldo ? String(raw.QtdSaldo) : raw.qtdSaldo ? String(raw.qtdSaldo) : undefined,
    qtdLote: raw.QtdLote ? String(raw.QtdLote) : raw.qtdLote ? String(raw.qtdLote) : undefined,
    qtdSaldo1: raw.QtdSaldo1 ? String(raw.QtdSaldo1) : raw.qtdSaldo1 ? String(raw.qtdSaldo1) : undefined,
    dataEnvioParaEleb: raw.DataEnvioParaEleb
      ? String(raw.DataEnvioParaEleb)
      : raw.dataEnvioParaEleb
        ? String(raw.dataEnvioParaEleb)
        : undefined,
    nfFaturada: raw.NfFaturada ? String(raw.NfFaturada) : raw.nfFaturada ? String(raw.nfFaturada) : undefined,
    decapagem: raw.Decapagem ? String(raw.Decapagem) : raw.decapagem ? String(raw.decapagem) : undefined,
    snDecap: raw.SnDecap ? String(raw.SnDecap) : raw.snDecap ? String(raw.snDecap) : undefined,
    cd: raw.Cd ? String(raw.Cd) : raw.cd ? String(raw.cd) : undefined,
    snPeca: raw.SnPeca ? String(raw.SnPeca) : raw.snPeca ? String(raw.snPeca) : undefined,
    cliente: raw.Cliente ? String(raw.Cliente) : raw.cliente ? String(raw.cliente) : undefined,
    situacao: raw.Situacao ? String(raw.Situacao) : raw.situacao ? String(raw.situacao) : undefined,
    lote: raw.Lote ? String(raw.Lote) : raw.lote ? String(raw.lote) : undefined,
    numCertificado: raw.NumCertificado
      ? String(raw.NumCertificado)
      : raw.numCertificado
        ? String(raw.numCertificado)
        : undefined,
  };
}

function mapControleElebDetail(payload: ControleElebDetailApi): ControleElebDetail {
  const raw = payload as Record<string, unknown>;
  const toText = (value: unknown) => (value === null || value === undefined ? undefined : String(value));
  return {
    dataEnvio: toText(raw.DataEnvio ?? raw.dataEnvio),
    notaFiscalFaturada: toText(raw.NotaFiscalFaturada ?? raw.notaFiscalFaturada),
    ordemProducao: toText(raw.OrdemProducao ?? raw.ordemProducao),
    codigoItem: toText(raw.CodigoItem ?? raw.codigoItem),
    ordemCompra: toText(raw.OrdemCompra ?? raw.ordemCompra),
    qtdLote: toText(raw.QtdLote ?? raw.qtdLote),
    qtdEnviada: toText(raw.QtdEnviada ?? raw.qtdEnviada),
    qtdSaldo: toText(raw.QtdSaldo ?? raw.qtdSaldo),
    status: toText(raw.Status ?? raw.status),
  };
}

export async function fetchControleElebFinalizadas(): Promise<ControleEleb[]> {
  const list = await requestJson<ControleElebApi[]>("/api/ControleEleb/ordens-finalizadas");
  if (!Array.isArray(list)) return [];
  return list.map(mapControleEleb);
}

export async function fetchControleElebByOp(opEleb: string): Promise<ControleEleb | null> {
  if (!opEleb) return null;
  const payload = await requestJson<ControleElebApi>(`/api/ControleEleb/${encodeURIComponent(opEleb)}`);
  return payload ? mapControleEleb(payload) : null;
}

export async function fetchControleElebByPo(poEleb: string): Promise<ControleEleb | null> {
  if (!poEleb) return null;
  const payload = await requestJson<ControleElebApi>(`/api/ControleEleb/por-po?poEleb=${encodeURIComponent(poEleb)}`);
  return payload ? mapControleEleb(payload) : null;
}

export async function liberarControleElebPorId(id: string, numeroCertificado: string): Promise<void> {
  await requestJson<LiberarResponse>("/api/ControleEleb/liberar-por-id", {
    method: "POST",
    body: JSON.stringify({
      Id: Number(id),
      NumeroCertificado: numeroCertificado,
    }),
  });
}

export async function liberarControleEleb(opEleb: string, numeroCertificado: string): Promise<void> {
  await requestJson<LiberarResponse>("/api/ControleEleb/liberar", {
    method: "PUT",
    body: JSON.stringify({
      OpEleb: opEleb,
      NumeroCertificado: numeroCertificado,
    }),
  });
}

export async function fetchControleElebDetails(orderNumber: string): Promise<ControleElebDetail[]> {
  if (!orderNumber) return [];
  const payload = await requestJson<ControleElebDetailApi[]>(
    `/api/ControleEleb/detalhes/${encodeURIComponent(orderNumber)}`
  );
  if (!Array.isArray(payload)) return [];
  return payload.map(mapControleElebDetail);
}
