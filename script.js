// --- 3D Parallax Tilt Effect on Avatar (disabled) ---


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

// --- GitHub Contributions Graph ---
(async function renderGitHubGraph() {
    const graphEl = document.getElementById('github-graph');

    if (!graphEl) return;

    const GITHUB_USERNAME = 'gabayleamae-coder';
    const API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`;
    const LEVEL_CLASSES = ['github-dot-empty', 'github-dot-l1', 'github-dot-l2', 'github-dot-l3', 'github-dot-l4'];

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const allContributions = data.contributions;

        // 1. Sort chronologically
        allContributions.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 2. Filter to last 365 days up to today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneYearAgo = new Date(today);
        oneYearAgo.setDate(oneYearAgo.getDate() - 364);

        const days = allContributions.filter(d => {
            const date = new Date(d.date);
            return date >= oneYearAgo && date <= today;
        });

        // 3. Add invisible padding dots so columns align Sun-Sat
        const firstDayOfWeek = new Date(days[0].date).getDay(); // 0=Sun
        const dots = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
            dots.push('<span class="github-dot github-dot-hidden"></span>');
        }

        // 4. Render the graph dots
        days.forEach(day => {
            const level = Math.min(day.level, 4);
            const cls = LEVEL_CLASSES[level];
            dots.push(`<span class="github-dot ${cls}" title="${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}"></span>`);
        });

        graphEl.innerHTML = dots.join('');

        // 5. Auto-scroll to the right (most recent)
        const scrollContainer = document.querySelector('.contributions-scroll');
        if (scrollContainer) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth;
        }

    } catch (error) {
        console.error('Failed to fetch GitHub contributions:', error);
    }
})();
