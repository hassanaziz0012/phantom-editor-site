// Phantom Editor landing page: the small working fragments.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveals, once */
  // A shutter starts fully clipped, which an observer reads as not there, so its parent is watched instead.
  const watched = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { watched.get(e.target).classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('[data-reveal]').forEach((el) => {
    const seen = el.classList.contains('shutter') ? el.parentElement : el;
    watched.set(seen, el);
    io.observe(seen);
  });

  /* hero: the status readout answers its own flags */
  const status = $('#status');
  if (status) {
    const flagOut = $('#status-flag');
    $$('.seg button', status).forEach((b) => b.addEventListener('click', () => {
      $$('.seg button', status).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      status.dataset.flag = b.dataset.flag;
      flagOut.textContent = b.dataset.flag ? ' ' + b.dataset.flag : '';
      $('.term-body', status).scrollTop = 0;
    }));
  }

  /* pipeline: one slider drives the clause and the folder */
  const range = $('#stage');
  if (range) {
    const data = JSON.parse($('#stage-data').textContent);
    const section = $('#pipeline');
    const names = $$('.stage-names li');
    let timer;
    const paint = (n) => {
      const s = data[n - 1];
      $('#clause').innerHTML = s.clause;
      $('#stage-text').textContent = s.text;
      section.classList.remove('is-swapping');
    };
    const set = (n, instant) => {
      n = Math.max(1, Math.min(9, n));
      range.value = n;
      $('#track').style.setProperty('--p', (n - 1) / 8);
      const s = data[n - 1];
      $('#stage-n').textContent = n;
      $('#stage-label').textContent = s.label;
      $('#stage-next').textContent = s.next;
      $('#stage-cmd').textContent = s.cmd;
      $$('.frow').forEach((r) => r.classList.toggle('is-there', n >= +r.dataset.from));
      names.forEach((li, i) => li.classList.toggle('is-on', i + 1 === n));
      clearTimeout(timer);
      if (instant || calm) return paint(n);
      section.classList.add('is-swapping');
      timer = setTimeout(() => paint(n), 200);
    };
    range.addEventListener('input', () => set(+range.value));
    $$('[data-go]').forEach((b) => b.addEventListener('click', () => set(+b.dataset.go)));
  }

  /* outputs: the panel at the centre is lit */
  const row = $('#out-row');
  if (row) {
    const items = $$('.out', row);
    const prev = $('#out-prev');
    const next = $('#out-next');
    let lit = Math.max(0, items.findIndex((i) => i.classList.contains('is-lit')));
    const centre = (el) => el.offsetLeft + el.offsetWidth / 2;
    const light = () => {
      const mid = row.scrollLeft + row.clientWidth / 2;
      let best = 0;
      items.forEach((el, i) => { if (Math.abs(centre(el) - mid) < Math.abs(centre(items[best]) - mid)) best = i; });
      lit = best;
      items.forEach((el, i) => el.classList.toggle('is-lit', i === best));
      prev.disabled = best === 0;
      next.disabled = best === items.length - 1;
    };
    const go = (i, smooth = true) => {
      const el = items[Math.max(0, Math.min(items.length - 1, i))];
      row.scrollTo({ left: centre(el) - row.clientWidth / 2, behavior: smooth && !calm ? 'smooth' : 'auto' });
    };
    let raf;
    row.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(light); }, { passive: true });
    prev.addEventListener('click', () => go(lit - 1));
    next.addEventListener('click', () => go(lit + 1));
    row.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(lit + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(lit - 1); }
    });
    items.forEach((el, i) => el.addEventListener('click', () => { if (i !== lit) go(i); }));
    /* drag with a mouse */
    let down = null;
    row.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') down = { x: e.clientX, left: row.scrollLeft, moved: false }; });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 4) { down.moved = true; row.classList.add('is-dragging'); }
      if (down.moved) row.scrollLeft = down.left - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      const moved = down.moved; down = null;
      if (moved) { light(); row.classList.remove('is-dragging'); go(lit); }
    });
    go(lit, false);
    light();
    addEventListener('resize', () => go(lit, false));
  }

  /* b-roll: the reader picks the clip and the theme */
  const video = $('#broll-video');
  if (video) {
    const field = $('#broll-field');
    const note = $('#broll-note');
    const clips = $$('.clip');
    let clip = 'step';
    let theme = 'dark';
    const show = (restart) => {
      const src = `assets/broll/${clip}-${theme}.mp4`;
      if (!video.src.endsWith(src)) {
        video.poster = `assets/broll/${clip}-${theme}.jpg`;
        video.src = src;
      } else if (restart) video.currentTime = 0;
      field.dataset.theme = theme;
      const el = clips.find((c) => c.dataset.clip === clip);
      note.textContent = `${el.dataset.name}, rendered by phantom`;
      clips.forEach((c) => c.classList.toggle('is-on', c === el));
      if (!calm) video.play().catch(() => {});
    };
    if (calm) { video.removeAttribute('autoplay'); video.pause(); video.controls = true; }
    $$('.seg-page button').forEach((b) => b.addEventListener('click', () => {
      theme = b.dataset.theme;
      $$('.seg-page button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      show(true);
    }));
    $$('[data-play]').forEach((b) => b.addEventListener('click', () => { clip = b.dataset.play; show(true); }));
    const seen = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { clip = e.target.dataset.clip; show(false); }
    }, { rootMargin: '-45% 0px -45% 0px' });
    clips.forEach((c) => seen.observe(c));
  }

  /* videos: the thumbnail follows the row under the pointer */
  const preview = $('#preview');
  if (preview) {
    const imgs = $$('img', preview);
    const rows = $$('.vrow');
    const on = (a) => {
      const i = +a.dataset.thumb;
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
      const max = preview.parentElement.clientHeight - preview.offsetHeight - 2 * preview.offsetTop;
      const y = Math.max(0, Math.min(max, a.offsetTop - rows[0].offsetTop));
      preview.style.transform = `translateY(${y}px)`;
    };
    rows.forEach((a) => { a.addEventListener('pointerenter', () => on(a)); a.addEventListener('focus', () => on(a)); });
  }

  /* commands: tabs */
  const tabs = $$('[role="tab"]');
  if (tabs.length) {
    const pick = (t, focus) => {
      tabs.forEach((x) => {
        const sel = x === t;
        x.setAttribute('aria-selected', String(sel));
        x.tabIndex = sel ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).toggleAttribute('data-off', !sel);
      });
      if (focus) t.focus();
      t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        pick(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
  }
})();
