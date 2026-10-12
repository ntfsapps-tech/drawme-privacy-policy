/**
 * DrawMe Legal & Policy Portal - Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const printDocBtn = document.getElementById('printDocBtn');
  const tabButtons = document.querySelectorAll('.doc-tab-btn');
  const docSections = document.querySelectorAll('.doc-section');
  const tocLinks = document.querySelectorAll('.toc-link');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const readingProgressBar = document.getElementById('readingProgressBar');
  const searchInput = document.getElementById('searchInput');

  // State
  let currentDocId = 'privacy';

  /* -------------------------------------------------------------------------
     1. Theme Switcher (Dark / Light / System)
     ------------------------------------------------------------------------- */
  const savedTheme = localStorage.getItem('drawme-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('drawme-theme', theme);
    const icon = themeToggleBtn.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (systemPrefersDark) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }

  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme} theme`);
  });

  /* -------------------------------------------------------------------------
     2. Document Tab Routing (#privacy, #terms, #children, #datasafety, etc.)
     ------------------------------------------------------------------------- */
  function switchDocument(targetId, updateHistory = true) {
    // Clean targetId
    const cleanId = targetId.replace('#', '') || 'privacy';
    const targetSection = document.getElementById(`doc-${cleanId}`);

    if (!targetSection) return;

    currentDocId = cleanId;

    // Update Tab Buttons
    tabButtons.forEach(btn => {
      const tabTarget = btn.getAttribute('data-doc');
      if (tabTarget === cleanId) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Update Sections
    docSections.forEach(sec => {
      if (sec.id === `doc-${cleanId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Update Sidebar TOC
    updateTocForDoc(cleanId);

    // Update URL Hash
    if (updateHistory) {
      history.pushState(null, '', `#${cleanId}`);
    }

    // Scroll to top of content smoothly
    const contentArea = document.querySelector('.content-area');
    if (contentArea && window.scrollY > 300) {
      window.scrollTo({
        top: contentArea.offsetTop - 90,
        behavior: 'smooth'
      });
    }

    // Reset search
    if (searchInput) {
      searchInput.value = '';
      clearSearchHighlights();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetDoc = btn.getAttribute('data-doc');
      switchDocument(targetDoc);
    });
  });

  // Handle Initial Route from URL Hash
  const initialHash = window.location.hash;
  if (initialHash) {
    const cleanHash = initialHash.replace('#', '');
    // If it's a sub-section anchor (e.g. #privacy-coppa), handle that
    if (cleanHash.startsWith('terms')) {
      switchDocument('terms', false);
    } else if (cleanHash.startsWith('children') || cleanHash.startsWith('coppa')) {
      switchDocument('children', false);
    } else if (cleanHash.startsWith('data-safety') || cleanHash.startsWith('datasafety')) {
      switchDocument('datasafety', false);
    } else if (cleanHash.startsWith('parental')) {
      switchDocument('parental', false);
    } else if (cleanHash.startsWith('contact')) {
      switchDocument('contact', false);
    } else {
      switchDocument('privacy', false);
    }
  } else {
    switchDocument('privacy', false);
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentDocId) {
      switchDocument(hash, false);
    }
  });

  /* -------------------------------------------------------------------------
     3. Dynamic Sidebar TOC per Document
     ------------------------------------------------------------------------- */
  function updateTocForDoc(docId) {
    const tocList = document.getElementById('tocLinksList');
    if (!tocList) return;

    const activeSection = document.getElementById(`doc-${docId}`);
    if (!activeSection) return;

    const headings = activeSection.querySelectorAll('h2[id]');
    tocList.innerHTML = '';

    headings.forEach(h2 => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h2.id}`;
      a.className = 'toc-link';
      a.textContent = h2.dataset.title || h2.childNodes[0].textContent.trim();
      a.addEventListener('click', (e) => {
        e.preventDefault();
        h2.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', `#${h2.id}`);
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });

    updateTocScrollspy();
  }

  /* -------------------------------------------------------------------------
     4. Scrollspy for Active Headings
     ------------------------------------------------------------------------- */
  function updateTocScrollspy() {
    const activeSection = document.getElementById(`doc-${currentDocId}`);
    if (!activeSection) return;

    const headings = activeSection.querySelectorAll('h2[id]');
    const links = document.querySelectorAll('.toc-link');
    const scrollPos = window.scrollY + 140;

    let activeHeadingId = null;

    headings.forEach(h2 => {
      if (h2.offsetTop <= scrollPos) {
        activeHeadingId = h2.id;
      }
    });

    links.forEach(link => {
      if (activeHeadingId && link.getAttribute('href') === `#${activeHeadingId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* -------------------------------------------------------------------------
     5. Reading Progress Bar & Back to Top
     ------------------------------------------------------------------------- */
  window.addEventListener('scroll', () => {
    // Progress
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (readingProgressBar) {
      readingProgressBar.style.width = scrolled + '%';
    }

    // Back to top
    if (backToTopBtn) {
      if (winScroll > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    updateTocScrollspy();
  });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -------------------------------------------------------------------------
     6. Copy Anchor Link to Heading
     ------------------------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-heading-btn');
    if (copyBtn) {
      const heading = copyBtn.closest('h2');
      if (heading && heading.id) {
        const fullUrl = `${window.location.origin}${window.location.pathname}#${heading.id}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
          showToast('Link copied to clipboard!');
        }).catch(() => {
          showToast('Failed to copy link');
        });
      }
    }
  });

  /* -------------------------------------------------------------------------
     7. Print Trigger
     ------------------------------------------------------------------------- */
  printDocBtn?.addEventListener('click', () => {
    window.print();
  });

  /* -------------------------------------------------------------------------
     8. Instant Search Filter
     ------------------------------------------------------------------------- */
  let searchDebounceTimer = null;

  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      performSearch(e.target.value.trim());
    }, 200);
  });

  function performSearch(query) {
    clearSearchHighlights();
    if (!query || query.length < 2) return;

    const activeSection = document.getElementById(`doc-${currentDocId}`);
    if (!activeSection) return;

    const paragraphs = activeSection.querySelectorAll('p, li, td, h3');
    let matchCount = 0;

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');

    paragraphs.forEach(el => {
      // Avoid breaking existing links or buttons
      if (el.children.length === 0 || (el.tagName === 'P' && !el.querySelector('a'))) {
        const text = el.textContent;
        if (regex.test(text)) {
          matchCount++;
          el.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
        }
      }
    });

    if (matchCount > 0) {
      showToast(`Found ${matchCount} occurrence(s) for "${query}"`);
    } else {
      showToast(`No matches found for "${query}"`);
    }
  }

  function clearSearchHighlights() {
    const highlights = document.querySelectorAll('mark.search-highlight');
    highlights.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      }
    });
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* -------------------------------------------------------------------------
     9. Toast Notification Helper
     ------------------------------------------------------------------------- */
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
});
