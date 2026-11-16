(function () {
  'use strict';
  const I = window.NPHO_I18N;
  if (!I) return;
  const languages = [
    { code: 'ky', name: 'Кыргызча', flag: 'kg' },
    { code: 'ru', name: 'Русский', flag: 'ru' },
    { code: 'en', name: 'English', flag: 'gb' }
  ];
  const pickers = [];
  function closeAll(except) {
    pickers.forEach(p => {
      if (p === except) return;
      p.menu.hidden = true;
      p.trigger.setAttribute('aria-expanded', 'false');
    });
  }
  document.querySelectorAll('select[data-lang-select]').forEach((select, index) => {
    const wrap = document.createElement('div'); wrap.className = 'language-picker';
    const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'language-trigger';
    trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-haspopup', 'menu');
    const menu = document.createElement('div'); menu.className = 'language-menu'; menu.id = 'language-menu-' + index;
    menu.setAttribute('role', 'menu'); menu.hidden = true; trigger.setAttribute('aria-controls', menu.id);
    const buttons = languages.map(lang => {
      const button = document.createElement('button'); button.type = 'button'; button.setAttribute('role', 'menuitemradio');
      button.lang = lang.code; button.dataset.language = lang.code;
      const flag = document.createElement('img'); flag.src = '/assets/flags/' + lang.flag + '.svg'; flag.alt = ''; flag.width = 24; flag.height = 16;
      const label = document.createElement('span'); label.textContent = lang.name;
      const check = document.createElement('span'); check.className = 'language-check'; check.setAttribute('aria-hidden', 'true'); check.innerHTML = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>';
      button.append(flag, label, check);
      button.addEventListener('click', () => { I.setLang(lang.code); closeAll(); trigger.focus(); }); menu.append(button); return button;
    });
    const picker = { trigger, menu, buttons }; pickers.push(picker);
    trigger.addEventListener('click', () => {
      const opening = menu.hidden; closeAll(picker); menu.hidden = !opening; trigger.setAttribute('aria-expanded', String(opening));
      if (opening) buttons.find(b => b.dataset.language === I.lang)?.focus();
    });
    trigger.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); closeAll(picker); menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); buttons.find(b => b.dataset.language === I.lang)?.focus(); } });
    menu.addEventListener('keydown', event => {
      const i = buttons.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (i + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length].focus();
      }
      if (event.key === 'Escape') { event.preventDefault(); closeAll(); trigger.focus(); }
      if (event.key === 'Tab') closeAll();
    });
    trigger.disabled = select.disabled || I.LANGS.length < 2;
    wrap.append(trigger, menu); select.before(wrap); select.hidden = true;
  });
  function sync() {
    pickers.forEach(({ trigger, buttons }) => {
      const lang = languages.find(l => l.code === I.lang) || languages[1];
      trigger.replaceChildren();
      const flag = document.createElement('img'); flag.src = '/assets/flags/' + lang.flag + '.svg'; flag.alt = ''; flag.width = 24; flag.height = 16;
      const name = document.createElement('span'); name.textContent = lang.name;
      const chevron = document.createElement('span'); chevron.className = 'language-chevron'; chevron.setAttribute('aria-hidden', 'true'); chevron.innerHTML = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';
      trigger.append(flag, name, chevron); trigger.setAttribute('aria-label', I.t('lang.label') + ': ' + lang.name);
      buttons.forEach(b => b.setAttribute('aria-checked', String(b.dataset.language === I.lang)));
    });
    document.querySelectorAll('[data-site-link]').forEach(a => { a.href = I.langUrl(a.dataset.siteLink); });
    const active = document.querySelector('body>nav .nav-links .active');
    if (active) active.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.language-picker')) closeAll(); });
  document.addEventListener('npho:langchange', sync); sync();
})();
