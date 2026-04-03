// ── LOADING SCREEN ──
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 1500);

  // Set current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Load Tamil Nadu packages by default
  const tnTab = document.querySelector(".pkg-tab[onclick*='tamilnadu']");
  if (tnTab && typeof window.filterPkgs === 'function') {
    window.filterPkgs('tamilnadu', tnTab);
  }
});

// ── SCROLL PROGRESS BAR ──
const progressBar = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile menu
function openMenu() { document.getElementById('mobileMenu').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMenu() { document.getElementById('mobileMenu').classList.remove('open'); document.body.style.overflow = ''; }

// Scroll reveal
const observer = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── ANIMATED COUNTERS ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      clearInterval(timer);
      el.textContent = target.toLocaleString() + suffix;
    } else {
      el.textContent = Math.floor(current).toLocaleString() + suffix;
    }
  }, 16);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCounter(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// Form — WhatsApp fallback
function submitForm(e) {
  e.preventDefault();
  const name = document.getElementById('f-name').value;
  const phone = document.getElementById('f-phone').value;
  const email = document.getElementById('f-email').value;
  const dest = document.getElementById('f-dest').value;
  const travelDate = document.getElementById('f-month').value;
  const msg = document.getElementById('f-msg').value;

  const whatsappMsg = `Hello Skyscape Holidays! I have an enquiry:\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email || 'Not provided'}\n*Destination:* ${dest}\n*Travel Date:* ${travelDate}\n\n*Message:*\n${msg}`;
  const encodedMsg = encodeURIComponent(whatsappMsg);
  window.open(`https://wa.me/919363768586?text=${encodedMsg}`, '_blank');

  const btn = document.getElementById('submit-btn');
  const successMsg = document.createElement('div');
  successMsg.className = 'form-success';
  successMsg.innerHTML = 'Redirecting to WhatsApp...<br>Thank you for reaching out!';
  successMsg.style.cssText = 'display:block;margin-top:20px;color:var(--teal);font-weight:700;';
  btn.parentNode.appendChild(successMsg);
  btn.style.display = 'none';
}

// ── TESTIMONIAL CAROUSEL ──
(function () {
  const track = document.getElementById('testi-track');
  const dotsWrap = document.getElementById('testi-dots');
  if (!track) return;

  const cards = track.querySelectorAll('.testi-card');
  let current = 0;
  let perView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const total = cards.length;
  let autoTimer;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Review ' + (i + 1));
    dot.onclick = () => goTo(i);
    dotsWrap.appendChild(dot);
  });

  function updateDots() {
    dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function cardWidth() {
    return cards[0].getBoundingClientRect().width + 30;
  }

  function goTo(idx) {
    const max = total - perView;
    current = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${current * cardWidth()}px)`;
    updateDots();
  }

  window.testiSlide = function (dir) {
    resetAuto();
    goTo(current + dir);
  };

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo((current + 1) % (total - perView + 1)), 4000);
  }

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) testiSlide(diff > 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener('resize', () => {
    perView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    goTo(0);
  });

  resetAuto();
})();

// Lightbox
function openLightbox(el) {
  const imgUrl = el.querySelector('img').src;
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  lbImg.src = imgUrl;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e.target.tagName !== 'IMG') {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ── PACKAGE FILTER ──
window.filterPkgs = function (cat, btn) {
  const tabs = document.querySelectorAll('.pkg-tab');
  const cards = document.querySelectorAll('.pkg-card');
  const emptyState = document.getElementById('pkg-empty');
  const grid = document.getElementById('pkg-grid');

  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // If a tab is selected, hide the empty state and reveal the grid
  if (emptyState) {
    emptyState.style.display = 'none';
    grid.style.display = 'grid';
  }

  cards.forEach(card => {
    const match = cat === 'all' || card.dataset.cat === cat;
    card.style.display = match ? 'flex' : 'none';
    if (match) {
      card.style.opacity = '0';
      card.style.animation = 'pkgFadeIn 0.5s ease forwards';
    }
  });
};

// ── SERVICE MODAL ──
const svcData = {
  tours: {
    icon: '🗺️',
    title: 'Domestic & International Tours',
    desc: 'We create personalized travel plans for families, friends, and solo soul-searchers, covering everything from India’s hidden gems to spectacular world destinations.',
    points: [
      'Day-by-day plans tailored specifically for your style of travel',
      'Exciting world trips to Dubai, South East Asia, Europe, and beyond',
      'We handle the lot: your stays, meals, transport, and all the local fun',
      'Flexible options whether you are traveling alone or with a big group',
      'Enjoy the best of every season with our special festival and holiday getaways'
    ]
  },
  tickets: {
    icon: '✈️',
    title: 'Flights, Trains & Bus Tickets',
    desc: 'We take the stress out of bookings. We find you the best rates for flights, trains, and buses, with support that never sleeps.',
    points: [
      'Grab travel tickets at the best possible fares, locally or abroad',
      'Easy train reservations including Tatkal and group booking support',
      'Comfortable bus travel with the best AC, sleeper, and luxury coach options',
      'Perfectly planned multi-city or round-trip routes for a smooth journey',
      'Get instant confirmation and help whenever you need it, 24/7'
    ]
  },
  hotels: {
    icon: '🏨',
    title: 'Hotels, Resorts & Homestays',
    desc: 'From cozy budget stays to premium luxury resorts, we find the perfect place for you to rest and recharge.',
    points: [
      'A huge range of stays, from simple rooms to 5-star luxury resorts',
      'Handpicked homestays for a real, authentic local experience',
      'Save more with special rates when you book for a group',
      'Every hotel is pre-checked by us to ensure your comfort and quality',
      'Choose the meal plan that fits you: breakfast only or full-board'
    ]
  },
  transport: {
    icon: '🚌',
    title: 'Cabs, Tempo Traveller & Bus',
    desc: 'With our own fleet of vehicles, we make sure your group travels safely, comfortably, and always on time.',
    points: [
      'Comfortable AC cabs for small families or quick airport transfers',
      'Spacious tempo travellers for groups of up to 13 friends or family members',
      'Luxury AC buses for large groups like college trips or corporate outings',
      'Friendly, experienced drivers who know the routes and put your safety first',
      'Every vehicle is GPS-tracked so you can travel with complete peace of mind'
    ]
  },
  groups: {
    icon: '👨‍👩‍👧‍👦',
    title: 'Group, Family & Special Trips',
    desc: 'From romantic honeymoons to big family reunions, we handle the heavy lifting so you can just focus on having fun.',
    points: [
      'Memorable student trips with full coordination for groups and faculty',
      'Family packages designed with activities that everyone will love',
      'Romantic honeymoon specials with beautiful stays and experiences',
      'Well-organized corporate team outings and incentive trips',
      'Meaningful pilgrimage and religious tour packages for all'
    ]
  },
  visa: {
    icon: '🛂',
    title: 'Visa, Docs & 24/7 Support',
    desc: 'Paperwork should never get in the way of travel. We handle the documentation so your journey stays smooth and worry-free.',
    points: [
      'We help you through the tourist visa process for 30+ countries',
      'Easy support for travel insurance and foreign exchange',
      'A simple, clear checklist to keep all your documents ready',
      'We’re just a call or message away, 24/7, throughout your entire trip',
      'Help is always available if you run into any trouble during your travels'
    ]
  }
};

window.openSvcModal = function (key) {
  const d = svcData[key];
  if (!d) return;
  document.getElementById('svcModalIcon').textContent = d.icon;
  document.getElementById('svcModalTitle').textContent = d.title;
  document.getElementById('svcModalDesc').textContent = d.desc;
  const ul = document.getElementById('svcModalPoints');
  ul.innerHTML = d.points.map(p => '<li>' + p + '</li>').join('');
  document.getElementById('svcModal').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeSvcModal = function (e, force) {
  if (force || (e && e.target === document.getElementById('svcModal'))) {
    document.getElementById('svcModal').classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeSvcModal(null, true);
});

// ── LOGO CURSOR TOOLTIP ──
(function () {
  const tip = document.getElementById('logo-tooltip');
  if (!tip) return;

  document.addEventListener('mousemove', function (e) {
    tip.style.left = (e.clientX + 16) + 'px';
    tip.style.top = (e.clientY - 10) + 'px';
  });

  document.querySelectorAll('.client-logo[data-name]').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      tip.textContent = el.dataset.name;
      tip.classList.add('visible');
    });
    el.addEventListener('mouseleave', function () {
      tip.classList.remove('visible');
    });
  });
})();

// ── ABOUT BUS SLIDESHOW ──
(function () {
  const slides = document.querySelectorAll('.about-slide');
  const dotsWrap = document.getElementById('aboutSlideDots');
  if (!slides.length || !dotsWrap) return;

  let current = 0;
  let timer;

  // Build dots
  slides.forEach(function (_, i) {
    const btn = document.createElement('button');
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', function () { goTo(i); resetTimer(); });
    dotsWrap.appendChild(btn);
  });

  function goTo(idx) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 3500);
  }

  resetTimer();
})();

// ── PACKAGE DETAIL MODAL ──
window.openPkgModal = function (card) {
  const destEl = card.querySelector('.pkg-dest');
  const dest = destEl ? destEl.textContent.trim() : '';
  const cat = card.dataset.cat;
  
  // Update Header
  document.getElementById('pkgModalDest').textContent = dest ? dest + '  —  Package Inclusions' : 'Package Inclusions';
  
  // Update Points if Tamil Nadu
  const ul = document.querySelector('#pkgModal .svc-modal-points');
  if (cat === 'tamilnadu') {
    ul.innerHTML = `
      <li>DJ Bus or Coach for the entire journey</li>
      <li>3 Times Unlimited Food</li>
      <li>All Entry Tickets</li>
      <li>Experienced Local Guides</li>
      <li>Refreshments throughout the trip</li>
      <li>Adventurous Activities included</li>
    `;
  } else {
    // Default / Other categories
    ul.innerHTML = `
      <li>Premium High-DJ Bus for the entire journey</li>
      <li>6 Times Unlimited Meals (2 Veg & 4 Non-Veg)</li>
      <li>Exciting Jeep Safari Experience</li>
      <li>DJ Boating Experience</li>
      <li>Campfire Night with DJ Entertainment</li>
      <li>Comfortable Resort Stay (Quad Sharing Rooms)</li>
      <li>Separate Accommodation for Faculty Members</li>
      <li>Refreshment Rooms provided throughout the trip</li>
      <li>Sightseeing with Professional Local Guide Support</li>
      <li>Complete Travel Management by Experienced Professionals</li>
    `;
  }
  
  document.getElementById('pkgModal').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closePkgModal = function (e, force) {
  if (force || (e && e.target === document.getElementById('pkgModal'))) {
    document.getElementById('pkgModal').classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (typeof closeSvcModal === 'function') closeSvcModal(null, true);
    if (typeof closePkgModal === 'function') closePkgModal(null, true);
  }
});

// ── VIDEO REVIEW PLAY ──
window.playReview = function (btn) {
  const wrap = btn.closest('.vreview-video-wrap');
  const video = wrap.querySelector('.vreview-video');

  // Pause all other videos first
  document.querySelectorAll('.vreview-video').forEach(function (v) {
    if (v !== video) {
      v.pause();
      v.closest('.vreview-video-wrap').querySelector('.vreview-play-btn').classList.remove('hidden');
    }
  });

  // Play this one
  video.play();
  btn.classList.add('hidden');

  // When video ends — show play button again
  video.onended = function () {
    btn.classList.remove('hidden');
    video.currentTime = 0;
  };

  // Also show play button if paused manually
  video.onpause = function () {
    if (!video.ended) btn.classList.remove('hidden');
  };

  video.onplay = function () {
    btn.classList.add('hidden');
  };
};

// ── VIDEO CLICK TO PAUSE/PLAY ──
document.querySelectorAll('.vreview-video').forEach(function (video) {
  video.addEventListener('click', function () {
    const btn = video.closest('.vreview-video-wrap').querySelector('.vreview-play-btn');
    if (video.paused) {
      video.play();
      btn.classList.add('hidden');
    } else {
      video.pause();
      btn.classList.remove('hidden');
    }
  });
});

// ── WONDERLA MODAL ──
window.openWonderlaModal = function () {
  document.getElementById('wonderlaModal').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeWonderlaModal = function (e, force) {
  if (force || (e && e.target === document.getElementById('wonderlaModal'))) {
    document.getElementById('wonderlaModal').classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* also close on Escape (already handled by global keydown in script.js — adding wonderla support) */
document.addEventListener('keydown', function wonderlaEsc(e) {
  if (e.key === 'Escape') closeWonderlaModal(null, true);
});


// ── VIDEO START AT 2 SECONDS ──
(function () {
  document.querySelectorAll('.vreview-video').forEach(function (video) {
    video.addEventListener('loadedmetadata', function onMeta() {
      video.removeEventListener('loadedmetadata', onMeta);
      // Lock the video's starting point straight to the 2nd second
      video.currentTime = 2.0;
    });
  });
})();

// ── LAZY LOAD BACKGROUND IMAGES ──
document.addEventListener("DOMContentLoaded", function () {
  const lazyBackgrounds = [].slice.call(document.querySelectorAll(".lazy-bg"));

  if ("IntersectionObserver" in window) {
    let lazyBackgroundObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyBg = entry.target;
          let bgUrl = lazyBg.getAttribute("data-bg");
          if (bgUrl) {
            lazyBg.style.backgroundImage = "url('" + bgUrl + "')";
            lazyBg.classList.remove("lazy-bg");
          }
          lazyBackgroundObserver.unobserve(lazyBg);
        }
      });
    }, { rootMargin: "0px 0px 200px 0px" });

    lazyBackgrounds.forEach(function (lazyBg) {
      lazyBackgroundObserver.observe(lazyBg);
    });
  } else {
    // Fallback for older browsers
    lazyBackgrounds.forEach(function (lazyBg) {
      let bgUrl = lazyBg.getAttribute("data-bg");
      if (bgUrl) {
        lazyBg.style.backgroundImage = "url('" + bgUrl + "')";
        lazyBg.classList.remove("lazy-bg");
      }
    });
  }
});

