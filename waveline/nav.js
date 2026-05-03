import { api } from './api.js';

async function initNav() {
  const btnLogin = document.querySelector('.nav .btn');
  if (!btnLogin) return;

  try {
    const data = await api.me();
    const user = data.user;

    // Пользователь авторизован — меняем кнопку
    btnLogin.textContent = user.username;
    btnLogin.href = 'profile.html';

    // Добавляем кнопку выхода
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn';
    logoutBtn.textContent = 'Выйти';
    logoutBtn.style.marginLeft = '8px';

    logoutBtn.addEventListener('click', async () => {
      await api.logout();
      window.location.reload();
    });

    btnLogin.after(logoutBtn);

  } catch (err) {
    // 401 — не авторизован, кнопка остаётся "Войти"
  }
}

initNav();