/* Shared interactions for both languages. No analytics are required to use the site. */
(() => {
  document.documentElement.classList.add("js-enabled");
  const english = document.documentElement.lang === 'en';
  const text = (en, mk) => english ? en : mk;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Reveal content even when the optional animation library is unavailable.
  if (window.AOS && !reducedMotion.matches) {
    document.documentElement.classList.add("animations-enabled");
    window.AOS.init({ duration: 400, once: true, offset: 20 });
  } else {
    document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
  }

  const dropdown = document.querySelector('.lang-dropdown');
  if (dropdown) {
    const button = dropdown.querySelector('button');
    const setOpen = open => {
      dropdown.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    };
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', event => { if (!dropdown.contains(event.target)) setOpen(false); });
    dropdown.addEventListener('keydown', event => {
      if (event.key === 'Escape') { setOpen(false); button.focus(); }
    });
    dropdown.addEventListener('focusout', event => {
      if (!dropdown.contains(event.relatedTarget)) setOpen(false);
    });
  }

  document.querySelectorAll('.more-info-btn').forEach((button, index) => {
    const panel = button.nextElementSibling;
    panel.id = `package-details-${index}`;
    panel.hidden = true;
    button.setAttribute('aria-controls', panel.id);
    button.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      const icon = button.querySelector('i');
      icon.classList.toggle('fa-chevron-up', !panel.hidden);
      icon.classList.toggle('fa-chevron-down', panel.hidden);
    });
  });

  const portfolioVideos = [...document.querySelectorAll('.portfolio-video')];
  portfolioVideos.forEach(video => {
    video.controls = false;
    const container = video.closest('.video-container');
    const button = container.querySelector('button');
    const title = container.closest('.portfolio-card').querySelector('h3').textContent;
    const sync = () => {
      container.classList.toggle('playing', !video.paused);
      button.setAttribute('aria-pressed', String(!video.paused));
      button.setAttribute('aria-label', (video.paused ? text('Play: ', 'Пушти: ') : text('Pause: ', 'Паузирај: ')) + title);
      button.querySelector('i').className = video.paused ? 'fas fa-play' : 'fas fa-pause';
    };
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      if (!video.paused) { video.pause(); return; }
      portfolioVideos.forEach(other => { if (other !== video) other.pause(); });
      container.querySelector('.video-error')?.remove();
      button.disabled = true;
      try { await video.play(); }
      catch {
        const error = document.createElement('p');
        error.className = 'video-error';
        error.setAttribute('role', 'status');
        error.textContent = text('Unable to play this video. Please try again.', 'Видеото не може да се пушти. Обидете се повторно.');
        container.append(error);
      } finally { button.disabled = false; sync(); }
    });
  });

  // Preview videos only play while visible, and visitors can pause each one.
  const previews = [...document.querySelectorAll('.v-video video')];
  const visible = new Set();
  const pausedByUser = new Set();
  const updatePreview = video => {
    if (!document.hidden && visible.has(video) && !pausedByUser.has(video) && !reducedMotion.matches) {
      video.play().catch(() => {});
    } else video.pause();
  };
  previews.forEach(video => {
    video.controls = false;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preview-toggle';
    const sync = () => {
      button.textContent = video.paused ? text('Play', 'Пушти') : text('Pause', 'Паузирај');
      button.setAttribute('aria-label', button.textContent + ': ' + video.closest('.v-section').querySelector('h2').textContent);
    };
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    button.addEventListener('click', () => {
      if (video.paused) { pausedByUser.delete(video); video.play().catch(() => {}); }
      else { pausedByUser.add(video); video.pause(); }
    });
    video.parentElement.append(button);
    sync();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
        updatePreview(entry.target);
      });
    }, { threshold: 0.25 });
    previews.forEach(video => observer.observe(video));
  }
  reducedMotion.addEventListener('change', () => previews.forEach(updatePreview));
  document.addEventListener('visibilitychange', () => {
    previews.forEach(updatePreview);
    if (document.hidden) portfolioVideos.forEach(video => video.pause());
  });

  const form = document.getElementById('my-form');
  if (form) {
    const status = document.getElementById('status');
    status.hidden = true;
    status.style.display = '';
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      if (button.disabled) return;
      const label = button.textContent;
      button.disabled = true;
      button.textContent = text('Sending…', 'Се испраќа…');
      status.hidden = true;
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Submission failed');
        form.hidden = true;
        status.textContent = text('Thank you! Your request has been sent. We will contact you soon.', 'Благодариме! Вашето барање е испратено. Ќе ве контактираме наскоро.');
      } catch {
        status.textContent = text('Your request could not be sent. Please try again or contact us directly.', 'Барањето не се испрати. Обидете се повторно или контактирајте нè директно.');
      } finally {
        button.disabled = false;
        button.textContent = label;
        status.hidden = false;
        status.focus();
      }
    });
  }
})();
