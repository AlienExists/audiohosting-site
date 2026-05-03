import { api } from './api.js';
import './nav.js';
import './player.js';

let currentTracks = [];
let currentPeriod = 'all';
let currentGenre  = '';

async function loadGenres() {
  try {
    const data = await api.getGenres();
    const select = document.getElementById('genreFilter');
    data.genres.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.slug;
      opt.textContent = g.name;
      select.appendChild(opt);
    });
  } catch (e) {}
}

async function loadTracks() {
  const list = document.getElementById('trackList');
  list.innerHTML = '<p style="color:var(--clr-muted)">Загружаем...</p>';

  try {
    const params = { period: currentPeriod, limit: 50 };
    if (currentGenre) params.genre = currentGenre;

    const data = await api.getTracks(params);
    currentTracks = data.tracks;
    renderTracks(currentTracks);
  } catch (e) {
    list.innerHTML = '<p style="color:var(--clr-muted)">Ошибка загрузки</p>';
  }
}

function renderTracks(tracks) {
  const list = document.getElementById('trackList');

  if (!tracks.length) {
    list.innerHTML = '<p style="color:var(--clr-muted);padding:16px 0">Треков нет</p>';
    return;
  }

  list.innerHTML = tracks.map((t, i) => `
    <div class="track" data-index="${i}" style="cursor:pointer">
      <div class="track__cover" style="background:var(--clr-surface);${t.cover_url ? `background-image:url(http://localhost:3000${t.cover_url});background-size:cover` : ''}"></div>
      <div class="track__info">
        <span class="track__title">${t.title}</span>
        <span class="track__artist">@${t.artist_name} ${t.genre_name ? '· ' + t.genre_name : ''}</span>
      </div>
      <div class="track__meta">
        <span>${formatPlays(t.plays)}</span>
        <span>${formatDuration(t.duration)}</span>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.track').forEach((el, i) => {
    el.addEventListener('click', () => window.waveplayer.setQueue(currentTracks, i));
  });
}

function formatPlays(n) {
  if (!n) return '0';
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
}

function formatDuration(s) {
  if (!s) return '—';
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

// Фильтры периода
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    currentPeriod = btn.dataset.period;
    loadTracks();
  });
});

// Фильтр жанра
document.getElementById('genreFilter').addEventListener('change', (e) => {
  currentGenre = e.target.value;
  loadTracks();
});

loadGenres();
loadTracks();