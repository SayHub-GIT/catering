"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  LogOut, 
  Utensils,
  CreditCard,
  Users
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  const isAdmin = user.role === "admin" || user.role === "owner";
  const isKurir = user.role === "kurir";
  const isPelanggan = user.role === "pelanggan";

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link className="flex items-center gap-2" href="/">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Utensils className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Symphony</span>
          </Link>
        </div>
        
        <div className="p-4">
          <div className="mb-6 px-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Akun</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user.nama_pelanggan ? user.nama_pelanggan[0] : user.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate">{user.nama_pelanggan || user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4 mt-6">Menu Utama</p>
            
            {/* Menu Admin / Owner */}
            {isAdmin && (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <LayoutDashboard className="h-4 w-4" /> Ringkasan
                </Link>
                <Link href="/dashboard/pesanan" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <ShoppingCart className="h-4 w-4" /> Kelola Pesanan
                </Link>
                <Link href="/dashboard/paket" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <Package className="h-4 w-4" /> Kelola Paket Menu
                </Link>
                <Link href="/dashboard/pengiriman" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <Truck className="h-4 w-4" /> Status Pengiriman
                </Link>
                <Link href="/dashboard/pembayaran" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <CreditCard className="h-4 w-4" /> Metode Pembayaran
                </Link>
                <Link href="/dashboard/detail-pembayaran" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <CreditCard className="h-4 w-4" /> Detail Rekening
                </Link>
                <Link href="/dashboard/pelanggan-admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <Users className="h-4 w-4" /> Kelola Pelanggan
                </Link>
                <Link href="/dashboard/user" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <Users className="h-4 w-4" /> Kelola User (Staff)
                </Link>
              </>
            )}

            {/* Menu Kurir */}
            {isKurir && (
              <>
                <Link href="/dashboard/pengiriman" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <Truck className="h-4 w-4" /> Tugas Pengiriman
                </Link>
              </>
            )}

            {/* Menu Pelanggan */}
            {isPelanggan && (
              <>
                <Link href="/dashboard/pelanggan" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <ShoppingCart className="h-4 w-4" /> Pesanan Saya
                </Link>
                <Link href="/dashboard/pelanggan/profil" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm font-medium">
                  <LayoutDashboard className="h-4 w-4" /> Profil Saya
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center px-4 border-b border-border bg-card">
          <span className="font-bold">Dashboard {user.role}</span>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
