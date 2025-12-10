// Cache strategies for different types of resources

export type CacheStrategy = 'network-first' | 'cache-first' | 'network-only' | 'cache-only';

export interface CacheConfig {
  cacheName: string;
  maxAge?: number; // in milliseconds
  maxEntries?: number;
}

// Network first, fallback to cache
export const networkFirst = async (
  request: Request,
  config: CacheConfig
): Promise<Response> => {
  const cache = await caches.open(config.cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

// Cache first, fallback to network
export const cacheFirst = async (
  request: Request,
  config: CacheConfig
): Promise<Response> => {
  const cache = await caches.open(config.cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Check if cache is still valid
    const cachedDate = cached.headers.get('date');
    if (cachedDate && config.maxAge) {
      const age = Date.now() - new Date(cachedDate).getTime();
      if (age > config.maxAge) {
        // Cache expired, fetch fresh
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Network failed, return stale cache
          return cached;
        }
      }
    }
    return cached;
  }
  
  // Not in cache, fetch from network
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
};

// Clean up old cache entries
export const cleanupCache = async (config: CacheConfig) => {
  const cache = await caches.open(config.cacheName);
  const keys = await cache.keys();
  
  if (config.maxEntries && keys.length > config.maxEntries) {
    // Remove oldest entries
    const entriesToRemove = keys.length - config.maxEntries;
    for (let i = 0; i < entriesToRemove; i++) {
      await cache.delete(keys[i]);
    }
  }
};
