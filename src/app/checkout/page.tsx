"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Utensils } from "lucide-react";
import Link from "next/link";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const paketId = searchParams.get("paket_id");
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [paket, setPaket] = useState<any>(null);
  const [metodePembayaran, setMetodePembayaran] = useState<any[]>([]);
  const [selectedMetode, setSelectedMetode] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check auth
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "pelanggan") {
      alert("Hanya pelanggan yang dapat melakukan pemesanan.");
      router.push("/dashboard");
      return;
    }
    setUser(parsedUser);

    async function fetchData() {
      if (!paketId) return;
      try {
        // Fetch paket
        const { data: paketData } = await supabase.from("pakets").select("*").eq("id", paketId).single();
        setPaket(paketData);

        // Fetch metode pembayaran
        const { data: metodeData } = await supabase.from("jenis_pembayarans").select("*");
        setMetodePembayaran(metodeData || []);
        if (metodeData && metodeData.length > 0) setSelectedMetode(metodeData[0].id);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [paketId, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paket || !selectedMetode) return alert("Pilih metode pembayaran");
    setProcessing(true);

    try {
      const noResi = "INV-" + Date.now().toString().slice(-6);
      
      // 1. Create Pesanan
      const { data: pesanan, error: pesananError } = await supabase
        .from("pesanans")
        .insert([
          {
            id_pelanggan: user.id,
            id_jenis_bayar: Number(selectedMetode),
            no_resi: noResi,
            tgl_pesan: new Date().toISOString(),
            status_pesan: "Menunggu Konfirmasi",
            total_bayar: paket.harga_paket
          }
        ])
        .select()
        .single();

      if (pesananError) throw pesananError;

      // 2. Create Detail Pemesanan
      const { error: detailError } = await supabase
        .from("detail_pemesanans")
        .insert([
          {
            id_pemesanan: pesanan.id,
            id_paket: paket.id,
            subtotal: paket.harga_paket
          }
        ]);

      if (detailError) throw detailError;

      setSuccess(true);
    } catch (error: any) {
      alert("Gagal memproses pesanan: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data checkout...</div>;
  if (!paket) return <div className="p-8 text-center">Paket tidak ditemukan.</div>;

  if (success) {
    return (
      <div className="bg-card p-8 rounded-3xl border border-border text-center space-y-6 max-w-md mx-auto mt-12 shadow-sm">
        <div className="flex justify-center">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Pesanan Berhasil!</h2>
        <p className="text-muted-foreground">
          Pesanan Anda telah kami terima dan sedang menunggu konfirmasi dari admin. 
        </p>
        <div className="pt-4">
          <Link href="/dashboard/pelanggan" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all inline-block w-full">
            Lihat Status Pesanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Checkout Pemesanan</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">Informasi Pemesan</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground w-24 inline-block">Nama</span> : <span className="font-medium">{user?.nama_pelanggan}</span></p>
              <p><span className="text-muted-foreground w-24 inline-block">Telepon</span> : <span className="font-medium">{user?.telepon}</span></p>
              <p><span className="text-muted-foreground w-24 inline-block">Alamat</span> : <span className="font-medium">{user?.alamat1}</span></p>
            </div>
            <p className="text-xs text-yellow-600 bg-yellow-50 p-3 rounded-lg mt-4 border border-yellow-200">
              *Pastikan alamat Anda sudah benar untuk keperluan pengiriman. Anda bisa mengubahnya di menu Profil.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">Metode Pembayaran</h2>
            {metodePembayaran.length === 0 ? (
              <p className="text-sm text-red-500">Belum ada metode pembayaran yang dikonfigurasi admin.</p>
            ) : (
              <div className="space-y-3">
                {metodePembayaran.map((m) => (
                  <label key={m.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedMetode === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-secondary/50'}`}>
                    <input 
                      type="radio" 
                      name="metode" 
                      value={m.id} 
                      checked={selectedMetode === m.id}
                      onChange={() => setSelectedMetode(m.id)}
                      className="mr-4 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="font-medium">{m.metode_pembayaran}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">Ringkasan Pesanan</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="font-bold text-sm">{paket?.nama_paket}</p>
                <p className="text-xs text-muted-foreground">{paket?.jenis} - {paket?.jumlah_pax} Pax</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">Rp {paket?.harga_paket?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Pembayaran</span>
                <span className="text-xl font-bold text-primary">Rp {paket?.harga_paket?.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={processing || !selectedMetode}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Buat Pesanan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-secondary/10 px-4 pb-12">
      <header className="h-20 flex items-center border-b border-border/40 mb-4 bg-background">
        <div className="container mx-auto px-4">
          <Link className="flex items-center gap-2" href="/">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Utensils className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Symphony</span>
          </Link>
        </div>
      </header>
      <Suspense fallback={<div className="text-center p-12">Memuat sistem pembayaran...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
