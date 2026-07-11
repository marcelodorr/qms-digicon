import { requestJson } from "./api";

export type SmtpConfig = {
  host?: string;
  port?: number | null;
  user?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  useSsl?: boolean;
};

type SmtpConfigApiModel = {
  Host?: string;
  Port?: number | null;
  User?: string;
  Password?: string;
  FromEmail?: string;
  FromName?: string;
  UseSsl?: boolean;
  host?: string;
  port?: number | null;
  user?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  useSsl?: boolean;
};

function mapConfig(payload: SmtpConfigApiModel): SmtpConfig {
  const raw = payload as Record<string, unknown>;
  return {
    host: String(raw.Host ?? raw.host ?? ""),
    port: typeof raw.Port === "number" ? raw.Port : typeof raw.port === "number" ? raw.port : null,
    user: String(raw.User ?? raw.user ?? ""),
    password: String(raw.Password ?? raw.password ?? ""),
    fromEmail: String(raw.FromEmail ?? raw.fromEmail ?? ""),
    fromName: String(raw.FromName ?? raw.fromName ?? ""),
    useSsl: Boolean(raw.UseSsl ?? raw.useSsl ?? true),
  };
}

export async function fetchSmtpConfig(): Promise<SmtpConfig> {
  const response = await requestJson<SmtpConfigApiModel>("/api/SmtpConfig");
  return response ? mapConfig(response) : {};
}

export async function updateSmtpConfig(config: SmtpConfig): Promise<SmtpConfig> {
  const payload = {
    Host: config.host ?? "",
    Port: config.port ?? null,
    User: config.user ?? "",
    Password: config.password ?? "",
    FromEmail: config.fromEmail ?? "",
    FromName: config.fromName ?? "",
    UseSsl: config.useSsl ?? true,
  };
  const response = await requestJson<SmtpConfigApiModel>("/api/SmtpConfig", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response ? mapConfig(response) : config;
}

export async function testSmtpConfig(toEmail?: string) {
  const response = await requestJson<{ success?: boolean; message?: string }>("/api/SmtpConfig/test", {
    method: "POST",
    body: JSON.stringify({
      ToEmail: toEmail ?? "",
    }),
  });

  return response;
}

export async function pingSmtpConfig() {
  const response = await requestJson<{ success?: boolean; message?: string }>("/api/SmtpConfig/ping", {
    method: "POST",
    body: JSON.stringify({}),
  });

  return response;
}
