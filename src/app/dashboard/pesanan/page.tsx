"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getSession, type SessionUser } from "@/lib/auth";

type StatusPesanan =
  | "Menunggu Konfirmasi"
  | "Sedang Diproses"
  | "Menunggu Kurir";

export default function KelolaPesanan() {
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [pesanans, setPesanans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role !== "admin" && session.role !== "owner") {
      if (session.role === "pelanggan") router.replace("/dashboard/pelanggan");
      else if (session.role === "kurir") router.replace("/dashboard/pengiriman");
      else router.replace("/login");
      return;
    }

    setUser(session);
    fetchPesanan();
  }, [router]);

  async function fetchPesanan() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("pesanans")
        .select(`
          *,
          pelanggans (
            nama_pelanggan,
            telepon
          ),
          jenis_pembayarans (
            metode_pembayaran
          )
        `)
        .order("tgl_pesan", { ascending: false });

      if (error) throw error;

      setPesanans(data || []);
    } catch (error) {
      console.error("Error fetching pesanan:", error);
      setPesanans([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, newStatus: StatusPesanan) {
    if (!user) return;

    if (user.role !== "admin") {
      alert("Hanya admin yang boleh mengubah status pesanan.");
      return;
    }

    try {
      const { error } = await supabase
        .from("pesanans")
        .update({
          status_pesan: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      if (newStatus === "Menunggu Kurir") {
        const { data: existing, error: existingError } = await supabase
          .from("pengirimans")
          .select("id")
          .eq("id_pesan", id)
          .maybeSingle();

        if (existingError) throw existingError;

        if (!existing) {
          const { error: pengirimanError } = await supabase
            .from("pengirimans")
            .insert([
              {
                id_pesan: id,
                id_user: null,
                status_kirim: "Sedang Dikirim",
                tgl_kirim: null,
                tgl_tiba: null,
                bukti_foto: null,
              },
            ]);

          if (pengirimanError) throw pengirimanError;
        }
      }

      fetchPesanan();
    } catch (error: any) {
      alert("Gagal update status: " + error.message);
    }
  }

  if (loading || !user) {
    return <div>Memuat data pesanan...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kelola Pesanan</h1>
        <p className="text-muted-foreground">
          Pantau dan kelola pesanan masuk dari pelanggan.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">No. Resi</th>
                <th className="px-6 py-4 font-medium">Pelanggan</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Total (Metode)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {pesanans.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              ) : (
                pesanans.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border hover:bg-secondary/20"
                  >
                    <td className="px-6 py-4 font-medium">
                      {p.no_resi || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold">
                        {p.pelanggans?.nama_pelanggan || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.pelanggans?.telepon || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {p.tgl_pesan
                        ? new Date(p.tgl_pesan).toLocaleDateString("id-ID")
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-primary">
                        Rp {p.total_bayar?.toLocaleString("id-ID") || "0"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.jenis_pembayarans?.metode_pembayaran || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        className={`text-xs font-bold rounded-full px-3 py-1.5 border-none outline-none cursor-pointer appearance-none ${
                          p.status_pesan === "Menunggu Konfirmasi"
                            ? "bg-yellow-100 text-yellow-800"
                            : p.status_pesan === "Sedang Diproses"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                        value={p.status_pesan || "Menunggu Konfirmasi"}
                        disabled={user.role !== "admin"}
                        onChange={(e) =>
                          updateStatus(
                            p.id,
                            e.target.value as StatusPesanan
                          )
                        }
                      >
                        <option value="Menunggu Konfirmasi">
                          Menunggu Konfirmasi
                        </option>
                        <option value="Sedang Diproses">
                          Sedang Diproses
                        </option>
                        <option value="Menunggu Kurir">
                          Menunggu Kurir
                        </option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-blue-600 hover:underline">
                        Detail
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