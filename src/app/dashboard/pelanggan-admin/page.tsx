"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function KelolaPelanggan() {
  const [pelanggans, setPelanggans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPelanggans() {
      try {
        const { data, error } = await supabase
          .from("pelanggans")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPelanggans(data || []);
      } catch (error) {
        console.error("Error fetching pelanggans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPelanggans();
  }, []);

  if (loading) return <div>Memuat data pelanggan...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Pelanggan</h1>
        <p className="text-muted-foreground">Daftar semua pelanggan yang terdaftar di sistem.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Nama</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Telepon</th>
              <th className="px-6 py-4 font-medium">Alamat</th>
              <th className="px-6 py-4 font-medium">Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            {pelanggans.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Belum ada pelanggan.</td></tr>
            ) : (
              pelanggans.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="px-6 py-4 font-bold">{p.nama_pelanggan}</td>
                  <td className="px-6 py-4">{p.email}</td>
                  <td className="px-6 py-4">{p.telepon}</td>
                  <td className="px-6 py-4"><span className="line-clamp-1">{p.alamat1}</span></td>
                  <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
