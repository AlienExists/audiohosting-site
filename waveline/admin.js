import { api } from './api.js';
import './nav.js';
import './player.js';

let currentStatus = 'pending';

// Загрузка статистики
async function loadStats() {
  try {
    const data = await api.admin.getStats();
    const s = data.stats;
    document.getElementById('statUsers').textContent    = s.total_users;
    document.getElementById('statTracks').textContent   = s.total_tracks;
    document.getElementById('statPending').textContent  = s.pending_tracks;
    document.getElementById('statApproved').textContent = s.approved_tracks;
    document.getElementById('statRejected').textContent = s.rejected_tracks;
    document.getElementById('statPlays').textContent    =
      s.total_plays >= 1000
        ? (s.total_plays / 1000).toFixed(1) + 'k'
        : (s.total_plays || 0);
  } catch (e) {
    if (e.status === 403) {
      document.querySelector('main').innerHTML =
        '<div style="padding:64px;text-align:center;color:var(--clr-muted)">Нет доступа. Войдите как администратор.</div>';
    }
  }
}

// Загрузка треков
async function loadTracks() {
  const list = document.getElementById('adminTrackList');
  list.innerHTML = '<p style="color:var(--clr-muted);padding:16px 0">Загружаем...</p>';

  try {
    const data = await api.admin.getTracks(currentStatus);
    renderTracks(data.tracks);
  } catch (e) {
    list.innerHTML = '<p style="color:var(--clr-muted)">Ошибка загрузки</p>';
  }
}

function renderTracks(tracks) {
  const list = document.getElementById('adminTrackList');

  if (!tracks.length) {
    list.innerHTML = '<p style="color:var(--clr-muted);padding:16px 0">Треков нет</p>';
    return;
  }

  list.innerHTML = tracks.map(t => `
    <div class="admin-track" data-id="${t.id}">
      <div class="admin-track__cover" style="${t.cover_url ? `background:url(http://localhost:3000${t.cover_url}) center/cover` : 'background:var(--clr-surface)'}"></div>

      <div class="admin-track__info">
        <span class="admin-track__title">${t.title}</span>
        <span class="admin-track__meta">
          @${t.artist_name} · ${t.artist_email}
          ${t.genre_name ? '· ' + t.genre_name : ''}
          · ${new Date(t.created_at).toLocaleDateString('ru')}
        </span>
      </div>

      <span class="admin-track__status admin-track__status--${t.status}">
        ${{ pending: 'На проверке', approved: 'Одобрен', rejected: 'Отклонён' }[t.status]}
      </span>

      <div class="admin-track__actions">
        <button class="btn btn--approve" data-action="approve" data-id="${t.id}"
          ${t.status === 'approved' ? 'disabled style="opacity:.4"' : ''}>
          ✓ Одобрить
        </button>
        <button class="btn btn--reject" data-action="reject" data-id="${t.id}"
          ${t.status === 'rejected' ? 'disabled style="opacity:.4"' : ''}>
          ✕ Отклонить
        </button>
      </div>
    </div>
  `).join('');

  // Обработчики кнопок
  list.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id     = parseInt(btn.dataset.id);
      const action = btn.dataset.action;

      btn.disabled = true;
      btn.textContent = '...';

      try {
        if (action === 'approve') await api.admin.approve(id);
        else                      await api.admin.reject(id);

        // Обновляем список и статистику
        await Promise.all([loadTracks(), loadStats()]);
      } catch (e) {
        btn.disabled = false;
        btn.textContent = action === 'approve' ? '✓ Одобрить' : '✕ Отклонить';
        alert(e.error || 'Ошибка');
      }
    });
  });
}

// Переключение статусов
document.querySelectorAll('[data-status]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-status]').forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    currentStatus = btn.dataset.status;
    loadTracks();
  });
});

loadStats();
loadTracks();