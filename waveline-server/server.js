const http = require('http')
const router = require('./router')

const PORT = process.env.PORT || 3000
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

 

const server = http.createServer((req, res) => {
   
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes(origin) ? origin : allowedOrigins[0])
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
    }

    router(req, res)
})

server.listen(PORT, () => {
     console.log(`Сервер запущен: http://localhost:${PORT}`)
})



