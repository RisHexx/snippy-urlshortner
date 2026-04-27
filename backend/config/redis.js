const Redis = require('ioredis');

let redis = null;
let isRedisConnected = false;

const connectRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) {
        console.warn('Redis: Max reconnect attempts reached. Running without cache.');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    isRedisConnected = false;
    if (err.code !== 'ECONNREFUSED') {
      console.error('Redis error:', err.message);
    }
  });

  redis.on('close', () => {
    isRedisConnected = false;
  });

  // Attempt connection (non-blocking)
  redis.connect().catch((err) => {
    console.warn('⚠️  Redis not available — running without cache. Error:', err.message);
    isRedisConnected = false;
  });

  return redis;
};

/**
 * Get cached value by key (returns parsed JSON or null)
 */
const getCache = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis GET error:', err.message);
    return null;
  }
};

/**
 * Set cache with TTL in seconds
 */
const setCache = async (key, value, ttlSeconds = 300) => {
  if (!isRedisConnected) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis SET error:', err.message);
  }
};

/**
 * Delete a specific cache key
 */
const deleteCache = async (key) => {
  if (!isRedisConnected) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Redis DEL error:', err.message);
  }
};

/**
 * Delete all keys matching a pattern (e.g., "analytics:*")
 */
const deleteCachePattern = async (pattern) => {
  if (!isRedisConnected) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Redis DEL pattern error:', err.message);
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
};
