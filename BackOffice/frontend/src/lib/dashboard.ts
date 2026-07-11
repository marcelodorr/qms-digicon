import { requestJson } from "./api";

export type DashboardStats = {
  partNumbers: number;
  normas: number;
  specialProcesses: number;
  purchaseOrders: number;
  clientes: number;
};

export type DashboardCertificateStats = {
  quality: number;
  specialProcess: number;
  productConformity: number;
  total: number;
};

export type DashboardRecentActivity = {
  id: string;
  type: string;
  label: string;
  code: string;
  actor: string;
  date: string;
};

export type DashboardOverview = {
  stats: DashboardStats;
  certificates: DashboardCertificateStats;
  recentActivities: DashboardRecentActivity[];
};

type DashboardStatsApi = {
  PartNumbers?: number;
  Normas?: number;
  SpecialProcesses?: number;
  PurchaseOrders?: number;
  Clientes?: number;
  partNumbers?: number;
  normas?: number;
  specialProcesses?: number;
  purchaseOrders?: number;
  clientes?: number;
};

type DashboardCertificateStatsApi = {
  Quality?: number;
  SpecialProcess?: number;
  ProductConformity?: number;
  Total?: number;
  quality?: number;
  specialProcess?: number;
  productConformity?: number;
  total?: number;
};

type DashboardRecentActivityApi = {
  Id?: number | string;
  Type?: string;
  Label?: string;
  Code?: string;
  Actor?: string;
  Date?: string;
  id?: number | string;
  type?: string;
  label?: string;
  code?: string;
  actor?: string;
  date?: string;
};

type DashboardOverviewApi = {
  Stats?: DashboardStatsApi;
  Certificates?: DashboardCertificateStatsApi;
  RecentActivities?: DashboardRecentActivityApi[];
  stats?: DashboardStatsApi;
  certificates?: DashboardCertificateStatsApi;
  recentActivities?: DashboardRecentActivityApi[];
};

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapStats(payload: DashboardStatsApi): DashboardStats {
  const raw = payload as Record<string, unknown>;

  return {
    partNumbers: toNumber(raw.PartNumbers ?? raw.partNumbers),
    normas: toNumber(raw.Normas ?? raw.normas),
    specialProcesses: toNumber(raw.SpecialProcesses ?? raw.specialProcesses),
    purchaseOrders: toNumber(raw.PurchaseOrders ?? raw.purchaseOrders),
    clientes: toNumber(raw.Clientes ?? raw.clientes),
  };
}

function mapCertificateStats(payload: DashboardCertificateStatsApi | undefined): DashboardCertificateStats {
  const raw = (payload ?? {}) as Record<string, unknown>;
  return {
    quality: toNumber(raw.Quality ?? raw.quality),
    specialProcess: toNumber(raw.SpecialProcess ?? raw.specialProcess),
    productConformity: toNumber(raw.ProductConformity ?? raw.productConformity),
    total: toNumber(raw.Total ?? raw.total),
  };
}

function mapRecentActivities(items?: DashboardRecentActivityApi[]): DashboardRecentActivity[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const raw = item as Record<string, unknown>;
    return {
      id: String(raw.Id ?? raw.id ?? ""),
      type: String(raw.Type ?? raw.type ?? ""),
      label: String(raw.Label ?? raw.label ?? ""),
      code: String(raw.Code ?? raw.code ?? ""),
      actor: String(raw.Actor ?? raw.actor ?? ""),
      date: String(raw.Date ?? raw.date ?? ""),
    };
  });
}

function mapOverview(payload: DashboardOverviewApi): DashboardOverview {
  const raw = payload as Record<string, unknown>;
  const statsPayload = (raw.Stats ?? raw.stats ?? {}) as DashboardStatsApi;
  const certPayload = (raw.Certificates ?? raw.certificates ?? {}) as DashboardCertificateStatsApi;
  const recentPayload = (raw.RecentActivities ?? raw.recentActivities ?? []) as DashboardRecentActivityApi[];

  return {
    stats: mapStats(statsPayload),
    certificates: mapCertificateStats(certPayload),
    recentActivities: mapRecentActivities(recentPayload),
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const payload = await requestJson<DashboardStatsApi>("/api/Dashboard/stats");
  return mapStats(payload ?? {});
}

export async function fetchDashboardOverview(options?: {
  from?: Date;
  to?: Date;
  take?: number;
}): Promise<DashboardOverview> {
  const params = new URLSearchParams();
  if (options?.from) {
    params.set("from", options.from.toISOString());
  }
  if (options?.to) {
    params.set("to", options.to.toISOString());
  }
  if (options?.take) {
    params.set("take", String(options.take));
  }
  const query = params.toString();
  const payload = await requestJson<DashboardOverviewApi>(`/api/Dashboard/overview${query ? `?${query}` : ""}`);
  return mapOverview(payload ?? {});
}
