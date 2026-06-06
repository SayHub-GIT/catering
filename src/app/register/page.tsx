"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Utensils } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getSession, saveSession } from "@/lib/auth";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    email: "",
    password: "",
    telepon: "",
    alamat1: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) return;

    if (session.role === "pelanggan") {
      router.replace("/dashboard/pelanggan");
    } else if (session.role === "kurir") {
      router.replace("/dashboard/pengiriman");
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter.");
        setLoading(false);
        return;
      }

      const { data: existingUser, error: checkError } = await supabase
        .from("pelanggans")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        setError("Email sudah digunakan.");
        setLoading(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from("pelanggans")
        .insert([
          {
            nama_pelanggan: formData.nama_pelanggan,
            email: formData.email,
            password: formData.password,
            telepon: formData.telepon,
            alamat1: formData.alamat1,
          },
        ])
        .select("id, nama_pelanggan, email")
        .single();

      if (insertError) throw insertError;

      saveSession({
        id: data.id,
        nama: data.nama_pelanggan,
        email: data.email,
        role: "pelanggan",
      });

      router.replace("/dashboard/pelanggan");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#8ED8F8] to-[#F5E6C8] p-4 py-12">
      <div className="w-full max-w-md minecraft-card p-8 space-y-6">
        <div className="flex justify-center">
          <div className="bg-[#3FA34D] text-[#FFF8E7] p-4 border-2 border-[#3b2f2f] shadow-[3px_3px_0px_#2b2b2b]">
            <span className="text-3xl">📝</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-[#1F2933]">
          Buat Akun Baru
        </h2>

        {error && (
          <div className="bg-[#DC2626] text-[#FFF8E7] p-3 border-2 border-[#3b2f2f] text-sm text-center font-semibold shadow-[2px_2px_0px_#2b2b2b]">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-[#1F2933]">
              👤 Nama Lengkap
            </label>

            <input
              type="text"
              required
              placeholder="Masukkan nama Anda"
              className="minecraft-input w-full"
              value={formData.nama_pelanggan}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nama_pelanggan: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-[#1F2933]">
              📧 Email
            </label>

            <input
              type="email"
              required
              placeholder="nama@example.com"
              className="minecraft-input w-full"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-[#1F2933]">
              🔑 Password (min 6 karakter)
            </label>

            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="minecraft-input w-full"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-[#1F2933]">
              📱 No. Telepon / WhatsApp
            </label>

            <input
              type="text"
              required
              placeholder="08xx-xxxx-xxxx"
              className="minecraft-input w-full"
              value={formData.telepon}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telepon: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-[#1F2933]">
              📍 Alamat Lengkap
            </label>

            <textarea
              required
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
              className="minecraft-input w-full min-h-[100px] resize-none"
              value={formData.alamat1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  alamat1: e.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="minecraft-button-primary w-full mt-6 disabled:opacity-50 text-base py-3"
          >
            {loading ? "⏳ Memproses..." : "✅ Daftar Akun"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B7280] border-t-2 border-[#D4AF84] pt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#3FA34D] font-bold hover:text-[#2E7D32] transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}