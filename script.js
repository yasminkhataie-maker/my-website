document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var nav = document.querySelector('.side-nav');
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.querySelectorAll('.side-nav-panel a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
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
