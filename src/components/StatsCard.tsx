'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
}

export default function StatsCard({
    title,
    value,
    icon,
    trend,
    color = 'primary'
}: StatsCardProps) {
    const colorStyles: Record<string, { bg: string; shadow: string }> = {
        primary: { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadow: 'rgba(139, 92, 246, 0.4)' },
        accent: { bg: 'linear-gradient(135deg, #14b8a6, #0d9488)', shadow: 'rgba(20, 184, 166, 0.4)' },
        success: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', shadow: 'rgba(34, 197, 94, 0.4)' },
        warning: { bg: 'linear-gradient(135deg, #f97316, #ea580c)', shadow: 'rgba(249, 115, 22, 0.4)' },
        info: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: 'rgba(59, 130, 246, 0.4)' }
    };

    const currentColor = colorStyles[color] || colorStyles.primary;

    return (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-neutral-900 mb-2">{value}</h3>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-neutral-500 font-normal">vs bulan lalu</span>
                        </div>
                    )}
                </div>
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-3xl flex-shrink-0"
                    style={{
                        background: currentColor.bg,
                        boxShadow: `0 8px 20px ${currentColor.shadow}`
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
