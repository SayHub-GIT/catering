import Link from "next/link";
import { ArrowRight, Utensils, Clock, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "./navbar";

// Make it dynamic to always fetch latest packages
export const revalidate = 0;

export default async function Home() {
  const { data: pakets } = await supabase
    .from("pakets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50" />
          
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm">
                <Star className="mr-2 h-4 w-4 fill-primary" />
                Katering Premium No. 1 di Kota Anda
              </div>
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl/none text-balance">
                  Sajikan Momen Tak Terlupakan dengan <span className="text-primary">Symphony</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                  Dari pernikahan impian hingga rapat penting, kami menyediakan hidangan lezat dan pelayanan profesional yang disesuaikan khusus untuk acara Anda.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="#packages"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105"
                >
                  Lihat Paket Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-background" id="about">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-3xl transition-all hover:bg-secondary/50">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                  <Utensils className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Bahan Berkualitas</h3>
                <p className="text-muted-foreground">Kami hanya menggunakan bahan segar pilihan terbaik untuk menjamin rasa dan kualitas setiap hidangan.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-3xl transition-all hover:bg-secondary/50">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Tepat Waktu</h3>
                <p className="text-muted-foreground">Layanan pengiriman dan persiapan yang selalu on-time, agar acara Anda berjalan lancar tanpa hambatan.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-3xl transition-all hover:bg-secondary/50">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Higienis & Halal</h3>
                <p className="text-muted-foreground">Proses memasak yang higienis dengan standar ketat dan 100% menggunakan bahan baku halal.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section id="packages" className="w-full py-24 bg-secondary/30">
          <div className="container px-4 md:px-6 mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Pilihan Paket Kami</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto md:text-lg">
                Temukan paket katering yang paling sesuai dengan kebutuhan acara Anda.
              </p>
            </div>
            
            {pakets && pakets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pakets.map((paket) => (
                  <Link href={`/paket/${paket.id}`} key={paket.id} className="group block bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all">
                    <div className="h-48 bg-muted relative overflow-hidden">
                      {paket.foto1 ? (
                        <img src={paket.foto1} alt={paket.nama_paket} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <Utensils className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {paket.kategori}
                        </span>
                        <span className="bg-background text-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-border">
                          {paket.jenis}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{paket.nama_paket}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{paket.deskripsi}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Harga / {paket.jumlah_pax} Pax</p>
                          <p className="text-lg font-bold text-primary">Rp {paket.harga_paket?.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-secondary p-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-card rounded-3xl border border-border">
                <Utensils className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold">Belum Ada Paket</h3>
                <p className="text-muted-foreground mt-2">Admin belum menambahkan paket katering apa pun ke sistem.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-background border-t border-border">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <Utensils className="h-5 w-5 text-primary" />
             <span className="font-bold tracking-tight">Symphony</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Symphony Catering. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
