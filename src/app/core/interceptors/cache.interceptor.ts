import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

/** How long a cached response stays valid before a fresh request is made again. */
const CACHE_TTL_MS = 30_000;

/**
 * In-memory cache, keyed by the full request URL (including query params).
 * Module-level `Map`, not a class field — this needs to survive across
 * every request, not reset per-component, so it lives outside any
 * injectable's instance state.
 */
const cache = new Map<string, CacheEntry>();

/**
 * Functional HTTP interceptor that serves GET requests from an in-memory
 * cache when a fresh-enough response already exists, instead of hitting
 * the network again.
 *
 * Only GET requests are cached — caching a POST/PUT/DELETE would be
 * actively wrong, since those are meant to have side effects every time.
 * This app's mock backend is read-only JSON files, so in practice this
 * only ever touches `/data/tasks.json` and `/data/statistics.json`, but
 * the interceptor is written generically so it stays correct if real
 * write endpoints are added later.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  const cached = cache.get(req.urlWithParams);
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

  if (isFresh) {
    // Return a clone — HttpResponse bodies can be consumed once, and this
    // same cached entry may be served to several callers.
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, { response: event, timestamp: Date.now() });
      }
    })
  );
};