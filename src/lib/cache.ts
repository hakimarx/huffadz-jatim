'use client';

/**
 * Simple in-memory cache with TTL support
 * For client-side caching of frequently accessed data
 */

interface CacheItem<T> {
    data: T;
    expiry: number;
}

class SimpleCache {
    private cache: Map<string, CacheItem<unknown>> = new Map();
    private maxSize: number = 100;

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    /**
     * Set item in cache with TTL (in seconds)
     */
    set<T>(key: string, data: T, ttlSeconds: number = 300): void {
        // LRU eviction if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + (ttlSeconds * 1000),
        });
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Delete item from cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Invalidate by prefix (useful for related data)
     */
    invalidateByPrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache stats
     */
    getStats(): { size: number; maxSize: number } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
        };
    }
}

// Singleton instance
export const cache = new SimpleCache();

// Cache keys constants
export const CACHE_KEYS = {
    HAFIZ_LIST: 'hafiz:list',
    HAFIZ_DETAIL: (id: string) => `hafiz:${id}`,
    HAFIZ_STATS: 'hafiz:stats',
    KABUPATEN_LIST: 'kabupaten:list',
    USER_PROFILE: (id: string) => `user:${id}`,
    LAPORAN_LIST: (hafizId: string) => `laporan:${hafizId}`,
} as const;

// TTL constants (in seconds)
export const CACHE_TTL = {
    SHORT: 60,        // 1 minute
    MEDIUM: 300,      // 5 minutes
    LONG: 900,        // 15 minutes
    VERY_LONG: 3600,  // 1 hour
} as const;

/**
 * Wrapper function for caching async data fetches
 */
export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    const data = await fetcher();
    cache.set(key, data, ttlSeconds);
    return data;
}
