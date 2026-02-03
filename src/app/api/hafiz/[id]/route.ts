import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, DBHafiz } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Get single hafiz detail
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: identifier } = await params;
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);
        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        let hafiz;

        // Try ID first if it looks like an ID, otherwise try NIK
        if (!isNaN(parseInt(identifier)) && identifier.length < 10) {
            hafiz = await queryOne<DBHafiz>('SELECT * FROM hafiz WHERE id = ?', [parseInt(identifier)]);
        } else {
            hafiz = await queryOne<DBHafiz>('SELECT * FROM hafiz WHERE nik = ?', [identifier]);
        }

        if (!hafiz) {
            return NextResponse.json({ error: 'Hafiz tidak ditemukan' }, { status: 404 });
        }

        // Access control
        if (user.role === 'hafiz' && hafiz.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (user.role === 'admin_kabko' && hafiz.kabupaten_kota !== user.kabupaten_kota) {
            return NextResponse.json({ error: 'Unauthorized region' }, { status: 403 });
        }

        // Get history
        const riwayat = await query('SELECT * FROM riwayat_mengajar WHERE hafiz_id = ? ORDER BY tmt_mengajar DESC', [hafiz.id]);

        return NextResponse.json({
            data: {
                ...hafiz,
                riwayat_mengajar: riwayat
            }
        });
    } catch (error) {
        console.error('Hafiz GET Detail error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Server error' },
            { status: 500 }
        );
    }
}

// PUT - Update hafiz
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: rawIdentifier } = await params;
    try {
        const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko', 'hafiz']);
        if (!authenticated || !user) {
            return NextResponse.json({ error }, { status: 401 });
        }

        let identifier = rawIdentifier;
        const data = await request.json();

        console.log(`[PUT Hafiz] Identifier: ${identifier}, User: ${user.id} (${user.role})`);

        let existing: DBHafiz | null = null;

        // If identifier is invalid but user is a hafiz, try to find their profile automatically
        if ((!identifier || identifier === 'undefined' || identifier === 'null') && user.role === 'hafiz') {
            existing = await queryOne<DBHafiz>('SELECT * FROM hafiz WHERE user_id = ?', [user.id]);
            if (existing) {
                identifier = existing.id.toString();
            }
        }

        // Fix date parsing error in edit hafiz
        if (data.tanggal_lahir) {
            try {
                data.tanggal_lahir = new Date(data.tanggal_lahir).toISOString().split('T')[0];
            } catch (e) {
                data.tanggal_lahir = '';
            }
        }
        if (data.tmt_mengajar) {
            try {
                data.tmt_mengajar = new Date(data.tmt_mengajar).toISOString().split('T')[0];
            } catch (e) {
                data.tmt_mengajar = '';
            }
        }

        if (!existing) {
            if (!identifier || identifier === 'undefined' || identifier === 'null') {
                return NextResponse.json({ error: 'ID Hafiz tidak valid' }, { status: 400 });
            }

            // Verify ownership/permission
            // Try ID first if it's purely numeric and length suggests it is an ID (e.g., < 16 digits)
            // NIK is always exactly 16 digits.
            if (/^\d+$/.test(identifier) && identifier.length < 16) {
                existing = await queryOne<DBHafiz>('SELECT * FROM hafiz WHERE id = ?', [parseInt(identifier)]);
            } else {
                existing = await queryOne<DBHafiz>('SELECT * FROM hafiz WHERE nik = ?', [identifier]);
            }
        }

        if (!existing) {
            console.warn(`[PUT Hafiz] Not Found: ${identifier}`);
            return NextResponse.json({ error: `Profil Hafiz (${identifier}) tidak ditemukan` }, { status: 404 });
        }

        if (user.role === 'hafiz' && existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to update this profile' }, { status: 403 });
        }
        if (user.role === 'admin_kabko' && existing.kabupaten_kota !== user.kabupaten_kota) {
            return NextResponse.json({ error: 'Unauthorized region' }, { status: 403 });
        }

        // Validate NIK uniqueness if it's being changed
        if (data.nik && data.nik !== existing.nik) {
            const nikConflict = await queryOne('SELECT id FROM hafiz WHERE nik = ? AND id != ?', [data.nik, existing.id]);
            if (nikConflict) {
                return NextResponse.json({ error: 'NIK sudah terdaftar pada profil lain' }, { status: 400 });
            }
        }

        // Helper to validate and format date (same as POST)
        const formatDate = (dateString: string | null) => {
            if (!dateString) return null;
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return null; // Invalid date

            // Simple sanity check for year
            const year = date.getFullYear();
            if (year < 1900 || year > 2100) return null;

            return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        };

        // Prepare update fields - common fields that hafiz can also edit
        const updateFields = [
            'nik', 'nama', 'tempat_lahir', 'jenis_kelamin',
            'alamat', 'rt', 'rw', 'desa_kelurahan', 'kecamatan', 'kabupaten_kota',
            'telepon', 'nama_bank', 'nomor_rekening', 'sertifikat_tahfidz',
            'mengajar', 'tempat_mengajar', 'foto_profil', 'tanda_tangan'
        ];

        // Admin-only fields - including is_aktif for status control
        if (user.role !== 'hafiz') {
            updateFields.push('status_kelulusan', 'nilai_tahfidz', 'nilai_wawasan', 'keterangan');
        }

        const updates: string[] = [];
        const values: any[] = [];

        // Handle Date Fields separately
        if (data.tanggal_lahir !== undefined) {
            const formattedDate = formatDate(data.tanggal_lahir);
            if (!formattedDate) {
                return NextResponse.json({ error: 'Format tanggal lahir tidak valid' }, { status: 400 });
            }
            updates.push('tanggal_lahir = ?');
            values.push(formattedDate);
        }

        if (data.tmt_mengajar !== undefined) {
            const formattedDate = formatDate(data.tmt_mengajar);
            updates.push('tmt_mengajar = ?');
            values.push(formattedDate); // Can be null
        }

        // Handle is_aktif separately - only admins can update, and convert boolean to int
        if (data.is_aktif !== undefined && user.role !== 'hafiz') {
            updates.push('is_aktif = ?');
            const isActive = data.is_aktif === true || data.is_aktif === 1 ? 1 : 0;
            values.push(isActive);

            // Also update the associated user login status
            if (existing.user_id) {
                try {
                    await execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, existing.user_id]);
                    console.log(`Synced user status for user_id ${existing.user_id} to ${isActive}`);
                } catch (userErr) {
                    console.error('Failed to sync user status:', userErr);
                }
            }
        }

        updateFields.forEach(field => {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        });

        // Always update updated_at
        updates.push('updated_at = NOW()');

        if (updates.length > 0) {
            const sql = `UPDATE hafiz SET ${updates.join(', ')} WHERE id = ?`;
            values.push(existing.id);
            await execute(sql, values);

            // If hafiz is updating their own profile, ensure user account is marked as active/not-pending
            if (user.role === 'hafiz' && existing.user_id === user.id) {
                await execute("UPDATE users SET status = 'active' WHERE id = ? AND status = 'pending'", [user.id]);
            }
        }

        return NextResponse.json({ success: true, message: 'Profile updated' });

    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Server error' },
            { status: 500 }
        );
    }
}
