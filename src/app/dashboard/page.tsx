"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getSession, type SessionUser } from "@/lib/auth";

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);

  const [stats, setStats] = useState({
    totalPesanan: 0,
    totalPendapatan: 0,
    totalPelanggan: 0,
    totalPaket: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role === "pelanggan") {
      router.replace("/dashboard/pelanggan");
      return;
    }

    if (session.role === "kurir") {
      router.replace("/dashboard/pengiriman");
      return;
    }

    if (session.role !== "admin" && session.role !== "owner") {
      router.replace("/login");
      return;
    }

    setUser(session);
    fetchStats();
  }, [router]);

  async function fetchStats() {
    setLoading(true);

    try {
      const { count: countPesanan, error: pesananCountError } = await supabase
        .from("pesanans")
        .select("*", { count: "exact", head: true });

      if (pesananCountError) throw pesananCountError;

      const { data: pesanans, error: pesananError } = await supabase
        .from("pesanans")
        .select("total_bayar");

      if (pesananError) throw pesananError;

      const totalPendapatan =
        pesanans?.reduce(
          (sum, item) => sum + Number(item.total_bayar || 0),
          0
        ) || 0;

      const { count: countPelanggan, error: pelangganError } = await supabase
        .from("pelanggans")
        .select("*", { count: "exact", head: true });

      if (pelangganError) throw pelangganError;

      const { count: countPaket, error: paketError } = await supabase
        .from("pakets")
        .select("*", { count: "exact", head: true });

      if (paketError) throw paketError;

      setStats({
        totalPesanan: countPesanan || 0,
        totalPendapatan,
        totalPelanggan: countPelanggan || 0,
        totalPaket: countPaket || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !user) {
    return <div>Memuat data statistik...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Ringkasan Bisnis
        </h1>

        <p className="text-muted-foreground">
          Selamat datang, {user.nama}. Anda login sebagai {user.role}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Total Pesanan
            </h3>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-2xl font-bold">
            {stats.totalPesanan}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Total Pendapatan
            </h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-2xl font-bold">
            Rp {stats.totalPendapatan.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Total Pelanggan
            </h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-2xl font-bold">
            {stats.totalPelanggan}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              Paket Aktif
            </h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-2xl font-bold">
            {stats.totalPaket}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Informasi Sistem</h3>

        <p className="text-muted-foreground text-sm">
          Sistem ini terhubung langsung dengan database Supabase. Semua
          perubahan pada pesanan, paket, dan pengiriman akan tersinkronisasi
          dengan database. Gunakan menu di samping untuk mengelola data
          operasional.
        </p>
      </div>
    </div>
  );
}