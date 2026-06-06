"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    return <div className="text-[#1F2933] font-bold">⏳ Memuat data statistik...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1F2933]">
          📊 Ringkasan Bisnis
        </h1>

        <p className="text-[#6B7280] font-semibold">
          Selamat datang, <span className="text-[#3FA34D] font-bold">{user.nama}</span>. Anda login sebagai <span className="uppercase text-[#1F2933] font-bold">{user.role}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard emoji="🛒" title="Total Pesanan" value={String(stats.totalPesanan)} />
        <StatCard emoji="💰" title="Total Pendapatan" value={`Rp ${stats.totalPendapatan.toLocaleString("id-ID")}`} />
        <StatCard emoji="👥" title="Total Pelanggan" value={String(stats.totalPelanggan)} />
        <StatCard emoji="📦" title="Paket Aktif" value={String(stats.totalPaket)} />
      </div>

      <div className="minecraft-card p-6 space-y-4">
        <h3 className="font-bold text-lg text-[#1F2933]">ℹ️ Informasi Sistem</h3>

        <p className="text-[#6B7280] text-sm font-semibold leading-relaxed">
          Sistem ini terhubung langsung dengan database Supabase. Semua perubahan pada pesanan, paket, dan pengiriman akan tersinkronisasi dengan database. Gunakan menu di samping untuk mengelola data operasional.
        </p>
      </div>
    </div>
  );
}

function StatCard({ emoji, title, value }: { emoji: string; title: string; value: string }) {
  return (
    <div className="minecraft-card p-6 space-y-2 hover:-translate-y-1 transition-transform">
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="tracking-tight text-sm font-bold text-[#1F2933]">
          {emoji} {title}
        </h3>
      </div>

      <div className="text-2xl font-bold text-[#3FA34D]">
        {value}
      </div>
    </div>
  );
}