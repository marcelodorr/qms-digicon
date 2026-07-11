import { requestJson } from "./api";

export type UserAccount = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  type: "User" | "Admin";
  image?: string | null;
  lastSeen?: string | null;
  isOnline?: boolean;
};

export type AuthSession = {
  user: UserAccount;
  sessionId: string;
};

type UserApiModel = {
  id?: string;
  fullName?: string;
  username?: string;
  email?: string;
  type?: "User" | "Admin";
  image?: string | null;
  lastSeen?: string | null;
  isOnline?: boolean;
};

type SessionApiModel = {
  id?: string;
  createdAt?: string;
  lastSeen?: string;
};

type UserApiResponse = {
  success?: boolean;
  message?: string;
  user?: UserApiModel;
  session?: SessionApiModel;
};

type ChangePasswordResponse = {
  success?: boolean;
  message?: string;
};

type ForgotPasswordResponse = {
  success?: boolean;
  message?: string;
};

function mapUserFromApi(payload: UserApiModel): UserAccount {
  const id = payload.id || payload.username || "";
  const username = payload.username || payload.fullName || id;
  const email = payload.email || "";
  const type = payload.type || "User";

  return {
    id,
    fullName: payload.fullName || username,
    username,
    email,
    type,
    image: payload.image ?? null,
    lastSeen: payload.lastSeen ?? null,
    isOnline: payload.isOnline,
  };
}

export async function fetchUsers(): Promise<UserAccount[]> {
  const list = await requestJson<UserApiModel[]>("/api/Login/users");
  if (!Array.isArray(list)) return [];
  return list.map(mapUserFromApi);
}

export async function authenticate(user: string, password: string) {
  const response = await requestJson<UserApiResponse>("/api/Login/auth", {
    method: "POST",
    body: JSON.stringify({
      User: user,
      Password: password,
    }),
  });

  if (!response?.user || !response?.session?.id) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return {
    user: mapUserFromApi(response.user),
    sessionId: response.session.id,
  };
}

export async function createUser(payload: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  type: "User" | "Admin";
  image?: string | null;
}) {
  const response = await requestJson<UserApiResponse>("/api/Login/users", {
    method: "POST",
    body: JSON.stringify({
      Username: payload.username,
      Email: payload.email,
      Password: payload.password,
      Type: payload.type,
      Image: payload.image ?? null,
    }),
  });

  if (!response?.user) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapUserFromApi(response.user);
}

export async function updateUser(id: string, payload: {
  fullName: string;
  username: string;
  email: string;
  type: "User" | "Admin";
  image?: string | null;
}) {
  const response = await requestJson<UserApiResponse>(`/api/Login/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      Username: payload.username,
      Email: payload.email,
      Type: payload.type,
      Image: payload.image ?? null,
    }),
  });

  if (!response?.user) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapUserFromApi(response.user);
}

export async function deleteUser(id: string) {
  await requestJson<UserApiResponse>(`/api/Login/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function fetchProfile(params: { username?: string; email?: string }) {
  const query = new URLSearchParams();
  if (params.username) query.set("username", params.username);
  if (params.email) query.set("email", params.email);
  const response = await requestJson<UserApiModel>(`/api/Login/profile?${query.toString()}`);
  return mapUserFromApi(response);
}

export async function updateProfile(payload: {
  username?: string;
  email?: string;
  newUsername?: string;
  newEmail?: string;
  image?: string | null;
}) {
  const response = await requestJson<UserApiResponse>("/api/Login/profile", {
    method: "PUT",
    body: JSON.stringify({
      Username: payload.username,
      Email: payload.email,
      NewUsername: payload.newUsername,
      NewEmail: payload.newEmail,
      Image: payload.image ?? null,
    }),
  });

  if (!response?.user) {
    throw new Error(response?.message || "Resposta invalida do servidor.");
  }

  return mapUserFromApi(response.user);
}

export async function changePassword(payload: {
  username?: string;
  email?: string;
  currentPassword: string;
  newPassword: string;
}) {
  const response = await requestJson<ChangePasswordResponse>("/api/Login/change-password", {
    method: "POST",
    body: JSON.stringify({
      Username: payload.username,
      Email: payload.email,
      CurrentPassword: payload.currentPassword,
      NewPassword: payload.newPassword,
    }),
  });

  return response;
}

export async function requestPasswordReset(identifier: string) {
  const response = await requestJson<ForgotPasswordResponse>("/api/Login/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      Identifier: identifier,
    }),
  });

  return response;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const response = await requestJson<ForgotPasswordResponse>("/api/Login/reset-password", {
    method: "POST",
    body: JSON.stringify({
      Token: token,
      NewPassword: newPassword,
    }),
  });

  return response;
}

export async function pingSession() {
  await requestJson<UserApiResponse>("/api/Login/ping", { method: "POST" });
}

export async function logoutSession() {
  await requestJson<UserApiResponse>("/api/Login/logout", { method: "POST" });
}
