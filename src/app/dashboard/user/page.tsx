"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2 } from "lucide-react";
import type { Database } from "@/types/database.types";

type StaffUser = Database["public"]["Tables"]["users"]["Row"];
type StaffLevel = NonNullable<StaffUser["level"]>;

export default function KelolaUser() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    level: "kurir" as StaffLevel,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("users")
        .insert([{
          name: formData.name,
          email: formData.email,
          password: formData.password,
          level: formData.level,
        }]);
      
      if (error) throw error;
      
      setFormData({ name: "", email: "", password: "", level: "kurir" });
      setIsAdding(false);
      fetchUsers();
    } catch (error) {
      alert("Gagal menambah user: " + getErrorMessage(error));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus user (staff) ini?")) return;
    try {
      await supabase.from("users").delete().eq("id", id);
      fetchUsers();
    } catch (error) {
      alert("Gagal menghapus: " + getErrorMessage(error));
    }
  }

  if (loading) return <div>Memuat data staff...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola User (Staff Internal)</h1>
          <p className="text-muted-foreground">Tambah dan kelola akun Admin, Owner, dan Kurir.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Staff
        </button>
      </div>

      {isAdding && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-6">
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border border-border rounded-lg"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full p-2 border border-border rounded-lg"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border border-border rounded-lg"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Level Akses (Role)</label>
              <select 
                className="w-full p-2 border border-border rounded-lg"
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as StaffLevel,
                  })
                }
              >
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="kurir">Kurir</option>
              </select>
            </div>
            <div className="col-span-2 pt-2 flex gap-2">
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">Simpan Akun</button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-secondary px-4 py-2 rounded-lg font-medium">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Nama</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role (Level)</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Belum ada data staff.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="px-6 py-4 font-bold">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.level === 'admin' ? 'bg-purple-100 text-purple-800' :
                      u.level === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {(u.level || "kurir").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}
