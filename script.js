const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/85JU64HPDD';

(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pinned = () => window.matchMedia('(min-width: 981px)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== data =====
  const CITIES = [
    ['Москва', 'MOW'], ['Санкт-Петербург', 'LED'], ['Екатеринбург', 'SVX'], ['Новосибирск', 'OVB'],
    ['Казань', 'KZN'], ['Нижний Новгород', 'GOJ'], ['Самара', 'KUF'], ['Краснодар', 'KRR'],
    ['Ростов-на-Дону', 'ROV'], ['Уфа', 'UFA'], ['Красноярск', 'KJA'], ['Пермь', 'PEE'],
    ['Челябинск', 'CEK'], ['Воронеж', 'VOZ'], ['Волгоград', 'VOG'], ['Омск', 'OMS'], ['Другой город', 'RUS']
  ];
  const DESTS = [
    ['Мальдивы', 'MLE'], ['Египет', 'HRG'], ['ОАЭ', 'DXB'], ['Таиланд', 'HKT'],
    ['Турция', 'AYT'], ['Куба', 'HAV'], ['Маврикий', 'MRU'], ['Доминикана', 'PUJ'], ['Пока не знаю', '???']
  ];
  const fill = (sel, list) => { list.forEach(([n]) => { const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); }); };
  const selFrom = $('#selFrom'), selTo = $('#selTo'), fCity = $('#f-city'), fDest = $('#f-dest');
  [selFrom, fCity].forEach(s => fill(s, CITIES));
  [selTo, fDest].forEach(s => fill(s, DESTS));
  const codeOf = (list, name) => (list.find(x => x[0] === name) || [])[1] || '';

  // ===== intro =====
  const start = () => root.classList.add('go');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(start);
  } else start();

  // ===== split-flap codes =====
  const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const paint = (el, text) => { el.innerHTML = ''; [...text].forEach(ch => { const s = document.createElement('span'); s.textContent = ch; el.appendChild(s); }); };
  const flap = (el, text) => {
    if (reduce) { paint(el, text); return; }
    el.classList.add('run');
    let n = 0;
    const id = setInterval(() => {
      n++;
      const cur = [...text].map((ch, i) => (n > 4 + i * 3 ? ch : LET[Math.floor(Math.random() * 26)])).join('');
      paint(el, cur);
      if (n > 4 + text.length * 3) { clearInterval(id); el.classList.remove('run'); paint(el, text); }
    }, 55);
  };
  const codeFrom = $('#codeFrom'), codeTo = $('#codeTo'), stubTo = $('#stubTo');
  paint(codeFrom, 'MOW'); paint(codeTo, 'MLE');
  selFrom.addEventListener('change', () => flap(codeFrom, codeOf(CITIES, selFrom.value)));
  selTo.addEventListener('change', () => { flap(codeTo, codeOf(DESTS, selTo.value)); stubTo.textContent = selTo.value; });

  $('#passGo').addEventListener('click', () => { fCity.value = selFrom.value; fDest.value = selTo.value; });

  // ===== barcode =====
  const bc = $('#barcode');
  if (bc) {
    let x = 0, seed = 7, html = '';
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    while (x < 156) { const w = 1 + Math.floor(rnd() * 4); html += `<rect x="${x}" y="0" width="${w}" height="44"/>`; x += w + 1 + Math.floor(rnd() * 3); }
    bc.innerHTML = html;
  }

  // ===== departure board =====
  const track = $('#boardTrack');
  const row = DESTS.slice(0, 8).map(([n, c]) => `<span>${c}<i>${n}</i></span>`).join('');
  track.innerHTML = row + row + row + row;

  // ===== scallops =====
  const sc = $('#scallopPath');
  if (sc) sc.setAttribute('d', 'M0 50' + ' a50 46 0 0 1 100 0'.repeat(12) + ' V50 Z');

  // ===== header hide =====
  const header = $('#header');
  let lastY = window.scrollY;

  // ===== process pin =====
  const proc = $('#process');
  const stages = $$('.stage');
  const trailPath = $('#trailPath'), trailDone = $('#trailDone'), trailPlane = $('#trailPlane');
  const trailLen = trailPath ? trailPath.getTotalLength() : 0;
  const setProcess = p => {
    const idx = clamp(Math.floor(p * stages.length * 0.999), 0, stages.length - 1);
    stages.forEach((s, i) => { s.classList.toggle('on', i === idx); s.classList.toggle('done', i < idx); });
    if (trailLen) {
      const d = p * trailLen;
      trailDone.style.strokeDashoffset = String(1 - p);
      const a = trailPath.getPointAtLength(d), b = trailPath.getPointAtLength(Math.min(trailLen, d + 2));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      trailPlane.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang}) translate(-4 0)`);
    }
  };

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    if (y > lastY + 6 && y > 600) header.classList.add('hide');
    if (y < lastY - 4 || y < 300) header.classList.remove('hide');
    lastY = y;
    const hero = $('.hero__img');
    if (!reduce && hero && y < vh) hero.style.translate = '0 ' + (y * 0.12).toFixed(1) + 'px';
    if (pinned() && !reduce) {
      const r = proc.getBoundingClientRect();
      setProcess(clamp(-r.top / (r.height - vh), 0, 1));
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', () => {
    if (!pinned() || reduce) { stages.forEach(s => s.classList.remove('on', 'done')); if (trailLen) setProcess(1); }
    onScroll();
  });
  if (!pinned() || reduce) { stages.forEach(s => s.classList.remove('on', 'done')); if (trailLen) setProcess(1); } else setProcess(0);
  onScroll();

  // ===== smooth anchors =====
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      let top = target.getBoundingClientRect().top + window.scrollY - (href === '#top' ? 0 : 64);
      if (href === '#process' && pinned()) top = target.getBoundingClientRect().top + window.scrollY - 64 + 40;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // ===== reveal =====
  const sel = ['.h2', '.lead', '.slip__h', '.slip__g', '.menu__g', '.menu__note', '.facts', '.faqs details', '.faq__act', '.cta__p', '.card__h', '.form > *', '.postcard__l > *', '.postcard__r li', '.price__ph', '.sheet__body'].join(',');
  const els = $$(sel);
  els.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('rv')) : [el];
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 0.08 + 's');
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => io.observe(el));

  // ===== form =====
  const form = $('#leadForm'), st = $('#formSt');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    delete payload._gotcha;
    $$('.f', form).forEach(f => f.classList.remove('err'));
    const bad = [];
    if (!String(payload.name || '').trim()) bad.push('#f-name');
    if (!String(payload.contact || '').trim()) bad.push('#f-contact');
    if (bad.length) { bad.forEach(s => $(s).closest('.f').classList.add('err')); st.textContent = 'Укажите имя и телефон или Telegram.'; $(bad[0]).focus(); return; }
    if (!$('#f-agree').checked) { st.textContent = 'Нужно согласие на обработку данных.'; return; }
    payload.phone = payload.contact;
    payload.route = payload.city + ' → ' + payload.dest;
    const btn = $('button[type="submit"]', form);
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Отправляем';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      st.textContent = 'Заявка отправлена. Свяжусь с вами в ближайшее время.';
      form.reset();
    } catch (err) {
      console.error(err);
      st.textContent = 'Не отправилось. Попробуйте ещё раз или напишите в Telegram @Kmai777.';
    } finally {
      setTimeout(() => { btn.disabled = false; btn.textContent = orig; }, 2500);
    }
  });
})();
