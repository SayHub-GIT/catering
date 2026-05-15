export type UserRole = "pelanggan" | "admin" | "owner" | "kurir";

export interface SessionUser {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
}

const SESSION_KEY = "catering-session";

export const saveSession = (user: SessionUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const getSession = (): SessionUser | null => {
  if (typeof window === "undefined") return null;

  const session = localStorage.getItem(SESSION_KEY);

  if (!session) return null;

  try {
    return JSON.parse(session) as SessionUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "/login";
};

export const getDashboardPath = (role: UserRole) => {
  if (role === "pelanggan") return "/dashboard/pelanggan";
  if (role === "kurir") return "/dashboard/pengiriman";
  return "/dashboard";
};