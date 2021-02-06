const redis = require('redis');
const { promisify } = require('util');
const { REDIS_HOST, REDIS_PORT, NODE_ENV } = process.env;
const host = NODE_ENV === 'development' ? '127.0.0.1' : REDIS_HOST;
const redisClient = redis.createClient(REDIS_PORT, host);

redisClient.on('ready', () => {
  console.log('Redis is ready!')
});

redisClient.on('error', () => {
  console.log('Error in Redis!')
});

redisClient.getCache = function (key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (err, reply) => {
      if (err) reject(err);
      if (reply !== null) {
        resolve(JSON.parse(reply));
      } else {
        const err = new Error('Get cache failed');
        err.status = 500;
        reject(err);
      }
    });
  });
};

const get = promisify(redisClient.get).bind(redisClient);
const set = promisify(redisClient.set).bind(redisClient);
const del = promisify(redisClient.del).bind(redisClient);

module.exports = {
  redisClient,
  get,
  set,
  del
}
