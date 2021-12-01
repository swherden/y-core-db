//https://medium.com/@mhagemann/create-a-mysql-database-middleware-with-node-js-8-and-async-await-6984a09d49f4
//https://github.com/Talento90/organization-api/tree/master/organizations-api/src
import util from "util";
import { createPool } from "mysql";

export function init(configs) {
  var pool = createPool({
    host: configs.host,
    user: configs.user,
    connectionLimit: configs.connectionLimit,
    database: configs.database,
    debug: configs.debug,
    password: configs.password,
    port: configs.port,
  });

  pool.getConnection((err, connection) => {
    if (err) {
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed.");
      }
      if (err.code === "ER_CON_COUNT_ERROR") {
        console.error("Database has too many connections.");
      }
      if (err.code === "ECONNREFUSED") {
        console.error("Database connection was refused.");
      }
      console.error(err);
    }
    if (connection) connection.release();
    return;
  });
  pool.query = util.promisify(pool.query);
  return pool;
}
