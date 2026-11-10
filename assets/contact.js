// Contact pop-up: a frosted-glass contact form shared by every page.
// Any element with data-contact opens it (the nav "Get in touch" buttons and the contact section button).
// Messages are posted to FormSubmit, which emails them to Andrew. Paste the Calendly link into CALENDLY_URL to switch on the booking button.
(() => {
  const ENDPOINT = 'https://formsubmit.co/ajax/andrew.basile12@gmail.com';
  const MAIL = 'andrew.basile12@gmail.com';
  const CALENDLY_URL = 'https://calendly.com/andrewbasile12/andrew-basile-intro';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = document.createElement('div');
  wrap.className = 'ct-layer';
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="ct-veil" data-ct-close></div>
    <div class="ct-panel" role="dialog" aria-modal="true" aria-labelledby="ct-title" tabindex="-1">
      <button class="ct-close" type="button" data-ct-close aria-label="Close"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg></button>
      <div class="ct-body">
        <h2 id="ct-title">Let’s talk<span class="g">.</span></h2>
        <p class="ct-lede">Tell me a little about what you’re working on and I’ll reply by email.</p>
        <form class="ct-form" novalidate>
          <div class="ct-row">
            <label class="ct-f"><span>First name</span><input name="first" type="text" autocomplete="given-name" required></label>
            <label class="ct-f"><span>Last name</span><input name="last" type="text" autocomplete="family-name" required></label>
          </div>
          <label class="ct-f"><span>Email</span><input name="email" type="email" autocomplete="email" inputmode="email" required></label>
          <label class="ct-f"><span>Company, LinkedIn or social media <i>(only need one)</i></span><input name="contact" type="text" autocomplete="off" required></label>
          <label class="ct-f"><span>Message</span><textarea name="message" rows="4" required></textarea></label>
          <input class="ct-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="ct-acts"><button class="btn fill ct-send" type="submit">Send</button><p class="ct-msg" role="status" aria-live="polite"></p></div>
        </form>
        <div class="ct-done" hidden><p class="ct-done-h"></p><p>I’ll get back to you at <b class="ct-done-mail"></b>.</p></div>
        <div class="ct-cal">
          <div><p class="ct-cal-h">Or rather talk it through?</p><p class="ct-cal-p">Grab a time on my calendar.</p></div>
          <a class="btn line ct-cal-btn" target="_blank" rel="noopener">Book a call <span>↗</span></a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const panel = wrap.querySelector('.ct-panel'), form = wrap.querySelector('.ct-form'), msg = wrap.querySelector('.ct-msg'),
        send = wrap.querySelector('.ct-send'), done = wrap.querySelector('.ct-done'), cal = wrap.querySelector('.ct-cal-btn');
  if (CALENDLY_URL) cal.href = CALENDLY_URL;
  else { cal.removeAttribute('href'); cal.setAttribute('aria-disabled', 'true'); cal.classList.add('is-soon'); cal.innerHTML = 'Calendar link coming soon'; }

  let opener = null;
  function open(from) {
    if (!wrap.hidden) return;
    opener = from || document.activeElement;
    const nav = document.querySelector('.nav'); if (nav) nav.classList.remove('is-menu');
    wrap.hidden = false; document.documentElement.classList.add('ct-on');
    requestAnimationFrame(() => { wrap.classList.add('is-in'); setTimeout(() => (form.hidden ? panel : form.querySelector('input')).focus({ preventScroll: true }), reduce ? 0 : 280); });
  }
  function close() {
    if (wrap.hidden) return;
    wrap.classList.remove('is-in');
    setTimeout(() => { wrap.hidden = true; document.documentElement.classList.remove('ct-on'); if (opener && opener.focus) opener.focus({ preventScroll: true }); }, reduce ? 0 : 320);
  }
  // Capture phase so the page's own in-page link handling never sees these clicks.
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-contact]');
    if (!t || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); e.stopPropagation(); open(t);
  }, true);
  wrap.querySelectorAll('[data-ct-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (wrap.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') {
      const f = [...panel.querySelectorAll('button,a[href],input:not([tabindex="-1"]),textarea')].filter(el => el.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  if (location.search.includes('contact')) open();

  form.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); if (msg.classList.contains('err')) { msg.textContent = ''; msg.className = 'ct-msg'; } });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (d._honey) return;
    const bad = [];
    ['first', 'last', 'email', 'contact', 'message'].forEach(n => { d[n] = (d[n] || '').trim(); if (!d[n]) bad.push(n); });
    const badMail = d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email);
    if (badMail) bad.push('email');
    if (bad.length) {
      bad.forEach(n => form.elements[n].setAttribute('aria-invalid', 'true'));
      msg.className = 'ct-msg err'; msg.textContent = badMail && bad.length === 1 ? 'That email looks off. Mind checking it?' : 'Your name, email, company or profile and a short message will do it.';
      form.elements[bad[0]].focus(); return;
    }
    send.disabled = true; send.innerHTML = 'Sending…';
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({ first_name: d.first, last_name: d.last, email: d.email, company_or_profile: d.contact, message: d.message, page: location.href,
          _subject: `New message from ${d.first} ${d.last} via andrewbasile.work`, _replyto: d.email, _template: 'table', _captcha: 'false' })) });
      if (!r.ok) throw new Error(r.status);
      form.hidden = true; done.hidden = false;
      done.querySelector('.ct-done-h').textContent = `Thanks, ${d.first}. Your note is in.`;
      done.querySelector('.ct-done-mail').textContent = d.email;
      panel.focus({ preventScroll: true });
    } catch (err) {
      send.disabled = false; send.innerHTML = 'Send';
      const mail = `mailto:${MAIL}?subject=${encodeURIComponent('Hello from andrewbasile.work')}&body=${encodeURIComponent(`${d.message}\n\n${d.first} ${d.last}\n${d.contact}`)}`;
      msg.className = 'ct-msg err'; msg.innerHTML = `That didn’t go through. You can <a href="${mail}">email me directly</a> instead.`;
    }
  });
})();
