"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilPelanggan() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    telepon: "",
    alamat1: "",
    alamat2: "",
    alamat3: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const parsedUser = JSON.parse(storedUser);
      
      try {
        const { data, error } = await supabase
          .from("pelanggans")
          .select("*")
          .eq("id", parsedUser.id)
          .single();
          
        if (error) throw error;
        setUser(data);
        setFormData({
          nama_pelanggan: data.nama_pelanggan || "",
          telepon: data.telepon || "",
          alamat1: data.alamat1 || "",
          alamat2: data.alamat2 || "",
          alamat3: data.alamat3 || ""
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("pelanggans")
        .update(formData)
        .eq("id", user.id);
        
      if (error) throw error;
      alert("Profil berhasil diperbarui!");
      
      // Update local storage too so UI reflects changes immediately
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify({ ...updatedUser, role: "pelanggan" }));
      
    } catch (error: any) {
      alert("Gagal menyimpan profil: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Memuat profil...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi pribadi dan alamat pengiriman Anda.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email (Tidak dapat diubah)</label>
            <input
              type="text"
              disabled
              className="w-full p-3 border border-border rounded-xl bg-secondary/50 text-muted-foreground"
              value={user.email}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={formData.nama_pelanggan}
              onChange={(e) => setFormData({...formData, nama_pelanggan: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">No. Telepon</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={formData.telepon}
              onChange={(e) => setFormData({...formData, telepon: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alamat Utama (Untuk Pengiriman)</label>
            <textarea
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
              value={formData.alamat1}
              onChange={(e) => setFormData({...formData, alamat1: e.target.value})}
            ></textarea>
          </div>
          
          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
