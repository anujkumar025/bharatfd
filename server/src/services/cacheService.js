import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.error("Redis error:", err));

export async function getFromCache(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

export async function setToCache(key, value, expiration) {
  return new Promise((resolve, reject) => {
    client.set(key, expiration, value, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
