// ==============================================
// 3D CANVAS ANIMATION - Rotating Particle Galaxy
// ==============================================
function init3DCanvas() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let connections = [];
    let mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    let animationId;

    const CONFIG = {
        particleCount: 120,
        connectionDistance: 150,
        rotationSpeed: 0.002,
        mouseInfluence: 0.0003,
        particleMinSize: 1,
        particleMaxSize: 3,
        colors: [
            'rgba(108, 92, 231, ',
            'rgba(9, 132, 227, ',
            'rgba(0, 206, 201, ',
            'rgba(253, 121, 168, ',
            'rgba(162, 155, 254, ',
        ],
        depth: 800,
        fov: 400,
    };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push({
                x: (Math.random() - 0.5) * width * 1.5,
                y: (Math.random() - 0.5) * height * 1.5,
                z: (Math.random() - 0.5) * CONFIG.depth * 2,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                vz: (Math.random() - 0.5) * 0.5,
                size: CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize),
                color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.03,
            });
        }
    }

    function project(x, y, z) {
        const scale = CONFIG.fov / (CONFIG.fov + z);
        return {
            x: x * scale + width / 2,
            y: y * scale + height / 2,
            scale: scale,
            z: z,
        };
    }

    function rotateX(x, y, z, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x,
            y: y * cos - z * sin,
            z: y * sin + z * cos,
        };
    }

    function rotateY(x, y, z, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos + z * sin,
            y: y,
            z: -x * sin + z * cos,
        };
    }

    function updateParticles() {
        rotationX += CONFIG.rotationSpeed;
        rotationY += CONFIG.rotationSpeed * 0.7;

        // Mouse influence
        const targetRotX = (mouseY / height - 0.5) * CONFIG.mouseInfluence * 10;
        const targetRotY = (mouseX / width - 0.5) * CONFIG.mouseInfluence * 10;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.pulsePhase += p.pulseSpeed;

            // Wrap around
            const bound = width * 0.8;
            const boundH = height * 0.8;
            const boundD = CONFIG.depth;
            if (p.x > bound) p.x = -bound;
            if (p.x < -bound) p.x = bound;
            if (p.y > boundH) p.y = -boundH;
            if (p.y < -boundH) p.y = boundH;
            if (p.z > boundD) p.z = -boundD;
            if (p.z < -boundD) p.z = boundD;
        });
    }

    function drawParticles() {
        particles.forEach(p => {
            // Apply 3D rotation
            let rotated = rotateX(p.x, p.y, p.z, rotationX);
            rotated = rotateY(rotated.x, rotated.y, rotated.z, rotationY);

            const projected = project(rotated.x, rotated.y, rotated.z);

            if (projected.scale > 0) {
                const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;
                const size = p.size * projected.scale * pulse;
                const alpha = Math.min(projected.scale * 0.8, 1) * pulse;

                // Glow effect
                const gradient = ctx.createRadialGradient(
                    projected.x, projected.y, 0,
                    projected.x, projected.y, size * 4
                );
                gradient.addColorStop(0, p.color + alpha + ')');
                gradient.addColorStop(0.5, p.color + (alpha * 0.3) + ')');
                gradient.addColorStop(1, p.color + '0)');

                ctx.beginPath();
                ctx.arc(projected.x, projected.y, size * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + alpha + ')';
                ctx.fill();
            }
        });
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            let r1 = rotateX(particles[i].x, particles[i].y, particles[i].z, rotationX);
            r1 = rotateY(r1.x, r1.y, r1.z, rotationY);
            const p1 = project(r1.x, r1.y, r1.z);

            if (p1.scale <= 0) continue;

            for (let j = i + 1; j < particles.length; j++) {
                let r2 = rotateX(particles[j].x, particles[j].y, particles[j].z, rotationX);
                r2 = rotateY(r2.x, r2.y, r2.z, rotationY);
                const p2 = project(r2.x, r2.y, r2.z);

                if (p2.scale <= 0) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const alpha = (1 - dist / CONFIG.connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(108, 92, 231, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function drawGeometricShapes() {
        // Draw rotating icosahedron wireframe in background
        const time = Date.now() * 0.001;
        const size = Math.min(width, height) * 0.15;
        const cx = width * 0.8;
        const cy = height * 0.3;

        const vertices = [];
        const phi = (1 + Math.sqrt(5)) / 2;

        const rawVerts = [
            [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
            [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
            [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
        ];

        rawVerts.forEach(v => {
            let [x, y, z] = v;
            // Normalize
            const len = Math.sqrt(x * x + y * y + z * z);
            x = (x / len) * size;
            y = (y / len) * size;
            z = (z / len) * size;

            // Rotate
            let r = rotateX(x, y, z, time * 0.5);
            r = rotateY(r.x, r.y, r.z, time * 0.3);
            r.z += size * 0.5; // push forward

            const p = project(r.x, r.y, r.z);
            p.x = p.x - (width / 2) + cx;
            p.y = p.y - (height / 2) + cy;
            vertices.push(p);
        });

        // Draw edges
        const edges = [
            [0,1],[0,5],[0,7],[0,10],[0,11],
            [1,5],[1,7],[1,8],[1,9],
            [2,3],[2,4],[2,6],[2,10],[2,11],
            [3,4],[3,6],[3,8],[3,9],
            [4,5],[4,9],[4,11],
            [5,9],[5,11],
            [6,7],[6,8],[6,10],
            [7,8],[7,10],
            [8,9],
            [10,11],
        ];

        edges.forEach(([a, b]) => {
            if (vertices[a] && vertices[b]) {
                ctx.beginPath();
                ctx.moveTo(vertices[a].x, vertices[a].y);
                ctx.lineTo(vertices[b].x, vertices[b].y);
                ctx.strokeStyle = 'rgba(0, 206, 201, 0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Draw vertices
        vertices.forEach(v => {
            ctx.beginPath();
            ctx.arc(v.x, v.y, 2 * v.scale, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 206, 201, 0.15)';
            ctx.fill();
        });
    }

    function drawSecondShape() {
        // Rotating cube wireframe on left side
        const time = Date.now() * 0.0008;
        const size = Math.min(width, height) * 0.1;
        const cx = width * 0.15;
        const cy = height * 0.65;

        const cubeVerts = [
            [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
            [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],
        ];

        const projected = cubeVerts.map(v => {
            let [x, y, z] = v;
            x *= size; y *= size; z *= size;
            let r = rotateX(x, y, z, time * 0.7);
            r = rotateY(r.x, r.y, r.z, time * 0.5);
            r.z += size;
            const p = project(r.x, r.y, r.z);
            p.x = p.x - (width / 2) + cx;
            p.y = p.y - (height / 2) + cy;
            return p;
        });

        const edges = [
            [0,1],[1,2],[2,3],[3,0],
            [4,5],[5,6],[6,7],[7,4],
            [0,4],[1,5],[2,6],[3,7],
        ];

        edges.forEach(([a, b]) => {
            ctx.beginPath();
            ctx.moveTo(projected[a].x, projected[a].y);
            ctx.lineTo(projected[b].x, projected[b].y);
            ctx.strokeStyle = 'rgba(253, 121, 168, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        projected.forEach(v => {
            ctx.beginPath();
            ctx.arc(v.x, v.y, 2 * v.scale, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(253, 121, 168, 0.12)';
            ctx.fill();
        });
    }

    function drawTorusRing() {
        const time = Date.now() * 0.0006;
        const R = Math.min(width, height) * 0.12; // major radius
        const r = R * 0.35; // minor radius
        const cx = width * 0.5;
        const cy = height * 0.5;
        const segments = 40;
        const rings = 20;
        const points = [];

        for (let i = 0; i < rings; i++) {
            const theta = (i / rings) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
                const phi = (j / segments) * Math.PI * 2;
                let x = (R + r * Math.cos(phi)) * Math.cos(theta);
                let y = (R + r * Math.cos(phi)) * Math.sin(theta);
                let z = r * Math.sin(phi);

                // Rotate
                let rot = rotateX(x, y, z, time * 0.4);
                rot = rotateY(rot.x, rot.y, rot.z, time * 0.3);

                const proj = project(rot.x, rot.y, rot.z + R * 0.5);
                proj.x = proj.x - (width / 2) + cx;
                proj.y = proj.y - (height / 2) + cy;
                proj.i = i;
                proj.j = j;
                points.push(proj);
            }
        }

        // Draw ring connections
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const idx = i * segments + j;
                const nextJ = i * segments + ((j + 1) % segments);
                const nextI = ((i + 1) % rings) * segments + j;

                if (points[idx] && points[nextJ]) {
                    const alpha = 0.03 * points[idx].scale;
                    ctx.beginPath();
                    ctx.moveTo(points[idx].x, points[idx].y);
                    ctx.lineTo(points[nextJ].x, points[nextJ].y);
                    ctx.strokeStyle = `rgba(0, 206, 201, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
                if (points[idx] && points[nextI]) {
                    const alpha = 0.03 * points[idx].scale;
                    ctx.beginPath();
                    ctx.moveTo(points[idx].x, points[idx].y);
                    ctx.lineTo(points[nextI].x, points[nextI].y);
                    ctx.strokeStyle = `rgba(108, 92, 231, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function drawDNAHelix() {
        const time = Date.now() * 0.001;
        const helixHeight = height * 0.5;
        const radius = Math.min(width, height) * 0.06;
        const cx = width * 0.85;
        const cy = height * 0.5;
        const turns = 4;
        const steps = 60;
        const prevPoints = [[], []];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = t * turns * Math.PI * 2 + time;
            const y = (t - 0.5) * helixHeight;

            for (let strand = 0; strand < 2; strand++) {
                const offset = strand * Math.PI;
                let x = Math.cos(angle + offset) * radius;
                let z = Math.sin(angle + offset) * radius;

                // Rotate
                let rot = rotateX(x, y, z, time * 0.2);
                rot = rotateY(rot.x, rot.y, rot.z, time * 0.15);

                const proj = project(rot.x, rot.y, rot.z + radius * 2);
                proj.x = proj.x - (width / 2) + cx;
                proj.y = proj.y - (height / 2) + cy;

                if (prevPoints[strand].length > 0) {
                    const prev = prevPoints[strand][prevPoints[strand].length - 1];
                    const alpha = 0.1 * proj.scale;
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(proj.x, proj.y);
                    ctx.strokeStyle = strand === 0
                        ? `rgba(108, 92, 231, ${alpha})`
                        : `rgba(253, 121, 168, ${alpha})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // Dot
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 2 * proj.scale, 0, Math.PI * 2);
                ctx.fillStyle = strand === 0
                    ? `rgba(108, 92, 231, ${0.4 * proj.scale})`
                    : `rgba(253, 121, 168, ${0.4 * proj.scale})`;
                ctx.fill();

                prevPoints[strand].push(proj);
            }

            // Cross links every few steps
            if (i % 4 === 0 && prevPoints[0][i] && prevPoints[1][i]) {
                const alpha = 0.05;
                ctx.beginPath();
                ctx.moveTo(prevPoints[0][i].x, prevPoints[0][i].y);
                ctx.lineTo(prevPoints[1][i].x, prevPoints[1][i].y);
                ctx.strokeStyle = `rgba(0, 206, 201, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        updateParticles();
        drawConnections();
        drawTorusRing();
        drawParticles();
        drawGeometricShapes();
        drawSecondShape();
        drawDNAHelix();

        animationId = requestAnimationFrame(animate);
    }

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        resize();
    });

    // Init
    resize();
    createParticles();
    animate();
}

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

// Contact Form Handling with Formspree
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
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

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showAlert('Message sent successfully! I will get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    showAlert('Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                showAlert('Network error. Please try again later.', 'error');
            }

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
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
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll direction
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
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
    const toggler = document.querySelector('.navbar-toggler');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                toggler.click();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navbarCollapse.classList.contains('show') &&
            !navbarCollapse.contains(e.target) &&
            !toggler.contains(e.target)) {
            toggler.click();
        }
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
        background: linear-gradient(135deg, #6c5ce7, #00cec9);
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
        box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4);
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

// Dark/Light Mode Toggle
function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
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

// ==============================================
// CURSOR GLOW - Follows mouse
// ==============================================
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// ==============================================
// 3D TILT EFFECT ON CARDS
// ==============================================
function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    });
}

// ==============================================
// MAGNETIC BUTTONS
// ==============================================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.1s ease';
        });
    });
}

// ==============================================
// SCROLL REVEAL ANIMATIONS
// ==============================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// ==============================================
// ANIMATED COUNTERS
// ==============================================
function initAnimatedCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                let current = 0;
                const increment = target / 60;
                const suffix = el.getAttribute('data-suffix') || '+';

                function update() {
                    current += increment;
                    if (current < target) {
                        el.textContent = Math.ceil(current) + suffix;
                        requestAnimationFrame(update);
                    } else {
                        el.textContent = target + suffix;
                    }
                }
                update();
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ==============================================
// HERO FLOATING PARTICLES (CSS-generated)
// ==============================================
function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const colors = [
        'rgba(108, 92, 231, 0.6)',
        'rgba(9, 132, 227, 0.6)',
        'rgba(0, 206, 201, 0.6)',
        'rgba(253, 121, 168, 0.6)',
        'rgba(253, 203, 110, 0.4)',
    ];

    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = 2 + Math.random() * 4;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (8 + Math.random() * 15) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        p.style.boxShadow = `0 0 ${size * 2}px ${p.style.background}`;
        container.appendChild(p);
    }
}

// ==============================================
// MOUSE TRAIL PARTICLES
// ==============================================
function initMouseTrail() {
    let lastTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime < 50) return;
        lastTime = now;

        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            width: 6px;
            height: 6px;
            background: rgba(108, 92, 231, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transition: all 0.6s ease;
            box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
        `;
        document.body.appendChild(trail);

        requestAnimationFrame(() => {
            trail.style.transform = 'scale(0)';
            trail.style.opacity = '0';
        });

        setTimeout(() => trail.remove(), 600);
    });
}

// ==============================================
// TIMELINE FILL ANIMATION
// ==============================================
function initTimelineAnimation() {
    const timelineFill = document.getElementById('timelineFill');
    const timelineSection = document.querySelector('.timeline');
    if (!timelineFill || !timelineSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                timelineFill.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(timelineSection);
}

// ==============================================
// PARALLAX SCROLL FOR SECTIONS
// ==============================================
function initSectionParallax() {
    const sections = document.querySelectorAll('.experience-section, .portfolio-section, .services-section');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const offset = rect.top / window.innerHeight;

            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const bgShift = offset * 20;
                section.style.backgroundPositionY = bgShift + 'px';
            }
        });
    });
}

// ==============================================
// STAGGERED PORTFOLIO REVEAL
// ==============================================
function initPortfolioReveal() {
    const cards = document.querySelectorAll('.reveal-portfolio');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach(card => observer.observe(card));
}

// ==============================================
// PAGE PRELOADER
// ==============================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => preloader.remove(), 600);
    });
}

// ==============================================
// SCROLL PROGRESS BAR
// ==============================================
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        bar.style.width = progress + '%';
    });
}

// ==============================================
// Initialize All Functions on DOM Load
// ==============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing Professional Web Solutions...');

    // Initialize all modules
    init3DCanvas();
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
    initDarkMode();

    // New advanced modules
    initCursorGlow();
    initTiltCards();
    initMagneticButtons();
    initScrollReveal();
    initAnimatedCounters();
    initHeroParticles();
    initMouseTrail();
    initPreloader();
    initScrollProgress();
    initTimelineAnimation();
    initSectionParallax();
    initPortfolioReveal();

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
