"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function KelolaPembayaran() {
  const [metodes, setMetodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMetode, setNewMetode] = useState("");

  useEffect(() => {
    fetchMetode();
  }, []);

  async function fetchMetode() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jenis_pembayarans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMetodes(data || []);
    } catch (error) {
      console.error("Error fetching metode pembayaran:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newMetode.trim()) return;
    
    try {
      const { error } = await supabase
        .from("jenis_pembayarans")
        .insert([{ metode_pembayaran: newMetode }]);
      
      if (error) throw error;
      setNewMetode("");
      setIsAdding(false);
      fetchMetode();
    } catch (error: any) {
      alert("Gagal menambahkan metode: " + error.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus metode pembayaran ini? Semua pesanan yang menggunakan metode ini akan kehilangan referensinya (menjadi null).")) return;
    try {
      const { error } = await supabase.from("jenis_pembayarans").delete().eq("id", id);
      if (error) throw error;
      fetchMetode();
    } catch (error) {
      alert("Gagal menghapus metode.");
    }
  }

  if (loading) return <div>Memuat metode pembayaran...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Metode Pembayaran</h1>
          <p className="text-muted-foreground">Atur daftar jenis pembayaran yang bisa dipilih pelanggan.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Metode
        </button>
      </div>

      {isAdding && (
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm mb-6">
          <form onSubmit={handleAdd} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Contoh: Transfer BCA, Tunai, DANA"
              required
              className="flex-1 p-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              value={newMetode}
              onChange={(e) => setNewMetode(e.target.value)}
            />
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
              Simpan
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-secondary px-4 py-2 rounded-lg font-medium">
              Batal
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Metode Pembayaran</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {metodes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Belum ada metode pembayaran.</td>
              </tr>
            ) : (
              metodes.map((m) => (
                <tr key={m.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="px-6 py-4">{m.id}</td>
                  <td className="px-6 py-4 font-bold">{m.metode_pembayaran}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
