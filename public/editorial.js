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
  const nextLogos = document.querySelector('.featured-next');
  const cue = document.querySelector('.featured-scroll-cue span');
  const updateLogoCue = () => {
    const atEnd = logos.scrollLeft + logos.clientWidth >= logos.scrollWidth - 2;
    nextLogos.disabled = atEnd;
    cue.textContent = atEnd ? 'Swipe back to explore' : 'Swipe to explore more';
  };
  nextLogos.addEventListener('click', () => {
    logos.scrollBy({left: logos.clientWidth * 0.75, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  logos.addEventListener('scroll', updateLogoCue, {passive: true});
  window.addEventListener('resize', updateLogoCue);
  window.addEventListener('load', updateLogoCue, {once: true});
  updateLogoCue();
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
