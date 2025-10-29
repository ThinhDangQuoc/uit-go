import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Keys used in Redis
export const KEYS = {
  DRIVERS_LOCATIONS: 'drivers_locations',
  DRIVER_STATUS: 'driver_status:', // prefix for driver status
};

export default redis;