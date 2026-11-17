import mysql from 'mysql2/promise';

/**
 * Envuelve el pool de MySQL en una interfaz mínima { query, transaction, close }.
 * Los servicios dependen de esta interfaz (no de mysql2), lo que permite probarlos
 * con una base simulada.
 */
export function createDb(dbConfig) {
  const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
    decimalNumbers: true,
  });

  return {
    async query(sql, params = []) {
      const [rows] = await pool.query(sql, params);
      return rows;
    },
    async transaction(work) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const tx = {
          query: async (sql, params = []) => (await conn.query(sql, params))[0],
        };
        const result = await work(tx);
        await conn.commit();
        return result;
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    },
    close: () => pool.end(),
  };
}
