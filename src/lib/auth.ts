export interface SessionUser {
  id: number;
  nama: string;
  email: string;
  role: string;
}

const SESSION_KEY = "catering-session";

// GET SESSION
export const getSession = (): SessionUser | null => {
  if (typeof window === "undefined") return null;

  const session = localStorage.getItem(SESSION_KEY);

  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
};

// SAVE SESSION
export const saveSession = (user: SessionUser) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);

  window.location.href = "/";
};

// CHECK LOGIN
export const isLoggedIn = () => {
  return !!getSession();
};