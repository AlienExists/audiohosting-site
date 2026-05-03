const bcrypt = require('bcrypt')
const pool = require('../db.js')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60


function setTokenCookie(res, token) {
    const cookie = [
        `token=${token}`,
        `Max-Age=${COOKIE_MAX_AGE}`,
        'HttpOnly',
        'Path=/',
        'SameSite=Strict'
    ].join('; ')

    res.setHeader('Set-Cookie', cookie)
}


async function register(req, res, body, sendJSON) {
    try {
        // let username = body.username
        // let email = body.email
        // let password = body.password
        const { username, email, password } = body

        if (!username || !email || !password) {
            return sendJSON(res, 400, { error: 'Поля должны быть не пусты' })
        }

        if (password.length < 6) {
            return sendJSON(res, 400, { error: 'Пароль должен содержать минимум 6 символов ' })
        }

        const hash = await bcrypt.hash(password, 10)

        const result = await pool.query(
            `INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email`,
            [username, email, hash]
        )

        const user = result.rows[0]

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        setTokenCookie(res, token)

        return sendJSON(res, 201, {
            user: { id: user.id, username: user.username, email: user.email }
        })
    } catch (e) {
        if (e.code === '23505') {
            return sendJSON(res, 409, { error: 'Email или username уже занят' })
        }
        console.error('register error:', e)
        return sendJSON(res, 500, { error: 'Ошибка сервера' })
    }
}

async function login(req, res, body, sendJSON) {
    try {
        const { email, password } = body
        const result = await pool.query(
            
            `SELECT * FROM users WHERE email=$1`,
            [email]
        )
        const user = result.rows[0]

        console.log(result.rows)

        if (!user) {
            return sendJSON(res, 401, { error: 'Неверный email или пароль' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return sendJSON(res, 401, { error: 'Неверный email или пароль' })
        }

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        setTokenCookie(res, token)
        return sendJSON(res, 200, {
            user: { id: user.id, username: user.username, email: user.email }
        })

    } catch (e) {
        console.error('login error:', e);
        return sendJSON(res, 500, { error: 'Ошибка сервера' });
    }


}

async function logout(req, res, body, sendJSON) {
    // Перезаписываем куку с истёкшим сроком — браузер удалит её
    res.setHeader('Set-Cookie', 'token=; Max-Age=0; HttpOnly; Path=/; SameSite=Strict')
    return sendJSON(res, 200, { message: 'Вышел успешно' })
}

// GET /api/auth/me
async function me(req, res, sendJSON) {
  const authMiddleware = require('../middleware/auth');
  const userId = authMiddleware(req, res, sendJSON);
  if (!userId) return;

  try {
    const result = await pool.query(
      'SELECT id, username, email, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows[0]) {
      return sendJSON(res, 404, { error: 'Пользователь не найден' });
    }

    return sendJSON(res, 200, { user: result.rows[0] });
  } catch (e) {
    console.error('me error:', e);
    return sendJSON(res, 500, { error: 'Ошибка сервера' });
  }
}

module.exports = { register, login, logout, me };