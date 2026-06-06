import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden bg-gradient-to-b from-[#8ED8F8] via-[#B8E6D5] to-[#F5E6C8]">
          <div className="absolute top-0 right-0 w-full h-96 opacity-20 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #F5E6C8, #F5E6C8 2px, transparent 2px, transparent 4px)',
          }} />
          
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center border-4 border-[#3FA34D] bg-[#3FA34D] px-4 py-2 text-sm font-bold text-[#FFF8E7] shadow-[4px_4px_0px_#2b2b2b]">
                ⭐ Katering Terbaik di Kota Anda
              </div>
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-6xl font-extrabold tracking-tighter sm:text-7xl md:text-8xl/none text-[#1F2933] text-balance" style={{ textShadow: '3px 3px 0px rgba(31, 41, 51, 0.3)' }}>
                  Catering-In
                </h1>
                <p className="mx-auto max-w-[700px] text-[#1F2933] md:text-lg leading-relaxed font-semibold">
                  Catering lezat untuk setiap momen, disajikan dengan rasa dan pelayanan terbaik.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="#packages"
                  className="minecraft-button-primary px-8 py-4 text-lg font-bold inline-flex items-center justify-center gap-2 hover:-translate-y-1"
                >
                  📦 Lihat Paket Menu
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-gradient-to-b from-[#F5E6C8] to-[#FFF8E7]" id="about">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="minecraft-card p-6 space-y-4 hover:-translate-y-1 transition-transform">
                <div className="p-4 bg-[#3FA34D] border-2 border-[#3b2f2f] rounded-none text-[#FFF8E7] font-bold text-center">
                  🥘
                </div>
                <h3 className="text-xl font-bold text-[#1F2933]">Bahan Berkualitas</h3>
                <p className="text-[#6B7280]">Kami hanya menggunakan bahan segar pilihan terbaik untuk menjamin rasa dan kualitas setiap hidangan.</p>
              </div>
              <div className="minecraft-card p-6 space-y-4 hover:-translate-y-1 transition-transform">
                <div className="p-4 bg-[#3FA34D] border-2 border-[#3b2f2f] rounded-none text-[#FFF8E7] font-bold text-center">
                  ⏱️
                </div>
                <h3 className="text-xl font-bold text-[#1F2933]">Tepat Waktu</h3>
                <p className="text-[#6B7280]">Layanan pengiriman dan persiapan yang selalu on-time, agar acara Anda berjalan lancar tanpa hambatan.</p>
              </div>
              <div className="minecraft-card p-6 space-y-4 hover:-translate-y-1 transition-transform">
                <div className="p-4 bg-[#3FA34D] border-2 border-[#3b2f2f] rounded-none text-[#FFF8E7] font-bold text-center">
                  ✅
                </div>
                <h3 className="text-xl font-bold text-[#1F2933]">Higienis & Halal</h3>
                <p className="text-[#6B7280]">Proses memasak yang higienis dengan standar ketat dan 100% menggunakan bahan baku halal.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section id="packages" className="w-full py-24 bg-gradient-to-b from-[#FFF8E7] to-[#F5E6C8]">
          <div className="container px-4 md:px-6 mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tighter md:text-5xl text-[#1F2933]">Pilihan Paket Kami</h2>
              <p className="text-[#6B7280] max-w-[600px] mx-auto md:text-lg font-semibold">
                Temukan paket katering yang paling sesuai dengan kebutuhan acara Anda.
              </p>
            </div>
            
            {pakets && pakets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pakets.map((paket) => (
                  <Link href={`/paket/${paket.id}`} key={paket.id} className="group minecraft-card overflow-hidden hover:-translate-y-2 transition-transform">
                    <div className="h-48 bg-[#D4AF84] relative overflow-hidden">
                      {paket.foto1 ? (
                        <img src={paket.foto1} alt={paket.nama_paket} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#A47148]">
                          <div className="text-4xl">📦</div>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-[#3FA34D] text-[#FFF8E7] text-xs font-bold px-3 py-1 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b]">
                          {paket.kategori}
                        </span>
                        <span className="bg-[#A47148] text-[#FFF8E7] text-xs font-bold px-3 py-1 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b]">
                          {paket.jenis}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-[#3FA34D] transition-colors line-clamp-1 text-[#1F2933]">{paket.nama_paket}</h3>
                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{paket.deskripsi}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t-2 border-[#D4AF84]">
                        <div>
                          <p className="text-xs text-[#6B7280] font-bold">Harga / {paket.jumlah_pax} Pax</p>
                          <p className="text-lg font-bold text-[#3FA34D]">Rp {paket.harga_paket?.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-[#3FA34D] p-2 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b] text-[#FFF8E7]">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 minecraft-card">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-[#1F2933]">Belum Ada Paket</h3>
                <p className="text-[#6B7280] mt-2">Admin belum menambahkan paket katering apa pun ke sistem.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#A47148] border-t-4 border-[#3b2f2f]">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#3FA34D] text-[#FFF8E7] p-1.5 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b]">
              🍽️
            </div>
            <span className="font-bold tracking-tight text-[#FFF8E7] text-lg">Catering-In</span>
          </div>
          <p className="text-xs text-[#FFF8E7] font-semibold">
            © 2024 Catering-In. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
