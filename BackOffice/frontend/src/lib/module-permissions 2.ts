import { requestJson } from "./api";

export const MODULE_KEYS = {
  dashboard: "dashboard",
  operations: "cadastro.operacoes",
  purchaseOrders: "cadastro.ordens-compra",
  norms: "cadastro.normas",
  specialNorms: "cadastro.normas-processo-especial",
  parameters: "cadastro.parametros",
  people: "cadastro.pessoas",
  clients: "cadastro.clientes",
  partNumbers: "cadastro.part-number",
  qualityCertificates: "certificados.qualidade",
  specialProcessCertificates: "certificados.processo-especial",
  productComplianceCertificates: "certificados.conformidade-produto",
  settings: "settings",
} as const;

export type ModuleKey = typeof MODULE_KEYS[keyof typeof MODULE_KEYS];

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  path: string;
  group: string;
};

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  { key: MODULE_KEYS.dashboard, label: "Dashboard", path: "/", group: "Geral" },
  { key: MODULE_KEYS.operations, label: "Operacoes", path: "/cadastro/operacoes", group: "Cadastro" },
  { key: MODULE_KEYS.purchaseOrders, label: "Ordens de compra", path: "/cadastro/ordens-compra", group: "Cadastro" },
  { key: MODULE_KEYS.norms, label: "Normas", path: "/cadastro/normas", group: "Cadastro" },
  { key: MODULE_KEYS.specialNorms, label: "Normas processo especial", path: "/cadastro/normas-processo-especial", group: "Cadastro" },
  { key: MODULE_KEYS.parameters, label: "Parametros", path: "/cadastro/parametros", group: "Cadastro" },
  { key: MODULE_KEYS.people, label: "Pessoas", path: "/cadastro/pessoas", group: "Cadastro" },
  { key: MODULE_KEYS.clients, label: "Clientes", path: "/cadastro/clientes", group: "Cadastro" },
  { key: MODULE_KEYS.partNumbers, label: "Part number", path: "/cadastro/part-number", group: "Cadastro" },
  { key: MODULE_KEYS.qualityCertificates, label: "Certificados de qualidade", path: "/certificados/qualidade", group: "Certificados" },
  { key: MODULE_KEYS.specialProcessCertificates, label: "Certificados de processo especial", path: "/certificados/processo-especial", group: "Certificados" },
  { key: MODULE_KEYS.productComplianceCertificates, label: "Certificados de conformidade", path: "/certificados/conformidade-produto", group: "Certificados" },
  { key: MODULE_KEYS.settings, label: "Configuracoes", path: "/settings", group: "Configuracoes" },
];

export type ModulePermission = {
  moduleKey: string;
  canView: boolean;
  canEdit: boolean;
};

export type ModuleAccess = {
  canView: boolean;
  canEdit: boolean;
};

export type ModulePermissionMap = Record<string, ModuleAccess>;

const moduleKeyByPath = new Map<string, ModuleKey>();
MODULE_DEFINITIONS.forEach(definition => {
  moduleKeyByPath.set(definition.path, definition.key);
});

export const getModuleKeyByPath = (path: string) => moduleKeyByPath.get(path);

export const buildPermissionMap = (
  permissions: ModulePermission[] = [],
  options?: { defaultCanView?: boolean; defaultCanEdit?: boolean }
): ModulePermissionMap => {
  const defaultCanView = options?.defaultCanView ?? true;
  const defaultCanEdit = options?.defaultCanEdit ?? true;
  const map: ModulePermissionMap = {};

  MODULE_DEFINITIONS.forEach(definition => {
    map[definition.key] = {
      canView: defaultCanView,
      canEdit: defaultCanEdit,
    };
  });

  permissions.forEach(permission => {
    const moduleKey = permission.moduleKey;
    if (!moduleKey) {
      return;
    }
    const canEdit = Boolean(permission.canEdit);
    const canView = Boolean(permission.canView) || canEdit;
    map[moduleKey] = { canView, canEdit };
  });

  return map;
};

export const buildPermissionList = (map: ModulePermissionMap): ModulePermission[] =>
  MODULE_DEFINITIONS.map(definition => {
    const access = map[definition.key] ?? { canView: false, canEdit: false };
    return {
      moduleKey: definition.key,
      canView: access.canView,
      canEdit: access.canEdit,
    };
  });

export async function fetchUserModulePermissions(username: string): Promise<ModulePermission[]> {
  return requestJson<ModulePermission[]>(
    `/api/Login/users/${encodeURIComponent(username)}/permissions`
  );
}

export async function updateUserModulePermissions(
  username: string,
  permissions: ModulePermission[]
): Promise<void> {
  await requestJson(`/api/Login/users/${encodeURIComponent(username)}/permissions`, {
    method: "PUT",
    body: JSON.stringify(permissions),
  });
}
