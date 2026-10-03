document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.querySelectorAll('.mobile-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Services dropdown (desktop): opens on hover/focus via CSS; click toggles it
  // for touch and keyboard users, Escape or a click elsewhere closes it
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var button = dropdown.querySelector('.nav-dropdown-toggle');
    if (!button) return;
    function setOpen(open) {
      dropdown.classList.toggle('open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!dropdown.classList.contains('open'));
    });
    dropdown.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setOpen(false);
        button.focus();
      }
    });
    dropdown.addEventListener('focusout', function (e) {
      if (!dropdown.contains(e.relatedTarget)) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) setOpen(false);
    });
  });

  // Links with data-prefill-message (e.g. "Contribute to the research") jump to
  // the contact form and fill in the message, unless the visitor already typed one
  var messageField = document.getElementById('message');
  document.querySelectorAll('[data-prefill-message]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!messageField) return;
      var text = link.getAttribute('data-prefill-message');
      if (!messageField.value.trim() || messageField.dataset.prefilled === 'true') {
        messageField.value = text;
        messageField.dataset.prefilled = 'true';
      }
    });
  });
  if (messageField) {
    messageField.addEventListener('input', function () {
      messageField.dataset.prefilled = 'false';
    });
  }

  // Contact form — submits to FormSubmit.co (no server code required)
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      status.textContent = 'Sending…';
      status.className = 'form-status';

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          status.textContent = 'Thanks — your message has been received. I’ll be in touch soon.';
          status.className = 'form-status success';
          form.reset();
        })
        .catch(function () {
          status.textContent = 'Something went wrong sending your message. Please try again or email directly.';
          status.className = 'form-status error';
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }
});
