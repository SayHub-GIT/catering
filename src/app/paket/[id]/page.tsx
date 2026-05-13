"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Users, Utensils } from "lucide-react";

export default function DetailPaket() {
  const { id } = useParams();
  const router = useRouter();
  const [paket, setPaket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaket() {
      try {
        const { data, error } = await supabase
          .from("pakets")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPaket(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPaket();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat detail paket...</div>;
  if (!paket) return <div className="min-h-screen flex items-center justify-center text-center">Paket tidak ditemukan.<br/><Link href="/" className="text-primary hover:underline">Kembali ke Beranda</Link></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 h-20 flex items-center border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-bold text-lg">Detail Paket</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Gambar Paket */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-secondary border border-border">
              {paket.foto1 ? (
                <img src={paket.foto1} alt={paket.nama_paket} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Utensils className="h-24 w-24 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {/* Jika ada foto2 dan foto3, bisa ditampilkan di bawahnya dalam bentuk grid */}
          </div>

          {/* Info Paket */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full">
                  {paket.kategori}
                </span>
                <span className="bg-secondary text-secondary-foreground text-sm font-bold px-3 py-1 rounded-full border border-border">
                  {paket.jenis}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{paket.nama_paket}</h1>
              <p className="text-3xl font-bold text-primary">
                Rp {paket.harga_paket?.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="bg-secondary/30 p-6 rounded-3xl border border-border flex items-center gap-4">
              <div className="bg-background p-3 rounded-2xl shadow-sm border border-border">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Kapasitas Porsi</p>
                <p className="text-lg font-bold">{paket.jumlah_pax} Pax / Porsi</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Deskripsi & Menu</h3>
              <div className="prose prose-sm md:prose-base dark:prose-invert">
                {paket.deskripsi?.split('\n').map((line: string, i: number) => (
                  <p key={i} className="flex items-start gap-2 mb-2">
                    {line.trim().startsWith('-') ? (
                      <>
                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span>{line.substring(1).trim()}</span>
                      </>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <Link
                href={`/checkout?paket_id=${paket.id}`}
                className="flex w-full items-center justify-center h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02]"
              >
                Pesan Sekarang
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
