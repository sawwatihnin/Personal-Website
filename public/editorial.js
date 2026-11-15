(() => {
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.querySelectorAll('.project-name a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.getElementById(link.hash.slice(1));
      if (target?.tagName === 'DETAILS') target.open = true;
    });
  });
  const logos = document.getElementById('featured-logos');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const originalLogos = [...logos.children];
  const duplicateLogos = originalLogos.map(logo => {
    const copy = logo.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.tabIndex = -1;
    return copy;
  });
  logos.append(...duplicateLogos);
  let paused = false;
  let lastFrame = 0;
  const marquee = timestamp => {
    if (!lastFrame) lastFrame = timestamp;
    const elapsed = timestamp - lastFrame;
    lastFrame = timestamp;
    const loopWidth = logos.scrollWidth / 2;
    if (!paused && !reducedMotion.matches) {
      logos.scrollLeft += elapsed * 0.025;
      if (logos.scrollLeft >= loopWidth) logos.scrollLeft -= loopWidth;
    }
    requestAnimationFrame(marquee);
  };
  logos.addEventListener('mouseenter', () => { paused = true; });
  logos.addEventListener('mouseleave', () => { paused = false; });
  logos.addEventListener('focusin', () => { paused = true; });
  logos.addEventListener('focusout', () => { paused = false; });
  reducedMotion.addEventListener('change', () => { lastFrame = 0; });
  requestAnimationFrame(marquee);
  const toggle = document.getElementById('projects-toggle');
  const archive = document.getElementById('all-projects');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    archive.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'View Fewer Projects' : 'View More Projects';
    const count = document.querySelectorAll('#projects .project-card').length - archive.querySelectorAll('.project-card').length + (open ? archive.querySelectorAll('.project-card').length : 0);
    document.getElementById('projects-status').textContent = `Showing ${count} projects${open ? '' : ' (selected work)'}.`;
  });
})();
