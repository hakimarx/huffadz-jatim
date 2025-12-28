import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// File type configurations
const UPLOAD_CONFIG = {
    'activity-photos': {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    'ktp': {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    },
    'profile': {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
};

type UploadType = keyof typeof UPLOAD_CONFIG;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as UploadType | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!type || !UPLOAD_CONFIG[type]) {
            return NextResponse.json(
                { error: 'Invalid upload type. Must be: activity-photos, ktp, or profile' },
                { status: 400 }
            );
        }

        const config = UPLOAD_CONFIG[type];

        // Validate file size
        if (file.size > config.maxSize) {
            return NextResponse.json(
                { error: `File size exceeds limit of ${config.maxSize / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Validate file type
        if (!config.allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Create directory structure: /public/uploads/{type}/{year-month}/
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type, yearMonth);

        // Ensure directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}-${randomStr}.${fileExt}`;
        const filePath = path.join(uploadDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Return public URL path
        const publicUrl = `/uploads/${type}/${yearMonth}/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName: fileName,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

// Handle GET request for info
export async function GET() {
    return NextResponse.json({
        message: 'File upload API',
        endpoints: {
            POST: {
                description: 'Upload a file',
                body: 'multipart/form-data with file and type fields',
                types: Object.keys(UPLOAD_CONFIG),
            },
        },
    });
}
