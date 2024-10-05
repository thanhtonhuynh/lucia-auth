import { headers } from 'next/headers';
import { RateLimitError } from './errors';

function getIp() {
  const forwardedFor = headers().get('x-forwarded-for');
  const realIp = headers().get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return null;
}

const trackers = new Map<string, { count: number; expiresAt: number }>();

const PRUNE_INTERVAL = 60 * 1000; // 1 minute

function pruneTrackers() {
  const now = Date.now();

  for (const [key, tracker] of trackers) {
    if (tracker.expiresAt < now) {
      trackers.delete(key);
    }
  }
}

setInterval(pruneTrackers, PRUNE_INTERVAL);

export async function rateLimitByIp({
  key = 'global',
  limit = 1,
  window = 10000,
}: {
  key: string;
  limit: number;
  window: number;
}) {
  const ip = getIp();

  if (!ip) {
    throw new RateLimitError();
  }

  await rateLimitByKey({
    key: `${ip}-${key}`,
    limit,
    window,
  });
}

export async function rateLimitByKey({
  key = 'global',
  limit = 1,
  window = 10000,
}: {
  key: string;
  limit: number;
  window: number;
}) {
  let tracker = trackers.get(key) || { count: 0, expiresAt: 0 };

  const now = Date.now();

  if (tracker.expiresAt < now) {
    tracker.count = 0;
    tracker.expiresAt = now + window;
  }

  tracker.count++;

  if (tracker.count > limit) {
    throw new RateLimitError();
  }

  trackers.set(key, tracker);
}
