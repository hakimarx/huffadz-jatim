import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sczdpueymqspwnhbuomf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjemRwdWV5bXFzcHduaGJ1b21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTQ3MzIsImV4cCI6MjA4MDkzMDczMn0.PAYAg5sHJ873Qfy1bmIYWjQD36Ryb3VIHUYg-QdmPCY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type UserRole = 'admin_provinsi' | 'admin_kabko' | 'hafiz';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nama: string;
  kabupaten_kota?: string;
  created_at: string;
}

export interface Hafiz {
  id: string;
  nik: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  alamat: string;
  rt: string;
  rw: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  telepon: string;
  email?: string;
  sertifikat_tahfidz: string;
  mengajar: boolean;
  tmt_mengajar?: string;
  tahun_tes: number;
  periode_tes: string;
  status_kelulusan: 'lulus' | 'tidak_lulus' | 'pending';
  nilai_tahfidz?: number;
  nilai_wawasan?: number;
  foto_ktp?: string;
  created_at: string;
  updated_at: string;
}

export interface LaporanHarian {
  id: string;
  hafiz_id: string;
  tanggal: string;
  jenis_kegiatan: 'mengajar' | 'murojah' | 'khataman' | 'lainnya';
  deskripsi: string;
  foto?: string;
  lokasi?: string;
  durasi_menit?: number;
  status_verifikasi: 'pending' | 'disetujui' | 'ditolak';
  verified_by?: string;
  verified_at?: string;
  catatan_verifikasi?: string;
  created_at: string;
}

export interface Kuota {
  id: string;
  tahun: number;
  kabupaten_kota: string;
  total_pendaftar: number;
  kuota_diterima: number;
  created_at: string;
  updated_at: string;
}

export interface PeriodeTes {
  id: string;
  tahun: number;
  nama_periode: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kuota_total: number;
  status: 'draft' | 'pendaftaran' | 'tes' | 'selesai';
  created_at: string;
}
