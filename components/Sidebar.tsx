'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    FiHome,
    FiUsers,
    FiFileText,
    FiCalendar,
    FiPieChart,
    FiUserCheck,
    FiBook,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiLoader,
    FiPrinter
} from 'react-icons/fi';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: string[];
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiHome />, roles: ['admin_provinsi', 'admin_kabko', 'hafiz'] },
    { label: 'Data Hafiz', href: '/dashboard/hafiz', icon: <FiUsers />, roles: ['admin_provinsi', 'admin_kabko'] },
    { label: 'Laporan', href: '/dashboard/laporan', icon: <FiFileText />, roles: ['admin_provinsi', 'admin_kabko', 'hafiz'] },
    { label: 'Cetak Laporan', href: '/dashboard/cetak-laporan', icon: <FiPrinter />, roles: ['admin_provinsi', 'admin_kabko'] },
    { label: 'Periode', href: '/dashboard/periode-tes', icon: <FiCalendar />, roles: ['admin_provinsi'] },
    { label: 'Statistik', href: '/dashboard/kuota', icon: <FiPieChart />, roles: ['admin_provinsi', 'admin_kabko'] },
    { label: 'Penguji', href: '/dashboard/penguji', icon: <FiUserCheck />, roles: ['admin_provinsi'] },
    { label: 'Al-Quran', href: '/dashboard/quran', icon: <FiBook />, roles: ['admin_provinsi', 'admin_kabko', 'hafiz'] },
    { label: 'Pengaturan', href: '/dashboard/pengaturan', icon: <FiSettings />, roles: ['admin_provinsi', 'admin_kabko'] },
    { label: 'Profil', href: '/dashboard/profil', icon: <FiSettings />, roles: ['hafiz'] }
];

interface SidebarProps {
    userRole: string;
    userName: string;
    userPhoto?: string;
}

export default function Sidebar({ userRole, userName, userPhoto }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            // Use MySQL logout API instead of Supabase
            const response = await fetch('/api/auth/logout', { method: 'POST' });

            if (response.ok) {
                // Redirect to login after successful sign out
                window.location.href = '/login';
            } else {
                const data = await response.json();
                console.error('Error signing out:', data.error);
                alert('Gagal logout: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Unexpected error during logout:', err);
            alert('Gagal logout. Silakan coba lagi.');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg text-neutral-800 hover:bg-neutral-50 transition-colors"
            >
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen bg-white border-r border-neutral-200 z-40
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-20' : 'w-64'}
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Brand */}
                    <div className="p-6 border-b border-neutral-200">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
                                L
                            </div>
                            {!collapsed && (
                                <span className="font-display font-bold text-neutral-800 text-xl tracking-tight group-hover:text-primary-600 transition-colors whitespace-nowrap">
                                    LPTQ <span className="text-primary-600">Jatim</span>
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* User Info with Profile Photo */}
                    <div className="p-4 border-b border-neutral-200">
                        <div className="flex items-center gap-3">
                            {userPhoto ? (
                                <img
                                    src={userPhoto}
                                    alt={userName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-md flex-shrink-0">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-neutral-800 leading-none mb-1 truncate">{userName}</p>
                                    <p className="text-xs text-neutral-500 font-medium capitalize bg-neutral-100 px-2 py-0.5 rounded-full inline-block">
                                        {userRole.replace('_', ' ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-1">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-primary-50 text-primary-600 shadow-sm'
                                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                            }
                                            ${collapsed ? 'justify-center' : ''}
                                        `}
                                        title={collapsed ? item.label : ''}
                                    >
                                        <span className={`text-xl flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-neutral-400'}`}>
                                            {item.icon}
                                        </span>
                                        {!collapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Logout Button - Now uses Supabase signOut */}
                    <div className="p-4 border-t border-neutral-200">
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50
                                ${collapsed ? 'justify-center' : ''}
                            `}
                            title={collapsed ? 'Keluar' : ''}
                        >
                            {loggingOut ? (
                                <FiLoader className="text-xl flex-shrink-0 animate-spin" />
                            ) : (
                                <FiLogOut className="text-xl flex-shrink-0" />
                            )}
                            {!collapsed && <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>}
                        </button>
                    </div>

                    {/* Collapse Toggle (Desktop only) */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-neutral-200 rounded-full items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm"
                    >
                        {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
                    </button>
                </div>
            </aside>

            {/* Spacer for content */}
            <div className={`hidden lg:block transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />
        </>
    );
}
