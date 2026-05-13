"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Utensils } from "lucide-react";


export default function Register() {
  const [formData, setFormData] = useState({
    nama_pelanggan: "",
    email: "",
    password: "",
    telepon: "",
    alamat1: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Insert to pelanggans table (plain text password as per simple schema requirement)
      // Note: In real world, password should be hashed. Using plain text to strictly follow simplicity if auth is custom
      const { data, error: insertError } = await supabase
        .from("pelanggans")
        .insert([
          { 
            nama_pelanggan: formData.nama_pelanggan,
            email: formData.email,
            password: formData.password,
            telepon: formData.telepon,
            alamat1: formData.alamat1
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Auto login after register
      localStorage.setItem("user", JSON.stringify({ ...data, role: "pelanggan" }));
      router.push("/dashboard/pelanggan");
      
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4 py-12">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl">
            <Utensils className="h-8 w-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Buat Akun Baru</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.nama_pelanggan}
              onChange={(e) => setFormData({...formData, nama_pelanggan: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">No. Telepon / WhatsApp</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              value={formData.telepon}
              onChange={(e) => setFormData({...formData, telepon: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat Lengkap (Utama)</label>
            <textarea
              required
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]"
              value={formData.alamat1}
              onChange={(e) => setFormData({...formData, alamat1: e.target.value})}
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground p-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Sudah punya akun? <Link href="/login" className="text-primary font-bold">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
