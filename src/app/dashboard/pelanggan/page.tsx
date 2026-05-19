"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarDays, CreditCard, PackageOpen, ReceiptText } from "lucide-react";

import { getDashboardPath, getSession, type SessionUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type PesananSaya = {
  id: number;
  no_resi: string | null;
  tgl_pesan: string | null;
  status_pesan: "Menunggu Konfirmasi" | "Sedang Diproses" | "Menunggu Kurir" | null;
  total_bayar: number | null;
  jenis_pembayarans: {
    metode_pembayaran: string;
  } | null;
  detail_pemesanans:
    | {
        subtotal: number | null;
        pakets: {
          nama_paket: string;
          jenis: string | null;
          kategori: string | null;
          jumlah_pax: number | null;
          foto1: string | null;
        } | null;
      }[]
    | null;
  pengirimans:
    | {
        status_kirim: "Sedang Dikirim" | "Tiba Ditujuan" | null;
        tgl_tiba: string | null;
        bukti_foto: string | null;
      }[]
    | null;
};

export default function PesananSayaPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [pesanans, setPesanans] = useState<PesananSaya[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPesananSaya = useCallback(async (idPelanggan: number) => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("pesanans")
        .select(
          `
          id,
          no_resi,
          tgl_pesan,
          status_pesan,
          total_bayar,
          jenis_pembayarans (
            metode_pembayaran
          ),
          detail_pemesanans (
            subtotal,
            pakets (
              nama_paket,
              jenis,
              kategori,
              jumlah_pax,
              foto1
            )
          ),
          pengirimans (
            status_kirim,
            tgl_tiba,
            bukti_foto
          )
        `
        )
        .eq("id_pelanggan", idPelanggan)
        .order("tgl_pesan", { ascending: false });

      if (error) throw error;

      setPesanans((data || []) as PesananSaya[]);
    } catch (error) {
      console.error("Error fetching pesanan pelanggan:", error);
      setPesanans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role !== "pelanggan") {
      router.replace(getDashboardPath(session.role));
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchPesananSaya(session.id).then(() => {
        setUser(session);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchPesananSaya, router]);

  if (loading || !user) {
    return <div>Memuat pesanan saya...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pesanan Saya</h1>
          <p className="text-muted-foreground">
            Daftar pesanan yang pernah Anda buat di Symphony Catering.
          </p>
        </div>

        <Link
          href="/#packages"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Pesan Paket Lagi
        </Link>
      </div>

      {pesanans.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
          <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-bold">Belum Ada Pesanan</h2>
          <p className="text-muted-foreground mt-2">
            Pesanan yang Anda buat nanti akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pesanans.map((pesanan) => {
            const detail = pesanan.detail_pemesanans?.[0];
            const paket = detail?.pakets;
            const pengiriman =
              pesanan.status_pesan === "Menunggu Kurir"
                ? pesanan.pengirimans?.[0]
                : undefined;
            const statusLabel =
              pengiriman?.status_kirim === "Tiba Ditujuan"
                ? "Pesanan Selesai"
                : pesanan.status_pesan;

            return (
              <article
                key={pesanan.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4 min-w-0">
                    <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-border bg-secondary">
                      {paket?.foto1 ? (
                        <img
                          src={paket.foto1}
                          alt={paket.nama_paket}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ReceiptText className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {pesanan.no_resi || `PESANAN-${pesanan.id}`}
                        </span>
                        <StatusBadge status={statusLabel} />
                      </div>

                      <h2 className="font-bold text-lg truncate">
                        {paket?.nama_paket || "Paket tidak ditemukan"}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        {[paket?.kategori, paket?.jenis, paket?.jumlah_pax ? `${paket.jumlah_pax} Pax` : null]
                          .filter(Boolean)
                          .join(" - ") || "Detail paket tidak tersedia"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                    <InfoCell
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Tanggal Pesan"
                      value={
                        pesanan.tgl_pesan
                          ? new Date(pesanan.tgl_pesan).toLocaleDateString("id-ID")
                          : "-"
                      }
                    />
                    <InfoCell
                      icon={<CreditCard className="h-4 w-4" />}
                      label="Pembayaran"
                      value={pesanan.jenis_pembayarans?.metode_pembayaran || "-"}
                    />
                    <InfoCell
                      icon={<ReceiptText className="h-4 w-4" />}
                      label="Total"
                      value={`Rp ${(pesanan.total_bayar || 0).toLocaleString("id-ID")}`}
                    />
                  </div>
                </div>

                {pengiriman?.bukti_foto && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    Pesanan sudah diantar
                    {pengiriman.tgl_tiba
                      ? ` pada ${new Date(pengiriman.tgl_tiba).toLocaleString("id-ID")}`
                      : ""}
                    .{" "}
                    <a
                      href={pengiriman.bukti_foto}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold underline"
                    >
                      Lihat bukti foto
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: PesananSaya["status_pesan"] | "Sedang Dikirim" | "Tiba Ditujuan" | "Pesanan Selesai";
}) {
  const label = status || "Menunggu Konfirmasi";
  const className =
    label === "Pesanan Selesai" || label === "Tiba Ditujuan"
      ? "bg-green-100 text-green-800"
      : label === "Menunggu Konfirmasi"
      ? "bg-yellow-100 text-yellow-800"
      : label === "Sedang Diproses"
        ? "bg-blue-100 text-blue-800"
        : "bg-indigo-100 text-indigo-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
