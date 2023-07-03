import { Redis } from "ioredis"
const redis = new Redis(process.env.SESSION_REDIS_DB_URL || "redis://127.0.0.1:6379");

export default redis