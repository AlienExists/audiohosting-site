const { Pool } = require('pg')
require('dotenv').config()


const pool = new Pool ({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

pool.connect((err, client, release) => {
    if (err) {
        console.log('Ошибка подключения к БД:', err.message)
        return 
    }
    console.log('БД подключена успешно')
    release()
})

module.exports = pool