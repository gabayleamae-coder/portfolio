(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // --- Three.js Setup ---
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 35);

    // --- Ambient & Directional Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    const roseLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    roseLight1.position.set(20, 30, 20);
    scene.add(roseLight1);

    const roseLight2 = new THREE.DirectionalLight(0x0284c7, 1.8);
    roseLight2.position.set(-20, -20, -10);
    scene.add(roseLight2);

    const pointLight = new THREE.PointLight(0x7dd3fc, 1.5, 45);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    // --- 3D Rose Petals System (Light Blue Theme - Smaller Petals) ---
    const PETAL_COUNT = 220;
    const petalsList = [];
    const petalsGroup = new THREE.Group();
    scene.add(petalsGroup);

    const petalColors = [0x38bdf8, 0x7dd3fc, 0x60a5fa, 0x0ea5e9, 0xa5f3fc, 0xbae6fd];

    for (let i = 0; i < PETAL_COUNT; i++) {
        const color = petalColors[i % petalColors.length];
        const pMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.15,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            emissive: 0x0284c7,
            emissiveIntensity: 0.15
        });

        // Smaller, delicate petal dimensions
        const pWidth = 0.3 + Math.random() * 0.25;
        const pHeight = 0.45 + Math.random() * 0.3;

        // Curved 3D plane geometry
        const pGeo = new THREE.PlaneGeometry(pWidth, pHeight, 6, 6);
        const pos = pGeo.attributes.position;
        for (let k = 0; k < pos.count; k++) {
            const px = pos.getX(k);
            const py = pos.getY(k);
            const pzCurve = -0.2 * (1 - Math.abs(px / pWidth)) * (1 - (py / pHeight));
            pos.setZ(k, pzCurve);
        }
        pGeo.computeVertexNormals();

        const pMesh = new THREE.Mesh(pGeo, pMat);
        const px = (Math.random() - 0.5) * 65;
        const py = (Math.random() - 0.5) * 110;
        const pz = (Math.random() - 0.5) * 35;

        pMesh.position.set(px, py, pz);
        pMesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        pMesh.scale.setScalar(0.45 + Math.random() * 0.35);

        pMesh.userData = {
            fallSpeed: 0.02 + Math.random() * 0.03,
            rotSpeedX: (Math.random() - 0.5) * 0.025,
            rotSpeedY: (Math.random() - 0.5) * 0.025,
            rotSpeedZ: (Math.random() - 0.5) * 0.015,
            drift: (Math.random() - 0.5) * 0.012,
            swingFreq: 1.2 + Math.random() * 1.5,
            initialY: py
        };

        petalsList.push(pMesh);
        petalsGroup.add(pMesh);
    }

    // --- Glowing Ambient Dots System ---
    const DOT_COUNT = 250;
    const dotPositions = new Float32Array(DOT_COUNT * 3);
    const dotVelocities = [];

    for (let d = 0; d < DOT_COUNT; d++) {
        dotPositions[d * 3] = (Math.random() - 0.5) * 65;
        dotPositions[d * 3 + 1] = (Math.random() - 0.5) * 110;
        dotPositions[d * 3 + 2] = (Math.random() - 0.5) * 35;
        dotVelocities.push({
            x: (Math.random() - 0.5) * 0.012,
            y: -0.015 - Math.random() * 0.02,
            z: (Math.random() - 0.5) * 0.01
        });
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));

    const dotMat = new THREE.PointsMaterial({
        color: 0x7dd3fc,
        size: 0.25,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const dotsMesh = new THREE.Points(dotGeo, dotMat);
    scene.add(dotsMesh);

    // --- Mouse & Scroll Tracking ---
    let mouseX = 0, mouseY = 0;
    let targetScrollY = 0;
    let currentScrollY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    });

    // --- Resize Handler ---
    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    // --- Main Render Loop ---
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Smooth scroll camera tracking down page height
        currentScrollY += (targetScrollY - currentScrollY) * 0.05;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = totalHeight > 0 ? currentScrollY / totalHeight : 0;
        camera.position.y = -scrollPercent * 85;

        // Falling, Twisting & Swaying 3D Rose Petals
        petalsList.forEach((petal) => {
            petal.position.y -= petal.userData.fallSpeed;
            petal.position.x += Math.sin(time * petal.userData.swingFreq + petal.position.y * 0.1) * petal.userData.drift;

            petal.rotation.x += petal.userData.rotSpeedX;
            petal.rotation.y += petal.userData.rotSpeedY;
            petal.rotation.z += petal.userData.rotSpeedZ;

            // Wrap around bottom to top relative to hero section (fixed Y)
            if (petal.position.y < -35) {
                petal.position.y = 35;
                petal.position.x = (Math.random() - 0.5) * 65;
            }
        });

        // Animate glowing ambient dots
        const dArray = dotGeo.attributes.position.array;
        for (let d = 0; d < DOT_COUNT; d++) {
            dArray[d * 3] += Math.sin(time + d) * 0.008;
            dArray[d * 3 + 1] += dotVelocities[d].y;

            // Wrap around vertically
            if (dArray[d * 3 + 1] < camera.position.y - 35) {
                dArray[d * 3 + 1] = camera.position.y + 35;
                dArray[d * 3] = (Math.random() - 0.5) * 65;
            }
        }
        dotGeo.attributes.position.needsUpdate = true;
        dotMat.size = 0.25 + Math.sin(time * 3) * 0.06;

        // Subtle camera follow mouse tilt
        camera.position.x += (mouseX * 2.5 - camera.position.x) * 0.02;
        camera.lookAt(0, camera.position.y, 0);

        renderer.render(scene, camera);
    }

    animate();
})();

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
