'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define UserData interface
export interface UserData {
    id: number;
    email: string;
    nama: string;
    role: 'admin_provinsi' | 'admin_kabko' | 'hafiz';
    kabupaten_kota?: string | null;
    foto_profil?: string;
}

// Define Context Type
interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    error: string | null;
    refreshAuth: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/session');
            const data = await response.json();

            if (response.ok && data.user) {
                setUser(data.user as UserData);
                setError(null);
            } else {
                setUser(null);
                // Don't set error for unauthenticated state, just empty user
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            // Silent error mostly, only log
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, refreshAuth: fetchUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use Auth Context
export function useAuth(redirectOnUnauthenticated: boolean = true) {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { user, loading, error } = context;

    useEffect(() => {
        if (redirectOnUnauthenticated && !loading && !user) {
            // Only redirect if explicitly asked and done loading
            // Avoid redirect loop on public pages: check pathname if needed
            // For now, let the component handle redirect or use middleware
            // window.location.href = '/login'; 
        }
    }, [user, loading, redirectOnUnauthenticated]);

    return context;
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
