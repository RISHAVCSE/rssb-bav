import keycloak from "../KeyCloak/KeyCloak";
import { API_BASE_URL } from "./api";

const API_URL = API_BASE_URL;

export type UserRole = "SUPERADMIN" | "ADMIN" | "USER" | "SUBUSER";

export interface User {
  id: number;
  keycloakId?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdBy?: User | string | number | null;
  parentUser?: User | string | number | null;
  subUsers?: User[];
}

export interface CreateUserPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  parentUser?: number | null;
  parentUserId?: number | null;
}

export interface UpdateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

const authHeader = () => ({
  Authorization: `Bearer ${keycloak.token}`,
});

const endpoint = (path: string) => `${API_URL.replace(/\/?$/, "/")}users${path}`;

const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "string"
        ? body
        : body?.message || body?.error || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  return body as T;
};

const normalizeUserList = (body: unknown): User[] => {
  if (Array.isArray(body)) {
    return body as User[];
  }

  if (body && typeof body === "object") {
    const responseObject = body as Record<string, unknown>;
    const possibleLists = [
      responseObject.users,
      responseObject.data,
      responseObject.content,
      responseObject.items,
      responseObject.results,
    ];

    const userList = possibleLists.find(Array.isArray);
    if (userList) {
      return userList as User[];
    }
  }

  throw new Error("Users API response did not contain a user list");
};

export class UserService {
  public static async fetchUsers(): Promise<User[]> {
    const response = await fetch(endpoint(""), {
      headers: authHeader(),
    });
    const body = await parseResponse<unknown>(response);
    return normalizeUserList(body);
  }

  public static async fetchUserById(id: number): Promise<User> {
    const response = await fetch(endpoint(`/${id}`), {
      headers: authHeader(),
    });
    return parseResponse<User>(response);
  }

  public static async fetchUserByKeycloakId(keycloakId: string): Promise<User> {
    const response = await fetch(endpoint(`/keycloak/${keycloakId}`), {
      headers: authHeader(),
    });
    return parseResponse<User>(response);
  }

  public static async fetchAllKeycloakUsers(): Promise<any[]> {
    const response = await fetch(endpoint("/keycloak/list/all"), {
      headers: authHeader(),
    });
    const body = await parseResponse<unknown>(response);
    if (Array.isArray(body)) return body;
    if (body && typeof body === "object") {
      const responseObject = body as Record<string, unknown>;
      const possibleLists = [
        responseObject.users,
        responseObject.data,
        responseObject.content,
        responseObject.items,
        responseObject.results,
      ];
      const keycloakUsers = possibleLists.find(Array.isArray);
      if (keycloakUsers) return keycloakUsers;
    }
    return [];
  }

  public static async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await fetch(endpoint(""), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify(payload),
    });
    return parseResponse<User>(response);
  }

  public static async updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    const response = await fetch(endpoint(`/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify(payload),
    });
    return parseResponse<User>(response);
  }

  public static async deleteUser(id: number): Promise<void> {
    const response = await fetch(endpoint(`/${id}`), {
      method: "DELETE",
      headers: authHeader(),
    });
    await parseResponse<void>(response);
  }

  public static async resetPassword(id: number, newPassword: string): Promise<void> {
    const response = await fetch(endpoint(`/${id}/reset-password`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({ newPassword }),
    });
    await parseResponse<void>(response);
  }
}
