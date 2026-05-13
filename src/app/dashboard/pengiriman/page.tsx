"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Truck } from "lucide-react";

export default function PengirimanDashboard() {
  const [pengirimans, setPengirimans] = useState<any[]>([]);
  const [kurirs, setKurirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    setUserRole(parsedUser.role);
    
    fetchPengiriman(parsedUser);
    if (parsedUser.role === "admin" || parsedUser.role === "owner") {
      fetchKurirs();
    }
  }, []);

  async function fetchKurirs() {
    try {
      const { data } = await supabase.from("users").select("*").eq("level", "kurir");
      setKurirs(data || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPengiriman(user: any) {
    setLoading(true);
    try {
      let query = supabase
        .from("pengirimans")
        .select(`
          *,
          pesanans (
            no_resi,
            pelanggans (nama_pelanggan, alamat1, telepon)
          ),
          users (name)
        `)
        .order("tgl_kirim", { ascending: false });

      if (user.role === "kurir") {
        query = query.eq("id_user", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPengirimans(data || []);
    } catch (error) {
      console.error("Error fetching pengiriman:", error);
    } finally {
      setLoading(false);
    }
  }

  async function assignKurir(id_pengiriman: number, id_kurir: string) {
    try {
      const { error } = await supabase
        .from("pengirimans")
        .update({ id_user: id_kurir === "" ? null : Number(id_kurir) })
        .eq("id", id_pengiriman);
      if (error) throw error;
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) fetchPengiriman(JSON.parse(storedUser));
    } catch (error: any) {
      alert("Gagal mengassign kurir: " + error.message);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      const updates: any = { status_kirim: newStatus };
      if (newStatus === "Tiba Ditujuan") {
        updates.tgl_tiba = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("pengirimans")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) fetchPengiriman(JSON.parse(storedUser));
      
    } catch (error: any) {
      alert("Gagal update status: " + error.message);
    }
  }

  if (loading) return <div>Memuat data pengiriman...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tugas Pengiriman</h1>
        <p className="text-muted-foreground">Kelola dan pantau status pengiriman pesanan.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">No. Resi Pesanan</th>
                <th className="px-6 py-4 font-medium">Tujuan</th>
                <th className="px-6 py-4 font-medium">Waktu Kirim</th>
                {userRole !== "kurir" && <th className="px-6 py-4 font-medium">Assign Kurir</th>}
                <th className="px-6 py-4 font-medium">Status Pengiriman</th>
              </tr>
            </thead>
            <tbody>
              {pengirimans.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'kurir' ? 4 : 5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Truck className="h-10 w-10 text-muted-foreground/30 mb-2" />
                      Belum ada jadwal pengiriman.
                    </div>
                  </td>
                </tr>
              ) : (
                pengirimans.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="px-6 py-4 font-bold text-primary">{p.pesanans?.no_resi}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold">{p.pesanans?.pelanggans?.nama_pelanggan}</p>
                      <p className="text-xs text-muted-foreground">{p.pesanans?.pelanggans?.alamat1}</p>
                      <p className="text-xs text-primary">{p.pesanans?.pelanggans?.telepon}</p>
                    </td>
                    <td className="px-6 py-4">
                      {p.tgl_kirim ? new Date(p.tgl_kirim).toLocaleString('id-ID') : '-'}
                    </td>
                    {userRole !== "kurir" && (
                      <td className="px-6 py-4 font-medium">
                        <select 
                          className="w-full p-2 border border-border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary text-xs"
                          value={p.id_user || ""}
                          onChange={(e) => assignKurir(p.id, e.target.value)}
                        >
                          <option value="">Belum Diassign</option>
                          {kurirs.map(k => (
                            <option key={k.id} value={k.id}>{k.name}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {p.status_kirim === 'Tiba Ditujuan' ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          Tiba Ditujuan
                        </span>
                      ) : (
                        <select 
                          className="bg-blue-100 text-blue-800 text-xs font-bold rounded-full px-3 py-1.5 border-none outline-none cursor-pointer"
                          value={p.status_kirim || ''}
                          onChange={(e) => updateStatus(p.id, e.target.value)}
                          disabled={userRole !== "kurir" && userRole !== "admin"}
                        >
                          <option value="Sedang Dikirim">Sedang Dikirim</option>
                          <option value="Tiba Ditujuan">Tiba Ditujuan</option>
                        </select>
                      )}
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
