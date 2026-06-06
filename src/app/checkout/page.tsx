"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { getDashboardPath, getSession, type SessionUser } from "@/lib/auth";
import type { Database } from "@/types/database.types";

type PelangganCheckout = Pick<
  Database["public"]["Tables"]["pelanggans"]["Row"],
  "id" | "nama_pelanggan" | "email" | "telepon" | "alamat1"
>;
type PaketCheckout = Database["public"]["Tables"]["pakets"]["Row"];
type MetodePembayaran = Database["public"]["Tables"]["jenis_pembayarans"]["Row"];

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paketId = searchParams.get("paket_id");

  const [user, setUser] = useState<SessionUser | null>(null);
  const [pelangganDetail, setPelangganDetail] =
    useState<PelangganCheckout | null>(null);
  const [paket, setPaket] = useState<PaketCheckout | null>(null);
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran[]>(
    []
  );
  const [selectedMetode, setSelectedMetode] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchData = useCallback(async (idPelanggan: number, selectedPaketId: number) => {
    setLoading(true);

    try {
      const { data: pelangganData, error: pelangganError } = await supabase
        .from("pelanggans")
        .select("id, nama_pelanggan, email, telepon, alamat1")
        .eq("id", idPelanggan)
        .maybeSingle();

      if (pelangganError) throw pelangganError;
      if (!pelangganData) throw new Error("Data pelanggan tidak ditemukan.");

      setPelangganDetail(pelangganData);

      const { data: paketData, error: paketError } = await supabase
        .from("pakets")
        .select("*")
        .eq("id", selectedPaketId)
        .maybeSingle();

      if (paketError) throw paketError;
      if (!paketData) throw new Error("Paket tidak ditemukan.");

      setPaket(paketData);

      const { data: metodeData, error: metodeError } = await supabase
        .from("jenis_pembayarans")
        .select("*")
        .order("id", { ascending: true });

      if (metodeError) throw metodeError;

      setMetodePembayaran(metodeData || []);

      if (metodeData && metodeData.length > 0) {
        setSelectedMetode(metodeData[0].id);
      }
    } catch (error) {
      console.error("CHECKOUT FETCH ERROR:", error);
      alert(getErrorMessage(error) || "Gagal memuat data checkout.");
      router.replace("/paket");
    } finally {
      setLoading(false);
    }
  }, [router]);

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

    if (!paketId) {
      router.replace("/paket");
      return;
    }

    const paketIdNumber = Number(paketId);

    if (Number.isNaN(paketIdNumber)) {
      router.replace("/paket");
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchData(session.id, paketIdNumber).then(() => {
        setUser(session);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData, paketId, router]);

  const handleCheckout = async () => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (!paket) {
      alert("Paket tidak ditemukan.");
      return;
    }

    if (!selectedMetode) {
      alert("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setProcessing(true);

    try {
      const noResi = "INV-" + Date.now().toString().slice(-8);

      const { data: pesanan, error: pesananError } = await supabase
        .from("pesanans")
        .insert([
          {
            id_pelanggan: user.id,
            id_jenis_bayar: Number(selectedMetode),
            no_resi: noResi,
            tgl_pesan: new Date().toISOString(),
            status_pesan: "Menunggu Konfirmasi",
            total_bayar: paket.harga_paket || 0,
          },
        ])
        .select("id")
        .single();

      if (pesananError) throw pesananError;

      const { error: detailError } = await supabase
        .from("detail_pemesanans")
        .insert([
          {
            id_pemesanan: pesanan.id,
            id_paket: paket.id,
            subtotal: paket.harga_paket || 0,
          },
        ]);

      if (detailError) throw detailError;

      setSuccess(true);
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Gagal memproses pesanan: " + getErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#1F2933] font-bold">⏳ Memuat data checkout...</div>;
  }

  if (!paket) {
    return <div className="p-8 text-center text-[#1F2933] font-bold">❌ Paket tidak ditemukan.</div>;
  }

  if (success) {
    return (
      <div className="minecraft-card p-8 text-center space-y-6 max-w-md mx-auto mt-12 shadow-[6px_6px_0px_#2b2b2b]">
        <div className="flex justify-center">
          <div className="text-6xl">✅</div>
        </div>

        <h2 className="text-3xl font-bold text-[#1F2933]">Pesanan Berhasil!</h2>

        <p className="text-[#6B7280] font-semibold">
          Pesanan Anda telah kami terima dan sedang menunggu konfirmasi dari admin.
        </p>

        <Link
          href="/dashboard/pelanggan"
          className="minecraft-button-primary py-3 inline-block w-full text-base"
        >
          ✨ Lihat Status Pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#D4AF84] transition-colors border-2 border-[#3b2f2f] text-[#1F2933] font-bold"
          type="button"
        >
          ← Kembali
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
          🛒 Checkout Pemesanan
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="minecraft-card p-6 space-y-4">
            <h2 className="text-lg font-bold border-b-2 border-[#D4AF84] pb-2 text-[#1F2933]">
              👤 Informasi Pemesan
            </h2>

            <div className="space-y-3 text-sm text-[#1F2933] font-semibold">
              <p>
                <span className="text-[#6B7280] w-24 inline-block">Nama</span>
                : {pelangganDetail?.nama_pelanggan || "-"}
              </p>

              <p>
                <span className="text-[#6B7280] w-24 inline-block">Telepon</span>
                : {pelangganDetail?.telepon || "-"}
              </p>

              <p>
                <span className="text-[#6B7280] w-24 inline-block">Alamat</span>
                : {pelangganDetail?.alamat1 || "-"}
              </p>
            </div>

            <p className="text-xs text-[#DC2626] bg-[#FEE2E2] p-3 border-2 border-[#DC2626] font-bold">
              ⚠️ Pastikan alamat Anda sudah benar untuk keperluan pengiriman.
            </p>
          </div>

          <div className="minecraft-card p-6 space-y-4">
            <h2 className="text-lg font-bold border-b-2 border-[#D4AF84] pb-2 text-[#1F2933]">
              💳 Metode Pembayaran
            </h2>

            {metodePembayaran.length === 0 ? (
              <p className="text-sm text-[#DC2626] font-bold">
                ❌ Belum ada metode pembayaran.
              </p>
            ) : (
              <div className="space-y-3">
                {metodePembayaran.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center p-4 border-2 cursor-pointer transition-all font-bold ${
                      selectedMetode === m.id
                        ? "border-[#3FA34D] bg-[#E8F5E9] shadow-[2px_2px_0px_#3FA34D]"
                        : "border-[#D4AF84] hover:bg-[#F5E6C8]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode"
                      value={m.id}
                      checked={selectedMetode === m.id}
                      onChange={() => setSelectedMetode(m.id)}
                      className="mr-4 h-4 w-4"
                    />

                    <span className="text-[#1F2933]">
                      {m.metode_pembayaran}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="minecraft-card p-6 sticky top-24 space-y-6">
            <h2 className="text-lg font-bold border-b-2 border-[#D4AF84] pb-2 text-[#1F2933]">
              📦 Ringkasan Pesanan
            </h2>

            <div className="space-y-4 mb-6">
              {paket.foto1 && (
                <img
                  src={paket.foto1}
                  alt={paket.nama_paket}
                  className="w-full h-36 object-cover border-2 border-[#D4AF84]"
                />
              )}

              <div>
                <p className="font-bold text-[#1F2933]">{paket.nama_paket}</p>
                <p className="text-xs text-[#6B7280] font-semibold">
                  {paket.jenis} - {paket.jumlah_pax} Pax
                </p>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#1F2933]">
                <span className="text-[#6B7280]">Subtotal</span>
                <span>
                  Rp {paket.harga_paket?.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#1F2933]">
                <span className="text-[#6B7280]">Ongkos Kirim</span>
                <span className="text-[#3FA34D]">Gratis 🎉</span>
              </div>
            </div>

            <div className="border-t-2 border-[#D4AF84] pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#1F2933]">Total</span>
                <span className="text-2xl font-bold text-[#3FA34D]">
                  Rp {paket.harga_paket?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing || !selectedMetode}
              type="button"
              className="minecraft-button-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {processing ? "⏳ Memproses..." : "✅ Buat Pesanan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8ED8F8] to-[#F5E6C8] px-4 pb-12">
      <header className="h-20 flex items-center border-b-4 border-[#3b2f2f] mb-4 bg-[#A47148] shadow-[0_4px_0px_#2b2b2b]">
        <div className="container mx-auto px-4">
          <Link className="flex items-center gap-2" href="/">
            <div className="bg-[#3FA34D] text-[#FFF8E7] p-1.5 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b]">
              🍽️
            </div>

            <span className="font-bold text-xl tracking-tight text-[#FFF8E7]">
              Catering-In
            </span>
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="text-center p-12 text-[#1F2933] font-bold">⏳ Memuat...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
