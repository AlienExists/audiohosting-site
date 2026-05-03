import { api } from './api.js';
import './nav.js';

// Элементы
const dropzone      = document.getElementById('dropzone');
const audioInput    = document.getElementById('audioInput');
const audioSelected = document.getElementById('audioSelected');
const audioName     = document.getElementById('audioName');
const audioRemove   = document.getElementById('audioRemove');
const coverInput    = document.getElementById('coverInput');
const coverPreview  = document.getElementById('coverPreview');
const coverPlaceholder = document.getElementById('coverPlaceholder');
const trackTitle    = document.getElementById('trackTitle');
const trackGenre    = document.getElementById('trackGenre');
const submitBtn     = document.getElementById('submitBtn');
const uploadError   = document.getElementById('uploadError');

let audioFile = null;
let coverFile = null;

// ── Загружаем жанры из API ──────────────────────────────
async function loadGenres() {
  try {
    const data = await api.getGenres();
    data.genres.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      trackGenre.appendChild(opt);
    });
  } catch (e) {
    console.error('Не удалось загрузить жанры', e);
  }
}

loadGenres();

// ── Выбор аудиофайла ────────────────────────────────────
function setAudioFile(file) {
  if (!file) return;

  const allowed = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
  if (!allowed.includes(file.type)) {
    showError('Недопустимый формат. Используй MP3, WAV, FLAC или OGG');
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    showError('Файл слишком большой. Максимум 50 МБ');
    return;
  }

  audioFile = file;
  audioName.textContent = file.name;
  audioSelected.style.display = 'flex';
  dropzone.style.display = 'none';
  clearError();
  updateSubmitBtn();
}

// Клик по dropzone открывает выбор файла
dropzone.addEventListener('click', () => audioInput.click());
audioInput.addEventListener('change', () => setAudioFile(audioInput.files[0]));

// Drag and drop
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('drag-over');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('drag-over');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  setAudioFile(e.dataTransfer.files[0]);
});

// Убрать выбранный файл
audioRemove.addEventListener('click', () => {
  audioFile = null;
  audioInput.value = '';
  audioSelected.style.display = 'none';
  dropzone.style.display = 'flex';
  updateSubmitBtn();
});

// ── Выбор обложки ───────────────────────────────────────
coverInput.addEventListener('change', () => {
  const file = coverInput.files[0];
  if (!file) return;

  coverFile = file;

  // Показываем превью
  const reader = new FileReader();
  reader.onload = (e) => {
    coverPreview.src = e.target.result;
    coverPreview.style.display = 'block';
    coverPlaceholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

// ── Активируем кнопку только когда есть файл и название ─
trackTitle.addEventListener('input', updateSubmitBtn);

function updateSubmitBtn() {
  submitBtn.disabled = !(audioFile && trackTitle.value.trim());
}

// ── Отправка ─────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
  if (!audioFile || !trackTitle.value.trim()) return;

  const formData = new FormData();
  formData.append('title', trackTitle.value.trim());
  formData.append('audio', audioFile);

  if (coverFile)              formData.append('cover', coverFile);
  if (trackGenre.value)       formData.append('genre_id', trackGenre.value);

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Загружаем...';
    clearError();

    const data = await api.createTrack(formData);

    // Успех — переходим на главную
    window.location.href = 'index.html';

  } catch (err) {
    showError(err.error || 'Ошибка загрузки');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Загрузить трек';
  }
});

// ── Вспомогательные ──────────────────────────────────────
function showError(msg) {
  uploadError.textContent = msg;
  uploadError.style.display = 'block';
}

function clearError() {
  uploadError.style.display = 'none';
}