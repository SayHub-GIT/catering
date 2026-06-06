"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getSession, logout, type SessionUser } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setUser(session);
    setChecking(false);
  }, [router]);

  if (checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#8ED8F8] to-[#F5E6C8]">
        ⏳ Memuat...
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const isOwner = user.role === "owner";
  const isKurir = user.role === "kurir";
  const isPelanggan = user.role === "pelanggan";

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#F5E6C8] to-[#FFF8E7]">
      <aside className="w-64 bg-[#A47148] border-r-4 border-[#3b2f2f] hidden md:flex flex-col shadow-[4px_0px_0px_#2b2b2b]">
        <div className="h-20 flex items-center px-6 border-b-4 border-[#3b2f2f] bg-[#8B5A2B]">
          <Link className="flex items-center gap-2" href="/">
            <div className="bg-[#3FA34D] text-[#FFF8E7] p-1.5 border-2 border-[#3b2f2f] shadow-[2px_2px_0px_#2b2b2b]">
              🍽️
            </div>
            <span className="font-bold text-lg tracking-tight text-[#FFF8E7]">Catering-In</span>
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6 px-4">
            <p className="text-xs font-bold text-[#FFF8E7] uppercase tracking-wider mb-3">
              👤 Akun
            </p>

            <div className="flex items-center gap-3 bg-[#8B5A2B] p-3 border-2 border-[#6B4423] rounded-none">
              <div className="w-10 h-10 rounded-none bg-[#3FA34D] flex items-center justify-center text-[#FFF8E7] font-bold border-2 border-[#3b2f2f]">
                {user.nama?.[0]?.toUpperCase() || "U"}
              </div>

              <div className="overflow-hidden">
                <p className="font-bold text-xs text-[#FFF8E7] truncate">
                  {user.nama}
                </p>
                <p className="text-xs text-[#F5E6C8] capitalize font-semibold">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-bold text-[#FFF8E7] uppercase tracking-wider mb-3 px-4 mt-6">
              📋 Menu Utama
            </p>

            {(isAdmin || isOwner) && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                >
                  📊 Ringkasan
                </Link>

                <Link
                  href="/dashboard/pesanan"
                  className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                >
                  🛒 Kelola Pesanan
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      href="/dashboard/paket"
                      className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                    >
                      📦 Kelola Paket Menu
                    </Link>

                    <Link
                      href="/dashboard/pembayaran"
                      className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                    >
                      💳 Metode Pembayaran
                    </Link>

                    <Link
                      href="/dashboard/detail-pembayaran"
                      className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                    >
                      🏦 Detail Rekening
                    </Link>

                    <Link
                      href="/dashboard/pelanggan-admin"
                      className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                    >
                      👥 Kelola Pelanggan
                    </Link>

                    <Link
                      href="/dashboard/user"
                      className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                    >
                      🔐 Kelola User
                    </Link>
                  </>
                )}

                <Link
                  href="/dashboard/pengiriman"
                  className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                >
                  🚚 Status Pengiriman
                </Link>
              </>
            )}

            {isKurir && (
              <Link
                href="/dashboard/pengiriman"
                className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
              >
                🚚 Tugas Pengiriman
              </Link>
            )}

            {isPelanggan && (
              <>
                <Link
                  href="/dashboard/pelanggan"
                  className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                >
                  🛒 Pesanan Saya
                </Link>

                <Link
                  href="/dashboard/pelanggan/profil"
                  className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#6B4423] bg-[#8B5A2B] hover:bg-[#9D6C34] text-[#FFF8E7] text-sm font-bold transition-colors"
                >
                  👤 Profil Saya
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t-4 border-[#3b2f2f] bg-[#8B5A2B]">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-2.5 border-2 border-[#DC2626] bg-[#DC2626] hover:bg-[#C026C0] text-[#FFF8E7] transition-colors text-sm font-bold shadow-[2px_2px_0px_#8B0000]"
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden h-16 flex items-center px-4 border-b-4 border-[#3b2f2f] bg-[#A47148] text-[#FFF8E7] font-bold shadow-[0_4px_0px_#2b2b2b]">
          <span className="capitalize">
            📋 {user.role} Dashboard
          </span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}