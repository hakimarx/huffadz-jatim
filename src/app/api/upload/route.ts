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
        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            message: 'File berhasil diupload',
            debug_path: filePath // For demonstration purposes as requested by user
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Gagal mengupload file' },
            { status: 500 }
        );
    }
}
