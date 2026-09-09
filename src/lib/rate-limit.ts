/**
 * ============================================================
 *  SERVITOKEN · Rate limiting en memoria local
 * ============================================================
 *  Ventana deslizante simple para proteger endpoints sensibles
 *  (login, registro, transferencias, compras) contra abuso.
 * ============================================================
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

function cleanup(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

/** Devuelve true si la petición está permitida. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  cleanup(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Devuelve cuota consumida: cuando la petición termina en éxito
 * (p. ej. PIN correcto) se descuenta el intento para que solo
 * los FALLOS agoten el límite.
 */
export function refundRateLimit(key: string): void {
  const bucket = buckets.get(key);
  if (!bucket) return;
  bucket.count = Math.max(0, bucket.count - 1);
  if (bucket.count === 0) buckets.delete(key);
}

/**
 * Segundos restantes hasta que se libere la ventana (0 si la
 * petición siguiente pasaría con normalidad).
 */
export function rateLimitRetryAfter(key: string, limit: number): number {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < Date.now() || bucket.count < limit) return 0;
  return Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000));
}

/** Clave por IP + scope. */
export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${ip}`;
}
