// --- 3D Parallax Tilt Effect on Avatar ---
const avatar = document.getElementById('hero-avatar');
if (avatar) {
    document.addEventListener('mousemove', (e) => {
        const rect = avatar.getBoundingClientRect();
        const avatarX = rect.left + rect.width / 2;
        const avatarY = rect.top + rect.height / 2;

        const distX = (e.clientX - avatarX) / (window.innerWidth / 2);
        const distY = (e.clientY - avatarY) / (window.innerHeight / 2);

        const tiltX = -distY * 12;
        const tiltY = distX * 12;

        avatar.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    avatar.addEventListener('mouseleave', () => {
        avatar.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
}

// --- Mobile Menu Toggle ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });
}

// --- Skill Progress Bar Animation ---
document.querySelectorAll('.skill-progress').forEach((bar) => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    bar.style.transition = 'width 1.2s ease';
                    bar.style.width = targetWidth;
                }, 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(bar);
});

// --- Copy to Clipboard Handler for Contact Cards ---
document.querySelectorAll('.contact-card.copyable').forEach((card) => {
    card.addEventListener('click', () => {
        const textToCopy = card.getAttribute('data-copy');
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const copyBtn = card.querySelector('.copy-btn i');
                if (copyBtn) {
                    copyBtn.className = 'fa-solid fa-check';
                    copyBtn.style.color = '#10b981';
                    setTimeout(() => {
                        copyBtn.className = 'fa-regular fa-copy';
                        copyBtn.style.color = '';
                    }, 2000);
                }
            });
        }
    });
});

// --- Marquee Fisheye Effect ---
const marqueeContainer = document.querySelector('.skills-marquee-container');
const skillPills = document.querySelectorAll('.skill-pill');

if (marqueeContainer && skillPills.length > 0) {
    let animationFrameId;
    let isVisible = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
                runFisheye();
            } else {
                cancelAnimationFrame(animationFrameId);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(marqueeContainer);

    function runFisheye() {
        if (!isVisible) return;

        const containerRect = marqueeContainer.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        skillPills.forEach(pill => {
            const rect = pill.getBoundingClientRect();
            const pillCenterX = rect.left + rect.width / 2;

            const distance = Math.abs(centerX - pillCenterX);
            const maxDistance = containerRect.width / 3;

            let scale = 1;
            if (distance < maxDistance) {
                const influence = Math.pow(1 - (distance / maxDistance), 2.5);
                scale = 1 + (influence * 1.0); // Max scale 2.0 at dead center
            }

            pill.style.transform = `scale(${scale})`;
            pill.style.zIndex = scale > 1.1 ? 5 : 1;
        });

        animationFrameId = requestAnimationFrame(runFisheye);
    }
}

