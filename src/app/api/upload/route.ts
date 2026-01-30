import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth';

// File upload limits (internal use only, not exported config)
const UPLOAD_LIMITS = {
    signatures: {
        maxSize: 1 * 1024 * 1024, // 1MB
        allowedTypes: ['image/png'],
    },
};

export async function POST(request: NextRequest) {
    try {
        const { authenticated, user } = await requireAuth();
        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'profile-photo' or 'ktp'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Sanitize filename
        const timestamp = Date.now();
        const secureName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${type || 'upload'}_${user.id}_${timestamp}_${secureName}`;

        let fileUrl = '';

        // Use Supabase Storage if configured (needed for Vercel/Production)
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            try {
                const { uploadToSupabase } = await import('@/lib/supabase');
                // Use 'uploads' as the default bucket name
                fileUrl = await uploadToSupabase(buffer, filename, file.type, 'uploads');
            } catch (supabaseError: any) {
                console.error('Supabase upload error:', supabaseError);
                // If it fails because bucket doesn't exist, we might want to log that
                if (supabaseError.message?.includes('bucket')) {
                    console.warn('Supabase bucket "uploads" might not exist. Please create it in your Supabase dashboard.');
                }
                // Fallback to local if in development, otherwise throw
                if (process.env.NODE_ENV === 'production') {
                    throw new Error('Gagal mengupload ke cloud storage: ' + supabaseError.message);
                }
            }
        }

        // Fallback to local storage (only works on cPanel/Local, NOT Vercel)
        if (!fileUrl) {
            // Ensure uploads directory exists
            const uploadDir = path.join(process.cwd(), 'public/uploads');
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (e) {
                // Ignore if exists
            }

            // Write file
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            // Return public URL (relative to domain)
            fileUrl = `/uploads/${filename}`;
        }

        return NextResponse.json({
            success: true,
            url: fileUrl,
            message: 'File berhasil diupload',
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal mengupload file' },
            { status: 500 }
        );
    }
}
