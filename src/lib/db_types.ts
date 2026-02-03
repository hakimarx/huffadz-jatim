export type UserRole = 'admin_provinsi' | 'admin_kabko' | 'hafiz';

export interface DBUser {
    id: number;
    email: string;
    password: string;
    role: UserRole;
    nama: string;
    kabupaten_kota: string | null;
    telepon: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface DBHafiz {
    id: number;
    user_id: number | null;
    nik: string;
    nama: string;
    tempat_lahir: string;
    tanggal_lahir: Date;
    jenis_kelamin: 'L' | 'P';
    alamat: string;
    rt: string | null;
    rw: string | null;
    desa_kelurahan: string;
    kecamatan: string;
    kabupaten_kota: string;
    telepon: string | null;
    email: string | null;
    nama_bank: string | null;
    nomor_rekening: string | null;
    sertifikat_tahfidz: string | null;
    mengajar: boolean;
    tmt_mengajar: Date | null;
    tempat_mengajar: string | null;
    tempat_mengajar_2: string | null;
    tmt_mengajar_2: Date | null;
    tahun_tes: number;
    periode_tes_id: number | null;
    status_kelulusan: 'lulus' | 'tidak_lulus' | 'pending';
    nilai_tahfidz: number | null;
    nilai_wawasan: number | null;
    foto_ktp: string | null;
    foto_profil: string | null;
    tanda_tangan: string | null;
    nomor_piagam: string | null;
    tanggal_lulus: Date | null;
    status_insentif: 'aktif' | 'tidak_aktif' | 'suspend';
    keterangan: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface DBKabupatenKota {
    id: number;
    nama: string;
    kode: string;
    created_at: Date;
}

export interface DBPeriodeTes {
    id: number;
    tahun: number;
    nama_periode: string;
    tanggal_mulai: Date;
    tanggal_selesai: Date;
    kuota_total: number;
    status: 'draft' | 'pendaftaran' | 'tes' | 'selesai';
    deskripsi: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface DBLaporanHarian {
    id: number;
    hafiz_id: number;
    tanggal: Date;
    jenis_kegiatan: 'mengajar' | 'murojah' | 'khataman' | 'lainnya';
    deskripsi: string;
    foto: string | null;
    lokasi: string | null;
    durasi_menit: number | null;
    status_verifikasi: 'pending' | 'disetujui' | 'ditolak';
    verified_by: number | null;
    verified_at: Date | null;
    catatan_verifikasi: string | null;
    created_at: Date;
    updated_at: Date;
}
