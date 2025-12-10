'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    FiHome,
    FiUsers,
    FiFileText,
    FiCalendar,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX,
    FiPieChart,
    FiUserCheck,
    FiBook,
    FiAward
} from 'react-icons/fi';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: string[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <FiHome />,
        roles: ['admin_provinsi', 'admin_kabko', 'hafiz']
    },
    {
        label: 'Data Hafiz',
        href: '/dashboard/hafiz',
        icon: <FiUsers />,
        roles: ['admin_provinsi', 'admin_kabko']
    },
    {
        label: 'Laporan Harian',
        href: '/dashboard/laporan',
        icon: <FiFileText />,
        roles: ['admin_provinsi', 'admin_kabko', 'hafiz']
    },
    {
        label: 'Periode Tes',
        href: '/dashboard/periode-tes',
        icon: <FiCalendar />,
        roles: ['admin_provinsi']
    },
    {
        label: 'Kuota & Statistik',
        href: '/dashboard/kuota',
        icon: <FiPieChart />,
        roles: ['admin_provinsi', 'admin_kabko']
    },
    {
        label: 'Penguji',
        href: '/dashboard/penguji',
        icon: <FiUserCheck />,
        roles: ['admin_provinsi']
    },
    {
        label: 'Absensi Tes',
        href: '/dashboard/absensi',
        icon: <FiBook />,
        roles: ['admin_provinsi', 'admin_kabko']
    },
    {
        label: 'Dokumen',
        href: '/dashboard/dokumen',
        icon: <FiAward />,
        roles: ['admin_provinsi', 'admin_kabko']
    },
    {
        label: 'Profil Saya',
        href: '/dashboard/profil',
        icon: <FiSettings />,
        roles: ['hafiz']
    }
];

interface SidebarProps {
    userRole: string;
    userName: string;
    userEmail: string;
}

export default function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(userRole)
    );

    const handleLogout = async () => {
        // Logout logic will be implemented
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg no-print"
            >
                {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 no-print"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 
          bg-white shadow-xl z-40 
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col no-print
        `}
            >
                {/* Header */}
                <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-neutral-800 truncate">{userName}</h3>
                            <p className="text-xs text-neutral-500 truncate">{userEmail}</p>
                        </div>
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                        {userRole === 'admin_provinsi' && '👑 Admin Provinsi'}
                        {userRole === 'admin_kabko' && '📍 Admin Kab/Ko'}
                        {userRole === 'hafiz' && '📖 Hafiz'}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      font-medium text-sm transition-all duration-200
                      ${isActive
                                                ? 'bg-primary-600 text-white shadow-lg'
                                                : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
                                            }
                    `}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-red-600 hover:bg-red-50 font-medium text-sm transition-all"
                    >
                        <FiLogOut />
                        <span>Keluar</span>
                    </button>
                    <div className="mt-3 text-center text-xs text-neutral-500">
                        © 2026 LPTQ Jawa Timur
                    </div>
                </div>
            </aside>
        </>
    );
}
