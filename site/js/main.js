/* ============================================
   Rider 777 - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initHeader();
  initMobileMenu();
  initScrollToTop();
  initAccordion();
  initSmoothScroll();
  initLazyLoading();
});

/* ============================================
   Header Scroll Effect
   ============================================ */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

/* ============================================
   Mobile Menu Toggle
   ============================================ */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navList = document.querySelector('.nav-list');

  if (!menuBtn || !navList) return;

  menuBtn.addEventListener('click', function() {
    navList.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!menuBtn.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('active');
      menuBtn.classList.remove('active');
    }
  });

  // Close menu when clicking on a link
  navList.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      navList.classList.remove('active');
      menuBtn.classList.remove('active');
    });
  });
}

/* ============================================
   Scroll to Top Button
   ============================================ */
function initScrollToTop() {
  const scrollBtn = document.querySelector('.scroll-top');
  if (!scrollBtn) return;

  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  scrollBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ============================================
   Accordion / FAQ
   ============================================ */
function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(function(item) {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    header.addEventListener('click', function() {
      // Close other items
      accordionItems.forEach(function(otherItem) {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
    });
  });
}

/* ============================================
   Smooth Scroll for Anchor Links
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ============================================
   Lazy Loading Images
   ============================================ */
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
  }
}

/* ============================================
   Active Navigation Link
   ============================================ */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath.endsWith('/') && href === currentPath.slice(0, -1))) {
      link.classList.add('active');
    } else if (currentPath.includes(href) && href !== '/') {
      link.classList.add('active');
    }
  });
}

// Call after DOM is ready
document.addEventListener('DOMContentLoaded', setActiveNavLink);

/* ============================================
   Copy to Clipboard (for PIX codes, etc.)
   ============================================ */
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(function() {
    const originalText = button.textContent;
    button.textContent = 'Copiado!';
    button.classList.add('copied');

    setTimeout(function() {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch(function(err) {
    console.error('Erro ao copiar:', err);
  });
}

/* ============================================
   Table of Contents (for articles)
   ============================================ */
function generateTOC() {
  const article = document.querySelector('.article-content');
  const tocContainer = document.querySelector('.toc');

  if (!article || !tocContainer) return;

  const headings = article.querySelectorAll('h2, h3');
  if (headings.length < 3) return;

  const tocList = document.createElement('ul');
  tocList.className = 'toc-list';

  headings.forEach(function(heading, index) {
    const id = heading.id || 'section-' + index;
    heading.id = id;

    const li = document.createElement('li');
    li.className = 'toc-item toc-' + heading.tagName.toLowerCase();

    const a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = heading.textContent;
    a.className = 'toc-link';

    li.appendChild(a);
    tocList.appendChild(li);
  });

  tocContainer.appendChild(tocList);
}

/* ============================================
   Analytics Events (if needed)
   ============================================ */
function trackCTAClick(ctaName) {
  // Placeholder for analytics tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'cta_click', {
      'cta_name': ctaName,
      'page_location': window.location.href
    });
  }
}

// Add click tracking to CTA buttons
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.cta-btn, .btn-primary').forEach(function(btn) {
    btn.addEventListener('click', function() {
      trackCTAClick(this.textContent.trim());
    });
  });
});

/* ============================================
   Age Verification Modal (Optional)
   ============================================ */
function showAgeVerification() {
  const hasVerified = localStorage.getItem('age_verified');
  if (hasVerified) return;

  const modal = document.createElement('div');
  modal.className = 'age-modal';
  modal.innerHTML = `
    <div class="age-modal-content">
      <h2>Verificação de Idade</h2>
      <p>Este site é destinado apenas para maiores de 18 anos.</p>
      <p>Você tem 18 anos ou mais?</p>
      <div class="age-modal-buttons">
        <button class="btn btn-primary" id="age-yes">Sim, tenho 18+</button>
        <button class="btn btn-secondary" id="age-no">Não</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('age-yes').addEventListener('click', function() {
    localStorage.setItem('age_verified', 'true');
    modal.remove();
  });

  document.getElementById('age-no').addEventListener('click', function() {
    window.location.href = 'https://www.google.com';
  });
}

// Uncomment to enable age verification:
// document.addEventListener('DOMContentLoaded', showAgeVerification);
