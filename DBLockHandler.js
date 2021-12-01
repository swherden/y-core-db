import log, { errorLog } from "../y-core-loghandler";

class DBLockHandler {
  #dbPool;

  constructor(pool) {
    this.#dbPool = pool;
  }

  unlockAll(TOPIC) {
    this.#dbPool.query(
      "DELETE FROM job_locks WHERE shop_domain is not null AND job_type=?",
      [TOPIC],
      (err, result) => {
        if (err) errorLog("ERROR - clearing locks" + err, "ALL", TOPIC);
        if (result)
          log("INFO - job locks cleared: " + result.affectedRows, "ALL", TOPIC);
      }
    );
  }

  lockAndProceedAndUnlock(shop_domain, TOPIC, next) {
    this.#dbPool.query(
      "INSERT INTO job_locks (shop_domain, job_type, created_at) VALUES (?, ?, now())",
      [shop_domain, TOPIC],
      async (err, result) => {
        if (err) {
          log("INFO - Job already running!", shop_domain, TOPIC);
          return;
        }
        if (result.affectedRows == 1) {
          next(() => {
            //unlock callback
            this.#dbPool.query(
              "DELETE FROM job_locks WHERE shop_domain = ? AND job_type = ?",
              [shop_domain, TOPIC],
              (err, result) => {
                if (err) errorLog("Cannot unlock", shop_domain, TOPIC);
                // if (result) log("Unlocked", shop_domain, topic);
              }
            );
          });
        }
      }
    );
  }
}

module.exports = DBLockHandler;
