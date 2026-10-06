/* ═══════════════════════════════════════════════════
   IMAGE CONFIGURATION – centralized image paths
   Replace paths here to update all images at once.
═══════════════════════════════════════════════════ */

const IMAGES = {
  hero: 'anh/couple/optimized/IMG_1365.JPG',
  heroThumbs: [
    'anh/couple/optimized/IMG_1365.JPG',
    'anh/couple/optimized/IMG_1366.JPG',
    'anh/couple/optimized/IMG_1372.jpeg'
  ],
  story: {
    main: '/images/story-main.jpg',
    side: '/images/story-side.jpg'
  },
  featured: [
    '/images/featured-01.jpg',
    '/images/featured-02.jpg',
    '/images/featured-03.jpg'
  ],
  portfolio: [
    '/images/portfolio-01.jpg',
    '/images/portfolio-02.jpg',
    '/images/portfolio-03.jpg',
    '/images/portfolio-04.jpg',
    '/images/portfolio-05.jpg',
    '/images/portfolio-06.jpg',
    '/images/portfolio-07.jpg'
  ],
  cta: '/images/cta.jpg'
};

/* ───────────────────────────────────────────────────
   HERO GALLERY SLIDER & SWIPE
   - Đổi ảnh nền mượt mà qua cross-fade (không zoom, giữ nguyên kích thước)
   - Vuốt qua lại (swipe left/right) trên điện thoại
   - Click thumbnails (Desktop), dots indicator, nút mũi tên (Prev/Next)
   - Tự động chạy ảnh (Auto-play) và tạm dừng khi tương tác
─────────────────────────────────────────────────── */
(function initHeroGallery() {
  const heroSection  = document.getElementById('hero');
  const slides       = document.querySelectorAll('.hero-slide');
  const thumbItems   = document.querySelectorAll('.hero-thumb-item');
  const dots         = document.querySelectorAll('.hero-dot');
  const counterCur   = document.getElementById('hero-counter-cur');
  const prevArrow    = document.getElementById('hero-nav-prev');
  const nextArrow    = document.getElementById('hero-nav-next');

  if (!heroSection || !slides.length) return;

  const totalSlides = slides.length;
  let currentIndex = 0;
  let autoTimer = null;

  // Preload all slide images to prevent loading flashes
  slides.forEach(slide => {
    const img = slide.querySelector('img');
    if (img && img.src) {
      const pre = new Image();
      pre.src = img.src;
    }
  });

  function goToSlide(index) {
    if (index === currentIndex && slides[currentIndex].classList.contains('active')) return;

    // Normalizing wrap-around index
    currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;

    // 1. Update slides
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentIndex);
    });

    // 2. Update desktop thumbnails
    if (thumbItems.length) {
      thumbItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === currentIndex);
      });
    }

    // 3. Update dots
    if (dots.length) {
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    // 4. Update counter
    if (counterCur) {
      counterCur.textContent = String(currentIndex + 1).padStart(2, '0');
    }
  }

  // --- Click / Key Events for Thumbnails ---
  thumbItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      goToSlide(idx);
      restartAutoPlay();
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToSlide(idx);
        restartAutoPlay();
      }
    });
  });

  // --- Click Events for Dots ---
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(idx);
      restartAutoPlay();
    });
  });

  // --- Arrow Navigation ---
  if (prevArrow) {
    prevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex - 1);
      restartAutoPlay();
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex + 1);
      restartAutoPlay();
    });
  }

  // --- Mobile Touch Swipe Gestures ---
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX   = 0;
  let touchEndY   = 0;
  let isTracking  = false;

  heroSection.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchEndX   = touchStartX;
    touchEndY   = touchStartY;
    isTracking  = true;
    stopAutoPlay();
  }, { passive: true });

  heroSection.addEventListener('touchmove', (e) => {
    if (!isTracking || e.touches.length !== 1) return;
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
  }, { passive: true });

  heroSection.addEventListener('touchend', () => {
    if (!isTracking) return;
    isTracking = false;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Swipe horizontally if horizontal distance > 35px and > 1.2 * vertical distance
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        // Swiped Left -> Next image
        goToSlide(currentIndex + 1);
      } else {
        // Swiped Right -> Previous image
        goToSlide(currentIndex - 1);
      }
    }
    restartAutoPlay();
  }, { passive: true });

  // --- Auto-play (every 6 seconds) ---
  function startAutoPlay() {
    stopAutoPlay();
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 6000);
  }

  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  heroSection.addEventListener('mouseenter', stopAutoPlay);
  heroSection.addEventListener('mouseleave', startAutoPlay);

  startAutoPlay();
})();

/* ───────────────────────────────────────────────────
   SIDEBAR TOGGLE – ẩn/hiện sidebar với animation
─────────────────────────────────────────────────── */
(function initSidebarToggle() {
  const sidebar     = document.getElementById('sidebar');
  const toggleBtn   = document.getElementById('sidebar-toggle-btn');
  const mainContent = document.getElementById('main-content');

  if (!sidebar || !toggleBtn || !mainContent) return;

  // Vị trí toggle: khi mở = sát mép phải sidebar, khi ẩn = sát mép trái màn hình
  const LEFT_OPEN     = '200px';
  const LEFT_CLOSED   = '14px';

  let isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

  function applyState(animate) {
    // Tắt transition khi load lần đầu
    if (!animate) {
      sidebar.style.transition     = 'none';
      toggleBtn.style.transition   = 'none';
      mainContent.style.transition = 'none';
    }

    if (isCollapsed) {
      // Ẩn sidebar hoàn toàn
      sidebar.classList.add('sidebar--collapsed');
      mainContent.classList.add('main-content--shifted');
      toggleBtn.style.left = LEFT_CLOSED;
      toggleBtn.querySelector('svg').style.transform = 'rotate(180deg)';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Mở thanh menu');
    } else {
      // Hiện sidebar
      sidebar.classList.remove('sidebar--collapsed');
      mainContent.classList.remove('main-content--shifted');
      toggleBtn.style.left = LEFT_OPEN;
      toggleBtn.querySelector('svg').style.transform = 'rotate(0deg)';
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Ẩn thanh menu');
    }

    // Bật lại transition sau 1 frame
    if (!animate) {
      requestAnimationFrame(() => {
        sidebar.style.transition     = '';
        toggleBtn.style.transition   = '';
        mainContent.style.transition = '';
      });
    }
  }

  // Đặt transition cho SVG icon
  toggleBtn.querySelector('svg').style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';

  // Áp dụng trạng thái đã lưu (không animate)
  applyState(false);

  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    applyState(true);
  });

  // Phím tắt [ để toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
      isCollapsed = !isCollapsed;
      localStorage.setItem('sidebarCollapsed', isCollapsed);
      applyState(true);
    }
  });
})();

/* ───────────────────────────────────────────────────
   SCROLL REVEAL – IntersectionObserver
─────────────────────────────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings within same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 300);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

/* ───────────────────────────────────────────────────
   MOBILE NAVIGATION
─────────────────────────────────────────────────── */
(function initMobileNav() {
  const hamburger   = document.getElementById('hamburger-btn');
  const mobileMenu  = document.getElementById('mobile-menu');
  const closeBtn    = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn && closeBtn.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });
})();

/* ───────────────────────────────────────────────────
   SIDEBAR ACTIVE STATE – based on scroll position
─────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
})();

/* ───────────────────────────────────────────────────
   FEATURED STORIES NAVIGATION
─────────────────────────────────────────────────── */
(function initFeaturedNav() {
  const track    = document.getElementById('featured-track');
  const prevBtn  = document.getElementById('feat-prev');
  const nextBtn  = document.getElementById('feat-next');

  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  const cards = track.querySelectorAll('.feat-card');
  const total = cards.length;

  function getVisibleCount() {
    if (window.innerWidth <= 767) return 1;
    if (window.innerWidth <= 1023) return 1;
    return 3;
  }

  function updateTrack() {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, total - visible);
    currentIndex = Math.min(currentIndex, maxIndex);

    // Desktop: use CSS grid, no transform needed
    if (visible >= 3) {
      track.style.transform = '';
      return;
    }

    // Tablet / Mobile: horizontal scroll by card width
    const cardW = track.querySelector('.feat-card').offsetWidth;
    const gap = 14;
    const offset = currentIndex * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) currentIndex--;
    updateTrack();
  });

  nextBtn.addEventListener('click', () => {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, total - visible);
    if (currentIndex < maxIndex) currentIndex++;
    updateTrack();
  });

  window.addEventListener('resize', () => {
    currentIndex = 0;
    updateTrack();
  });
})();

/* ───────────────────────────────────────────────────
   PORTFOLIO FILTERS – Lọc album như thư mục trên trang
─────────────────────────────────────────────────── */
(function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portItems  = document.querySelectorAll('.port-item');
  const portGrid   = document.getElementById('portfolio-grid');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;

      if (portGrid) {
        if (filter === 'all') {
          portGrid.removeAttribute('data-filtered');
        } else {
          portGrid.setAttribute('data-filtered', 'true');
        }
      }

      portItems.forEach(item => {
        const cat = item.dataset.category;
        const match = (filter === 'all') ||
                      (cat === filter) ||
                      (filter === 'tet' && cat === 'chan-dung') ||
                      (filter === 'ki-yeu' && cat === 'tot-nghiep');
        if (match) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();


/* ───────────────────────────────────────────────────
   IMAGE GRACEFUL FALLBACK
   If real image doesn't exist, keep placeholder visible
─────────────────────────────────────────────────── */
(function initImageFallback() {
  const imgs = document.querySelectorAll('img[src^="/images/"]');
  imgs.forEach(img => {
    img.addEventListener('load', () => {
      // Image loaded – hide placeholder text via CSS (handled via CSS sibling selector)
      img.style.opacity = '1';
    });
    img.addEventListener('error', () => {
      // Image not found – keep transparent so placeholder text shows
      img.style.opacity = '0';
      img.style.display = 'none';
    });
  });
})();

/* ───────────────────────────────────────────────────
   SMOOTH SCROLL for anchor links
─────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ───────────────────────────────────────────────────
   ALBUM MODAL – Hiển thị ảnh album theo category
─────────────────────────────────────────────────── */
(function initAlbumModal() {
  /* ── 1. Dữ liệu ảnh theo từng album (3 album: Couple, Tết, Kỉ yếu) ── */
  const ALBUM_DATA = {
    couple: {
      title: 'Couple',
      images: [
        'anh/couple/optimized/IMG_1365.JPG',
        'anh/couple/optimized/IMG_1366.JPG',
        'anh/couple/optimized/IMG_1372.jpeg',
        'anh/couple/optimized/IMG_3008.JPEG',
        'anh/couple/optimized/IMG_3010.JPG',
        'anh/couple/optimized/IMG_3016.JPG',
        'anh/couple/optimized/IMG_3019.jpeg',
        'anh/couple/optimized/IMG_3022.JPG',
        'anh/couple/optimized/IMG_3023.JPG',
        'anh/couple/optimized/IMG_3024.JPG',
        'anh/couple/optimized/IMG_3025.JPG',
        'anh/couple/optimized/IMG_3026.JPG',
        'anh/couple/optimized/IMG_4968.JPG',
        'anh/couple/optimized/IMG_4969.JPG',
        'anh/couple/optimized/IMG_4974.JPG',
        'anh/couple/optimized/IMG_5015.JPG',
        'anh/couple/optimized/IMG_5016.JPG',
        'anh/couple/optimized/IMG_5017.JPG',
        'anh/couple/optimized/IMG_5018.JPG',
        'anh/couple/optimized/IMG_5019.JPG',
        'anh/couple/optimized/IMG_5020.JPG',
        'anh/couple/optimized/IMG_5021.JPG',
        'anh/couple/optimized/IMG_5022.JPG',
      ]
    },
    tet: {
      title: 'Tết',
      images: [
        'anh/tet/optimized/C8A4E6A0-C52B-4F8C-B0C9-3FCC555A7A62.jpg',
        'anh/tet/optimized/DSC09271.JPEG',
        'anh/tet/optimized/DSC09655.JPEG',
        'anh/tet/optimized/IMG_1402.jpeg',
        'anh/tet/optimized/IMG_1426.JPG',
        'anh/tet/optimized/IMG_2849.jpeg',
        'anh/tet/optimized/IMG_2867.jpeg',
        'anh/tet/optimized/IMG_2868.jpeg',
        'anh/tet/optimized/IMG_2880.JPG',
        'anh/tet/optimized/IMG_2904.JPG',
        'anh/tet/optimized/IMG_2905.JPG',
        'anh/tet/optimized/IMG_2906.JPG',
        'anh/tet/optimized/IMG_2907.JPG',
        'anh/tet/optimized/IMG_2908.JPG',
        'anh/tet/optimized/IMG_3219.JPG',
        'anh/tet/optimized/IMG_3220.JPG',
        'anh/tet/optimized/IMG_3221.JPG',
        'anh/tet/optimized/IMG_3222.JPG',
        'anh/tet/optimized/IMG_3223.JPG',
        'anh/tet/optimized/IMG_3224.JPG',
        'anh/tet/optimized/IMG_3225.JPG',
      ]
    },
    'ki-yeu': {
      title: 'Kỉ yếu',
      images: [
        'anh/tot nghiep/optimized/6BBBBD69-F4D9-4E34-8FA9-E038CD2F1872.jpg',
        'anh/tot nghiep/optimized/IMG_3632.JPG',
        'anh/tot nghiep/optimized/IMG_3633.JPG',
        'anh/tot nghiep/optimized/IMG_3634.JPG',
        'anh/tot nghiep/optimized/IMG_3635.JPG',
        'anh/tot nghiep/optimized/IMG_3636.JPG',
        'anh/tot nghiep/optimized/IMG_3658.JPG',
        'anh/tot nghiep/optimized/IMG_3713.jpeg',
        'anh/tot nghiep/optimized/IMG_3818.JPG',
        'anh/tot nghiep/optimized/IMG_3819.JPG',
        'anh/tot nghiep/optimized/IMG_3822.JPG',
        'anh/tot nghiep/optimized/IMG_3823.JPG',
        'anh/tot nghiep/optimized/IMG_3835.JPG',
        'anh/tot nghiep/optimized/IMG_3836.JPG',
        'anh/tot nghiep/optimized/IMG_3842.JPG',
        'anh/tot nghiep/optimized/IMG_3843.JPG',
        'anh/tot nghiep/optimized/IMG_3844.JPG',
        'anh/tot nghiep/optimized/IMG_4020.JPG',
        'anh/tot nghiep/optimized/IMG_4023.JPG',
        'anh/tot nghiep/optimized/IMG_4024.JPG',
        'anh/tot nghiep/optimized/IMG_4203.JPG',
        'anh/tot nghiep/optimized/IMG_4204.JPG',
        'anh/tot nghiep/optimized/IMG_4257.JPG',
        'anh/tot nghiep/optimized/IMG_4285.JPG',
        'anh/tot nghiep/optimized/IMG_4286.JPG',
        'anh/tot nghiep/optimized/IMG_4398.JPG',
        'anh/tot nghiep/optimized/IMG_4399.JPG',
        'anh/tot nghiep/optimized/IMG_4404.JPG',
        'anh/tot nghiep/optimized/IMG_4455.JPG',
        'anh/tot nghiep/optimized/IMG_4456.JPG',
      ]
    }
  };

  // Aliases tương thích ngược
  ALBUM_DATA['tot-nghiep'] = ALBUM_DATA['ki-yeu'];
  ALBUM_DATA['chan-dung']  = ALBUM_DATA['tet'];
  ALBUM_DATA['all']        = ALBUM_DATA['couple'];


  /* ── 2. DOM refs ── */
  const modal        = document.getElementById('album-modal');
  const backdrop     = document.getElementById('album-modal-backdrop');
  const closeBtn     = document.getElementById('album-modal-close');
  const modalTitle   = document.getElementById('album-modal-title');
  const grid         = document.getElementById('album-modal-grid');
  const viewer       = document.getElementById('album-viewer');
  const viewerImg    = document.getElementById('album-viewer-img');
  const viewerClose  = document.getElementById('album-viewer-close');
  const viewerPrev   = document.getElementById('album-viewer-prev');
  const viewerNext   = document.getElementById('album-viewer-next');
  const viewerCounter= document.getElementById('album-viewer-counter');

  if (!modal || !grid) return;

  let currentImages = [];
  let currentViewerIndex = 0;

  /* ── 3. Open / Close modal ── */
  function openModal(filter) {
    const data = ALBUM_DATA[filter] || ALBUM_DATA.all;
    modalTitle.textContent = data.title;
    renderGrid(data.images);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    closeViewer();
    document.body.style.overflow = '';
  }

  /* ── 4. Render grid ── */
  function renderGrid(images) {
    currentImages = images;
    grid.innerHTML = '';

    if (!images || images.length === 0) {
      grid.innerHTML = `
        <div class="album-modal-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>Chưa có ảnh trong album này</p>
        </div>`;
      return;
    }

    images.forEach((src, idx) => {
      const item = document.createElement('div');
      item.className = 'album-grid-item';
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Xem ảnh ${idx + 1}`);

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Album photo ${idx + 1}`;
      img.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'album-grid-item-overlay';
      overlay.innerHTML = `<span class="album-grid-expand">↗ Xem</span>`;

      item.appendChild(img);
      item.appendChild(overlay);

      item.addEventListener('click', () => openViewer(idx));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(idx); }
      });

      // Stagger animation
      item.style.opacity = '0';
      item.style.transform = 'translateY(16px)';
      item.style.transition = `opacity 0.4s ease ${idx * 40}ms, transform 0.4s ease ${idx * 40}ms`;
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 50);

      grid.appendChild(item);
    });
  }

  /* ── 5. Viewer ── */
  function openViewer(idx) {
    currentViewerIndex = idx;
    viewerImg.src = currentImages[idx];
    viewerImg.classList.remove('switching');
    updateViewerCounter();
    viewer.classList.add('open');
  }

  function closeViewer() {
    viewer.classList.remove('open');
  }

  function navigateViewer(dir) {
    const newIdx = (currentViewerIndex + dir + currentImages.length) % currentImages.length;
    viewerImg.classList.add('switching');
    setTimeout(() => {
      currentViewerIndex = newIdx;
      viewerImg.src = currentImages[newIdx];
      viewerImg.classList.remove('switching');
      updateViewerCounter();
    }, 200);
  }

  function updateViewerCounter() {
    viewerCounter.textContent = `${currentViewerIndex + 1} / ${currentImages.length}`;
  }

  /* ── 6. Event listeners ── */
  // Portfolio grid items – click ảnh mở album của category đó
  document.querySelectorAll('.port-item').forEach(item => {
    if (item.dataset.noModal === 'true') return; // chỉ hiển thị ảnh, không mở album
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const category = item.dataset.category || 'all';
      openModal(category);
    });
  });

  // Close
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  viewerClose.addEventListener('click', closeViewer);

  // Viewer navigation
  viewerPrev.addEventListener('click', () => navigateViewer(-1));
  viewerNext.addEventListener('click', () => navigateViewer(+1));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') {
      if (viewer.classList.contains('open')) closeViewer();
      else closeModal();
    }
    if (viewer.classList.contains('open')) {
      if (e.key === 'ArrowLeft') navigateViewer(-1);
      if (e.key === 'ArrowRight') navigateViewer(+1);
    }
  });
})();

/* ───────────────────────────────────────────────────
   FEATURED STORIES FULL-SCREEN DARK GALLERY
─────────────────────────────────────────────────── */
(function initFeaturedStoryGallery() {
  const modal       = document.getElementById('story-gallery-modal');
  if (!modal) return;

  const backdrop    = document.getElementById('story-gallery-backdrop');
  const closeBtn    = document.getElementById('story-gallery-close');
  const prevBtn     = document.getElementById('story-gallery-prev');
  const nextBtn     = document.getElementById('story-gallery-next');
  const imgEl       = document.getElementById('story-gallery-img');
  const tagEl       = document.getElementById('story-gallery-tag');
  const titleEl     = document.getElementById('story-gallery-title');
  const counterEl   = document.getElementById('story-gallery-counter');
  const stageEl     = document.getElementById('story-gallery-stage');

  // Featured stories collections
  const STORY_COLLECTIONS = {
    'couple': {
      tag: 'PORTRAIT',
      title: 'Thanh xuân trong nắng',
      images: [
        'anh/couple/optimized/IMG_1365.JPG',
        'anh/couple/optimized/IMG_1366.JPG',
        'anh/couple/optimized/IMG_1372.jpeg',
        'anh/couple/optimized/IMG_1373.jpeg',
        'anh/couple/optimized/IMG_1374.jpeg',
        'anh/couple/optimized/IMG_1375.jpeg',
        'anh/couple/optimized/IMG_1376.jpeg',
        'anh/couple/optimized/IMG_1377.jpeg',
        'anh/couple/optimized/IMG_1378.jpeg',
        'anh/couple/optimized/IMG_1379.jpeg',
        'anh/couple/optimized/IMG_1380.jpeg',
        'anh/couple/optimized/IMG_1381.jpeg',
        'anh/couple/optimized/IMG_1382.jpeg',
        'anh/couple/optimized/IMG_1383.jpeg',
        'anh/couple/optimized/IMG_1384.jpeg',
        'anh/couple/optimized/IMG_1385.jpeg',
        'anh/couple/optimized/IMG_1386.jpeg',
        'anh/couple/optimized/IMG_1387.jpeg',
        'anh/couple/optimized/IMG_1388.jpeg',
        'anh/couple/optimized/IMG_1389.jpeg'
      ]
    },
    'ki-yeu': {
      tag: 'GRADUATION',
      title: 'Những năm tháng chúng ta',
      images: [
        'anh/tot nghiep/optimized/IMG_3632.JPG',
        'anh/tot nghiep/optimized/IMG_3633.JPG',
        'anh/tot nghiep/optimized/IMG_3634.JPG',
        'anh/tot nghiep/optimized/IMG_3635.JPG',
        'anh/tot nghiep/optimized/IMG_3636.JPG',
        'anh/tot nghiep/optimized/IMG_3658.JPG',
        'anh/tot nghiep/optimized/IMG_3713.jpeg',
        'anh/tot nghiep/optimized/IMG_3818.JPG',
        'anh/tot nghiep/optimized/IMG_3819.JPG',
        'anh/tot nghiep/optimized/IMG_3822.JPG',
        'anh/tot nghiep/optimized/IMG_3823.JPG',
        'anh/tot nghiep/optimized/IMG_3835.JPG',
        'anh/tot nghiep/optimized/IMG_3836.JPG',
        'anh/tot nghiep/optimized/IMG_3842.JPG',
        'anh/tot nghiep/optimized/IMG_3843.JPG',
        'anh/tot nghiep/optimized/IMG_3844.JPG',
        'anh/tot nghiep/optimized/IMG_4020.JPG',
        'anh/tot nghiep/optimized/IMG_4023.JPG',
        'anh/tot nghiep/optimized/IMG_4024.JPG',
        'anh/tot nghiep/optimized/IMG_4203.JPG',
        'anh/tot nghiep/optimized/IMG_4204.JPG',
        'anh/tot nghiep/optimized/IMG_4257.JPG',
        'anh/tot nghiep/optimized/IMG_4285.JPG',
        'anh/tot nghiep/optimized/IMG_4286.JPG',
        'anh/tot nghiep/optimized/IMG_4398.JPG',
        'anh/tot nghiep/optimized/IMG_4399.JPG',
        'anh/tot nghiep/optimized/IMG_4404.JPG',
        'anh/tot nghiep/optimized/IMG_4455.JPG',
        'anh/tot nghiep/optimized/IMG_4456.JPG'
      ]
    },
    'tet': {
      tag: 'TRADITIONAL',
      title: 'Lưu giữ nét Việt',
      images: [
        'anh/tet/optimized/DSC09271.JPEG',
        'anh/tet/optimized/DSC09655.JPEG',
        'anh/tet/optimized/IMG_1402.jpeg',
        'anh/tet/optimized/IMG_1426.JPG',
        'anh/tet/optimized/IMG_2849.jpeg',
        'anh/tet/optimized/IMG_2867.jpeg',
        'anh/tet/optimized/IMG_2868.jpeg',
        'anh/tet/optimized/IMG_2880.JPG',
        'anh/tet/optimized/IMG_2904.JPG',
        'anh/tet/optimized/IMG_2905.JPG',
        'anh/tet/optimized/IMG_2906.JPG',
        'anh/tet/optimized/IMG_2907.JPG',
        'anh/tet/optimized/IMG_2908.JPG',
        'anh/tet/optimized/IMG_3219.JPG',
        'anh/tet/optimized/IMG_3220.JPG',
        'anh/tet/optimized/IMG_3221.JPG',
        'anh/tet/optimized/IMG_3222.JPG',
        'anh/tet/optimized/IMG_3223.JPG',
        'anh/tet/optimized/IMG_3224.JPG',
        'anh/tet/optimized/IMG_3225.JPG'
      ]
    }
  };

  // Aliases
  STORY_COLLECTIONS['portrait']   = STORY_COLLECTIONS['couple'];
  STORY_COLLECTIONS['graduation'] = STORY_COLLECTIONS['ki-yeu'];
  STORY_COLLECTIONS['traditional']= STORY_COLLECTIONS['tet'];

  let activeImages = [];
  let currentIndex = 0;
  let isAnimating = false;

  function padZero(num) {
    return num < 10 ? '0' + num : String(num);
  }

  function updateCounter() {
    if (!counterEl || activeImages.length === 0) return;
    counterEl.textContent = `${padZero(currentIndex + 1)} / ${padZero(activeImages.length)}`;
  }

  function preloadAdjacent() {
    if (activeImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % activeImages.length;
    const prevIdx = (currentIndex - 1 + activeImages.length) % activeImages.length;
    const imgNext = new Image();
    imgNext.src = activeImages[nextIdx];
    const imgPrev = new Image();
    imgPrev.src = activeImages[prevIdx];
  }

  function renderImage(direction = 0) {
    if (!activeImages.length) return;
    const nextSrc = activeImages[currentIndex];

    if (direction === 0) {
      imgEl.className = 'story-gallery-img';
      imgEl.src = nextSrc;
      updateCounter();
      preloadAdjacent();
      return;
    }

    if (isAnimating) return;
    isAnimating = true;

    const outClass = direction > 0 ? 'slide-out-left' : 'slide-out-right';
    const inClass  = direction > 0 ? 'slide-in-from-right' : 'slide-in-from-left';

    imgEl.className = `story-gallery-img ${outClass}`;

    setTimeout(() => {
      imgEl.src = nextSrc;
      updateCounter();
      imgEl.className = `story-gallery-img ${inClass}`;

      setTimeout(() => {
        imgEl.className = 'story-gallery-img';
        isAnimating = false;
        preloadAdjacent();
      }, 300);
    }, 180);
  }

  function navigate(dir) {
    if (activeImages.length <= 1) return;
    currentIndex = (currentIndex + dir + activeImages.length) % activeImages.length;
    renderImage(dir);
  }

  function openGallery(storyKey) {
    const story = STORY_COLLECTIONS[storyKey] || STORY_COLLECTIONS['couple'];
    activeImages = story.images;
    currentIndex = 0;

    if (tagEl) tagEl.textContent = story.tag;
    if (titleEl) titleEl.textContent = story.title;

    renderImage(0);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeGallery() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Click triggers on Featured Stories cards and "Xem thêm" links
  document.querySelectorAll('.feat-card').forEach(card => {
    const link = card.querySelector('.feat-link');
    const storyKey = card.dataset.story || (link && link.dataset.story) || 'couple';

    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openGallery(storyKey);
      });
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      e.preventDefault();
      openGallery(storyKey);
    });
  });

  // Buttons & backdrop
  if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));
  if (closeBtn) closeBtn.addEventListener('click', closeGallery);
  if (backdrop) backdrop.addEventListener('click', closeGallery);

  // Desktop keyboard navigation: ArrowLeft, ArrowRight, Escape
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowLeft') {
      navigate(-1);
    } else if (e.key === 'ArrowRight') {
      navigate(1);
    }
  });

  // Mobile swipe support (touch left / right)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  if (stageEl) {
    stageEl.addEventListener('touchstart', (e) => {
      if (!modal.classList.contains('open')) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    stageEl.addEventListener('touchend', (e) => {
      if (!modal.classList.contains('open')) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const elapsed = Date.now() - touchStartTime;

      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && elapsed < 600) {
        if (deltaX < 0) {
          navigate(1);
        } else {
          navigate(-1);
        }
      }
    }, { passive: true });
  }
})();

