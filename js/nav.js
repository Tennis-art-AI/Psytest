/* === NAV.JS — мега-меню + бургер === */

document.addEventListener('DOMContentLoaded', () => {
  const menuTrigger = document.querySelector('[data-mega-trigger]');
  const megaMenu = document.querySelector('.mega-menu');
  const burger = document.querySelector('.nav-burger');
  const nav = document.querySelector('.nav');
  const crisisBar = document.querySelector('.crisis-bar');

  // Кризисная полоска — сдвиг навбара
  if (crisisBar) nav.classList.add('has-crisis');

  // Мега-меню десктоп
  if (menuTrigger && megaMenu) {
    menuTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      megaMenu.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!megaMenu.contains(e.target) && e.target !== menuTrigger) {
        megaMenu.classList.remove('active');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') megaMenu.classList.remove('active');
    });
  }

  // Бургер мобайл
  if (burger) {
    burger.addEventListener('click', () => {
      megaMenu.classList.toggle('active');
      burger.classList.toggle('open');
    });
  }

  // Скрытие навбара при скролле вниз
  let lastY = 0;
  const crisisH = crisisBar ? crisisBar.offsetHeight : 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 100 && y > lastY) {
      nav.style.transform = 'translateY(-100%)';
      if (crisisBar) crisisBar.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
      if (crisisBar) crisisBar.style.transform = 'translateY(0)';
    }
    lastY = y;
  }, { passive: true });
});
