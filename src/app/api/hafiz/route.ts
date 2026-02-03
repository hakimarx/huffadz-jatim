import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, execute, DBHafiz } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - List hafiz with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const kabupaten = searchParams.get('kabupaten') || '';
        const tahun = searchParams.get('tahun') || '';
        const status = searchParams.get('status') || '';

        const offset = (page - 1) * limit;

        // Default where clause
        let whereClause = '1=1';
        const params: unknown[] = [];

        // Filter by role
        if (user.role === 'hafiz') {
            // Hafiz can always see their own profile regardless of is_aktif status
            whereClause += ' AND user_id = ?';
            params.push(user.id);
        } else {
            // For admins, default to showing active ones only, unless overridden by status filter
            if (!status) {
                whereClause += ' AND is_aktif = 1';
            }

            if (user.role === 'admin_kabko' && user.kabupaten_kota) {
                whereClause += ' AND kabupaten_kota = ?';
                params.push(user.kabupaten_kota);
            } else if (kabupaten) {
                whereClause += ' AND kabupaten_kota = ?';
                params.push(kabupaten);
            }
        }

        // Search filter
        if (search) {
            whereClause += ' AND (nama LIKE ? OR nik LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Year filter
        if (tahun) {
            whereClause += ' AND tahun_tes = ?';
            params.push(parseInt(tahun));
        }

        // Status filter
        if (status) {
            whereClause += ' AND status_kelulusan = ?';
            params.push(status);
        }

        // Get total count
        const countResult = await queryOne<{ total: number }>(
            `SELECT COUNT(*) as total FROM hafiz WHERE ${whereClause}`,
            params
        );
        const total = countResult?.total || 0;

        // Get hafiz list
        let hafizList = await query<DBHafiz>(
            `SELECT * FROM hafiz WHERE ${whereClause} ORDER BY nama ASC LIMIT ${limit} OFFSET ${offset}`,
            params
        );

        // If user is hafiz and no profile returned, try to auto-link by exact email match
        if (user.role === 'hafiz' && hafizList.length === 0) {
            const fallback = await queryOne<DBHafiz>('SELECT * FROM hafiz WHERE email = ? LIMIT 1', [user.email]);
            if (fallback) {
                if (!fallback.user_id) {
                    await execute('UPDATE hafiz SET user_id = ? WHERE id = ?', [user.id, fallback.id]);
                    fallback.user_id = user.id;
                }
                hafizList = [fallback];
            }
        }

        return NextResponse.json({
            data: hafizList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Hafiz GET error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST - Create new hafiz
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);

        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const data = await request.json();

        // Validate required fields
        const requiredFields = ['nik', 'nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
            'alamat', 'desa_kelurahan', 'kecamatan', 'kabupaten_kota', 'tahun_tes'];

        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `Field ${field} wajib diisi` },
                    { status: 400 }
                );
            }
        }

        // Admin kabko can only add hafiz in their region
        if (user.role === 'admin_kabko' && data.kabupaten_kota !== user.kabupaten_kota) {
            return NextResponse.json(
                { error: 'Anda hanya dapat menambah hafiz di wilayah Anda' },
                { status: 403 }
            );
        }

        // If user is Hafiz, check if they already have a profile
        let userIdToLink = null;
        if (user.role === 'hafiz') {
            const myProfile = await queryOne('SELECT id FROM hafiz WHERE user_id = ?', [user.id]);
            if (myProfile) {
                return NextResponse.json({ error: 'Anda sudah memiliki profil Hafiz' }, { status: 400 });
            }
            userIdToLink = user.id;
        }

        // Check if NIK already exists
        const existing = await queryOne<DBHafiz>(
            'SELECT id FROM hafiz WHERE nik = ?',
            [data.nik]
        );

        if (existing) {
            return NextResponse.json(
                { error: 'NIK sudah terdaftar' },
                { status: 400 }
            );
        }

        // If admin is adding, we should probably create a user account if it doesn't exist
        // so the Hafiz can login later.
        if (!userIdToLink && user.role !== 'hafiz') {
            const tempEmail = data.email || `${data.nik}@huffadz-jatim.com`;

            // Check if email already exists in users table
            const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [tempEmail]);

            if (!existingUser) {
                // Set default password: last 6 digits of NIK
                const { hashPassword } = await import('@/lib/auth');
                const defaultPassword = data.nik.slice(-6);
                const hashedPassword = await hashPassword(defaultPassword);

                userIdToLink = await insert(
                    `INSERT INTO users (email, password, nama, role, kabupaten_kota, telepon, is_active, is_verified) 
                     VALUES (?, ?, ?, 'hafiz', ?, ?, TRUE, TRUE)`,
                    [tempEmail, hashedPassword, data.nama, data.kabupaten_kota, data.telepon || null]
                );
                console.log(`[POST Hafiz] Created auto-user for NIK ${data.nik}, UserID: ${userIdToLink}`);
            } else {
                userIdToLink = (existingUser as any).id;
            }
        }

        // Insert new hafiz
        const insertId = await insert(
            `INSERT INTO hafiz (
                user_id, nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin,
                alamat, rt, rw, desa_kelurahan, kecamatan, kabupaten_kota,
                telepon, email, nama_bank, nomor_rekening, sertifikat_tahfidz, mengajar, tmt_mengajar,
                tempat_mengajar, tahun_tes, status_kelulusan, nilai_tahfidz,
                nilai_wawasan, keterangan, foto_profil, tanda_tangan, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
            [
                userIdToLink,
                data.nik, data.nama, data.tempat_lahir, data.tanggal_lahir, data.jenis_kelamin,
                data.alamat, data.rt || null, data.rw || null, data.desa_kelurahan, data.kecamatan,
                data.kabupaten_kota, data.telepon || null, data.email || null,
                data.nama_bank || null, data.nomor_rekening || null,
                data.sertifikat_tahfidz || null, Boolean(data.mengajar), data.tmt_mengajar || null,
                data.tempat_mengajar || null, data.tahun_tes,
                user.role === 'hafiz' ? 'pending' : (data.status_kelulusan || 'pending'),
                data.nilai_tahfidz || null, data.nilai_wawasan || null, data.keterangan || null,
                data.foto_profil || null, data.tanda_tangan || null
            ]
        );

        return NextResponse.json({
            success: true,
            id: insertId,
            message: 'Hafiz berhasil ditambahkan',
        });
    } catch (error) {
        console.error('Hafiz POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
