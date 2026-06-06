"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";

import { getSession, logout } from "@/lib/auth";

interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();

    if (session) {
      setUser(session);
    }
  }, []);

  return (
    <header className="px-6 lg:px-14 h-20 flex items-center border-b-4 border-[#3b2f2f] backdrop-blur-md sticky top-0 z-50 bg-[#A47148] shadow-[0_4px_0px_#2b2b2b]">
      
      {/* LOGO */}
      <Link className="flex items-center justify-center gap-2" href="/">
        <div className="bg-[#3FA34D] text-[#FFF8E7] p-2 border-2 border-[#3b2f2f] shadow-[3px_3px_0px_#2b2b2b]">
          <UtensilsCrossed className="h-6 w-6" />
        </div>

        <span className="font-bold text-2xl tracking-tight text-[#FFF8E7]">
          Catering-In
        </span>
      </Link>

      {/* MENU */}
      <nav className="ml-auto hidden md:flex gap-6 sm:gap-8 text-sm font-bold text-[#FFF8E7]">
        <Link
          className="hover:text-[#F5E6C8] transition-colors"
          href="/#packages"
        >
          Paket Menu
        </Link>

        <Link
          className="hover:text-[#F5E6C8] transition-colors"
          href="/#about"
        >
          Tentang Kami
        </Link>
      </nav>

      {/* RIGHT SIDE */}
      <div className="ml-8 flex items-center gap-3">

        {!user ? (
          <>
            <Link
              href="/login"
              className="minecraft-button bg-[#6B7280] text-[#FFF8E7] hover:-translate-y-1 text-sm px-3 py-1.5"
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="minecraft-button-primary text-sm px-3 py-1.5"
            >
              Daftar
            </Link>
          </>
        ) : (
          <>
            <div className="text-right hidden sm:block text-[#FFF8E7]">
              <p className="text-xs font-bold">
                {user.nama}
              </p>

              <p className="text-xs capitalize font-medium">
                {user.role}
              </p>
            </div>

            <Link
              href={
                user.role === "pelanggan"
                  ? "/dashboard/pelanggan"
                  : user.role === "kurir"
                  ? "/dashboard/pengiriman"
                  : "/dashboard"
              }
              className="minecraft-button-primary text-sm px-3 py-1.5"
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="minecraft-button-danger text-sm px-3 py-1.5"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}