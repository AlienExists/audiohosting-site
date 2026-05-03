const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Проверка что пользователь — админ
async function requireAdmin(req, res, sendJSON) {
  const userId = authMiddleware(req, res, sendJSON);
  if (!userId) return null;

  const result = await pool.query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );

  if (!result.rows[0] || result.rows[0].role !== 'admin') {
    sendJSON(res, 403, { error: 'Нет доступа' });
    return null;
  }

  return userId;
}

// GET /api/admin/tracks?status=pending
async function getTracks(req, res, sendJSON) {
  const adminId = await requireAdmin(req, res, sendJSON);
  if (!adminId) return;

  try {
    const { searchParams } = new URL(req.url, 'http://localhost');
    const status = searchParams.get('status') || 'pending';

    const result = await pool.query(
      `SELECT
        t.id, t.title, t.file_url, t.cover_url,
        t.duration, t.plays, t.status, t.created_at,
        u.id       AS artist_id,
        u.username AS artist_name,
        u.email    AS artist_email,
        g.name     AS genre_name
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE t.status = $1
       ORDER BY t.created_at DESC`,
      [status]
    );

    return sendJSON(res, 200, { tracks: result.rows });
  } catch (e) {
    console.error('admin getTracks error:', e);
    return sendJSON(res, 500, { error: 'Ошибка сервера' });
  }
}

// PUT /api/admin/tracks/:id — approve или reject
async function updateTrackStatus(req, res, id, body, sendJSON) {
  const adminId = await requireAdmin(req, res, sendJSON);
  if (!adminId) return;

  try {
    const { status } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return sendJSON(res, 400, { error: 'Статус должен быть approved или rejected' });
    }

    const result = await pool.query(
      `UPDATE tracks SET status = $1 WHERE id = $2 RETURNING id, title, status`,
      [status, id]
    );

    if (!result.rows[0]) {
      return sendJSON(res, 404, { error: 'Трек не найден' });
    }

    return sendJSON(res, 200, { track: result.rows[0] });
  } catch (e) {
    console.error('admin updateTrackStatus error:', e);
    return sendJSON(res, 500, { error: 'Ошибка сервера' });
  }
}

// GET /api/admin/stats — общая статистика
async function getStats(req, res, sendJSON) {
  const adminId = await requireAdmin(req, res, sendJSON);
  if (!adminId) return;

  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)                          AS total_users,
        (SELECT COUNT(*) FROM tracks)                         AS total_tracks,
        (SELECT COUNT(*) FROM tracks WHERE status = 'pending')   AS pending_tracks,
        (SELECT COUNT(*) FROM tracks WHERE status = 'approved')  AS approved_tracks,
        (SELECT COUNT(*) FROM tracks WHERE status = 'rejected')  AS rejected_tracks,
        (SELECT SUM(plays) FROM tracks)                       AS total_plays
    `);

    return sendJSON(res, 200, { stats: result.rows[0] });
  } catch (e) {
    console.error('admin getStats error:', e);
    return sendJSON(res, 500, { error: 'Ошибка сервера' });
  }
}

module.exports = { getTracks, updateTrackStatus, getStats };