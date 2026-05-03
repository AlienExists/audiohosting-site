const pool = require('../db')
const parseMultipart = require('../middleware/upload')
const authMiddleware = require('../middleware/auth')

// GET /api/tracks
async function getTracks(req, res, sendJSON) {
    try {
        const { searchParams } = new URL(req.url, 'http://localhost');
        const statusFilter = `AND t.status = 'approved'`;
        const period = searchParams.get('period') || 'all'; // week | month | all
        const genre = searchParams.get('genre') || null;
        const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
        const offset = parseInt(searchParams.get('offset')) || 0;

        // Фильтр по периоду
        let periodFilter = '';
        if (period === 'week') periodFilter = `AND t.created_at > NOW() - INTERVAL '7 days'`;
        if (period === 'month') periodFilter = `AND t.created_at > NOW() - INTERVAL '30 days'`;

        const genreFilter = genre ? `AND g.slug = '${genre}'` : '';

        const result = await pool.query(
            `SELECT
        t.id, t.title, t.file_url, t.cover_url,
        t.duration, t.plays, t.created_at,
        u.id   AS artist_id,
        u.username AS artist_name,
        g.name AS genre_name,
        g.slug AS genre_slug
       FROM tracks t
       JOIN users  u ON t.user_id  = u.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE 1=1 ${statusFilter} ${periodFilter} ${genreFilter}
       ORDER BY t.plays DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return sendJSON(res, 200, { tracks: result.rows });
    } catch (e) {
        console.error('getTracks error:', e);
        return sendJSON(res, 500, { error: 'Ошибка сервера' });
    }
}

// GET /api/tracks/:id
async function getTrack(req, res, id, sendJSON) {
    try {
        const statusFilter = `AND t.status = 'approved'`;
        const result = await pool.query(
            `SELECT
        t.id, t.title, t.file_url, t.cover_url,
        t.duration, t.plays, t.created_at,
        u.id   AS artist_id,
        u.username AS artist_name,
        g.name AS genre_name
       FROM tracks t
       JOIN users  u ON t.user_id  = u.id
       LEFT JOIN genres g ON t.genre_id = g.id
       WHERE t.id = $1`,
            [id]
        );

        if (!result.rows[0]) {
            return sendJSON(res, 404, { error: 'Трек не найден' });
        }

        // Увеличиваем счётчик прослушиваний
        await pool.query('UPDATE tracks SET plays = plays + 1 WHERE id = $1', [id]);

        return sendJSON(res, 200, { track: result.rows[0] });
    } catch (e) {
        console.error('getTrack error:', e);
        return sendJSON(res, 500, { error: 'Ошибка сервера' });
    }
}

// POST /api/tracks
async function createTrack(req, res, sendJSON) {
    // Проверяем авторизацию
    const userId = authMiddleware(req, res, sendJSON);
    if (!userId) return; // authMiddleware уже отправил 401

    try {
        const { fields, files } = await parseMultipart(req);

        const { title, genre_id } = fields;
        const audioFile = files.audio;

        if (!title || !audioFile) {
            return sendJSON(res, 400, { error: 'Название и аудиофайл обязательны' });
        }

        // Проверяем расширение файла
        const allowed = ['.mp3', '.wav', '.flac', '.ogg'];
        const ext = audioFile.url.slice(audioFile.url.lastIndexOf('.'));
        if (!allowed.includes(ext)) {
            return sendJSON(res, 400, { error: 'Недопустимый формат файла' });
        }

        const coverFile = files.cover || null;

        const result = await pool.query(
            `INSERT INTO tracks (user_id, genre_id, title, file_url, cover_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [
                userId,
                genre_id || null,
                title,
                audioFile.url,
                coverFile ? coverFile.url : null,
            ]
        );

        return sendJSON(res, 201, { track: result.rows[0] });
    } catch (e) {
        console.error('createTrack error:', e);
        return sendJSON(res, 500, { error: 'Ошибка сервера' });
    }
}

// DELETE /api/tracks/:id
async function deleteTrack(req, res, id, sendJSON) {
    const userId = authMiddleware(req, res, sendJSON);
    if (!userId) return;

    try {
        // Проверяем что трек принадлежит этому пользователю
        const check = await pool.query(
            'SELECT id FROM tracks WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (!check.rows[0]) {
            return sendJSON(res, 403, { error: 'Нет доступа' });
        }

        await pool.query('DELETE FROM tracks WHERE id = $1', [id]);
        return sendJSON(res, 200, { message: 'Трек удалён' });
    } catch (e) {
        console.error('deleteTrack error:', e);
        return sendJSON(res, 500, { error: 'Ошибка сервера' });
    }
}

module.exports = { getTracks, getTrack, createTrack, deleteTrack };