'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    email: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    nama: string;
    kabupaten_kota?: string;
    foto_profil?: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchUser() {
            try {
                // Get current session from Supabase
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    console.error('No active session:', sessionError);
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // Fetch user profile from public.users table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, email, nama, role, kabupaten_kota, foto_profil')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (userError) {
                    console.error('Error fetching user profile:', userError);
                    // Fallback: use session data with default role
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        nama: session.user.email?.split('@')[0] || 'User',
                        role: 'hafiz', // Default role
                        kabupaten_kota: undefined,
                        foto_profil: undefined
                    });
                } else if (userData) {
                    setUser(userData as User);
                } else {
                    // User authenticated but no profile in users table
                    console.warn('User authenticated but no profile found');
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        nama: session.user.email?.split('@')[0] || 'User',
                        role: 'hafiz',
                        kabupaten_kota: undefined,
                        foto_profil: undefined
                    });
                }
            } catch (err) {
                console.error('Unexpected error in useAuth:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/login');
            } else if (event === 'SIGNED_IN' && session) {
                // Refetch user data on sign in
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, email, nama, role, kabupaten_kota, foto_profil')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (userData) {
                    setUser(userData as User);
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            } else {
                setUser(null);
                router.push('/login');
            }
        } catch (err) {
            console.error('Unexpected error during sign out:', err);
        }
    };

    const refreshUser = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: userData } = await supabase
                .from('users')
                .select('id, email, nama, role, kabupaten_kota, foto_profil')
                .eq('id', session.user.id)
                .maybeSingle();
            if (userData) {
                setUser(userData as User);
            }
        }
        setLoading(false);
    };

    return { user, loading, signOut, refreshUser };
}
