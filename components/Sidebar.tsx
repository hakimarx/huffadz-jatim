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
          bg-[#0f172a] text-white shadow-2xl z-40 
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col no-print
        `}
            >
                {/* Brand / Logo Area */}
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-xl">📖</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">LPTQ Jatim</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Huffadz System</p>
                    </div>
                </div>

                {/* Profile Section (Compact) */}
                <div className="px-6 py-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-emerald-400 font-bold text-lg">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-white truncate">{userName}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`w-2 h-2 rounded-full ${userRole === 'admin_provinsi' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></span>
                                <p className="text-xs text-slate-400 truncate capitalize">{userRole.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
                        <ul className="space-y-1">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href || pathname === item.href + '/';
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-xl
                      font-medium text-sm transition-all duration-200 group
                      ${isActive
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }
                    `}
                                        >
                                            <span className={`text-lg transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                                            <span>{item.label}</span>
                                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50"></div>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 dark-footer-gradient">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-medium text-sm transition-all duration-200"
                    >
                        <FiLogOut />
                        <span>Keluar Aplikasi</span>
                    </button>
                    <div className="mt-4 flex justify-center opacity-40">
                        <span className="text-[10px] text-slate-400">v2.5.0 • &copy; 2025</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
