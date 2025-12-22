import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    // Handle errors from OAuth providers
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error) {
        console.error('OAuth error:', error, error_description);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`);
    }

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options });
                    },
                },
            }
        );

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
        }

        if (data.user) {
            // Check if user exists in public.users table
            const { data: existingUser } = await supabase
                .from('users')
                .select('id, role')
                .eq('id', data.user.id)
                .maybeSingle();

            // If user doesn't exist in public.users, create them
            if (!existingUser) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        nama: data.user.user_metadata?.full_name ||
                            data.user.user_metadata?.name ||
                            data.user.email?.split('@')[0] || 'User',
                        role: 'hafiz', // Default role for OAuth users
                        is_active: true
                    });

                if (insertError) {
                    console.error('Error creating user profile:', insertError);
                    // Continue anyway - user can complete profile later
                }
            }
        }

        // Redirect to the requested page or dashboard
        return NextResponse.redirect(`${origin}${next}`);
    }

    // No code present, redirect to login
    return NextResponse.redirect(`${origin}/login`);
}
