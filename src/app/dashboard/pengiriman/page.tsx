"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Camera, CheckCircle2, Clock, ImageIcon, Truck } from "lucide-react";

import { getSession, type SessionUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type StatusKirim = "Sedang Dikirim" | "Tiba Ditujuan";

type PengirimanRow = {
  id: number;
  tgl_kirim: string | null;
  tgl_tiba: string | null;
  status_kirim: StatusKirim | null;
  bukti_foto: string | null;
  id_user: number | null;
  pesanans: {
    id: number;
    no_resi: string | null;
    status_pesan: string | null;
    total_bayar: number | null;
    pelanggans: {
      nama_pelanggan: string | null;
      alamat1: string | null;
      telepon: string | null;
    } | null;
    detail_pemesanans:
      | {
          pakets: {
            nama_paket: string;
            jumlah_pax: number | null;
          } | null;
        }[]
      | null;
  } | null;
  users: {
    id: number;
    name: string;
    email: string;
    level: string | null;
  } | null;
};

type KurirRow = {
  id: number;
  name: string;
};

type PesananForPengiriman = {
  id: number;
  tgl_pesan: string | null;
  status_pesan: string | null;
};

export default function PengirimanDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [pengirimans, setPengirimans] = useState<PengirimanRow[]>([]);
  const [kurirs, setKurirs] = useState<KurirRow[]>([]);
  const [proofFiles, setProofFiles] = useState<Record<number, File | null>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!["admin", "owner", "kurir"].includes(session.role)) {
      router.replace("/dashboard/pelanggan");
      return;
    }

    const timer = window.setTimeout(() => {
      setUser(session);
      void fetchPengiriman(session);

      if (session.role === "admin" || session.role === "owner") {
        void fetchKurirs();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  async function fetchKurirs() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("level", "kurir")
        .order("name", { ascending: true });

      if (error) throw error;

      setKurirs(data || []);
    } catch (error) {
      console.error("Error fetch kurir:", error);
    }
  }

  async function fetchPengiriman(currentUser: SessionUser) {
    setLoading(true);

    try {
      await syncMissingPengirimanRecords();

      let query = supabase
        .from("pengirimans")
        .select(
          `
          *,
          pesanans!inner (
            id,
            no_resi,
            status_pesan,
            total_bayar,
            pelanggans (
              nama_pelanggan,
              alamat1,
              telepon
            ),
            detail_pemesanans (
              pakets (
                nama_paket,
                jumlah_pax
              )
            )
          ),
          users (
            id,
            name,
            email,
            level
          )
        `
        )
        .eq("pesanans.status_pesan", "Menunggu Kurir")
        .order("created_at", { ascending: false });

      if (currentUser.role === "kurir") {
        query = query.or(`id_user.is.null,id_user.eq.${currentUser.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPengirimans((data || []) as PengirimanRow[]);
    } catch (error) {
      console.error("Error fetching pengiriman:", error);
      setPengirimans([]);
    } finally {
      setLoading(false);
    }
  }

  async function syncMissingPengirimanRecords() {
    const [{ data: pesanans, error: pesananError }, { data: pengirimans, error: pengirimanError }] =
      await Promise.all([
        supabase
          .from("pesanans")
          .select("id, tgl_pesan, status_pesan")
          .eq("status_pesan", "Menunggu Kurir"),
        supabase.from("pengirimans").select("id_pesan"),
      ]);

    if (pesananError) throw pesananError;
    if (pengirimanError) throw pengirimanError;

    const existingPesananIds = new Set(
      (pengirimans || []).map((pengiriman) => pengiriman.id_pesan)
    );

    const missingPengirimans = ((pesanans || []) as PesananForPengiriman[])
      .filter((pesanan) => !existingPesananIds.has(pesanan.id))
      .map((pesanan) => ({
        id_pesan: pesanan.id,
        id_user: null,
        status_kirim: "Sedang Dikirim" as const,
        tgl_kirim: new Date().toISOString(),
        tgl_tiba: null,
        bukti_foto: null,
      }));

    if (missingPengirimans.length === 0) return;

    const { error } = await supabase
      .from("pengirimans")
      .insert(missingPengirimans);

    if (error) throw error;
  }

  async function assignKurir(idPengiriman: number, idKurir: string) {
    if (!user) return;

    if (user.role !== "admin") {
      alert("Hanya admin yang boleh assign kurir.");
      return;
    }

    try {
      const { error } = await supabase
        .from("pengirimans")
        .update({
          id_user: idKurir === "" ? null : Number(idKurir),
          updated_at: new Date().toISOString(),
        })
        .eq("id", idPengiriman);

      if (error) throw error;

      await fetchPengiriman(user);
    } catch (error) {
      alert("Gagal assign kurir: " + getErrorMessage(error));
    }
  }

  async function uploadBukti(file: File, idPengiriman: number) {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${idPengiriman}.${fileExt}`;
    const filePath = `bukti-pengiriman/${fileName}`;

    const { error } = await supabase.storage
      .from("paket-images")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from("paket-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function konfirmasiTiba(pengiriman: PengirimanRow) {
    if (!user) return;

    if (user.role !== "kurir") {
      alert("Hanya kurir yang boleh mengonfirmasi pengiriman.");
      return;
    }

    const proofFile = proofFiles[pengiriman.id];

    if (!proofFile && !pengiriman.bukti_foto) {
      alert("Upload foto bukti pengiriman terlebih dahulu.");
      return;
    }

    setSubmittingId(pengiriman.id);

    try {
      let buktiFotoUrl = pengiriman.bukti_foto;

      if (proofFile) {
        buktiFotoUrl = await uploadBukti(proofFile, pengiriman.id);
      }

      const { error } = await supabase
        .from("pengirimans")
        .update({
          id_user: pengiriman.id_user || user.id,
          bukti_foto: buktiFotoUrl,
          status_kirim: "Tiba Ditujuan",
          tgl_tiba: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", pengiriman.id);

      if (error) throw error;

      setProofFiles((current) => ({
        ...current,
        [pengiriman.id]: null,
      }));

      await fetchPengiriman(user);
      alert("Pengiriman berhasil dikonfirmasi.");
    } catch (error) {
      alert("Gagal konfirmasi pengiriman: " + getErrorMessage(error));
    } finally {
      setSubmittingId(null);
    }
  }

  async function konfirmasiSelesaiAdmin(pengiriman: PengirimanRow) {
    if (!user) return;

    if (user.role !== "admin") {
      alert("Hanya admin yang boleh mengonfirmasi pesanan selesai.");
      return;
    }

    if (pengiriman.status_kirim !== "Tiba Ditujuan" || !pengiriman.bukti_foto) {
      alert("Bukti foto dari kurir belum tersedia.");
      return;
    }

    if (!pengiriman.pesanans?.id) {
      alert("Data pesanan tidak ditemukan.");
      return;
    }

    try {
      const { error } = await supabase
        .from("pesanans")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", pengiriman.pesanans.id);

      if (error) throw error;

      alert("Pesanan berhasil dikonfirmasi selesai.");
      router.push("/dashboard/pesanan");
    } catch (error) {
      alert("Gagal konfirmasi pesanan selesai: " + getErrorMessage(error));
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Memuat data pengiriman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {user.role === "kurir" ? "Invoice Pengiriman" : "Status Pengiriman"}
        </h1>
        <p className="text-muted-foreground">
          {user.role === "kurir"
            ? "Ambil tugas pengiriman, upload bukti, lalu konfirmasi saat pesanan sudah diantar."
            : "Pantau tugas kurir, assign pengiriman, dan lihat bukti pesanan yang sudah diantar."}
        </p>
      </div>

      {pengirimans.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-bold">Belum Ada Jadwal Pengiriman</h2>
          <p className="text-muted-foreground mt-2">
            Invoice dari pesanan pelanggan akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pengirimans.map((p) => {
            const paket = p.pesanans?.detail_pemesanans?.[0]?.pakets;

            return (
              <article
                key={p.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <div className="grid gap-5 xl:grid-cols-[1fr_320px] xl:items-start">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {p.pesanans?.no_resi || `PENGIRIMAN-${p.id}`}
                      </span>
                      <StatusBadge status={p.status_kirim} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        {paket?.nama_paket || "Paket tidak ditemukan"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {paket?.jumlah_pax ? `${paket.jumlah_pax} Pax` : "Jumlah pax belum tersedia"} - Rp{" "}
                        {(p.pesanans?.total_bayar || 0).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <InfoBox label="Pelanggan" value={p.pesanans?.pelanggans?.nama_pelanggan || "-"} />
                      <InfoBox label="Telepon" value={p.pesanans?.pelanggans?.telepon || "-"} />
                      <InfoBox label="Alamat" value={p.pesanans?.pelanggans?.alamat1 || "-"} />
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <InfoBox
                        label="Waktu Masuk"
                        value={p.tgl_kirim ? new Date(p.tgl_kirim).toLocaleString("id-ID") : "-"}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      <InfoBox
                        label="Waktu Tiba"
                        value={p.tgl_tiba ? new Date(p.tgl_tiba).toLocaleString("id-ID") : "-"}
                        icon={<CheckCircle2 className="h-4 w-4" />}
                      />
                      <InfoBox label="Kurir" value={p.users?.name || "Belum diassign"} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {user.role !== "kurir" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Assign Kurir
                        </label>
                        <select
                          className="w-full p-3 border border-border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary text-sm"
                          value={p.id_user || ""}
                          onChange={(e) => assignKurir(p.id, e.target.value)}
                          disabled={user.role !== "admin" || p.status_kirim === "Tiba Ditujuan"}
                        >
                          <option value="">Belum Diassign</option>

                          {kurirs.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="rounded-2xl border border-border p-4 space-y-3">
                      <div className="flex items-center gap-2 font-bold">
                        <Camera className="h-4 w-4" />
                        Bukti Pengiriman
                      </div>

                      {p.bukti_foto ? (
                        <a href={p.bukti_foto} target="_blank" rel="noreferrer">
                          <img
                            src={p.bukti_foto}
                            alt="Bukti pengiriman"
                            className="h-40 w-full rounded-xl object-cover border border-border"
                          />
                        </a>
                      ) : (
                        <div className="h-32 rounded-xl bg-secondary flex items-center justify-center border border-border">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}

                      {user.role !== "kurir" && p.status_kirim !== "Tiba Ditujuan" && (
                        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                          Menunggu kurir mengantar pesanan dan mengupload bukti foto.
                        </div>
                      )}

                      {user.role !== "kurir" && p.status_kirim === "Tiba Ditujuan" && (
                        <button
                          type="button"
                          onClick={() => konfirmasiSelesaiAdmin(p)}
                          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                        >
                          Konfirmasi Pesanan Selesai
                        </button>
                      )}

                      {user.role === "kurir" && p.status_kirim !== "Tiba Ditujuan" && (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full text-sm"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setProofFiles((current) => ({
                                ...current,
                                [p.id]: file,
                              }));
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => konfirmasiTiba(p)}
                            disabled={submittingId === p.id}
                            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                          >
                            {submittingId === p.id
                              ? "Mengirim konfirmasi..."
                              : "Konfirmasi Sudah Diantar"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: StatusKirim | null }) {
  const label = status || "Sedang Dikirim";
  const className =
    label === "Tiba Ditujuan"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3 min-w-0">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-bold truncate">{value}</p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}
