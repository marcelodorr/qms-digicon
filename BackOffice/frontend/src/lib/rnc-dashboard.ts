import { requestJson } from "./api";

export type RncFilterOptions = {
  machines: string[];
  operators: string[];
  clients: string[];
  reasons: string[];
  causes: string[];
  partNumbers: string[];
  productionOrders: string[];
  origins: string[];
};

export type RncChartItem = {
  label: string;
  count: number;
};

export type RncParetoItem = {
  label: string;
  count: number;
  percent: number;
  cumulativePercent: number;
};

export type RncDashboardOverview = {
  total: number;
  byMachine: RncChartItem[];
  byOperator: RncChartItem[];
  byReason: RncChartItem[];
  byCause: RncChartItem[];
  paretoTop: RncParetoItem[];
};

export type RncEntry = {
  machine?: string;
  operator?: string;
  productionOrder?: string;
  partNumber?: string;
  nonConformityQuantity: number;
  reason?: string;
  cause?: string;
  nonConformityDate?: string;
  client?: string;
  origin?: string;
};

export type RncEntriesPage = {
  total: number;
  items: RncEntry[];
};

export type RncDashboardQuery = {
  machine?: string;
  operator?: string;
  client?: string;
  reason?: string;
  cause?: string;
  partNumber?: string;
  productionOrder?: string;
  origin?: string;
  from?: Date;
  to?: Date;
};

type RncChartItemApi = {
  Label?: string;
  Count?: number;
  label?: string;
  count?: number;
};

type RncParetoItemApi = {
  Label?: string;
  Count?: number;
  Percent?: number;
  CumulativePercent?: number;
  label?: string;
  count?: number;
  percent?: number;
  cumulativePercent?: number;
};

type RncFilterOptionsApi = {
  Machines?: string[];
  Operators?: string[];
  Clients?: string[];
  Reasons?: string[];
  Causes?: string[];
  PartNumbers?: string[];
  ProductionOrders?: string[];
  Origins?: string[];
  machines?: string[];
  operators?: string[];
  clients?: string[];
  reasons?: string[];
  causes?: string[];
  partNumbers?: string[];
  productionOrders?: string[];
  origins?: string[];
};

type RncDashboardOverviewApi = {
  Total?: number;
  ByMachine?: RncChartItemApi[];
  ByOperator?: RncChartItemApi[];
  ByReason?: RncChartItemApi[];
  ByCause?: RncChartItemApi[];
  ParetoTop?: RncParetoItemApi[];
  total?: number;
  byMachine?: RncChartItemApi[];
  byOperator?: RncChartItemApi[];
  byReason?: RncChartItemApi[];
  byCause?: RncChartItemApi[];
  paretoTop?: RncParetoItemApi[];
};

type RncEntryApi = {
  Machine?: string;
  Operator?: string;
  ProductionOrder?: string;
  PartNumber?: string;
  NonConformityQuantity?: number;
  Reason?: string;
  Cause?: string;
  NonConformityDate?: string;
  Client?: string;
  Origin?: string;
  machine?: string;
  operator?: string;
  productionOrder?: string;
  partNumber?: string;
  nonConformityQuantity?: number;
  reason?: string;
  cause?: string;
  nonConformityDate?: string;
  client?: string;
  origin?: string;
};

type RncEntriesPageApi = {
  Total?: number;
  Items?: RncEntryApi[];
  total?: number;
  items?: RncEntryApi[];
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
};

const toOptionalString = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text ? text : undefined;
};

const mapChartItem = (item: RncChartItemApi): RncChartItem => {
  const raw = item as Record<string, unknown>;
  return {
    label: String(raw.Label ?? raw.label ?? ""),
    count: toNumber(raw.Count ?? raw.count),
  };
};

const mapParetoItem = (item: RncParetoItemApi): RncParetoItem => {
  const raw = item as Record<string, unknown>;
  return {
    label: String(raw.Label ?? raw.label ?? ""),
    count: toNumber(raw.Count ?? raw.count),
    percent: toNumber(raw.Percent ?? raw.percent),
    cumulativePercent: toNumber(raw.CumulativePercent ?? raw.cumulativePercent),
  };
};

const mapFilterOptions = (payload: RncFilterOptionsApi): RncFilterOptions => {
  const raw = payload as Record<string, unknown>;
  return {
    machines: toStringArray(raw.Machines ?? raw.machines),
    operators: toStringArray(raw.Operators ?? raw.operators),
    clients: toStringArray(raw.Clients ?? raw.clients),
    reasons: toStringArray(raw.Reasons ?? raw.reasons),
    causes: toStringArray(raw.Causes ?? raw.causes),
    partNumbers: toStringArray(raw.PartNumbers ?? raw.partNumbers),
    productionOrders: toStringArray(raw.ProductionOrders ?? raw.productionOrders),
    origins: toStringArray(raw.Origins ?? raw.origins),
  };
};

const mapOverview = (payload: RncDashboardOverviewApi): RncDashboardOverview => {
  const raw = payload as Record<string, unknown>;
  const byMachine = (raw.ByMachine ?? raw.byMachine ?? []) as RncChartItemApi[];
  const byOperator = (raw.ByOperator ?? raw.byOperator ?? []) as RncChartItemApi[];
  const byReason = (raw.ByReason ?? raw.byReason ?? []) as RncChartItemApi[];
  const byCause = (raw.ByCause ?? raw.byCause ?? []) as RncChartItemApi[];
  const paretoTop = (raw.ParetoTop ?? raw.paretoTop ?? []) as RncParetoItemApi[];

  return {
    total: toNumber(raw.Total ?? raw.total),
    byMachine: Array.isArray(byMachine) ? byMachine.map(mapChartItem) : [],
    byOperator: Array.isArray(byOperator) ? byOperator.map(mapChartItem) : [],
    byReason: Array.isArray(byReason) ? byReason.map(mapChartItem) : [],
    byCause: Array.isArray(byCause) ? byCause.map(mapChartItem) : [],
    paretoTop: Array.isArray(paretoTop) ? paretoTop.map(mapParetoItem) : [],
  };
};

const mapEntry = (payload: RncEntryApi): RncEntry => {
  const raw = payload as Record<string, unknown>;
  return {
    machine: toOptionalString(raw.Machine ?? raw.machine),
    operator: toOptionalString(raw.Operator ?? raw.operator),
    productionOrder: toOptionalString(raw.ProductionOrder ?? raw.productionOrder),
    partNumber: toOptionalString(raw.PartNumber ?? raw.partNumber),
    nonConformityQuantity: toNumber(raw.NonConformityQuantity ?? raw.nonConformityQuantity),
    reason: toOptionalString(raw.Reason ?? raw.reason),
    cause: toOptionalString(raw.Cause ?? raw.cause),
    nonConformityDate: toOptionalString(raw.NonConformityDate ?? raw.nonConformityDate),
    client: toOptionalString(raw.Client ?? raw.client),
    origin: toOptionalString(raw.Origin ?? raw.origin),
  };
};

const mapEntriesPage = (payload: RncEntriesPageApi): RncEntriesPage => {
  const raw = payload as Record<string, unknown>;
  const items = (raw.Items ?? raw.items ?? []) as RncEntryApi[];
  return {
    total: toNumber(raw.Total ?? raw.total),
    items: Array.isArray(items) ? items.map(mapEntry) : [],
  };
};

export async function fetchRncFilterOptions(query?: {
  from?: Date;
  to?: Date;
}): Promise<RncFilterOptions> {
  const params = new URLSearchParams();
  if (query?.from) params.set("from", query.from.toISOString());
  if (query?.to) params.set("to", query.to.toISOString());
  const queryString = params.toString();
  const payload = await requestJson<RncFilterOptionsApi>(
    `/api/RncDashboard/filters${queryString ? `?${queryString}` : ""}`
  );
  return mapFilterOptions(payload ?? {});
}

export async function fetchRncDashboardOverview(
  query?: RncDashboardQuery
): Promise<RncDashboardOverview> {
  const params = new URLSearchParams();

  if (query?.machine) params.set("machine", query.machine);
  if (query?.operator) params.set("operator", query.operator);
  if (query?.client) params.set("client", query.client);
  if (query?.reason) params.set("reason", query.reason);
  if (query?.cause) params.set("cause", query.cause);
  if (query?.partNumber) params.set("partNumber", query.partNumber);
  if (query?.productionOrder) params.set("productionOrder", query.productionOrder);
  if (query?.origin) params.set("origin", query.origin);
  if (query?.from) params.set("from", query.from.toISOString());
  if (query?.to) params.set("to", query.to.toISOString());

  const queryString = params.toString();
  const payload = await requestJson<RncDashboardOverviewApi>(
    `/api/RncDashboard/overview${queryString ? `?${queryString}` : ""}`
  );

  return mapOverview(payload ?? {});
}

export async function fetchRncDashboardEntries(
  query?: RncDashboardQuery & { page?: number; pageSize?: number }
): Promise<RncEntriesPage> {
  const params = new URLSearchParams();

  if (query?.machine) params.set("machine", query.machine);
  if (query?.operator) params.set("operator", query.operator);
  if (query?.client) params.set("client", query.client);
  if (query?.reason) params.set("reason", query.reason);
  if (query?.cause) params.set("cause", query.cause);
  if (query?.partNumber) params.set("partNumber", query.partNumber);
  if (query?.productionOrder) params.set("productionOrder", query.productionOrder);
  if (query?.origin) params.set("origin", query.origin);
  if (query?.from) params.set("from", query.from.toISOString());
  if (query?.to) params.set("to", query.to.toISOString());
  if (query?.page) params.set("page", String(query.page));
  if (query?.pageSize) params.set("pageSize", String(query.pageSize));

  const queryString = params.toString();
  const payload = await requestJson<RncEntriesPageApi>(
    `/api/RncDashboard/entries${queryString ? `?${queryString}` : ""}`
  );

  return mapEntriesPage(payload ?? {});
}
