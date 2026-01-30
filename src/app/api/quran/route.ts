import { NextRequest, NextResponse } from 'next/server';

// API Kemenag Configuration
const KEMENAG_API_URL = 'https://quran-api.lpmqkemenag.id/api-alquran';
const KEMENAG_USERNAME = 'gayungan';
const KEMENAG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjQyNDg4NjcxOGI5NDQ2MDBmZjU2MTY0OTRjM2NhZWVhIiwiaWF0IjoxNzY2MzcyMDYwfQ.BdigfduNQjyPlnCQJwLfHAWjhUoxz1eQBOUQkwA4_nQ';

// GET /api/quran?endpoint=surah/local/1/114
// GET /api/quran?endpoint=ayat/local/1
// GET /api/quran?endpoint=ayat/local/tafsir/1
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const endpoint = searchParams.get('endpoint');

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint parameter is required' },
                { status: 400 }
            );
        }

        // Construct full URL
        const url = `${KEMENAG_API_URL}/${endpoint}`;

        console.log('Proxying request to:', url);

        // Make request to Kemenag API
        // API expects 'user' header (not 'username') based on error message
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'user': KEMENAG_USERNAME,
                'username': KEMENAG_USERNAME,
                'token': KEMENAG_TOKEN,
                'Authorization': KEMENAG_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Kemenag API error:', response.status, response.statusText);
            return NextResponse.json(
                { error: `API returned ${response.status}: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return data with CORS headers
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch from Kemenag API' },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
