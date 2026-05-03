
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Восстанавливаем тему при загрузке
  if (localStorage.getItem('theme') === 'dark') {
    html.classList.add('dark');
    toggle.textContent = '☾';
  }

  toggle.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    toggle.textContent = isDark ? '☾' : '☀';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
