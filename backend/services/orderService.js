const pool = require('../utils/db');

/**
 * Retrieve order row by id.
 * @param {string|number} orderId
 * @returns {Promise<object|null>}
 */
async function getOrderById(orderId) {
  const [rows] = await pool.execute(
    'SELECT id, status, total_amount, created_at FROM orders WHERE id = ?',
    [orderId]
  );
  return rows.length ? rows[0] : null;
}

/**
 * Return order status text or null if not found
 */
async function getOrderStatus(orderId) {
  const order = await getOrderById(orderId);
  return order ? order.status : null;
}

/**
 * Attempt to cancel an order by updating its status.
 * Returns an object with success flag and optional message.
 */
async function cancelOrder(orderId) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      'UPDATE orders SET status = ? WHERE id = ? AND status <> ?',
      ['cancelled', orderId, 'cancelled']
    );
    if (result.affectedRows === 0) {
      return { success: false, message: 'Order not found or already cancelled' };
    }
    return { success: true };
  } finally {
    conn.release();
  }
}

module.exports = { getOrderById, getOrderStatus, cancelOrder };