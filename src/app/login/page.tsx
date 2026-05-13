"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Utensils } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getSession, saveSession } from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // CHECK SESSION
  // =========================
  useEffect(() => {
    const session = getSession();

    if (!session) return;

    // Redirect berdasarkan role
    if (session.role === "pelanggan") {
      router.push("/dashboard/pelanggan");
    } else if (session.role === "kurir") {
      router.push("/dashboard/pengiriman");
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  // =========================
  // HANDLE LOGIN
  // =========================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // =========================
      // LOGIN PELANGGAN
      // =========================
      const {
        data: pelanggan,
        error: pelangganError,
      } = await supabase
        .from("pelanggans")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

      if (pelangganError) {
        throw pelangganError;
      }

      // Kalau pelanggan ditemukan
      if (pelanggan) {
        saveSession({
          id: pelanggan.id,
          nama: pelanggan.nama_pelanggan,
          email: pelanggan.email,
          role: "pelanggan",
        });

        router.push("/dashboard/pelanggan");
        return;
      }

      // =========================
      // LOGIN STAFF
      // =========================
      const {
        data: staff,
        error: staffError,
      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

      if (staffError) {
        throw staffError;
      }

      // Kalau staff ditemukan
      if (staff) {
        saveSession({
          id: staff.id,
          nama: staff.name,
          email: staff.email,
          role: staff.level,
        });

        // Redirect berdasarkan role
        switch (staff.level) {
          case "kurir":
            router.push("/dashboard/pengiriman");
            break;

          case "admin":
          case "owner":
            router.push("/dashboard");
            break;

          default:
            router.push("/");
        }

        return;
      }

      // Kalau tidak ditemukan
      setError("Email atau password salah.");
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      setError(
        err?.message || "Terjadi kesalahan saat login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl">
            <Utensils className="h-8 w-8" />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center mb-2">
          Selamat Datang Kembali
        </h2>

        <p className="text-center text-sm text-muted-foreground mb-6">
          Silakan login untuk melanjutkan
        </p>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Masukkan email anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground p-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* REGISTER */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}