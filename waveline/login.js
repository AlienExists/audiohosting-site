import { api } from './api.js';

const form = document.querySelector('.auth-form');
const tabs = document.querySelectorAll('.auth-tab');
const submitBtn = form.querySelector('button[type="submit"]');
const hintLink = document.querySelector('.auth-hint a');

let mode = 'login'; // 'login' | 'register'

// Переключение между входом и регистрацией
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('auth-tab--active'));
    tab.classList.add('auth-tab--active');

    mode = tab.dataset.mode;
    submitBtn.textContent = mode === 'login' ? 'Войти' : 'Зарегистрироваться';

    // Показываем/скрываем поле username
    const usernameGroup = document.querySelector('.form-group--username');
    if (usernameGroup) {
      usernameGroup.style.display = mode === 'register' ? 'flex' : 'none';
    }

    clearError();
  });
});

// Отправка формы
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const email    = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;
  const username = form.querySelector('input[name="username"]')?.value.trim();

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    if (mode === 'register') {
      await api.register({ username, email, password });
    } else {
      await api.login({ email, password });
    }

    // После успеха — на главную
    window.location.href = 'index.html';

  } catch (err) {
    showError(err.error || 'Что-то пошло не так');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === 'login' ? 'Войти' : 'Зарегистрироваться';
  }
});

function showError(msg) {
  let el = document.querySelector('.auth-error');
  if (!el) {
    el = document.createElement('p');
    el.className = 'auth-error';
    el.style.cssText = 'color:#e84040;font-size:13px;text-align:center;';
    form.prepend(el);
  }
  el.textContent = msg;
}

function clearError() {
  document.querySelector('.auth-error')?.remove();
}