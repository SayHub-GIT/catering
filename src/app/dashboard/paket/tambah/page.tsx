"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TambahPaket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_paket: "",
    jenis: "Prasmanan",
    kategori: "Pernikahan",
    jumlah_pax: "",
    harga_paket: "",
    deskripsi: "",
    foto1: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("pakets")
        .insert([
          {
            nama_paket: formData.nama_paket,
            jenis: formData.jenis,
            kategori: formData.kategori,
            jumlah_pax: parseInt(formData.jumlah_pax),
            harga_paket: parseInt(formData.harga_paket),
            deskripsi: formData.deskripsi,
            foto1: formData.foto1 // Simplification: Using URL string instead of file upload for speed
          }
        ]);

      if (error) throw error;
      router.push("/dashboard/paket");
    } catch (error: any) {
      alert(error.message || "Gagal menambahkan paket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/paket" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Paket Baru</h1>
          <p className="text-muted-foreground">Isi detail form di bawah untuk menambah paket.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Paket</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.nama_paket}
              onChange={(e) => setFormData({...formData, nama_paket: e.target.value})}
              placeholder="Contoh: Paket Mewah A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jenis</label>
              <select
                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.jenis}
                onChange={(e) => setFormData({...formData, jenis: e.target.value})}
              >
                <option value="Prasmanan">Prasmanan</option>
                <option value="Box">Box</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori Acara</label>
              <select
                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.kategori}
                onChange={(e) => setFormData({...formData, kategori: e.target.value})}
              >
                <option value="Pernikahan">Pernikahan</option>
                <option value="Selamatan">Selamatan</option>
                <option value="Ulang Tahun">Ulang Tahun</option>
                <option value="Studi Tour">Studi Tour</option>
                <option value="Rapat">Rapat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah Pax / Porsi</label>
              <input
                type="number"
                required
                min="1"
                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.jumlah_pax}
                onChange={(e) => setFormData({...formData, jumlah_pax: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Harga Total (Rp)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.harga_paket}
                onChange={(e) => setFormData({...formData, harga_paket: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Foto Paket (Opsional)</label>
            <input
              type="text"
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.foto1}
              onChange={(e) => setFormData({...formData, foto1: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi & Menu</label>
            <textarea
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all min-h-[120px]"
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              placeholder="- Nasi Putih&#10;- Ayam Bakar&#10;- Sambal..."
            ></textarea>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground p-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Paket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
