/* ============================================================
   VELOXITAS AGENCY — behaviour + no-code Edit Mode
   Open the site with  ?edit=1  at the end of the URL to edit
   text and photos directly on the page. No coding needed.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'veloxitas_site_edits_v1';

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      mobileMenu.style.display = open ? 'flex' : 'none';
      mobileMenu.style.flexDirection = 'column';
      mobileMenu.style.gap = '18px';
      mobileMenu.style.padding = '18px 24px 28px';
      mobileMenu.style.background = 'var(--navy-800)';
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------- Accordion ---------------- */
  document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.accordion-item');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ============================================================
     EDIT MODE
     ============================================================ */
  var editableEls = Array.prototype.slice.call(document.querySelectorAll('[data-editable]'))
    .filter(function (el) { return el.getAttribute('data-editable') !== 'false'; });

  // Give every editable element a stable id so we can save/restore it.
  editableEls.forEach(function (el, i) {
    if (!el.dataset.editId) el.dataset.editId = 'el-' + i;
  });

  function loadEdits() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveEdits(edits) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  }

  // Always apply any previously-saved edits, in edit mode or not,
  // so the owner (and, once downloaded, visitors) see the latest content.
  (function applySavedEdits() {
    var edits = loadEdits();
    editableEls.forEach(function (el) {
      var saved = edits[el.dataset.editId];
      if (!saved) return;
      if (saved.type === 'image' && el.tagName === 'IMG') {
        el.src = saved.src;
      } else if (saved.type === 'text') {
        el.innerHTML = saved.html;
      }
    });
  })();

  var params = new URLSearchParams(window.location.search);
  var editMode = params.get('edit') === '1';
  if (editMode) document.body.classList.add('edit-mode');

  if (editMode) {
    var statusEl = document.getElementById('editStatus');
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    var currentImgTarget = null;

    function setStatus(msg) {
      if (statusEl) statusEl.textContent = msg;
    }

    function persist(el, data) {
      var edits = loadEdits();
      edits[el.dataset.editId] = data;
      saveEdits(edits);
      setStatus('ذخیره شد ✓');
    }

    editableEls.forEach(function (el) {
      if (el.tagName === 'IMG') {
        var wrap = el.closest('.img-edit-wrap') || el;
        wrap.addEventListener('click', function (e) {
          e.preventDefault();
          currentImgTarget = el;
          fileInput.click();
        });
      } else {
        el.setAttribute('contenteditable', 'true');
        el.addEventListener('input', debounce(function () {
          persist(el, { type: 'text', html: el.innerHTML });
        }, 400));
        // Prevent Enter from creating new <div>s in single-line elements like headings/buttons.
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !el.matches('p, .accordion-panel p')) {
            e.preventDefault();
            el.blur();
          }
        });
      }
    });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file || !currentImgTarget) return;
      var reader = new FileReader();
      reader.onload = function () {
        currentImgTarget.src = reader.result;
        persist(currentImgTarget, { type: 'image', src: reader.result });
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });

    var btnDownload = document.getElementById('btnDownload');
    var btnReset = document.getElementById('btnReset');
    var btnExit = document.getElementById('btnExit');

    if (btnDownload) {
      btnDownload.addEventListener('click', function () {
        var clone = document.documentElement.cloneNode(true);
        clone.querySelector('body').classList.remove('edit-mode');
        var toolbar = clone.querySelector('.edit-toolbar');
        if (toolbar) toolbar.remove();
        var fi = clone.querySelector('input[type=file]');
        if (fi) fi.remove();
        clone.querySelectorAll('[contenteditable]').forEach(function (el) { el.removeAttribute('contenteditable'); });
        var html = '<!DOCTYPE html>\n' + clone.outerHTML;
        var blob = new Blob([html], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setStatus('فایل دانلود شد ⬇️ — همینو جای فایل قبلی بذار');
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (confirm('همه‌ی تغییرات ذخیره‌شده پاک بشه؟')) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        }
      });
    }

    if (btnExit) {
      btnExit.addEventListener('click', function () {
        var url = new URL(window.location.href);
        url.searchParams.delete('edit');
        window.location.href = url.toString();
      });
    }
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }
})();
