"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";

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
    <header className="px-6 lg:px-14 h-20 flex items-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
      
      {/* LOGO */}
      <Link className="flex items-center justify-center gap-2" href="/">
        <div className="bg-primary text-primary-foreground p-2 rounded-xl">
          <Utensils className="h-6 w-6" />
        </div>

        <span className="font-bold text-2xl tracking-tight">
          Symphony
        </span>
      </Link>

      {/* MENU */}
      <nav className="ml-auto hidden md:flex gap-6 sm:gap-8 text-sm font-medium">
        <Link
          className="hover:text-primary transition-colors"
          href="/#packages"
        >
          Paket Menu
        </Link>

        <Link
          className="hover:text-primary transition-colors"
          href="/#about"
        >
          Tentang Kami
        </Link>
      </nav>

      {/* RIGHT SIDE */}
      <div className="ml-8 flex items-center gap-4">

        {!user ? (
          <>
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium rounded-full hover:bg-secondary transition-colors"
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Daftar
            </Link>
          </>
        ) : (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">
                {user.nama}
              </p>

              <p className="text-xs text-muted-foreground capitalize">
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
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm"
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-full bg-red-500 text-white text-sm"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}