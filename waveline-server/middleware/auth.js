const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

function parseCookies(req) {
    const header = req.headers.cookie || ''
    return Object.fromEntries(
        header.split(';').map(c => {
            const [key, ...val] = c.trim().split('=')
            return [key, val.join('=')]
        })
    )
}

function authMiddleware(req, res, sendJSON) {
    const cookies = parseCookies(req)
    const token = cookies.token

    if(!token) {
        sendJSON(res, 401, { error: 'Необходима авторизация' })
        return null
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        return payload.userId
    } catch (e) {
        sendJSON(res, 401, { error: 'Токен недействителен или истек' })
        return null
    }
}

module.exports = authMiddleware