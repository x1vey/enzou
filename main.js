import './style.css';
import { getContent } from './siteContent.js';
import { initHero3D } from './hero3d.js';
import { initRouter } from './router.js';
import { renderAdminPanel } from './adminPanel.js';
import { mountReactMap } from './MapComponent.js';

function applyColors(colors) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-light', colors.accentLight);
  root.style.setProperty('--color-dark', colors.dark);
  root.style.setProperty('--color-dark-overlay', colors.darkOverlay);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-muted', colors.textMuted);
  root.style.setProperty('--color-cream', colors.cream);
  root.style.setProperty('--color-slate', colors.slate);
  root.style.setProperty('--color-card-bg', colors.cardBg);
  root.style.setProperty('--color-glass-bg', colors.glassBg);
  root.style.setProperty('--color-glass-border', colors.glassBorder);
}

function renderHomePage(container, data) {
  applyColors(data.colors);
  container.innerHTML = `
    ${renderNavbar(data)}
    ${renderHero(data)}
    ${renderStats(data)}
    ${renderWhy(data)}
    ${renderTestimonials(data)}
    ${renderMap(data)}
    ${renderFooter(data)}
  `;
  const heroBg = document.getElementById('hero-3d-container');
  if (heroBg) initHero3D(heroBg, data.colors);
  initPageScripts();
}

function renderServicesPage(container, data) {
  applyColors(data.colors);
  container.innerHTML = `
    ${renderNavbar(data)}
    <div style="padding-top: 100px;"></div>
    ${renderServices(data)}
    ${renderMap(data)}
    ${renderFooter(data)}
  `;
  initPageScripts();
}

function renderAboutPage(container, data) {
  applyColors(data.colors);
  container.innerHTML = `
    ${renderNavbar(data)}
    <div style="padding-top: 100px;"></div>
    ${renderAbout(data)}
    ${renderDiscounts(data)}
    ${renderFooter(data)}
  `;
  initPageScripts();
}

function renderContactPage(container, data) {
  applyColors(data.colors);
  container.innerHTML = `
    ${renderNavbar(data)}
    <div style="padding-top: 100px;"></div>
    ${renderContact(data)}
    ${renderMap(data)}
    ${renderFooter(data)}
  `;
  initPageScripts();
}

function renderTestimonialsPage(container, data) {
  applyColors(data.colors);
  container.innerHTML = `
    ${renderNavbar(data)}
    <div style="padding-top: 100px;"></div>
    ${renderTestimonials(data)}
    ${renderFooter(data)}
  `;
  initPageScripts();
}

function initPageScripts() {
  initNavbarScroll();
  initMobileNav();
  initScrollReveal();
  initSmoothScroll();
  
  // Mount the React Shadcn MapCN component if the container exists on this page
  setTimeout(() => {
    mountReactMap('react-map-root');
  }, 100);
}

function getLinkPath(link) {
  const l = link.toLowerCase();
  if (l === 'home') return '/';
  if (l === 'about') return '/about/';
  if (l === 'contact') return '/contact/';
  if (l === 'testimonials') return '/testimonials/';
  if (l === 'services') return '/services/';
  return "/" + l + "/";
}

function renderNavbar(data) {
  const { nav } = data;
  return `
    <nav class="navbar" id="navbar">
      <div class="container">
        <a href="/" class="nav-logo">${nav.logo} <span>${nav.logoSub}</span></a>
        <ul class="nav-links" id="nav-links">
          ${nav.links.map((link) => `<li><a href="${getLinkPath(link)}">${link}</a></li>`).join('')}
          <li><a href="${nav.phoneLink}" class="nav-phone">📞 ${nav.phone}</a></li>
          <li><a href="/contact/" class="nav-cta">${nav.ctaText}</a></li>
        </ul>
        <div class="mobile-toggle" id="mobile-toggle">
          <span></span><span></span><span></span>
        </div>
      </div>
    </nav>
  `;
}

function renderHero(data) {
  const { hero } = data;
  return `
    <section class="hero" id="home">
      <div class="hero-bg">
        <div id="hero-3d-container"></div>
        <div class="hero-overlay"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-badge">🛡️ ${hero.badge}</div>
        <h1>${hero.headline} <span>${hero.subheadline}</span></h1>
        <p class="hero-desc">${hero.description}</p>
        <div class="hero-ctas">
          <a href="/contact/" class="btn btn-primary">${hero.cta1Text}</a>
          <a href="/services/" class="btn btn-outline">${hero.cta2Text}</a>
        </div>
      </div>
      <div class="scroll-hint">${hero.scrollHint}</div>
    </section>
  `;
}

function renderStats(data) {
  const { stats } = data;
  if (!stats) return '';
  return `
    <section class="stats section-padding" id="stats">
      <div class="container">
        <div class="section-header reveal">
          <h2>${stats.sectionTitle}</h2>
          <p>${stats.sectionSubtitle}</p>
        </div>
        <div class="stats-grid">
          ${stats.items.map((item, i) => `
            <div class="stat-item reveal" style="animation-delay: ${i * 0.1}s">
              <div class="stat-number">${item.number}</div>
              <div class="stat-label">${item.label}</div>
              <div class="stat-desc">${item.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderServices(data) {
  const { services } = data;
  return `
    <section class="services section-padding" id="services">
      <div class="container">
        <div class="section-header reveal">
          <h2>${services.sectionTitle}</h2>
          <p>${services.sectionSubtitle}</p>
        </div>
        <div class="services-grid">
          ${services.items.map((item, i) => `
            <div class="service-card glass-card reveal" style="animation-delay: ${i * 0.1}s">
              <div class="service-card-image">
                <img src="${item.image}" alt="${item.title}" loading="lazy" />
              </div>
              <span class="service-icon">${item.icon}</span>
              <h3>${item.title}</h3>
              <p>${item.description}</p>
              <div class="service-stat">${item.stat}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderWhy(data) {
  const { why } = data;
  if (!why) return '';
  return `
    <section class="why section-padding" id="why">
      <div class="container">
        <div class="section-header reveal">
          <h2>${why.sectionTitle}</h2>
          <p>${why.sectionSubtitle}</p>
        </div>
        <div class="why-grid">
          ${why.points.map((pt, i) => `
            <div class="why-card reveal" style="animation-delay: ${i * 0.1}s">
              <div class="why-icon">${pt.icon}</div>
              <div class="why-content">
                <h3>${pt.title}</h3>
                <p>${pt.description}</p>
                <div class="why-stat">${pt.stat}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderAbout(data) {
  const { about } = data;
  return `
    <section class="about section-padding" id="about">
      <div class="container">
        <div class="about-grid">
          <div class="about-image-wrapper reveal">
            <img src="${about.image}" alt="Enzou Drywall Team" loading="lazy" />
          </div>
          <div class="about-text reveal">
            <h2>${about.sectionTitle}</h2>
            <h4>${about.subtitle}</h4>
            <p>${about.description}</p>
            <p>${about.description2}</p>
            <div class="trust-badges">
              ${about.badges.map((badge) => `<span class="trust-badge">${badge}</span>`).join('')}
            </div>
            <a href="${about.ctaLink}" class="btn btn-primary">${about.ctaText}</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderDiscounts(data) {
  const { discounts } = data;
  return `
    <section class="discounts" id="discounts">
      <div class="container reveal">
        <h2>${discounts.title}</h2>
        <p>${discounts.description}</p>
        <div class="discount-categories">
          ${discounts.categories.map((cat) => `<span class="discount-chip">${cat}</span>`).join('')}
        </div>
        <a href="${discounts.ctaLink}" class="btn btn-outline" style="border-color: var(--color-dark); color: var(--color-dark); border-width: 2px; font-weight: 700;">${discounts.ctaText}</a>
      </div>
    </section>
  `;
}



function renderTestimonials(data) {
  const { testimonials } = data;
  return `
    <section class="testimonials section-padding" id="testimonials">
      <div class="container">
        <div class="section-header reveal">
          <h2>${testimonials.sectionTitle}</h2>
          <p>${testimonials.sectionSubtitle}</p>
        </div>
        <div class="testimonials-track">
          ${testimonials.items.map((item) => `
            <div class="testimonial-card">
              <div class="testimonial-header">
                <div class="testimonial-avatar">${item.name.charAt(0)}</div>
                <div class="testimonial-info">
                  <h4>${item.name}</h4>
                  <span>${item.source} • ${item.date}</span>
                </div>
              </div>
              <div class="testimonial-stars">★★★★★</div>
              <p>"${item.text}"</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderContact(data) {
  const { contact } = data;
  return `
    <section class="contact section-padding" id="contact">
      <div class="container">
        <div class="section-header reveal">
          <h2>${contact.sectionTitle}</h2>
          <p>${contact.sectionSubtitle}</p>
        </div>
        <div class="contact-grid">
          <div class="contact-form glass-card reveal">
            <h3>${contact.formTitle}</h3>
            <div class="form-group">
              <label for="contact-name">Full Name</label>
              <input type="text" id="contact-name" placeholder="Your full name" />
            </div>
            <div class="form-group">
              <label for="contact-email">Email</label>
              <input type="email" id="contact-email" placeholder="you@example.com" />
            </div>
            <div class="form-group">
              <label for="contact-phone">Phone</label>
              <input type="tel" id="contact-phone" placeholder="(503) 000-0000" />
            </div>
            <div class="form-group">
              <label for="contact-message">Message / Project Details</label>
              <textarea id="contact-message" placeholder="Tell us about the damage, wall size, or renovation goals..."></textarea>
            </div>
            <button class="btn btn-primary" style="width:100%">Request Estimate</button>
          </div>
          <div class="contact-info reveal">
            <div class="contact-info-card glass-card">
              <h3>Direct Contact</h3>
              <div class="contact-detail">
                <div class="contact-detail-icon">📧</div>
                <div class="contact-detail-text">
                  <h4>Email</h4>
                  <a href="mailto:${contact.email}">${contact.email}</a>
                </div>
              </div>
              <div class="contact-detail">
                <div class="contact-detail-icon">📞</div>
                <div class="contact-detail-text">
                  <h4>Phone</h4>
                  <a href="${contact.phoneLink}">${contact.phone}</a>
                </div>
              </div>
              <div class="contact-detail">
                <div class="contact-detail-icon">📍</div>
                <div class="contact-detail-text">
                  <h4>Service Area Base</h4>
                  <p>${contact.location}</p>
                </div>
              </div>
              <div class="contact-detail">
                <div class="contact-detail-icon">🕐</div>
                <div class="contact-detail-text">
                  <h4>Operating Hours</h4>
                  <p>${contact.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderMap(data) {
  return `
    <section class="map-section reveal" id="map" style="padding: 0; margin-top: 4rem;">
      <div id="react-map-root" style="width: 100%; min-height: 400px; background: var(--color-dark);"></div>
    </section>
  `;
}

function renderFooter(data) {
  const { footer } = data;
  return `
    <footer class="footer" id="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>${footer.companyName}</h3>
            <p>${footer.tagline}</p>
            <p style="font-size: 0.8rem; margin-top: 1rem;">${footer.license}</p>
          </div>
          <div class="footer-links">
            <h4>Quick Links</h4>
            <ul>
              ${footer.links.map((link) => `<li><a href="${link.href}">${link.text}</a></li>`).join('')}
            </ul>
          </div>
          <div class="footer-contact">
            <h4>Get In Touch</h4>
            <p>📧 ${data.contact.email}</p>
            <p>📞 ${data.contact.phone}</p>
            <p>📍 ${data.contact.location}</p>
            <p>🕐 ${data.contact.hours}</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>${footer.copyright}</p>
          <a href="${footer.reviewLink}" target="_blank" rel="noopener" class="footer-review-link">⭐ ${footer.reviewText}</a>
        </div>
      </div>
    </footer>
  `;
}

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initSmoothScroll() {
  // Smooth scroll for anchors on the same page
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#/') return;
      const targetId = href.replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

initRouter({
  '/': (app) => renderHomePage(app, getContent()),
  '/services': (app) => renderServicesPage(app, getContent()),
  '/about': (app) => renderAboutPage(app, getContent()),
  '/contact': (app) => renderContactPage(app, getContent()),
  '/testimonials': (app) => renderTestimonialsPage(app, getContent()),
  '/adminpanel': (app) => renderAdminPanel(app)
});
