import {createClient} from 'redis'
import {redisConfig} from '../config.js'
import logger from '../core/logger.js'
console.log("1. REDIS MODULE LOADED");

const redisUrl = "redis://127.0.0.1:6379"
  // `redis://:${redisConfig.redis_password}@${redisConfig.redis_host}:${redisConfig.redis_port}`;

console.log("2. REDIS CONFIG LOADED", {
  host: redisConfig.redis_host,
  port: redisConfig.redis_port,
  passwordExists: Boolean(redisConfig.redis_password),
});

const client = createClient({ url: redisUrl });

console.log("3. REDIS CLIENT CREATED");

client.on("connect", () => console.log("REDIS CONNECTING"));
client.on("ready", () => console.log("REDIS READY"));

client.on("error", (err) => {
  console.error("REDIS ERROR:", err);
});

client.on("reconnecting", () => console.log("REDIS RECONNECTING"));

async function redisConnect() {
  console.log("4. redisConnect() CALLED");

  try {
    console.log("5. CONNECT STARTED");
    await client.connect();
    console.log("6. CONNECT SUCCESS");
  } catch (error) {
    console.error("REDIS CONNECTION FAILED:", error);
    setTimeout(redisConnect, 5000);
  }
}

void redisConnect();
export default client