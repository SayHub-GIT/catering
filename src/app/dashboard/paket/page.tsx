"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function KelolaPaket() {
  const [pakets, setPakets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaket();
  }, []);

  async function fetchPaket() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pakets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPakets(data || []);
    } catch (error) {
      console.error("Error fetching paket:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus paket ini?")) return;
    try {
      const { error } = await supabase.from("pakets").delete().eq("id", id);
      if (error) throw error;
      fetchPaket();
    } catch (error) {
      alert("Gagal menghapus paket. Mungkin paket ini sudah ada di transaksi pemesanan.");
    }
  }

  if (loading) return <div>Memuat data paket...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Paket Menu</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus paket katering.</p>
        </div>
        <Link 
          href="/dashboard/paket/tambah" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Paket
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Paket</th>
                <th className="px-6 py-4 font-medium">Jenis</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Harga</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pakets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada paket yang ditambahkan.</td>
                </tr>
              ) : (
                pakets.map((paket) => (
                  <tr key={paket.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="px-6 py-4 font-bold">{paket.nama_paket}</td>
                    <td className="px-6 py-4">
                      <span className="bg-secondary px-2 py-1 rounded-md text-xs">{paket.jenis}</span>
                    </td>
                    <td className="px-6 py-4">{paket.kategori}</td>
                    <td className="px-6 py-4 text-primary font-semibold">Rp {paket.harga_paket?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link
      href={`/dashboard/paket/edit/${paket.id}`}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    >
      <Pencil className="h-4 w-4" />
    </Link>
                      <button onClick={() => handleDelete(paket.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
    </div>
  );
}
