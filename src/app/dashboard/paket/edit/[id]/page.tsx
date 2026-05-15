"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

type JenisPaket = "Prasmanan" | "Box";

type KategoriPaket =
  | "Pernikahan"
  | "Selamatan"
  | "Ulang Tahun"
  | "Studi Tour"
  | "Rapat";

export default function EditPaketPage() {
  const router = useRouter();
  const params = useParams();

  const paketId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [foto1File, setFoto1File] = useState<File | null>(null);
  const [foto2File, setFoto2File] = useState<File | null>(null);
  const [foto3File, setFoto3File] = useState<File | null>(null);

  const [preview1, setPreview1] = useState("");
  const [preview2, setPreview2] = useState("");
  const [preview3, setPreview3] = useState("");

  const [formData, setFormData] = useState({
    nama_paket: "",
    jenis: "Prasmanan" as JenisPaket,
    kategori: "Pernikahan" as KategoriPaket,
    jumlah_pax: "",
    harga_paket: "",
    deskripsi: "",
    foto1: "",
    foto2: "",
    foto3: "",
  });

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    fetchPaket();
  }, [router, paketId]);

  async function fetchPaket() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("pakets")
        .select("*")
        .eq("id", Number(paketId))
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        alert("Paket tidak ditemukan.");
        router.replace("/dashboard/paket");
        return;
      }

      setFormData({
        nama_paket: data.nama_paket || "",
        jenis: (data.jenis || "Prasmanan") as JenisPaket,
        kategori: (data.kategori || "Pernikahan") as KategoriPaket,
        jumlah_pax: String(data.jumlah_pax || ""),
        harga_paket: String(data.harga_paket || ""),
        deskripsi: data.deskripsi || "",
        foto1: data.foto1 || "",
        foto2: data.foto2 || "",
        foto3: data.foto3 || "",
      });

      setPreview1(data.foto1 || "");
      setPreview2(data.foto2 || "");
      setPreview3(data.foto3 || "");
    } catch (error: any) {
      alert(error.message || "Gagal memuat data paket.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `pakets/${fileName}`;

    const { error } = await supabase.storage
      .from("paket-images")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("paket-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      const jumlahPax = Number(formData.jumlah_pax);
      const hargaPaket = Number(formData.harga_paket);

      if (!jumlahPax || jumlahPax <= 0) {
        alert("Jumlah pax harus lebih dari 0.");
        setSaving(false);
        return;
      }

      if (!hargaPaket || hargaPaket <= 0) {
        alert("Harga paket harus lebih dari 0.");
        setSaving(false);
        return;
      }

      let foto1Url = formData.foto1 || "";
      let foto2Url = formData.foto2 || "";
      let foto3Url = formData.foto3 || "";

      if (foto1File) {
        foto1Url = await uploadImage(foto1File);
      }

      if (foto2File) {
        foto2Url = await uploadImage(foto2File);
      }

      if (foto3File) {
        foto3Url = await uploadImage(foto3File);
      }

      if (!foto1Url) {
        alert("Foto utama wajib ada.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("pakets")
        .update({
          nama_paket: formData.nama_paket,
          jenis: formData.jenis,
          kategori: formData.kategori,
          jumlah_pax: jumlahPax,
          harga_paket: hargaPaket,
          deskripsi: formData.deskripsi,
          foto1: foto1Url,
          foto2: foto2Url || null,
          foto3: foto3Url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(paketId));

      if (error) throw error;

      alert("Paket berhasil diperbarui.");
      router.push("/dashboard/paket");
    } catch (error: any) {
      alert(error.message || "Gagal memperbarui paket.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Memuat data paket...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/paket"
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Paket Menu
          </h1>
          <p className="text-muted-foreground">
            Ubah detail paket katering yang sudah tersedia.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Paket
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl"
              value={formData.nama_paket}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nama_paket: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Jenis
              </label>
              <select
                className="w-full p-3 border border-border rounded-xl"
                value={formData.jenis}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jenis: e.target.value as JenisPaket,
                  })
                }
              >
                <option value="Prasmanan">Prasmanan</option>
                <option value="Box">Box</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Kategori
              </label>
              <select
                className="w-full p-3 border border-border rounded-xl"
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kategori: e.target.value as KategoriPaket,
                  })
                }
              >
                <option value="Pernikahan">Pernikahan</option>
                <option value="Selamatan">Selamatan</option>
                <option value="Ulang Tahun">Ulang Tahun</option>
                <option value="Studi Tour">Studi Tour</option>
                <option value="Rapat">Rapat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Jumlah Pax
              </label>
              <input
                type="number"
                required
                min={1}
                className="w-full p-3 border border-border rounded-xl"
                value={formData.jumlah_pax}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jumlah_pax: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Harga Paket
              </label>
              <input
                type="number"
                required
                min={1}
                className="w-full p-3 border border-border rounded-xl"
                value={formData.harga_paket}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    harga_paket: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Deskripsi Paket
            </label>
            <textarea
              required
              className="w-full p-3 border border-border rounded-xl min-h-[120px]"
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deskripsi: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Foto Utama Paket
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setFoto1File(file);
                    setPreview1(URL.createObjectURL(file));
                  }
                }}
              />

              {preview1 && (
                <img
                  src={preview1}
                  alt="Preview foto utama"
                  className="mt-3 h-40 w-full object-cover rounded-xl border"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Foto Tambahan 2
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setFoto2File(file);
                    setPreview2(URL.createObjectURL(file));
                  }
                }}
              />

              {preview2 && (
                <img
                  src={preview2}
                  alt="Preview foto tambahan 2"
                  className="mt-3 h-40 w-full object-cover rounded-xl border"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Foto Tambahan 3
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setFoto3File(file);
                    setPreview3(URL.createObjectURL(file));
                  }
                }}
              />

              {preview3 && (
                <img
                  src={preview3}
                  alt="Preview foto tambahan 3"
                  className="mt-3 h-40 w-full object-cover rounded-xl border"
                />
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-primary-foreground p-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}