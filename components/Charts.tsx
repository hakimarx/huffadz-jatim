'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface PieChartProps {
    data: {
        labels: string[];
        values: number[];
    };
    title?: string;
}

export function PieChartComponent({ data, title }: PieChartProps) {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Jumlah Pendaftar',
                data: data.values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',   // Indigo
                    'rgba(59, 130, 246, 0.8)',   // Blue
                    'rgba(14, 165, 233, 0.8)',   // Sky
                    'rgba(6, 182, 212, 0.8)',    // Cyan
                    'rgba(20, 184, 166, 0.8)',   // Teal
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(14, 165, 233, 1)',
                    'rgba(6, 182, 212, 1)',
                    'rgba(20, 184, 166, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
            },
        },
    };

    return <Pie data={chartData} options={options} />;
}

interface BarChartProps {
    data: {
        labels: string[];
        values: number[];
    };
    title?: string;
}

export function BarChartComponent({ data, title }: BarChartProps) {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Jumlah Pendaftar',
                data: data.values,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return <Bar data={chartData} options={options} />;
}
