import { NextResponse, type NextRequest } from 'next/server';

// For MySQL auth, we check the session cookie directly in middleware
// The full session validation is done in the API routes

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Check for session cookie
    const sessionCookie = request.cookies.get('huffadz_session');
    const hasSession = sessionCookie && sessionCookie.value;

    const isLoginPage = request.nextUrl.pathname === '/login';
    const isRegisterPage = request.nextUrl.pathname === '/register';
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
    const isApiPage = request.nextUrl.pathname.startsWith('/api');

    // Skip middleware for API routes
    if (isApiPage) {
        return response;
    }

    // If user has session cookie and on login/register page, redirect to dashboard
    if (hasSession && (isLoginPage || isRegisterPage)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user has NO session cookie and trying to access dashboard, redirect to login
    if (!hasSession && isDashboardPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
