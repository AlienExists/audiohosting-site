const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function parseMultipart(req) {
    return new Promise((resolve, reject) => {
        const contentType = req.headers['content-type'] || ''

        if (!contentType.includes('multipart/form-data')) {
            return reject(new Error('Не multipart/form-data'))
        }
        // Граница между частями — из заголовка Content-Type
        // Content-Type: multipart/form-data; boundary=----FormBoundaryXYZ

        const boundary = contentType.split('boundary=')[1]
        if (!boundary) return reject(new Error('Нет boundary'))

        const chunks = []
        req.on('data', chunk => chunks.push(chunk))
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks)
                const result = parseBuffer(buffer, boundary)
                resolve(result)
            } catch (e) {
                reject(e)
            }
        })

    })
}

function parseBuffer(buffer, boundary) {
    const fields = {}
    const files = {}

    const boundaryBuffer = Buffer.from('--' + boundary)
    const parts = splitBuffer(buffer, boundaryBuffer)

    for (const part of parts) {
        if (!part.length) continue

        const headerEnd = part.indexOf('\r\n\r\n')
        if (headerEnd === -1) continue

        const headerStr = part.slice(0, headerEnd).toString()
        const body = part.slice(headerEnd + 4)

        const content = body.slice(0, body.length - 2)

        const nameMatch = headerStr.match(/name="([^"]+)"/)
        const filenameMatch = headerStr.match(/filename="([^"]+)"/)

        if (!nameMatch) continue
        const fieldName = nameMatch[1]

        if (filenameMatch) {
            const originalName = filenameMatch[1]
            const ext = path.extname(originalName)
            const uniqueName = crypto.randomBytes(16).toString('hex') + ext
            const filePath = path.join(__dirname, '..', 'uploads', uniqueName)

            fs.writeFileSync(filePath, content)

            files[fieldName] = {
                originalName,
                path: filePath,
                url: `/uploads/${uniqueName}`,
                size: content.length
            }

        } else {
            fields[fieldName] = content.toString()
        }
    }
    return { fields, files }
}

function splitBuffer(buffer, delimiter) {
    const parts = [];
    let start = 0;

    while (true) {
        const idx = buffer.indexOf(delimiter, start);
        if (idx === -1) break;
        parts.push(buffer.slice(start, idx));
        start = idx + delimiter.length;
    }

    return parts;
}

module.exports = parseMultipart;