
'use strict';

const Redis = require('ioredis');

const redis = new Redis(
  process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false
  }
);

async function cacheGet(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

async function cacheSet(key, data, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    // Redis error: continue without caching
  }
}

async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (err) {
    // Redis error: continue without caching
  }
}

module.exports = { cacheGet, cacheSet, cacheDel, redis };
