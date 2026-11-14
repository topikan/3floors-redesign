/* 3 ЭТАЖА — интерактив */
(() => {
  'use strict';

  /* ---------- настройки отправки форм ----------
     FORM_ENDPOINT — адрес обработчика (например, https://formspree.io/f/XXXX).
     Если пусто — заявка открывается письмом на info@3floors.ru. */
  const FORM_ENDPOINT = '';
  const FORM_EMAIL = 'info@3floors.ru';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- header ---------- */
  const header = $('#header');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > 500 && y > lastY && !document.body.classList.contains('lock'));
    lastY = y;
    $('#toTop').classList.toggle('is-visible', y > 900);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- burger ---------- */
  const burger = $('#burger'), nav = $('#nav');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('lock', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a, button', nav).forEach(el => el.addEventListener('click', () => setMenu(false)));

  /* ---------- active nav link ---------- */
  const links = $$('.nav__link');
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['novostroyki', 'services', 'mortgage', 'about', 'reviews', 'contacts'].forEach(id => { const s = document.getElementById(id); s && secObs.observe(s); });

  /* ---------- reveal ---------- */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); revObs.unobserve(e.target); } });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => revObs.observe(el));

  /* ---------- hero slider ---------- */
  const slides = $$('.hero__slide'), texts = $$('.hero__text');
  const cur = $('#heroCur'), prog = $('#heroProgress');
  const DUR = 7000;
  let idx = 0, start = performance.now(), paused = false, pausedAt = 0;
  const isMobile = () => matchMedia('(max-width:760px)').matches;
  const go = n => {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    texts.forEach((t, i) => t.classList.toggle('is-active', i === idx));
    cur.textContent = String(idx + 1).padStart(2, '0');
    start = performance.now();
  };
  $$('.hero__nav').forEach(b => b.addEventListener('click', () => go(idx + +b.dataset.dir)));
  const tick = now => {
    if (!paused && !reduce) {
      const p = Math.min((now - start) / DUR, 1);
      prog.style.transform = isMobile() ? `scaleX(${p})` : `scaleY(${p})`;
      if (p >= 1) go(idx + 1);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { paused = true; pausedAt = performance.now(); }
    else { start += performance.now() - pausedAt; paused = false; }
  });
  // swipe
  let tx = null;
  const hero = $('#hero');
  hero.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  hero.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    tx = null;
  });
  // parallax
  if (!reduce && matchMedia('(hover:hover)').matches) {
    const box = $('.hero__slides');
    hero.addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - .5) * -14, y = (e.clientY / innerHeight - .5) * -10;
      box.style.transform = `translate3d(${x}px,${y}px,0) scale(1.03)`;
    });
    box.style.transition = 'transform .6s cubic-bezier(.22,.8,.24,1)';
  }

  /* ---------- about more ---------- */
  const more = $('#aboutMore'), det = $('#aboutDetails');
  more.addEventListener('click', () => {
    const open = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', open);
    det.hidden = !open;
    more.firstChild.textContent = open ? 'Свернуть ' : 'Узнать больше ';
  });

  /* ---------- service cards (tap to flip on touch) ---------- */
  $$('.service').forEach(card => {
    card.addEventListener('click', () => {
      const was = card.classList.contains('is-open');
      $$('.service').forEach(c => c.classList.remove('is-open'));
      if (!was) card.classList.add('is-open');
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
  });

  /* ---------- carousel ---------- */
  const track = $('#complexTrack'), dotsBox = $('#complexDots');
  const prevB = $('.carousel__btn--prev'), nextB = $('.carousel__btn--next');
  const visibleCards = () => $$('.complex', track).filter(c => !c.classList.contains('is-hidden'));
  const step = () => { const c = visibleCards()[0]; return c ? c.getBoundingClientRect().width + 18 : 300; };
  const buildDots = () => {
    dotsBox.innerHTML = '';
    visibleCards().forEach((c, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Слайд ${i + 1}`);
      b.addEventListener('click', () => track.scrollTo({ left: c.offsetLeft - track.firstElementChild.offsetLeft, behavior: 'smooth' }));
      dotsBox.appendChild(b);
    });
    updCar();
  };
  const updCar = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prevB.disabled = track.scrollLeft <= 2;
    nextB.disabled = track.scrollLeft >= max;
    const i = Math.round(track.scrollLeft / step());
    $$('button', dotsBox).forEach((d, k) => d.classList.toggle('is-active', k === Math.min(i, visibleCards().length - 1)));
  };
  [prevB, nextB].forEach(b => b.addEventListener('click', () => track.scrollBy({ left: step() * +b.dataset.dir, behavior: 'smooth' })));
  track.addEventListener('scroll', () => requestAnimationFrame(updCar), { passive: true });
  addEventListener('resize', updCar);
  // drag with mouse
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
    track.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    track.classList.remove('is-drag');
    if (moved) { const s = step(); track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' }); }
  });
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  buildDots();

  /* ---------- mortgage calc ---------- */
  const fmt = n => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n));
  const plural = (n, f) => { const a = n % 10, b = n % 100; return f[(a === 1 && b !== 11) ? 0 : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? 1 : 2]; };
  const inp = { price: $('#price'), down: $('#down'), term: $('#term'), rate: $('#rate') };
  const fill = el => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
  const animateNum = (el, to) => {
    const from = +el.dataset.v || 0; el.dataset.v = to;
    if (reduce) { el.textContent = fmt(to) + ' ₽'; return; }
    const t0 = performance.now();
    const f = t => { const p = Math.min((t - t0) / 450, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(from + (to - from) * e) + ' ₽'; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  const calc = () => {
    const P = +inp.price.value, d = +inp.down.value, T = +inp.term.value, R = +inp.rate.value;
    Object.values(inp).forEach(fill);
    $('#oPrice').textContent = fmt(P) + ' ₽';
    $('#oDown').textContent = `${d}% · ${fmt(P * d / 100)} ₽`;
    $('#oTerm').textContent = `${T} ${plural(T, ['год', 'года', 'лет'])}`;
    $('#oRate').textContent = R.toFixed(1).replace('.', ',') + ' %';
    const loan = P * (1 - d / 100), n = T * 12, r = R / 1200;
    const m = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
    const total = m * n, over = total - loan;
    animateNum($('#rMonthly'), m);
    $('#rLoan').textContent = fmt(loan) + ' ₽';
    $('#rOver').textContent = fmt(over) + ' ₽';
    $('#rTotal').textContent = fmt(total) + ' ₽';
    $('#rIncome').textContent = 'от ' + fmt(m / 0.5) + ' ₽';
    $('#rBar').style.width = (total ? loan / total * 100 : 100) + '%';
  };
  Object.values(inp).forEach(i => i.addEventListener('input', calc));
  calc();

  /* ---------- reviews ---------- */
  const rTrack = $('#reviewsTrack');
  $$('[data-rev]').forEach(b => b.addEventListener('click', () => {
    const card = $('.review', rTrack), w = card.getBoundingClientRect().width + 18;
    const max = rTrack.scrollWidth - rTrack.clientWidth - 2;
    const dir = +b.dataset.rev;
    if (dir > 0 && rTrack.scrollLeft >= max) rTrack.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && rTrack.scrollLeft <= 2) rTrack.scrollTo({ left: max, behavior: 'smooth' });
    else rTrack.scrollBy({ left: w * dir, behavior: 'smooth' });
  }));
  // avatar fallback
  $$('img.avatar').forEach(img => {
    const fb = () => {
      const s = document.createElement('span');
      s.className = 'avatar-fallback'; s.textContent = img.dataset.initials || '';
      s.setAttribute('aria-hidden', 'true');
      img.replaceWith(s);
    };
    if (img.complete && !img.naturalWidth) fb(); else img.addEventListener('error', fb);
  });

  /* ---------- map (lazy) ---------- */
  const loadMap = () => {
    const m = $('#map');
    if (m.querySelector('iframe')) return;
    const f = document.createElement('iframe');
    f.src = 'https://yandex.ru/map-widget/v1/?text=' + encodeURIComponent('Бузулук, улица Московская, 2Г') + '&z=16';
    f.title = 'Карта: Бузулук, ул. Московская, 2Г';
    f.loading = 'lazy';
    f.allowFullscreen = true;
    m.appendChild(f);
    $('#mapLoad')?.remove();
  };
  $('#mapLoad').addEventListener('click', loadMap);
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { loadMap(); o.disconnect(); } }, { rootMargin: '200px' }).observe($('#map'));

  /* ---------- modals ---------- */
  let lastFocus = null;
  const openModal = (id, subject) => {
    const m = document.getElementById('modal-' + id);
    if (!m) return;
    lastFocus = document.activeElement;
    if (id === 'consult') {
      const s = $('#consultSubject'), h = $('input[name=subject]', m);
      s.textContent = subject ? `Расскажем всё о предложении: ${subject}.` : 'Перезвоним в течение рабочего дня и ответим на все вопросы.';
      h.value = subject || 'Консультация';
      resetForm($('form', m));
    }
    if (id === 'quiz') quizGo(1, true);
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    setTimeout(() => $('input:not([type=hidden]), button', $('.modal__box', m))?.focus(), 350);
  };
  const closeModal = m => {
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
    lastFocus?.focus();
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); openModal(t.dataset.modal, t.dataset.subject); }
    const c = e.target.closest('[data-close]');
    if (c) closeModal(c.closest('.modal'));
  });
  document.addEventListener('keydown', e => {
    const m = $('.modal.is-open');
    if (!m) return;
    if (e.key === 'Escape') closeModal(m);
    if (e.key === 'Tab') { // focus trap
      const f = $$('button, input, textarea, a[href]', m).filter(x => !x.disabled && x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- quiz ---------- */
  const quiz = $('#quiz'), qSteps = $$('.quiz__step', quiz), qBack = $('#quizBack');
  let qi = 1;
  const quizGo = (n, reset) => {
    if (reset) { $$('input[type=radio]', quiz).forEach(r => r.checked = false); const f = $('form', quiz); resetForm(f); }
    qi = n;
    qSteps.forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
    $('#quizStep').textContent = n;
    $('#quizBar').style.width = n * 25 + '%';
    qBack.disabled = n === 1;
    qBack.parentElement.hidden = false;
  };
  $$('input[type=radio]', quiz).forEach(r => r.addEventListener('change', () => setTimeout(() => quizGo(qi + 1), 280)));
  qBack.addEventListener('click', () => qi > 1 && quizGo(qi - 1));

  /* ---------- phone mask ---------- */
  $$('[data-phone]').forEach(inpEl => {
    inpEl.addEventListener('input', () => {
      let d = inpEl.value.replace(/\D/g, '');
      if (!d) { inpEl.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      let v = '+7';
      if (d.length > 1) v += ' (' + d.slice(1, 4);
      if (d.length >= 4) v += ')';
      if (d.length > 4) v += ' ' + d.slice(4, 7);
      if (d.length > 7) v += '-' + d.slice(7, 9);
      if (d.length > 9) v += '-' + d.slice(9, 11);
      inpEl.value = v;
    });
    inpEl.addEventListener('focus', () => { if (!inpEl.value) inpEl.value = '+7 ('; });
    inpEl.addEventListener('blur', () => { if (inpEl.value.replace(/\D/g, '').length <= 1) inpEl.value = ''; });
  });

  /* ---------- forms ---------- */
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('is-visible'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-visible'), 3500); };
  const resetForm = f => {
    if (!f) return;
    const s = f.parentElement.querySelector('.success'); s && s.remove();
    f.hidden = false; f.reset();
    $$('.is-error', f).forEach(x => x.classList.remove('is-error'));
  };
  const validate = f => {
    let ok = true;
    $$('[required]', f).forEach(el => {
      const wrap = el.closest('.field, .check');
      let bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
      if (el.dataset.phone !== undefined) bad = el.value.replace(/\D/g, '').length !== 11;
      wrap.classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    return ok;
  };
  $$('form[data-form]').forEach(f => {
    f.addEventListener('input', e => e.target.closest('.is-error')?.classList.remove('is-error'));
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(f)) { toast('Проверьте, пожалуйста, заполнение полей'); return; }
      const data = Object.fromEntries(new FormData(f));
      if (f.dataset.quiz !== undefined) {
        $$('input[type=radio]:checked', quiz).forEach(r => data[r.name] = r.value);
      }
      delete data.agree;
      const btn = $('button[type=submit]', f);
      btn.disabled = true;
      try {
        if (FORM_ENDPOINT) {
          const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error();
        } else {
          const labels = { subject: 'Тема', name: 'Имя', phone: 'Телефон', comment: 'Комментарий', rooms: 'Комнат', budget: 'Бюджет', pay: 'Оплата' };
          const body = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${labels[k] || k}: ${v}`).join('\n');
          location.href = `mailto:${FORM_EMAIL}?subject=${encodeURIComponent('Заявка с сайта: ' + (data.subject || 'Обратный звонок'))}&body=${encodeURIComponent(body)}`;
        }
        f.hidden = true;
        const s = document.createElement('div');
        s.className = 'success';
        s.innerHTML = '<div class="success__icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m5 12 5 5 9-10"/></svg></div><h4>Спасибо!</h4><p>Заявка принята. Мы свяжемся с вами в ближайшее время.</p>';
        f.after(s);
        if (f.dataset.quiz !== undefined) qBack.parentElement.hidden = true;
        if (f.classList.contains('form--inline')) setTimeout(() => resetForm(f), 6000);
      } catch {
        toast('Не удалось отправить. Позвоните нам: 8 995 310-07-00');
      } finally { btn.disabled = false; }
    });
  });
})();
