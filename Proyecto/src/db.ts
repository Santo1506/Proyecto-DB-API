// db.ts
import { Pool, type PoolConfig } from "pg"

const config: PoolConfig = {
  user: "estudiante",
  password: "pass123",
  host: "localhost",
  port: 5432,
  database: "universidad",
}

const pool = new Pool(config)

export default pool