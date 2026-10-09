import type {
  Options,
  Paginated,
  User,
  Vacancy,
  VacancyInput,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
export const TOKEN_KEY = "djobs_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.message ?? "Terjadi kesalahan", res.status, body.errors);
  return body as T;
}

const json = (data: unknown) => JSON.stringify(data);

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  company_sector: string;
  company_size: string;
}

export const api = {
  options: () => request<Options>("/options"),
  vacancies: (search: string, page: number) =>
    request<Paginated<Vacancy>>(
      `/vacancies?${new URLSearchParams({ search, page: String(page) })}`,
    ),
  vacancy: (id: string | number) =>
    request<{ data: Vacancy }>(`/vacancies/${id}`).then((r) => r.data),
  myVacancies: () => request<{ data: Vacancy[] }>("/my-vacancies").then((r) => r.data),
  createVacancy: (input: VacancyInput) =>
    request<{ data: Vacancy }>("/vacancies", { method: "POST", body: json(input) }),
  updateVacancy: (id: number | string, input: VacancyInput) =>
    request<{ data: Vacancy }>(`/vacancies/${id}`, { method: "PUT", body: json(input) }),
  deleteVacancy: (id: number) => request<void>(`/vacancies/${id}`, { method: "DELETE" }),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/login", {
      method: "POST",
      body: json({ email, password }),
    }),
  register: (input: RegisterInput) =>
    request<{ token: string; user: User }>("/register", {
      method: "POST",
      body: json(input),
    }),
  me: () => request<{ data: User }>("/me").then((r) => r.data),
  logout: () => request<void>("/logout", { method: "POST" }),
};
