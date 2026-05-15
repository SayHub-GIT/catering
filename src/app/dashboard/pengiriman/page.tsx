"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getSession, type SessionUser } from "@/lib/auth";

export default function PengirimanDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [pengirimans, setPengirimans] = useState<any[]>([]);
  const [kurirs, setKurirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!["admin", "owner", "kurir"].includes(session.role)) {
      router.replace("/dashboard/pelanggan");
      return;
    }

    setUser(session);
    fetchPengiriman(session);

    if (session.role === "admin" || session.role === "owner") {
      fetchKurirs();
    }
  }, [router]);

  async function fetchKurirs() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("level", "kurir")
        .order("name", { ascending: true });

      if (error) throw error;

      setKurirs(data || []);
    } catch (error) {
      console.error("Error fetch kurir:", error);
    }
  }

  async function fetchPengiriman(currentUser: SessionUser) {
    setLoading(true);

    try {
      let query = supabase
        .from("pengirimans")
        .select(`
          *,
          pesanans (
            id,
            no_resi,
            status_pesan,
            total_bayar,
            pelanggans (
              nama_pelanggan,
              alamat1,
              telepon
            )
          ),
          users (
            id,
            name,
            email,
            level
          )
        `)
        .order("created_at", { ascending: false });

      if (currentUser.role === "kurir") {
        query = query.eq("id_user", currentUser.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPengirimans(data || []);
    } catch (error) {
      console.error("Error fetching pengiriman:", error);
      setPengirimans([]);
    } finally {
      setLoading(false);
    }
  }

  async function assignKurir(idPengiriman: number, idKurir: string) {
    if (!user) return;

    if (user.role !== "admin") {
      alert("Hanya admin yang boleh assign kurir.");
      return;
    }

    try {
      const { error } = await supabase
        .from("pengirimans")
        .update({
          id_user: idKurir === "" ? null : Number(idKurir),
          updated_at: new Date().toISOString(),
        })
        .eq("id", idPengiriman);

      if (error) throw error;

      fetchPengiriman(user);
    } catch (error: any) {
      alert("Gagal assign kurir: " + error.message);
    }
  }

  async function updateStatus(idPengiriman: number, newStatus: string) {
    if (!user) return;

    if (user.role !== "kurir" && user.role !== "admin") {
      alert("Anda tidak punya akses update pengiriman.");
      return;
    }

    try {
      const updates: any = {
        status_kirim: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "Sedang Dikirim") {
        updates.tgl_kirim = new Date().toISOString();
      }

      if (newStatus === "Tiba Ditujuan") {
        updates.tgl_tiba = new Date().toISOString();
      }

      const { error } = await supabase
        .from("pengirimans")
        .update(updates)
        .eq("id", idPengiriman);

      if (error) throw error;

      fetchPengiriman(user);
    } catch (error: any) {
      alert("Gagal update status: " + error.message);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Memuat data pengiriman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Tugas Pengiriman
        </h1>
        <p className="text-muted-foreground">
          Kelola dan pantau status pengiriman pesanan.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">No. Resi Pesanan</th>
                <th className="px-6 py-4 font-medium">Tujuan</th>
                <th className="px-6 py-4 font-medium">Waktu Kirim</th>

                {user.role !== "kurir" && (
                  <th className="px-6 py-4 font-medium">Assign Kurir</th>
                )}

                <th className="px-6 py-4 font-medium">Status Pengiriman</th>
              </tr>
            </thead>

            <tbody>
              {pengirimans.length === 0 ? (
                <tr>
                  <td
                    colSpan={user.role === "kurir" ? 4 : 5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <Truck className="h-10 w-10 text-muted-foreground/30 mb-2" />
                      Belum ada jadwal pengiriman.
                    </div>
                  </td>
                </tr>
              ) : (
                pengirimans.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border hover:bg-secondary/20"
                  >
                    <td className="px-6 py-4 font-bold text-primary">
                      {p.pesanans?.no_resi || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold">
                        {p.pesanans?.pelanggans?.nama_pelanggan || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.pesanans?.pelanggans?.alamat1 || "-"}
                      </p>
                      <p className="text-xs text-primary">
                        {p.pesanans?.pelanggans?.telepon || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {p.tgl_kirim
                        ? new Date(p.tgl_kirim).toLocaleString("id-ID")
                        : "-"}
                    </td>

                    {user.role !== "kurir" && (
                      <td className="px-6 py-4 font-medium">
                        <select
                          className="w-full p-2 border border-border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary text-xs"
                          value={p.id_user || ""}
                          onChange={(e) => assignKurir(p.id, e.target.value)}
                          disabled={user.role !== "admin"}
                        >
                          <option value="">Belum Diassign</option>

                          {kurirs.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      {p.status_kirim === "Tiba Ditujuan" ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          Tiba Ditujuan
                        </span>
                      ) : (
                        <select
                          className="bg-blue-100 text-blue-800 text-xs font-bold rounded-full px-3 py-1.5 border-none outline-none cursor-pointer"
                          value={p.status_kirim || "Sedang Dikirim"}
                          onChange={(e) => updateStatus(p.id, e.target.value)}
                          disabled={
                            user.role !== "kurir" && user.role !== "admin"
                          }
                        >
                          <option value="Sedang Dikirim">
                            Sedang Dikirim
                          </option>
                          <option value="Tiba Ditujuan">
                            Tiba Ditujuan
                          </option>
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