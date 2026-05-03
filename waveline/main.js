import { api } from './api.js';
import './nav.js';
import './player.js';

// Загружаем треки при открытии страницы



// Форматируем число прослушиваний: 1200 → "1.2k"
function formatPlays(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// Форматируем секунды: 222 → "3:42"
function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Переключение фильтров
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('filter-btn--active');
    });
    btn.classList.add('filter-btn--active');

    const period = btn.dataset.period;
    loadTracks(period);
  });
});

// Запускаем
loadTracks();

function renderTracks(tracks) {
  const list = document.querySelector('.track-list');
  if (!list) return;

  if (!tracks.length) {
    list.innerHTML = '<p style="color:var(--clr-muted);padding:16px 0">Треков пока нет</p>';
    return;
  }

  list.innerHTML = tracks.map((t, i) => `
    <div class="track" data-index="${i}">
      <div class="track__cover" style="background:var(--clr-surface);"></div>
      <div class="track__info">
        <span class="track__title">${t.title}</span>
        <span class="track__artist">@${t.artist_name}</span>
      </div>
      <div class="track__meta">
        <span>${formatPlays(t.plays)}</span>
        <span>${formatDuration(t.duration)}</span>
      </div>
    </div>
  `).join('');

  // Клик по треку → запускаем очередь с этого места
  list.querySelectorAll('.track').forEach((el, i) => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      window.waveplayer.setQueue(currentTracks, i);
    });
  });
}

// Сохраняем треки для передачи в плеер
let currentTracks = [];

async function loadTracks(period = 'all') {
  try {
    const data = await api.getTracks({ period, limit: 20 });
    currentTracks = data.tracks;
    renderTracks(currentTracks);
  } catch (err) {
    console.error('Ошибка загрузки треков:', err);
  }
}