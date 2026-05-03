
const { register, login, logout, me } = require('./controllers/auth');
const { getGenres } = require('./controllers/genres');
const { getTracks, getTrack, createTrack, deleteTrack } = require('./controllers/tracks')
const fs = require('fs');
const path = require('path');


const {
    getTracks: adminGetTracks,
    updateTrackStatus,
    getStats
} = require('./controllers/admin');


function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {})
            } catch {
                reject(new Error('Invalid JSON'))
            }
        })
    })
}

async function router(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost')
    const method = req.method

    if (method === 'GET' && pathname.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, pathname);

        if (!fs.existsSync(filePath)) {
            return sendJSON(res, 404, { error: 'Файл не найден' });
        }

        const ext = path.extname(filePath);
        const mimeTypes = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.flac': 'audio/flac',
            '.ogg': 'audio/ogg',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
        };

        res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream'
        });
        fs.createReadStream(filePath).pipe(res);
        return;
    }

    if (method === 'GET' && pathname === '/api/ping') {
        return sendJSON(res, 200, { message: 'pong' })
    }

    if (method === 'POST' && pathname === '/api/auth/register') {
        const body = await readBody(req)
        return register(req, res, body, sendJSON)
    }

    if (method === 'POST' && pathname === '/api/auth/login') {
        const body = await readBody(req)
        return login(req, res, body, sendJSON)
    }

    if (method === 'GET' && pathname === '/api/tracks') {
        return getTracks(req, res, sendJSON);
    }

    if (method === 'POST' && pathname === '/api/tracks') {
        return createTrack(req, res, sendJSON);
    }

    // Динамический маршрут /api/tracks/:id
    const trackMatch = pathname.match(/^\/api\/tracks\/(\d+)$/);
    if (trackMatch) {
        const id = parseInt(trackMatch[1]);

        if (method === 'GET') return getTrack(req, res, id, sendJSON);
        if (method === 'DELETE') return deleteTrack(req, res, id, sendJSON);
    }

    if (method === 'GET' && pathname === '/api/auth/me') {
        return me(req, res, sendJSON);
    }

    if (method === 'GET' && pathname === '/api/genres') {
        return getGenres(req, res, sendJSON);
    }

    if (method === 'GET' && pathname === '/api/admin/tracks') {
        return adminGetTracks(req, res, sendJSON);
    }

    if (method === 'GET' && pathname === '/api/admin/stats') {
        return getStats(req, res, sendJSON);
    }

    const adminTrackMatch = pathname.match(/^\/api\/admin\/tracks\/(\d+)$/);
    if (adminTrackMatch) {
        const id = parseInt(adminTrackMatch[1]);
        if (method === 'PUT') {
            const body = await readBody(req);
            return updateTrackStatus(req, res, id, body, sendJSON);
        }
    }

    sendJSON(res, 404, { error: 'Route doesnt exists' })




}

// Tracks


module.exports = router
module.exports.sendJSON = sendJSON
module.exports.readBody = readBody