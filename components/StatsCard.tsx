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
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        accent: 'from-accent-500 to-accent-600',
        success: 'from-green-500 to-green-600',
        warning: 'from-orange-500 to-orange-600',
        info: 'from-blue-500 to-blue-600'
    };

    return (
        <div className="card hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-neutral-900 mb-2">{value}</h3>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-neutral-500 font-normal">vs bulan lalu</span>
                        </div>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} 
          flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
