"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getSession, saveSession, type SessionUser } from "@/lib/auth";

export default function ProfilPelanggan() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    telepon: "",
    alamat1: "",
    alamat2: "",
    alamat3: "",
  });

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role !== "pelanggan") {
      router.replace("/dashboard");
      return;
    }

    setSessionUser(session);
    fetchProfile(session.id);
  }, [router]);

  async function fetchProfile(idPelanggan: number) {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("pelanggans")
        .select("*")
        .eq("id", idPelanggan)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        router.replace("/login");
        return;
      }

      setUser(data);

      setFormData({
        nama_pelanggan: data.nama_pelanggan || "",
        telepon: data.telepon || "",
        alamat1: data.alamat1 || "",
        alamat2: data.alamat2 || "",
        alamat3: data.alamat3 || "",
      });
    } catch (error) {
      console.error("FETCH PROFILE ERROR:", error);
      alert("Gagal memuat profil pelanggan.");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !sessionUser) {
      alert("Session tidak valid. Silakan login ulang.");
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("pelanggans")
        .update({
          nama_pelanggan: formData.nama_pelanggan,
          telepon: formData.telepon,
          alamat1: formData.alamat1,
          alamat2: formData.alamat2,
          alamat3: formData.alamat3,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      saveSession({
        id: sessionUser.id,
        nama: formData.nama_pelanggan,
        email: sessionUser.email,
        role: "pelanggan",
      });

      setUser({
        ...user,
        ...formData,
      });

      alert("Profil berhasil diperbarui!");
    } catch (error: any) {
      alert("Gagal menyimpan profil: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div>Memuat profil...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi pribadi dan alamat pengiriman Anda.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email (Tidak dapat diubah)
            </label>

            <input
              type="text"
              disabled
              className="w-full p-3 border border-border rounded-xl bg-secondary/50 text-muted-foreground"
              value={user.email || ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Lengkap
            </label>

            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
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
            <label className="block text-sm font-medium mb-1">
              No. Telepon
            </label>

            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
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
            <label className="block text-sm font-medium mb-1">
              Alamat Utama (Untuk Pengiriman)
            </label>

            <textarea
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
              value={formData.alamat1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  alamat1: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Alamat Tambahan 1
            </label>

            <textarea
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
              value={formData.alamat2}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  alamat2: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Alamat Tambahan 2
            </label>

            <textarea
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
              value={formData.alamat3}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  alamat3: e.target.value,
                })
              }
            />
          </div>

          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}