// ==============================================
// MAIN.JS - Professional JavaScript Functionality
// ============================================== 

// Smooth Scroll Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link
function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Intersection Observer for Fade-in animations
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe service cards, portfolio cards, and experience cards
    const elements = document.querySelectorAll(
        '.service-card, .portfolio-card, .experience-card'
    );

    elements.forEach(element => {
        observer.observe(element);
    });
}

// Contact Form Handling
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validate form
            if (!name || !email || !subject || !message) {
                showAlert('Please fill in all fields', 'error');
                return;
            }

            // Validate email
            if (!isValidEmail(email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }

            // Show success message
            showAlert('Message sent successfully! I will get back to you soon.', 'success');

            // Reset form
            contactForm.reset();

            // Log to console (in production, this would send to a server)
            console.log('Contact Form Submitted:', {
                name: name,
                email: email,
                subject: subject,
                message: message,
                timestamp: new Date()
            });
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show alert messages
function showAlert(message, type) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    alert.style.position = 'fixed';
    alert.style.top = '100px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';

    const icon = type === 'success' ? '✓' : '✕';
    alert.innerHTML = `
        <strong>${icon}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alert);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Navbar Background on Scroll
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = 'var(--shadow-lg)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-md)';
        }
    });
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50;

        const updateCount = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + '+';
                setTimeout(updateCount, 40);
            } else {
                counter.textContent = target + '+';
            }
        };

        updateCount();
    });
}

// Lazy Loading Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Mobile Menu Close on Link Click
function initMobileMenuClose() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                document.querySelector('.navbar-toggler').click();
            }
        });
    });
}

// Parallax Effect (Optional)
function initParallax() {
    window.addEventListener('scroll', () => {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(element => {
            const scrollPosition = window.scrollY;
            const elementPosition = element.offsetTop;
            const distance = scrollPosition - elementPosition;
            element.style.transform = `translateY(${distance * 0.5}px)`;
        });
    });
}

// Keyboard Navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Close mobile menu on Escape
        if (e.key === 'Escape') {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                document.querySelector('.navbar-toggler').click();
            }
        }
    });
}

// Smooth Page Load
function smoothPageLoad() {
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    });

    document.body.style.opacity = '0';
}

// Performance Monitoring
function logPerformanceMetrics() {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        console.log('=== Page Performance Metrics ===');
        console.log(`Page Load Time: ${pageLoadTime}ms`);
        console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`);
        console.log(`Time to First Byte: ${perfData.responseEnd - perfData.navigationStart}ms`);
    });
}

// Accessibility: Skip to main content
function initAccessibility() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Scroll to Top Button
function initScrollToTop() {
    const scrollButton = document.createElement('button');
    scrollButton.id = 'scrollToTop';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        display: none;
        z-index: 999;
        font-size: 1.2rem;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-lg);
    `;

    document.body.appendChild(scrollButton);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollButton.style.display = 'flex';
            scrollButton.style.alignItems = 'center';
            scrollButton.style.justifyContent = 'center';
        } else {
            scrollButton.style.display = 'none';
        }
    });

    scrollButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    scrollButton.addEventListener('mouseenter', () => {
        scrollButton.style.transform = 'scale(1.1)';
    });

    scrollButton.addEventListener('mouseleave', () => {
        scrollButton.style.transform = 'scale(1)';
    });
}

// Dark Mode Toggle (Optional)
function initDarkMode() {
    const darkModeToggle = localStorage.getItem('darkMode') === 'true';
    if (darkModeToggle) {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';
    localStorage.setItem('darkMode', 'true');
}

// Form Input Validation
function initFormValidation() {
    const inputs = document.querySelectorAll('.form-control');

    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        input.addEventListener('focus', () => {
            input.classList.remove('is-invalid');
        });
    });
}

// Initialize All Functions on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing Professional Web Solutions...');

    // Initialize all modules
    updateActiveNavLink();
    initIntersectionObserver();
    initContactForm();
    handleNavbarScroll();
    initMobileMenuClose();
    initKeyboardNavigation();
    initAccessibility();
    initScrollToTop();
    initFormValidation();
    logPerformanceMetrics();

    console.log('✓ All modules initialized successfully');
});

// Prevent console errors in production
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

// Log page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
    }
});
