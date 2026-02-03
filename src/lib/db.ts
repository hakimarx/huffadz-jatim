import mysql from 'mysql2/promise';
import postgres from 'postgres';
import path from 'path';
import dotenv from 'dotenv';

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const isPostgres = process.env.DATABASE_URL?.startsWith('postgres://') || process.env.DATABASE_URL?.startsWith('postgresql://');

// Translation helper
function translateSql(sql: string): string {
    if (!isPostgres) return sql;

    let paramIndex = 1;
    let translated = sql
        .replace(/TIMESTAMPDIFF\(YEAR, (.*?), CURDATE\(\)\)/gi, "EXTRACT(YEAR FROM AGE(CURRENT_DATE, $1))")
        .replace(/CURDATE\(\)/gi, "CURRENT_DATE")
        .replace(/YEAR\((.*?)\)/gi, "EXTRACT(YEAR FROM $1)")
        .replace(/MONTH\((.*?)\)/gi, "EXTRACT(MONTH FROM $1)")
        .replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP")
        .replace(/IFNOTEXISTS/gi, "IF NOT EXISTS")
        .replace(/TINYINT\(1\)/gi, "BOOLEAN")
        .replace(/DATETIME/gi, "TIMESTAMP WITH TIME ZONE")
        .replace(/\?(?=(?:[^']*'[^']*')*[^']*$)/g, () => `$${paramIndex++}`);

    // Convert common boolean comparisons
    translated = translated
        .replace(/is_active = 1/gi, "is_active = true")
        .replace(/is_active = 0/gi, "is_active = false")
        .replace(/is_aktif = 1/gi, "is_active = true") // Unify to is_active if needed, or keep
        .replace(/is_aktif = 0/gi, "is_active = false")
        .replace(/= 1/g, (match, offset, full) => {
            // Only replace if it looks like a boolean field (heuristic)
            const prev = full.substring(offset - 10, offset).toLowerCase();
            if (prev.includes('active') || prev.includes('aktif') || prev.includes('is_') || prev.includes('mengajar')) {
                return "= true";
            }
            return "= 1";
        })
        .replace(/= 0/g, (match, offset, full) => {
            const prev = full.substring(offset - 10, offset).toLowerCase();
            if (prev.includes('active') || prev.includes('aktif') || prev.includes('is_') || prev.includes('mengajar')) {
                return "= false";
            }
            return "= 0";
        });

    return translated;
}

// MySQL configuration
const mysqlConfig: mysql.PoolOptions = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '4000'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'huffadz_jatim',
    ssl: process.env.DATABASE_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false,
    } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Postgres configuration
const pgSql = isPostgres ? postgres(process.env.DATABASE_URL!, {
    ssl: { rejectUnauthorized: false },
    max: 10,
}) : null;

// Connection pool for MySQL
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
    if (!pool) {
        pool = mysql.createPool(mysqlConfig);
    }
    return pool;
}

// Helper to clean params
function cleanParams(params?: unknown[]): any[] | undefined {
    if (!params) return undefined;
    return params.map(p => p === undefined ? null : p);
}

// Helper function to execute queries
export async function query<T = unknown>(
    sql: string,
    params?: unknown[]
): Promise<T[]> {
    const translatedSql = translateSql(sql);
    const cleanedParams = cleanParams(params) || [];

    try {
        if (isPostgres && pgSql) {
            const rows = await pgSql.unsafe(translatedSql, cleanedParams);
            return rows as unknown as T[];
        } else {
            const connection = getPool();
            const [rows] = await connection.execute(translatedSql, cleanedParams);
            return rows as T[];
        }
    } catch (error: any) {
        console.error('Database Query Error:', {
            sql: translatedSql,
            params: cleanedParams,
            message: error.message,
            code: error.code,
        });

        if (error.code === 'ECONNREFUSED' && !isPostgres) {
            throw new Error('Gagal terhubung ke database. Pastikan MySQL sudah berjalan.');
        }

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

// Helper for insert operations
export async function insert(
    sql: string,
    params?: unknown[]
): Promise<number> {
    const translatedSql = translateSql(sql);
    const cleanedParams = cleanParams(params) || [];

    if (isPostgres && pgSql) {
        // Postgres insert usually needs RETURNING id
        const sqlWithReturning = translatedSql.trim().endsWith(';')
            ? translatedSql.trim().slice(0, -1) + ' RETURNING id'
            : translatedSql + ' RETURNING id';

        const result = await pgSql.unsafe(sqlWithReturning, cleanedParams);
        return result[0]?.id || 0;
    } else {
        const connection = getPool();
        const [result] = await connection.execute(translatedSql, cleanedParams);
        return (result as mysql.ResultSetHeader).insertId;
    }
}

// Helper for update/delete operations
export async function execute(
    sql: string,
    params?: unknown[]
): Promise<number> {
    const translatedSql = translateSql(sql);
    const cleanedParams = cleanParams(params) || [];

    if (isPostgres && pgSql) {
        const result = await pgSql.unsafe(translatedSql, cleanedParams);
        return result.count;
    } else {
        const connection = getPool();
        const [result] = await connection.execute(translatedSql, cleanedParams);
        return (result as mysql.ResultSetHeader).affectedRows;
    }
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

export type { DBUser, DBHafiz, DBKabupatenKota, DBPeriodeTes, DBLaporanHarian, UserRole } from './db_types';
