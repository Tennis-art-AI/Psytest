/* === NAV.JS — dropdown + бургер === */

document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('[data-mega-trigger]');
  const dropdown = document.querySelector('.nav-dd-menu');
  const burger = document.querySelector('.nav-burger');
  const nav = document.querySelector('.nav');

  // Dropdown
  if (trigger && dropdown) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== trigger) {
        dropdown.classList.remove('active');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dropdown.classList.remove('active');
    });
  }

  // Бургер мобайл
  if (burger && dropdown) {
    burger.addEventListener('click', () => {
      dropdown.classList.toggle('active');
      burger.classList.toggle('open');
    });
  }

  // Скрытие навбара при скролле вниз
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 100 && y > lastY) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastY = y;
  }, { passive: true });
});
