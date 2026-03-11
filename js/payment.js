/* === PAYMENT.JS — модалка оплаты === */

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('payment-modal');
  if (!overlay) return;

  const modal = overlay.querySelector('.modal');
  const closeBtn = overlay.querySelector('.modal-close');
  const consentBox = overlay.querySelector('#consent-check');
  const payBtn = overlay.querySelector('.pay-btn');
  const nameEl = overlay.querySelector('.pm-name');
  const priceEl = overlay.querySelector('.pm-price');

  // Открытие модалки
  document.querySelectorAll('[data-pay]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.payName || 'Скрининг';
      const price = btn.dataset.payPrice || '499';
      const link = btn.dataset.payLink || '#';

      if (nameEl) nameEl.textContent = name;
      if (priceEl) priceEl.textContent = price + ' ₽';
      if (payBtn) {
        payBtn.href = link;
        payBtn.classList.add('disabled');
      }
      if (consentBox) consentBox.checked = false;

      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Чекбокс согласия
  if (consentBox && payBtn) {
    consentBox.addEventListener('change', () => {
      payBtn.classList.toggle('disabled', !consentBox.checked);
    });
  }

  // Закрытие
  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
});
