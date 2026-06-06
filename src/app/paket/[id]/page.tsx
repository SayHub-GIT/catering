import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

import Navbar from "@/app/navbar";

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
    <div className="min-h-screen bg-gradient-to-b from-[#8ED8F8] to-[#F5E6C8]">
      <Navbar />

      <main className="container px-4 md:px-6 py-10 md:py-14 mx-auto">
        <Link
          href="/#packages"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1F2933] hover:text-[#3FA34D] transition-colors mb-8"
        >
          ← Kembali ke paket menu
        </Link>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <section className="space-y-4">
            <div className="aspect-[4/3] bg-[#D4AF84] border-2 border-[#3b2f2f] overflow-hidden shadow-[4px_4px_0px_#2b2b2b]">
              {paket.foto1 ? (
                <img
                  src={paket.foto1}
                  alt={paket.nama_paket}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#A47148] text-4xl">
                  📦
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {gallery.map((foto, index) => (
                  <div
                    key={`${foto}-${index}`}
                    className="aspect-[4/3] bg-[#D4AF84] border-2 border-[#3b2f2f] overflow-hidden shadow-[3px_3px_0px_#2b2b2b]"
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
                  <span className="bg-[#3FA34D] text-[#FFF8E7] text-xs font-bold px-3 py-1.5 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b]">
                    {paket.kategori}
                  </span>
                )}

                {paket.jenis && (
                  <span className="bg-[#A47148] text-[#FFF8E7] text-xs font-bold px-3 py-1.5 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b]">
                    {paket.jenis}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1F2933]" style={{ textShadow: '2px 2px 0px rgba(31, 41, 51, 0.2)' }}>
                  {paket.nama_paket}
                </h1>

                <p className="text-[#6B7280] leading-relaxed text-base md:text-lg font-semibold">
                  {paket.deskripsi || "Detail paket belum ditambahkan."}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem
                label="👥 Jumlah Pax"
                value={paket.jumlah_pax ? `${paket.jumlah_pax} Pax` : "-"}
              />

              <InfoItem
                label="🍽️ Tipe Layanan"
                value={paket.jenis || "-"}
              />
            </div>

            <div className="minecraft-card p-6 space-y-5">
              <div>
                <p className="text-sm text-[#6B7280] font-bold">
                  💰 Harga paket
                </p>
                <p className="text-4xl font-extrabold text-[#3FA34D] mt-1">
                  Rp {formatRupiah(paket.harga_paket)}
                </p>
              </div>

              <ul className="space-y-3 text-sm text-[#1F2933] font-semibold">
                <li className="flex items-center gap-3">
                  <span className="text-lg">✅</span>
                  Cocok untuk acara {paket.kategori?.toLowerCase() || "Anda"}
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-lg">✅</span>
                  Paket sudah dihitung untuk kebutuhan pax yang tercantum
                </li>
              </ul>

              <Link
                href={`/checkout?paket_id=${paket.id}`}
                className="minecraft-button-primary w-full py-4 text-base inline-flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                🛒 Pesan Paket Ini
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 minecraft-card p-4">
      <div className="text-2xl">
        {label.includes("Pax") ? "👥" : "🍽️"}
      </div>
      <div>
        <p className="text-xs font-bold text-[#6B7280]">{label}</p>
        <p className="font-bold text-[#1F2933]">{value}</p>
      </div>
    </div>
  );
}

function formatRupiah(value: Paket["harga_paket"]) {
  return (value || 0).toLocaleString("id-ID");
}
