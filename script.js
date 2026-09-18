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

// --- Theme Toggle Handler ---
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const icon = themeBtn.querySelector('i');
        if (icon.classList.contains('fa-sun')) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
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
