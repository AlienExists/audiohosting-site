const pool = require('../db');

async function getGenres(req, res, sendJSON) {
  try {
    const result = await pool.query(
      'SELECT id, name, slug FROM genres ORDER BY name'
    );
    return sendJSON(res, 200, { genres: result.rows });
  } catch (e) {
    console.error('getGenres error:', e);
    return sendJSON(res, 500, { error: 'Ошибка сервера' });
  }
}

module.exports = { getGenres };