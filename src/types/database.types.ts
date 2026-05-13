export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pelanggans: {
        Row: {
          id: number
          nama_pelanggan: string
          email: string
          password: string
          tgl_lahir: string | null
          telepon: string | null
          alamat1: string | null
          alamat2: string | null
          alamat3: string | null
          kartu_id: string | null
          foto: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          nama_pelanggan: string
          email: string
          password: string
          tgl_lahir?: string | null
          telepon?: string | null
          alamat1?: string | null
          alamat2?: string | null
          alamat3?: string | null
          kartu_id?: string | null
          foto?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          nama_pelanggan?: string
          email?: string
          password?: string
          tgl_lahir?: string | null
          telepon?: string | null
          alamat1?: string | null
          alamat2?: string | null
          alamat3?: string | null
          kartu_id?: string | null
          foto?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: number
          name: string
          email: string
          password: string
          level: 'admin' | 'owner' | 'kurir' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          email: string
          password: string
          level?: 'admin' | 'owner' | 'kurir' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          email?: string
          password?: string
          level?: 'admin' | 'owner' | 'kurir' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jenis_pembayarans: {
        Row: {
          id: number
          metode_pembayaran: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          metode_pembayaran: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          metode_pembayaran?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      detail_jenis_pembayarans: {
        Row: {
          id: number
          id_jenis_pembayaran: number | null
          no_rek: string | null
          tempat_bayar: string | null
          logo: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          id_jenis_pembayaran?: number | null
          no_rek?: string | null
          tempat_bayar?: string | null
          logo?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          id_jenis_pembayaran?: number | null
          no_rek?: string | null
          tempat_bayar?: string | null
          logo?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detail_jenis_pembayarans_id_jenis_pembayaran_fkey"
            columns: ["id_jenis_pembayaran"]
            referencedRelation: "jenis_pembayarans"
            referencedColumns: ["id"]
          }
        ]
      }
      pakets: {
        Row: {
          id: number
          nama_paket: string
          jenis: 'Prasmanan' | 'Box' | null
          kategori: 'Pernikahan' | 'Selamatan' | 'Ulang Tahun' | 'Studi Tour' | 'Rapat' | null
          jumlah_pax: number | null
          harga_paket: number | null
          deskripsi: string | null
          foto1: string | null
          foto2: string | null
          foto3: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          nama_paket: string
          jenis?: 'Prasmanan' | 'Box' | null
          kategori?: 'Pernikahan' | 'Selamatan' | 'Ulang Tahun' | 'Studi Tour' | 'Rapat' | null
          jumlah_pax?: number | null
          harga_paket?: number | null
          deskripsi?: string | null
          foto1?: string | null
          foto2?: string | null
          foto3?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          nama_paket?: string
          jenis?: 'Prasmanan' | 'Box' | null
          kategori?: 'Pernikahan' | 'Selamatan' | 'Ulang Tahun' | 'Studi Tour' | 'Rapat' | null
          jumlah_pax?: number | null
          harga_paket?: number | null
          deskripsi?: string | null
          foto1?: string | null
          foto2?: string | null
          foto3?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pesanans: {
        Row: {
          id: number
          id_pelanggan: number | null
          id_jenis_bayar: number | null
          no_resi: string | null
          tgl_pesan: string | null
          status_pesan: 'Menunggu Konfirmasi' | 'Sedang Diproses' | 'Menunggu Kurir' | null
          total_bayar: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          id_pelanggan?: number | null
          id_jenis_bayar?: number | null
          no_resi?: string | null
          tgl_pesan?: string | null
          status_pesan?: 'Menunggu Konfirmasi' | 'Sedang Diproses' | 'Menunggu Kurir' | null
          total_bayar?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          id_pelanggan?: number | null
          id_jenis_bayar?: number | null
          no_resi?: string | null
          tgl_pesan?: string | null
          status_pesan?: 'Menunggu Konfirmasi' | 'Sedang Diproses' | 'Menunggu Kurir' | null
          total_bayar?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pesanans_id_pelanggan_fkey"
            columns: ["id_pelanggan"]
            referencedRelation: "pelanggans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesanans_id_jenis_bayar_fkey"
            columns: ["id_jenis_bayar"]
            referencedRelation: "jenis_pembayarans"
            referencedColumns: ["id"]
          }
        ]
      }
      detail_pemesanans: {
        Row: {
          id_pemesanan: number
          id_paket: number
          subtotal: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id_pemesanan: number
          id_paket: number
          subtotal?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id_pemesanan?: number
          id_paket?: number
          subtotal?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detail_pemesanans_id_pemesanan_fkey"
            columns: ["id_pemesanan"]
            referencedRelation: "pesanans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detail_pemesanans_id_paket_fkey"
            columns: ["id_paket"]
            referencedRelation: "pakets"
            referencedColumns: ["id"]
          }
        ]
      }
      pengirimans: {
        Row: {
          id: number
          tgl_kirim: string | null
          tgl_tiba: string | null
          status_kirim: 'Sedang Dikirim' | 'Tiba Ditujuan' | null
          bukti_foto: string | null
          id_pesan: number | null
          id_user: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          tgl_kirim?: string | null
          tgl_tiba?: string | null
          status_kirim?: 'Sedang Dikirim' | 'Tiba Ditujuan' | null
          bukti_foto?: string | null
          id_pesan?: number | null
          id_user?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          tgl_kirim?: string | null
          tgl_tiba?: string | null
          status_kirim?: 'Sedang Dikirim' | 'Tiba Ditujuan' | null
          bukti_foto?: string | null
          id_pesan?: number | null
          id_user?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pengirimans_id_pesan_fkey"
            columns: ["id_pesan"]
            referencedRelation: "pesanans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengirimans_id_user_fkey"
            columns: ["id_user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
