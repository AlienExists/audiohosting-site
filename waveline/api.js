const BASE_URL = '';

// Базовая функция запроса
async function request(method, path, body = null, isFormData = false) {
    const options = {
        method,
        credentials: 'include', // отправляем куки автоматически
    };

    if (body) {
        if (isFormData) {
            options.body = body; // FormData — браузер сам ставит Content-Type
        } else {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
        }
    }

    const res = await fetch(BASE_URL + path, options);
    const data = await res.json();

    if (!res.ok) throw { status: res.status, ...data };
    return data;
}

export const api = {
    // Auth
    register: (body) => request('POST', '/api/auth/register', body),
    login: (body) => request('POST', '/api/auth/login', body),
    logout: () => request('POST', '/api/auth/logout'),

    // Tracks
    getTracks: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request('GET', `/api/tracks${qs ? '?' + qs : ''}`);
    },
    getTrack: (id) => request('GET', `/api/tracks/${id}`),
    createTrack: (formData) => request('POST', '/api/tracks', formData, true),
    deleteTrack: (id) => request('DELETE', `/api/tracks/${id}`),
    me: () => request('GET', '/api/auth/me'),
    getGenres: () => request('GET', '/api/genres'),
    admin: {
        getStats: () => request('GET', '/api/admin/stats'),
        getTracks: (status) => request('GET', `/api/admin/tracks?status=${status}`),
        approve: (id) => request('PUT', `/api/admin/tracks/${id}`, { status: 'approved' }),
        reject: (id) => request('PUT', `/api/admin/tracks/${id}`, { status: 'rejected' }),
    },
};