// Date formatting utilities for Indonesian locale (DD/MM/YYYY)

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Format date with day name (Senin, 01/01/2024)
 */
export function formatDateWithDay(date: Date | string | null | undefined): string {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '-';

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[d.getDay()];

    return `${dayName}, ${formatDate(d)}`;
}

/**
 * Format date for display in Indonesian format
 */
export function formatDateLong(date: Date | string | null | undefined): string {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '-';

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '-';

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${formatDate(d)} ${hours}:${minutes}`;
}

/**
 * Parse DD/MM/YYYY string to Date object
 */
export function parseDateDDMMYYYY(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    if (isNaN(date.getTime())) return null;

    return date;
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD (for input type="date")
 */
export function toISODateString(dateStr: string): string {
    const date = parseDateDDMMYYYY(dateStr);
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY
 */
export function toDisplayDate(isoDateStr: string): string {
    if (!isoDateStr) return '';

    const parts = isoDateStr.split('-');
    if (parts.length !== 3) return isoDateStr;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
