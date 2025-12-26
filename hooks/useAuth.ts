'use client';

import { useState, useEffect } from 'react';

export interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string | null;
    foto_profil?: string;
}

interface UseAuthResult {
    user: UserData | null;
    loading: boolean;
    error: string | null;
}

/**
 * Custom hook to fetch current user from MySQL session API.
 * Redirects to login if no session is found.
 * 
 * @param redirectOnUnauthenticated - If true (default), redirects to /login when not authenticated
 * @returns Object containing user data, loading state, and error
 */
export function useAuth(redirectOnUnauthenticated: boolean = true): UseAuthResult {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch('/api/auth/session');
                const data = await response.json();

                if (response.ok && data.user) {
                    setUser(data.user as UserData);
                    setError(null);
                } else {
                    setUser(null);
                    if (redirectOnUnauthenticated) {
                        window.location.href = '/login';
                        return;
                    }
                    setError(data.error || 'Not authenticated');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to fetch user data');
                if (redirectOnUnauthenticated) {
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [redirectOnUnauthenticated]);

    return { user, loading, error };
}

/**
 * Check if user has required role
 */
export function hasRole(user: UserData | null, allowedRoles: string[]): boolean {
    if (!user) return false;
    return allowedRoles.includes(user.role);
}

/**
 * Helper to get role display name
 */
export function getRoleDisplayName(role: string): string {
    switch (role) {
        case 'admin_provinsi':
            return 'Admin Provinsi';
        case 'admin_kabko':
            return 'Admin Kab/Ko';
        case 'hafiz':
            return 'Hafiz';
        default:
            return role.replace('_', ' ');
    }
}
