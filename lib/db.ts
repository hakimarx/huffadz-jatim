import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Database configuration - uses TiDB Serverless or local MySQL
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'huffadz_jatim',
    ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: true,
    } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Connection pool for better performance
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}

// Helper function to execute queries
export async function query<T = unknown>(
    sql: string,
    params?: unknown[]
): Promise<T[]> {
    try {
        const connection = getPool();
        const [rows] = await connection.execute(sql, params);
        return rows as T[];
    } catch (error: any) {
        console.error('Database Query Error:', {
            sql,
            params,
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            stack: error.stack
        });
        throw error;
    }
}

// Helper for single row queries
export async function queryOne<T = unknown>(
    sql: string,
    params?: unknown[]
): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows[0] || null;
}

// Helper for insert operations (returns insertId)
export async function insert(
    sql: string,
    params?: unknown[]
): Promise<number> {
    const connection = getPool();
    const [result] = await connection.execute(sql, params);
    return (result as mysql.ResultSetHeader).insertId;
}

// Helper for update/delete operations (returns affectedRows)
export async function execute(
    sql: string,
    params?: unknown[]
): Promise<number> {
    const connection = getPool();
    const [result] = await connection.execute(sql, params);
    return (result as mysql.ResultSetHeader).affectedRows;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
    try {
        await query('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

// Database Types (matching existing schema)
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
