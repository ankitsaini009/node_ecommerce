const pool = require('../utils/db');

/**
 * Search products by name or description using a LIKE query.
 * Uses prepared statements to avoid SQL injection.
 * Returns up to 5 rows.
 */
async function searchProducts(term) {
  const wildcard = `%${term}%`;
  const [rows] = await pool.execute(
    `SELECT id, name, description, price
     FROM products
     WHERE name LIKE ? OR description LIKE ?
     LIMIT 5`,
    [wildcard, wildcard]
  );
  return rows;
}

module.exports = { searchProducts };