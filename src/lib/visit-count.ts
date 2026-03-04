import { Redis } from '@upstash/redis';

const KEY = 'retromanager_visits';

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function incrementVisitCount(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.incr(KEY);
  } catch {
    // ignore
  }
}

export async function getVisitCount(): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const n = await redis.get<number>(KEY);
    return typeof n === 'number' ? n : 0;
  } catch {
    return null;
  }
}
