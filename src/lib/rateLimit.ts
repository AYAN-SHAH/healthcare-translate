const buckets = new Map<string, { count: number; start: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    buckets.set(key, { count: 1, start: now });
    return false;
  }
  if (b.count >= limit) return true;
  b.count++;
  return false;
}