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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#8ED8F8] to-[#F5E6C8]">
        <p className="text-[#1F2933] font-bold">
          ⏳ Memuat...
        </p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#8ED8F8] to-[#F5E6C8] p-4">

      <div className="w-full max-w-md minecraft-card p-8 space-y-6">

        {/* ICON */}
        <div className="flex justify-center">
          <div className="bg-[#3FA34D] text-[#FFF8E7] p-4 border-2 border-[#3b2f2f] shadow-[3px_3px_0px_#2b2b2b]">
            <span className="text-3xl">🔓</span>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-[#1F2933]">
          Selamat Datang
        </h2>

        {/* ERROR */}
        {error && (
          <div className="bg-[#DC2626] text-[#FFF8E7] p-3 border-2 border-[#3b2f2f] text-sm text-center font-semibold shadow-[2px_2px_0px_#2b2b2b]">
            ⚠️ {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#1F2933]">
              📧 Email
            </label>

            <input
              type="email"
              required
              placeholder="nama@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="minecraft-input w-full"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-bold mb-2 text-[#1F2933]">
              🔑 Password
            </label>

            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="minecraft-input w-full"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="minecraft-button-primary w-full mt-6 disabled:opacity-50 text-base py-3"
          >
            {loading
              ? "⏳ Memproses..."
              : "✅ Masuk"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-[#6B7280] border-t-2 border-[#D4AF84] pt-4">
          Belum punya akun?{" "}

          <Link
            href="/register"
            className="text-[#3FA34D] font-bold hover:text-[#2E7D32] transition-colors"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}