'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
    FiAward,
    FiBell
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
    { label: 'Periode', href: '/dashboard/periode-tes', icon: <FiCalendar />, roles: ['admin_provinsi'] },
    { label: 'Statistik', href: '/dashboard/kuota', icon: <FiPieChart />, roles: ['admin_provinsi', 'admin_kabko'] },
    { label: 'Penguji', href: '/dashboard/penguji', icon: <FiUserCheck />, roles: ['admin_provinsi'] },
    { label: 'Al-Quran', href: '/dashboard/quran', icon: <FiBook />, roles: ['admin_provinsi', 'admin_kabko', 'hafiz'] },
    { label: 'Profil', href: '/dashboard/profil', icon: <FiSettings />, roles: ['hafiz'] }
];

interface NavbarProps {
    userRole: string;
    userName: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-10">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <img
                                src="/logo-lptq.png"
                                alt="Logo LPTQ"
                                className="w-10 h-10 group-hover:scale-105 transition-transform"
                            />
                            <span className="font-display font-bold text-neutral-800 text-xl tracking-tight group-hover:text-primary-600 transition-colors">
                                LPTQ <span className="text-primary-600">Jatim</span>
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex space-x-1">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-primary-50 text-primary-600 shadow-sm'
                                                : 'text-neutral-500 hover:bg-white/50 hover:text-neutral-900'
                                            }
                                        `}
                                    >
                                        <span className={`mr-2 text-lg ${isActive ? 'text-primary-500' : 'text-neutral-400'}`}>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side User Menu */}
                    <div className="flex items-center gap-5">
                        <button className="p-2.5 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all relative group">
                            <FiBell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
                        </button>

                        <div className="hidden md:flex items-center gap-4 pl-5 border-l border-neutral-200">
                            <div className="text-right">
                                <p className="text-sm font-bold text-neutral-800 leading-none mb-1">{userName}</p>
                                <p className="text-xs text-neutral-500 font-medium capitalize bg-neutral-100 px-2 py-0.5 rounded-full inline-block">{userRole.replace('_', ' ')}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-md">
                                {userName.charAt(0)}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 focus:outline-none transition-colors"
                        >
                            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden glass border-t border-white/20 absolute w-full left-0 top-20 animate-fade-in shadow-xl backdrop-blur-xl bg-white/90">
                    <div className="pt-2 pb-4 space-y-1 px-4 max-h-[calc(100vh-80px)] overflow-y-auto">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all
                                        ${isActive
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                        }
                                    `}
                                >
                                    <span className={`mr-4 text-xl ${isActive ? 'text-primary-500' : 'text-neutral-400'}`}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            )
                        })}
                        <div className="border-t border-neutral-100 mt-4 pt-4 px-2">
                            <div className="flex items-center gap-3 mb-6 bg-neutral-50 p-4 rounded-2xl">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                    {userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-800">{userName}</p>
                                    <p className="text-sm text-neutral-500 capitalize">{userRole.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 rounded-xl shadow-sm text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                <FiLogOut /> Keluar Aplikasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
