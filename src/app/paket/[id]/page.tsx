import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImageIcon,
  Users,
  Utensils,
} from "lucide-react";

import Navbar from "@/app/navbar";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Paket = Database["public"]["Tables"]["pakets"]["Row"];

export const revalidate = 0;

export default async function PaketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paketId = Number(id);

  if (!Number.isInteger(paketId) || paketId <= 0) {
    notFound();
  }

  const { data: paket, error } = await supabase
    .from("pakets")
    .select("*")
    .eq("id", paketId)
    .maybeSingle();

  if (error || !paket) {
    notFound();
  }

  const gallery = [paket.foto1, paket.foto2, paket.foto3].filter(
    (foto): foto is string => Boolean(foto)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 md:px-6 py-10 md:py-14 mx-auto">
        <Link
          href="/#packages"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke paket menu
        </Link>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <section className="space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-3xl overflow-hidden border border-border">
              {paket.foto1 ? (
                <img
                  src={paket.foto1}
                  alt={paket.nama_paket}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-secondary">
                  <ImageIcon className="h-14 w-14 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {gallery.map((foto, index) => (
                  <div
                    key={`${foto}-${index}`}
                    className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden border border-border"
                  >
                    <img
                      src={foto}
                      alt={`${paket.nama_paket} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-8">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {paket.kategori && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                    {paket.kategori}
                  </span>
                )}

                {paket.jenis && (
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full border border-border">
                    {paket.jenis}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {paket.nama_paket}
                </h1>

                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  {paket.deskripsi || "Detail paket belum ditambahkan."}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem
                icon={<Users className="h-5 w-5" />}
                label="Jumlah Pax"
                value={paket.jumlah_pax ? `${paket.jumlah_pax} Pax` : "-"}
              />

              <InfoItem
                icon={<Utensils className="h-5 w-5" />}
                label="Tipe Layanan"
                value={paket.jenis || "-"}
              />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Harga paket
                </p>
                <p className="text-3xl font-extrabold text-primary mt-1">
                  Rp {formatRupiah(paket.harga_paket)}
                </p>
              </div>

              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Cocok untuk acara {paket.kategori?.toLowerCase() || "Anda"}
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Paket sudah dihitung untuk kebutuhan pax yang tercantum
                </li>
              </ul>

              <Link
                href={`/checkout?paket_id=${paket.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
              >
                Pesan Paket Ini
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function formatRupiah(value: Paket["harga_paket"]) {
  return (value || 0).toLocaleString("id-ID");
}
