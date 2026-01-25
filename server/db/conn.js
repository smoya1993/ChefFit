const { pool } = require("./pool");
const { ensureSchema } = require("./schema");

const connectDB = async () => {
  // Validate DB connectivity early
  await pool.query("SELECT 1");
  // Ensure required tables exist (idempotent)
  await ensureSchema(pool);

  if (process.env.DEBUG_DB === "1") {
    try {
      const info = await pool.query(
        `SELECT
          current_database() AS db,
          current_schema() AS schema,
          inet_server_addr() AS server_addr,
          inet_server_port() AS server_port,
          inet_client_addr() AS client_addr
        `
      );
      const counts = await pool.query(`SELECT COUNT(*)::int AS users_count FROM users`);
      console.log("[DB] connected", { ...info.rows[0], ...counts.rows[0] });
    } catch (e) {
      console.log("[DB] debug query failed", { message: e?.message });
    }
  }

  return pool;
};

module.exports = connectDB;
