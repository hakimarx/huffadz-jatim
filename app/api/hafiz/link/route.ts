import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { authenticated, user, error } = await requireAuth(['admin_provinsi', 'admin_kabko']);
    if (!authenticated || !user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const data = await request.json();
    const hafizId = data.hafiz_id;
    const userId = data.user_id;

    if (!hafizId || !userId) {
      return NextResponse.json({ error: 'hafiz_id dan user_id wajib diisi' }, { status: 400 });
    }

    // Fetch hafiz and user
    const hafiz = await queryOne<any>('SELECT * FROM hafiz WHERE id = ?', [hafizId]);
    if (!hafiz) {
      return NextResponse.json({ error: 'Hafiz tidak ditemukan' }, { status: 404 });
    }

    // Admin kabko can only link hafiz in their region
    if (user.role === 'admin_kabko' && hafiz.kabupaten_kota !== user.kabupaten_kota) {
      return NextResponse.json({ error: 'Anda tidak boleh menautkan hafiz di luar wilayah Anda' }, { status: 403 });
    }

    const targetUser = await queryOne<any>('SELECT id, role FROM users WHERE id = ? AND is_active = 1', [userId]);
    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan atau tidak aktif' }, { status: 404 });
    }

    // Prefer linking only to users with role hafiz
    if (targetUser.role !== 'hafiz') {
      return NextResponse.json({ error: 'Target user harus berperan sebagai hafiz' }, { status: 400 });
    }

    // If hafiz already linked to another user, block to avoid accidental overwrites
    if (hafiz.user_id && hafiz.user_id !== targetUser.id) {
      return NextResponse.json({ error: 'Profil sudah terhubung dengan akun lain. Batalkan terlebih dahulu jika perlu mengganti.' }, { status: 400 });
    }

    await execute('UPDATE hafiz SET user_id = ? WHERE id = ?', [targetUser.id, hafizId]);

    return NextResponse.json({ success: true, message: 'Profil hafiz berhasil ditautkan' });
  } catch (err) {
    console.error('Hafiz link error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
