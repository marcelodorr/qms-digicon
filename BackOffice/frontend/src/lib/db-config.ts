import { requestJson } from "./api";

export type DbConnectionConfig = {
  server?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  defaultConnection?: string;
};

export async function fetchDbConfig(): Promise<DbConnectionConfig> {
  const response = await requestJson<DbConnectionConfig>("/api/DbConfig");
  return response ?? {};
}

export async function updateDbConfig(payload: DbConnectionConfig): Promise<DbConnectionConfig> {
  const response = await requestJson<DbConnectionConfig>("/api/DbConfig", {
    method: "PUT",
    body: JSON.stringify({
      server: payload.server,
      port: payload.port,
      database: payload.database,
      user: payload.user,
      password: payload.password,
    }),
  });

  return response ?? {};
}
