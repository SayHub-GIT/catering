"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Utensils } from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  getSession,
  saveSession,
} from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // CHECK SESSION
  // =========================
  useEffect(() => {
    const session = getSession();

    if (session) {
      redirectByRole(session.role);
      return;
    }

    setCheckingSession(false);
  }, []);

  // =========================
  // REDIRECT ROLE
  // =========================
  function redirectByRole(role: string) {
    if (role === "pelanggan") {
      router.replace("/dashboard/pelanggan");
      return;
    }

    if (role === "kurir") {
      router.replace("/dashboard/pengiriman");
      return;
    }

    router.replace("/dashboard");
  }

  // =========================
  // HANDLE LOGIN
  // =========================
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // =========================
      // LOGIN PELANGGAN
      // =========================
      const { data: pelanggan, error: pelangganError } =
        await supabase
          .from("pelanggans")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .maybeSingle();

      if (pelangganError) {
        throw pelangganError;
      }

      if (pelanggan) {
        saveSession({
          id: pelanggan.id,
          nama: pelanggan.nama_pelanggan,
          email: pelanggan.email,
          role: "pelanggan",
        });

        router.replace("/dashboard/pelanggan");
        return;
      }

      // =========================
      // LOGIN STAFF
      // =========================
      const { data: staff, error: staffError } =
        await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .maybeSingle();

      if (staffError) {
        throw staffError;
      }

      if (staff) {
        // FIX NULL ROLE
        if (
          staff.level !== "admin" &&
          staff.level !== "owner" &&
          staff.level !== "kurir"
        ) {
          setError("Role user tidak valid.");
          setLoading(false);
          return;
        }

        saveSession({
          id: staff.id,
          nama: staff.name,
          email: staff.email,
          role: staff.level,
        });

        redirectByRole(staff.level);

        return;
      }

      setError("Email atau password salah.");
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message ||
          "Terjadi kesalahan saat login."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOADING SESSION
  // =========================
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Memuat...
        </p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">

      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border">

        {/* ICON */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl">
            <Utensils className="h-8 w-8" />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center mb-6">
          Selamat Datang Kembali
        </h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              required
              placeholder="Masukkan email anda"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground p-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading
              ? "Memproses..."
              : "Masuk"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Belum punya akun?{" "}

          <Link
            href="/register"
            className="text-primary font-bold"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}