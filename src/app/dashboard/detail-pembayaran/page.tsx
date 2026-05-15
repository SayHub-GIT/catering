"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export default function DetailPembayaran() {
  const router = useRouter();

  const [details, setDetails] = useState<any[]>([]);
  const [metodes, setMetodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    id_jenis_pembayaran: 0,
    no_rek: "",
    tempat_bayar: "",
    logo: "",
  });

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);

    try {
      const [detailRes, metodeRes] = await Promise.all([
        supabase
          .from("detail_jenis_pembayarans")
          .select("*, jenis_pembayarans(metode_pembayaran)")
          .order("created_at", { ascending: false }),

        supabase
          .from("jenis_pembayarans")
          .select("*")
          .order("id", { ascending: true }),
      ]);

      if (detailRes.error) throw detailRes.error;
      if (metodeRes.error) throw metodeRes.error;

      setDetails(detailRes.data || []);
      setMetodes(metodeRes.data || []);

      if (metodeRes.data && metodeRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          id_jenis_pembayaran: Number(metodeRes.data[0].id),
        }));
      }
    } catch (error) {
      console.error("FETCH DETAIL PEMBAYARAN ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.id_jenis_pembayaran) {
      alert("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    try {
      const { error } = await supabase
        .from("detail_jenis_pembayarans")
        .insert([
          {
            id_jenis_pembayaran: Number(formData.id_jenis_pembayaran),
            no_rek: formData.no_rek,
            tempat_bayar: formData.tempat_bayar,
            logo: formData.logo || null,
          },
        ]);

      if (error) throw error;

      setFormData((prev) => ({
        ...prev,
        no_rek: "",
        tempat_bayar: "",
        logo: "",
      }));

      setIsAdding(false);
      fetchData();
    } catch (error: any) {
      alert("Gagal menambah: " + error.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus detail ini?")) return;

    try {
      const { error } = await supabase
        .from("detail_jenis_pembayarans")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchData();
    } catch (error: any) {
      alert("Gagal menghapus: " + error.message);
    }
  }

  if (loading) return <div>Memuat data...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Detail Rekening & Pembayaran
          </h1>
          <p className="text-muted-foreground">
            Kelola nomor rekening atau e-wallet untuk setiap metode pembayaran.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Detail
        </button>
      </div>

      {isAdding && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-6">
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Metode Induk</label>
              <select
                className="w-full p-2 border border-border rounded-lg"
                value={formData.id_jenis_pembayaran}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id_jenis_pembayaran: Number(e.target.value),
                  })
                }
                required
              >
                {metodes.length === 0 ? (
                  <option value={0}>Belum ada metode</option>
                ) : (
                  metodes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.metode_pembayaran}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">
                Tempat Bayar (Bank/E-Wallet)
              </label>
              <input
                type="text"
                placeholder="Contoh: Bank BCA / DANA"
                required
                className="w-full p-2 border border-border rounded-lg"
                value={formData.tempat_bayar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tempat_bayar: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                No. Rekening / No. HP
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border border-border rounded-lg"
                value={formData.no_rek}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    no_rek: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">URL Logo (Opsional)</label>
              <input
                type="text"
                className="w-full p-2 border border-border rounded-lg"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    logo: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-span-2 pt-2 flex gap-2">
              <button
                type="submit"
                disabled={metodes.length === 0}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Simpan
              </button>

              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-secondary px-4 py-2 rounded-lg font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Metode</th>
              <th className="px-6 py-4 font-medium">Tempat Bayar</th>
              <th className="px-6 py-4 font-medium">No. Rekening</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {details.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  Belum ada data detail.
                </td>
              </tr>
            ) : (
              details.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-border hover:bg-secondary/20"
                >
                  <td className="px-6 py-4 font-bold">
                    {d.jenis_pembayarans?.metode_pembayaran || "-"}
                  </td>

                  <td className="px-6 py-4">{d.tempat_bayar || "-"}</td>

                  <td className="px-6 py-4 font-mono text-primary">
                    {d.no_rek || "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}