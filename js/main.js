// Mobile navigation toggle and page interactions.

(() => {
    'use strict';

    const nav = document.getElementById('site-nav');
    const toggle = document.querySelector('.nav-toggle');
    const body = document.body;

    if (!nav || !toggle) return;

    // Matches the desktop breakpoint in css/styles.css.
    const desktopQuery = window.matchMedia('(min-width: 900px)');

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    function openMenu() {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        body.classList.add('nav-open');
    }

    function closeMenu() {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('nav-open');
    }

    // Toggle the menu when the hamburger is clicked.
    toggle.addEventListener('click', () => {
        isOpen() ? closeMenu() : openMenu();
    });

    // Close the menu when a navigation link is clicked.
    nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            closeMenu();
        }
    });

    // Close on Escape and return focus to the toggle for accessibility.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            closeMenu();
            toggle.focus();
        }
    });

    // Keep keyboard focus within the menu while it is open on mobile.
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab' || !isOpen() || desktopQuery.matches) return;

        const focusable = [toggle, ...nav.querySelectorAll('a[href]')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    // Close automatically if the viewport is resized to desktop width.
    desktopQuery.addEventListener('change', (event) => {
        if (event.matches && isOpen()) {
            closeMenu();
        }
    });
})();

// Scroll-spy: highlight the nav link for the section currently in view.

(() => {
    'use strict';

    if (!('IntersectionObserver' in window)) return;

    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.site-nav a[href^="#"]');
    if (!sections.length || !links.length) return;

    function setActive(id) {
        links.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            });
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
})();

// Fade-in on scroll (progressive enhancement).

(() => {
    'use strict';

    if (!('IntersectionObserver' in window)) return;

    const SELECTOR = [
        '.about__bio',
        '.facts',
        '.skill-card',
        '.project-card',
        '.timeline__item',
        '.certification',
        '.contact__details',
        '.contact-form',
        '.site-footer__inner',
    ].join(',');

    const targets = document.querySelectorAll(SELECTOR);
    if (!targets.length) return;

    // The hidden state itself is gated by .js + prefers-reduced-motion in CSS.
    targets.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target); // reveal once
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
})();

// Contact form validation and mailto submit (no backend).

(() => {
    'use strict';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const RECIPIENT = 'aminabibihere@gmail.com';

    const fields = [
        {
            el: document.getElementById('name'),
            error: (value) => value.trim().length >= 2 ? '' : 'Please enter your name.',
        },
        {
            el: document.getElementById('email'),
            error: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Please enter a valid email address.',
        },
        {
            el: document.getElementById('message'),
            error: (value) => value.trim().length >= 10 ? '' : 'Please enter a message of at least 10 characters.',
        },
    ];

    function validateField(field) {
        const message = field.error(field.el.value);
        const errorEl = document.getElementById(`${field.el.id}-error`);

        field.el.setAttribute('aria-invalid', message ? 'true' : 'false');

        if (errorEl) {
            errorEl.textContent = message;
        }

        return message === '';
    }

    function validateAll() {
        return fields.map(validateField).every(Boolean);
    }

    // Validate each field when the user leaves it.
    fields.forEach((field) => {
        field.el.addEventListener('blur', () => validateField(field));
    });

    // Validate on submit, then hand off to the visitor's mail app.
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validateAll()) {
            const firstInvalid = fields.find((field) => field.el.getAttribute('aria-invalid') === 'true');
            if (firstInvalid) {
                firstInvalid.el.focus();
            }
            return;
        }

        const [name, email, message] = fields.map((field) => field.el.value.trim());
        const subject = encodeURIComponent(`Portfolio message from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

        window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;

        form.reset();
        fields.forEach((field) => {
            field.el.removeAttribute('aria-invalid');
            const errorEl = document.getElementById(`${field.el.id}-error`);
            if (errorEl) {
                errorEl.textContent = '';
            }
        });
    });
})();

// Footer: keep the copyright year current.

(() => {
    'use strict';

    const year = document.getElementById('year');
    if (year) {
        year.textContent = new Date().getFullYear();
    }
})();
