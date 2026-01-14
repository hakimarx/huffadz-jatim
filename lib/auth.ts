import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query, queryOne, DBUser, UserRole } from './db';

// Session data interface
export interface SessionData {
    userId?: number;
    email?: string;
    role?: UserRole;
    nama?: string;
    kabupaten_kota?: string | null;
    isLoggedIn: boolean;
}

// Default session values
const defaultSession: SessionData = {
    isLoggedIn: false,
};

// Session options
const sessionOptions = {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
    cookieName: 'huffadz_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};

// Get session from cookies
export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
    }

    return session;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Login user
export async function loginUser(email: string, password: string): Promise<{
    success: boolean;
    error?: string;
    user?: Omit<DBUser, 'password'>;
}> {
    try {
        // Find user by email
        const user = await queryOne<DBUser>(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email]
        );

        if (!user) {
            return { success: false, error: 'Email atau password salah' };
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return { success: false, error: 'Email atau password salah' };
        }

        // Create session
        const session = await getSession();
        session.userId = user.id;
        session.email = user.email;
        session.role = user.role;
        session.nama = user.nama;
        session.kabupaten_kota = user.kabupaten_kota;
        session.isLoggedIn = true;
        await session.save();

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
    } catch (error: any) {
        console.error('Login error:', error);
        return {
            success: false,
            error: `Terjadi kesalahan saat login: ${error.message || 'Unknown error'}`
        };
    }
}

// Logout user
export async function logoutUser(): Promise<void> {
    const session = await getSession();
    session.destroy();
}

// Get current user from session
export async function getCurrentUser(): Promise<Omit<DBUser, 'password'> | null> {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
        return null;
    }

    const user = await queryOne<DBUser>(
        'SELECT * FROM users WHERE id = ? AND is_active = 1',
        [session.userId]
    );

    if (!user) {
        return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

// Check if user has required role
export async function requireAuth(allowedRoles?: UserRole[]): Promise<{
    authenticated: boolean;
    user?: Omit<DBUser, 'password'>;
    error?: string;
}> {
    const user = await getCurrentUser();

    if (!user) {
        return { authenticated: false, error: 'Unauthorized' };
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return { authenticated: false, error: 'Forbidden' };
    }

    return { authenticated: true, user };
}

// Register new user (admin only)
export async function registerUser(
    email: string,
    password: string,
    nama: string,
    role: UserRole,
    kabupaten_kota?: string,
    nik?: string,
    telepon?: string
): Promise<{ success: boolean; error?: string; userId?: number }> {
    try {
        // Check if email already exists
        const existingUser = await queryOne<DBUser>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return { success: false, error: 'Email sudah terdaftar' };
        }

        // If role is hafiz, validate NIK
        if (role === 'hafiz') {
            if (!nik) {
                return { success: false, error: 'NIK wajib diisi untuk akun hafiz' };
            }

            if (nik.length !== 16) {
                return { success: false, error: 'NIK harus 16 digit' };
            }

            // Check if NIK already exists in hafiz table
            const existingHafiz = await queryOne(
                'SELECT id FROM hafiz WHERE nik = ?',
                [nik]
            );

            if (existingHafiz) {
                return { success: false, error: 'NIK sudah terdaftar' };
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert user
        const result = await query<{ insertId: number }>(
            `INSERT INTO users (email, password, nama, role, kabupaten_kota, telepon, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [email, hashedPassword, nama, role, kabupaten_kota || null, telepon || null]
        );

        // Get inserted ID
        const insertedUser = await queryOne<DBUser>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        const userId = insertedUser?.id;

        // If role is hafiz, create hafiz record
        if (role === 'hafiz' && userId && nik) {
            await query(
                `INSERT INTO hafiz (user_id, nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat,
                 desa_kelurahan, kecamatan, kabupaten_kota, telepon, tahun_tes, status_kelulusan)
                 VALUES (?, ?, ?, '-', '2000-01-01', 'L', '-', '-', '-', ?, ?, ?, 'pending')`,
                [userId, nik, nama, kabupaten_kota || 'Jawa Timur', telepon || null, new Date().getFullYear()]
            );
        }

        return { success: true, userId };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Terjadi kesalahan saat registrasi' };
    }
}
