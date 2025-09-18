(() => {
  const portfolioItems = [
    {
      id: 'p1',
      title: 'SaaS Analytics Dashboard',
      category: 'Web',
      year: '2025',
      tags: ['Product', 'UI', 'DataViz'],
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop',
      description: 'A modern analytics dashboard with real-time metrics and custom theming.'
    },
    {
      id: 'p2',
      title: 'E-commerce Brand Refresh',
      category: 'Brand',
      year: '2024',
      tags: ['Identity', 'Guidelines'],
      image: 'https://images.unsplash.com/photo-1557825835-70d97c4aa567?q=80&w=1600&auto=format&fit=crop',
      description: 'Complete visual identity refresh with packaging, typography, and web components.'
    },
    {
      id: 'p3',
      title: 'Travel App Concepts',
      category: 'Mobile',
      year: '2024',
      tags: ['iOS', 'Android', 'Prototype'],
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1600&auto=format&fit=crop',
      description: 'Rapid prototypes for a multi-city itinerary planner with offline support.'
    },
    {
      id: 'p4',
      title: 'Portfolio CMS Theme',
      category: 'Web',
      year: '2023',
      tags: ['Theme', 'Marketing'],
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop',
      description: 'Clean, accessible CMS theme optimized for performance and SEO.'
    },
    {
      id: 'p5',
      title: 'AR Product Preview',
      category: 'Experimental',
      year: '2023',
      tags: ['WebXR', '3D'],
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop',
      description: 'Interactive prototype to preview products in augmented reality.'
    },
    {
      id: 'p6',
      title: 'Fintech Brand Kit',
      category: 'Brand',
      year: '2022',
      tags: ['Logo', 'System'],
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
      description: 'Logo system, palette, and component tokens for a fintech startup.'
    }
  ];

  const state = {
    activeCategory: 'All',
    lightboxIndex: -1
  };

  const els = {
    grid: document.getElementById('grid'),
    filterButtons: document.getElementById('filterButtons'),
    year: document.getElementById('year'),
    themeToggle: document.getElementById('themeToggle'),
    lightbox: document.getElementById('lightbox'),
    lbImage: document.getElementById('lightbox-image'),
    lbTitle: document.getElementById('lightbox-title'),
    lbDesc: document.getElementById('lightbox-desc')
  };

  // Footer year
  els.year.textContent = new Date().getFullYear();

  // Theme toggle
  els.themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('theme-dark');
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
    els.themeToggle.setAttribute('aria-pressed', String(isDark));
  });

  // Build filters
  const categories = ['All', ...Array.from(new Set(portfolioItems.map(i => i.category)))];
  function renderFilters() {
    els.filterButtons.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'tab';
      btn.textContent = cat;
      btn.setAttribute('aria-selected', String(cat === state.activeCategory));
      btn.addEventListener('click', () => {
        state.activeCategory = cat;
        renderFilters();
        renderGrid();
      });
      els.filterButtons.appendChild(btn);
    });
  }

  // Build grid
  function cardTemplate(item, index) {
    const wide = index % 5 === 0 ? ' card--wide' : '';
    return `
      <article class="card${wide}">
        <button class="card-media" data-open="${item.id}" aria-label="Open ${item.title}" style="background-image:url('${item.image}');background-size:cover;background-position:center"></button>
        <div class="card-body">
          <h3 class="card-title">${item.title}</h3>
          <div class="card-meta">${item.category} • ${item.year}</div>
          <div class="card-tags">${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
      </article>
    `;
  }

  function renderGrid() {
    const list = state.activeCategory === 'All' ? portfolioItems : portfolioItems.filter(i => i.category === state.activeCategory);
    els.grid.innerHTML = list.map(cardTemplate).join('');

    // Bind opens
    els.grid.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open');
        const index = portfolioItems.findIndex(i => i.id === id);
        openLightbox(index);
      });
    });

    // Reveal on scroll
    const cards = Array.from(els.grid.querySelectorAll('.card'));
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach(card => observer.observe(card));
  }

  // Lightbox
  function openLightbox(index) {
    state.lightboxIndex = index;
    const item = portfolioItems[index];
    if (!item) return;
    els.lbImage.src = item.image;
    els.lbImage.alt = item.title;
    els.lbTitle.textContent = item.title;
    els.lbDesc.textContent = item.description;
    els.lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    els.lightbox.hidden = true;
    document.body.style.overflow = '';
    state.lightboxIndex = -1;
  }
  function navLightbox(dir) {
    if (state.lightboxIndex < 0) return;
    let next = state.lightboxIndex + dir;
    if (next < 0) next = portfolioItems.length - 1;
    if (next >= portfolioItems.length) next = 0;
    openLightbox(next);
  }

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.matches('[data-close]')) { closeLightbox(); }
    if (target.matches('[data-prev]')) { navLightbox(-1); }
    if (target.matches('[data-next]')) { navLightbox(1); }
  });

  document.addEventListener('keydown', (e) => {
    if (els.lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  // Lazy load images via background style: create real images in lightbox only.

  // Initialize
  renderFilters();
  renderGrid();
})();


