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

/** Clave por IP + scope. */
export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${ip}`;
}
