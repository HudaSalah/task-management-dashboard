import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';

/** Max number of automatic retries before giving up and surfacing the error. */
const MAX_RETRIES = 2;

/**
 * Functional HTTP interceptor providing two things every request in the
 * app gets for free, without any component having to ask for them:
 *
 * 1. **Automatic retry with backoff** — a request that fails (e.g. a
 *    dropped connection) is retried up to `MAX_RETRIES` times, waiting
 *    a little longer each time, before the error is allowed through.
 *    This quietly recovers from transient network blips; the manual
 *    "Retry" button in the UI (see `TaskService.reload()`) is the
 *    fallback for failures that persist past these automatic attempts.
 * 2. **Centralized error logging** — one place to log/transform HTTP
 *    errors, instead of a try/catch repeated in every service.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (_error, retryCount) => {
        console.warn(`Request to ${req.urlWithParams} failed — retrying (${retryCount}/${MAX_RETRIES})…`);
        return timer(retryCount * 500); // 500ms, then 1000ms
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error(`Request to ${req.urlWithParams} failed after ${MAX_RETRIES} retries:`, error.message);
      return throwError(() => error);
    })
  );
};