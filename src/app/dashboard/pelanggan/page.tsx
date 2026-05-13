"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function PelangganDashboard() {
  const [pesanans, setPesanans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPesanans() {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      try {
        const { data, error } = await supabase
          .from("pesanans")
          .select(`
            *,
            jenis_pembayarans (metode_pembayaran)
          `)
          .eq("id_pelanggan", user.id)
          .order("tgl_pesan", { ascending: false });

        if (error) throw error;
        setPesanans(data || []);
      } catch (error) {
        console.error("Error fetching pesanan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPesanans();
  }, []);

  if (loading) return <div>Memuat pesanan Anda...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pesanan Saya</h1>
        <p className="text-muted-foreground">Pantau status pesanan katering Anda di sini.</p>
      </div>

      {pesanans.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="bg-secondary p-4 rounded-full mb-4 text-muted-foreground">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-lg">Belum ada pesanan</h3>
          <p className="text-muted-foreground mb-6">Anda belum pernah memesan katering. Yuk, lihat menu kami!</p>
          <Link href="/#packages" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Lihat Menu Katering
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">No. Resi</th>
                  <th className="px-6 py-4 font-medium">Tanggal Pesan</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Total Bayar</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesanans.map((pesanan) => (
                  <tr key={pesanan.id} className="border-b border-border hover:bg-secondary/20">
                    <td className="px-6 py-4 font-medium">{pesanan.no_resi || '-'}</td>
                    <td className="px-6 py-4">{new Date(pesanan.tgl_pesan).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        pesanan.status_pesan === 'Menunggu Konfirmasi' ? 'bg-yellow-100 text-yellow-800' :
                        pesanan.status_pesan === 'Sedang Diproses' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pesanan.status_pesan}
                      </span>
                    </td>
                    <td className="px-6 py-4">Rp {pesanan.total_bayar?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-medium hover:underline">Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
