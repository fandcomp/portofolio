/* Matrix-style crypto/neon background + interactions */
(function(){
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, cols, ypos;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
  w = canvas.width = window.innerWidth;
  const headerH = (document.querySelector('.site-header')?.offsetHeight || 72);
  h = canvas.height = Math.max(320, window.innerHeight - headerH);
    cols = Math.floor(w / 16);
    ypos = Array(cols).fill(0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const chars = '01ΞλΣψΦΩ∑πµκχΔαβγδθηικλμνξοπρστυφω<>[]{}#$@%*&'.split('');

  function step(){
    if (reduceMotion) {
      // Draw a subtle static backdrop and stop animating
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,229,255,0.06)';
      for (let i = 0; i < 60; i++){
        const x = Math.random()*w, y = Math.random()*h;
        ctx.fillRect(x, y, 2, 2);
      }
      return;
    }
    ctx.fillStyle = 'rgba(10,15,20,0.24)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(0,229,255,0.9)';
    ctx.font = '16px monospace';

    for (let i = 0; i < ypos.length; i++){
      const text = chars[Math.floor(Math.random()*chars.length)];
      const x = i * 16;
      const y = ypos[i] * 16;
      ctx.fillStyle = Math.random() > 0.975 ? 'rgba(255,0,234,0.9)' : 'rgba(0,229,255,0.9)';
      ctx.fillText(text, x, y);

      if (y > h && Math.random() > 0.975) ypos[i] = 0;
      else ypos[i]++;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

// Reveal on scroll animations
(function(){
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window) || !items.length) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  items.forEach(el => io.observe(el));
})();

// Gallery album filter
(function(){
  const buttons = document.querySelectorAll('[data-album-filter]');
  const cards = document.querySelectorAll('.gallery-grid [data-album]');
  if (!buttons.length || !cards.length) return;
  buttons.forEach(btn => btn.addEventListener('click', ()=>{
    const filter = btn.getAttribute('data-album-filter');
    buttons.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    cards.forEach(card => {
      const album = card.getAttribute('data-album');
      const show = filter === 'all' || filter === album;
      card.style.display = show ? '' : 'none';
    });
  }));
})();

// Theme toggle (dark / light)
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const key = 'theme:mode';
  const pref = localStorage.getItem(key);
  if (pref === 'light') root.classList.add('light');
  btn.textContent = root.classList.contains('light') ? '🌙' : '🌞';
  btn.addEventListener('click', ()=>{
    root.classList.toggle('light');
    const mode = root.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem(key, mode);
  btn.textContent = mode === 'light' ? '🌙' : '🌞';
  // Let visual layers recalc (e.g., galaxy canvas colors/sizes)
  window.dispatchEvent(new Event('resize'));
  });
})();

// Keep CSS --header-height in sync with actual header height (for scroll offset)
(function(){
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  if (!header) return;
  const set = () => root.style.setProperty('--header-height', `${header.offsetHeight || 72}px`);
  set();
  // Trigger layout-dependent listeners (e.g., canvas resize)
  window.dispatchEvent(new Event('resize'));
  window.addEventListener('resize', () => requestAnimationFrame(set), { passive: true });
  window.addEventListener('load', () => { set(); window.dispatchEvent(new Event('resize')); }, { once: true });
})();

// Mobile nav
(function(){
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle?.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    if (open) menu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }, { once: true }));
  });
})();

// Smooth scroll with dynamic offset for in-page anchors
(function(){
  const header = document.querySelector('.site-header');
  const getOffset = () => (header?.offsetHeight || 72) + 16;
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#' || hash.length === 1) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - getOffset();
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', hash);
    });
  });
})();

// Footer year
(function(){
  const y = document.getElementById('year');
  y.textContent = String(new Date().getFullYear());
})();

// Contact form: send via endpoint with mailto fallback
(function(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const emailLink = document.getElementById('emailLink');
  const copyBtn = document.getElementById('copyEmail');
  // Replace with your Formspree (or similar) endpoint or leave empty to force mailto
  const FORM_ENDPOINT = 'https://formspree.io/f/xldlkaej';
  const submitBtn = form.querySelector('button[type="submit"]');
  const MIN_INTERACT_MS = 1200; // human interaction threshold
  const RATE_LIMIT_MS = 30000;  // 30s between submissions
  const STORAGE_KEY_LAST = 'contact:lastSubmit';

  // Track human interaction to deter bots
  let firstInteractAt = 0;
  const markInteraction = () => { if (!firstInteractAt) firstInteractAt = Date.now(); };
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('focus', markInteraction, { once: true });
    el.addEventListener('input', markInteraction, { once: true });
  });

  function setSending(v){
    if (submitBtn){
      submitBtn.disabled = v;
      submitBtn.textContent = v ? 'Sending…' : 'Hire Me';
    }
    form.setAttribute('aria-busy', v ? 'true' : 'false');
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name');
    const email = fd.get('email');
    const message = fd.get('message');
    const hp = (fd.get('hp_field') || '').toString().trim();

    // Basic validation
    if(!name || !email || !message){
      status.textContent = 'Please complete all fields.';
      status.style.color = 'var(--danger)';
      return;
    }
    // Simple email sanity check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
    if (!emailOk){
      status.textContent = 'Please provide a valid email address.';
      status.style.color = 'var(--danger)';
      return;
    }
    // Honeypot check
    if (hp) {
      status.textContent = 'Submission blocked.';
      status.style.color = 'var(--danger)';
      return;
    }
    // Human interaction threshold
    if (!firstInteractAt || (Date.now() - firstInteractAt) < MIN_INTERACT_MS){
      status.textContent = 'Please review your message, then submit again.';
      status.style.color = 'var(--danger)';
      return;
    }
    // Client-side rate limit
    const last = Number(localStorage.getItem(STORAGE_KEY_LAST) || 0);
    if (last && (Date.now() - last) < RATE_LIMIT_MS){
      const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - last))/1000);
      status.textContent = `Please wait ${wait}s before sending again.`;
      status.style.color = 'var(--danger)';
      return;
    }

    // Try sending via endpoint if configured
    if (FORM_ENDPOINT) {
      setSending(true);
      status.textContent = 'Sending…';
      status.style.color = 'var(--muted)';

      const controller = new AbortController();
      const timeoutMs = 12000;
      const toId = setTimeout(() => controller.abort(), timeoutMs);

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd,
        signal: controller.signal,
      })
      .then(async (res) => {
        clearTimeout(toId);
        if (!res.ok) throw new Error('Failed');
        const toClear = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
        toClear.forEach(el => el.value = '');
        status.textContent = 'Sent! I will get back to you shortly.';
        status.style.color = 'var(--success)';
        localStorage.setItem(STORAGE_KEY_LAST, String(Date.now()));
        setSending(false);
      })
      .catch((err) => {
        clearTimeout(toId);
        status.textContent = 'Network issue — opening your email client…';
        status.style.color = 'var(--muted)';
        // Fallback to mailto if network fails or times out
        sendMailto(name, email, message);
        setSending(false);
      });
      return;
    }

    // Default: mailto fallback
    setSending(true);
    sendMailto(name, email, message);
    // Re-enable shortly; mail client will open
    setTimeout(() => setSending(false), 1200);
  });

  copyBtn.addEventListener('click', async ()=>{
    try{
      const to = emailLink.textContent.trim();
      await navigator.clipboard.writeText(to);
      status.textContent = 'Email copied to clipboard.';
      status.style.color = 'var(--success)';
    }catch(err){
      status.textContent = 'Failed to copy email.';
      status.style.color = 'var(--danger)';
    }
  });
  function sendMailto(name, email, message){
    const subject = encodeURIComponent(`[PORTFOLIO] ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const href = emailLink.getAttribute('href');
    const to = href.replace('mailto:', '');
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email client…';
    status.style.color = 'var(--muted)';
  }
})();

// Galaxy starfield for sections after hero
(function(){
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main = document.querySelector('main');
  const hero = document.querySelector('.hero-section');
  if (!main || !hero) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'galaxyCanvas';
  canvas.className = 'galaxy-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  main.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  let w = 0, h = 0, topY = 0;
  let stars = [];
  let clouds = [];
  let bg = '#0d141c';

  function readTheme(){
    const cs = getComputedStyle(document.documentElement);
    const v = cs.getPropertyValue('--sections-bg').trim();
    bg = v || '#0d141c';
  }

  function makeStars(count){
    const arr = [];
    for (let i = 0; i < count; i++){
      const layer = Math.random();
      arr.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: 0.5 + layer*1.2,
        s: 0.05 + layer*0.25,
        a0: Math.random()*Math.PI*2,
        tw: 0.2 + Math.random()*0.5
      });
    }
    return arr;
  }

  function makeClouds(n){
    const arr = [];
    for (let i=0; i<n; i++){
      arr.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: 200 + Math.random()*380,
        dx: (Math.random()*0.3 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
        dy: (Math.random()*0.2 + 0.03) * (Math.random() > 0.5 ? 1 : -1),
        hue: Math.random() > 0.5 ? 'rgba(0,229,255,0.06)' : 'rgba(255,0,234,0.05)'
      });
    }
    return arr;
  }

  function resize(){
    readTheme();
    const firstAfterHero = main.querySelector(':scope > section:not(.hero-section)');
    if (!firstAfterHero) return;
    topY = firstAfterHero.offsetTop;
    canvas.style.top = `${topY}px`;
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';

    const rect = main.getBoundingClientRect();
    const docW = rect.width;
    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - topY;

    w = canvas.width = Math.max(320, docW);
    h = canvas.height = Math.max(320, docH);

    const density = Math.min(1, (w*h) / (1400*1600));
    const count = Math.floor(220 * density) + 120;
    stars = makeStars(count);
    clouds = makeClouds(3);
    draw(0);
  }

  let lastT = 0;
  function draw(t){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,w,h);

    clouds.forEach(c => {
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      g.addColorStop(0, c.hue);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
      ctx.fill();
      if (!reduceMotion){
        c.x += c.dx*0.15; c.y += c.dy*0.15;
        if (c.x < -c.r) c.x = w + c.r;
        if (c.x > w + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = h + c.r;
        if (c.y > h + c.r) c.y = -c.r;
      }
    });

    const dt = Math.min(33, t - lastT);
    lastT = t;
    stars.forEach(s => {
      const twinkle = 0.6 + s.tw*Math.sin((t/1000) + s.a0);
      ctx.fillStyle = `rgba(255,255,255,${0.25*twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
      if (!reduceMotion){
        s.x += s.s * (dt*0.03);
        s.y += s.s * 0.3 * (dt*0.03);
        if (s.x > w+2) s.x = -2;
        if (s.y > h+2) s.y = -2;
      }
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', resize, { once: true });
  resize();
  if (!reduceMotion) requestAnimationFrame(draw);
})();
