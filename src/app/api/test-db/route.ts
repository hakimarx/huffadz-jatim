import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Attempt a simple query
        await query('SELECT 1');

        return NextResponse.json({
            status: 'OK',
            message: 'Database connection successful',
            env: {
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT,
                user: process.env.DATABASE_USER,
                db: process.env.DATABASE_NAME,
                // Do not expose password
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'ERROR',
            error: {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                stack: error.stack
            },
            env: {
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT,
                user: process.env.DATABASE_USER,
                db: process.env.DATABASE_NAME,
            }
        }, { status: 500 });
    }
}
