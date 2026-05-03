const audio     = document.getElementById('audioEl');
const playerEl  = document.getElementById('player');
const playBtn   = document.getElementById('playerPlay');
const prevBtn   = document.getElementById('playerPrev');
const nextBtn   = document.getElementById('playerNext');
const bar       = document.getElementById('playerBar');
const fill      = document.getElementById('playerFill');
const volInput  = document.getElementById('playerVolume');
const titleEl   = document.getElementById('playerTitle');
const artistEl  = document.getElementById('playerArtist');
const coverEl   = document.getElementById('playerCover');
const curEl     = document.getElementById('playerCurrent');
const durEl     = document.getElementById('playerDuration');

// Очередь треков и текущий индекс
let queue = [];
let currentIndex = -1;

// Форматируем секунды → "3:42"
function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Загрузить и играть трек по индексу
function playIndex(i) {
  if (i < 0 || i >= queue.length) return;
  currentIndex = i;
  const track = queue[i];

  audio.src = track.file_url;
  audio.volume = parseFloat(volInput.value);
  audio.play();

  titleEl.textContent  = track.title;
  artistEl.textContent = '@' + track.artist_name;

  // Обложка
  coverEl.innerHTML = track.cover_url
    ? `<img src="http://localhost:3000${track.cover_url}" alt="">`
    : '';

  playerEl.style.display = 'grid';
  playBtn.textContent = '⏸';
}

// Публичный API плеера — вызывается из других скриптов
window.waveplayer = {
  // Запустить один трек
  play(track) {
    queue = [track];
    playIndex(0);
  },
  // Загрузить список и запустить с позиции i
  setQueue(tracks, startIndex = 0) {
    queue = tracks;
    playIndex(startIndex);
  }
};

// Play / Pause
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = '⏸';
  } else {
    audio.pause();
    playBtn.textContent = '▶';
  }
});

// Prev / Next
prevBtn.addEventListener('click', () => playIndex(currentIndex - 1));
nextBtn.addEventListener('click', () => playIndex(currentIndex + 1));

// Прогресс
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  fill.style.width = pct + '%';
  curEl.textContent = fmt(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  durEl.textContent = fmt(audio.duration);
});

// Клик по прогресс-бару — перемотка
bar.addEventListener('click', (e) => {
  const rect = bar.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

// Громкость
volInput.addEventListener('input', () => {
  audio.volume = parseFloat(volInput.value);
});

// Автоматически следующий трек
audio.addEventListener('ended', () => {
  if (currentIndex < queue.length - 1) {
    playIndex(currentIndex + 1);
  } else {
    playBtn.textContent = '▶';
  }
});