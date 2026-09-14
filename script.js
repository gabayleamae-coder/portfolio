(function () {
    const canvas = document.getElementById('hero-canvas');
    const heroSection = document.getElementById('hero');

    // --- Three.js Setup ---
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 30;

    // --- Create Particles ---
    const PARTICLE_COUNT = 350;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = [];
    const spread = 60;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
        velocities.push({
            x: (Math.random() - 0.5) * 0.015,
            y: (Math.random() - 0.5) * 0.015,
            z: (Math.random() - 0.5) * 0.015
        });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Glowing particle material
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.35,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // --- Connection Lines ---
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // --- Floating Geometric Shapes ---
    const shapesGroup = new THREE.Group();
    scene.add(shapesGroup);

    const shapeColors = [0x38bdf8, 0x818cf8, 0xa78bfa, 0x06b6d4];
    const shapeMeshes = [];

    // Create floating icosahedrons
    for (let i = 0; i < 6; i++) {
        const geo = new THREE.IcosahedronGeometry(Math.random() * 1.5 + 0.5, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: shapeColors[Math.floor(Math.random() * shapeColors.length)],
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20
        );
        mesh.userData = {
            rotSpeed: { x: Math.random() * 0.01, y: Math.random() * 0.01, z: Math.random() * 0.005 },
            floatSpeed: Math.random() * 0.002 + 0.001,
            floatOffset: Math.random() * Math.PI * 2
        };
        shapeMeshes.push(mesh);
        shapesGroup.add(mesh);
    }

    // Create floating octahedrons
    for (let i = 0; i < 4; i++) {
        const geo = new THREE.OctahedronGeometry(Math.random() * 1.2 + 0.4, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: shapeColors[Math.floor(Math.random() * shapeColors.length)],
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 45,
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 15
        );
        mesh.userData = {
            rotSpeed: { x: Math.random() * 0.008, y: Math.random() * 0.012, z: Math.random() * 0.004 },
            floatSpeed: Math.random() * 0.003 + 0.001,
            floatOffset: Math.random() * Math.PI * 2
        };
        shapeMeshes.push(mesh);
        shapesGroup.add(mesh);
    }

    // --- Mouse interaction ---
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // --- Resize handler ---
    function resize() {
        const rect = heroSection.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // --- Animation Loop ---
    const CONNECTION_DISTANCE = 8;
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        const posArray = particleGeometry.attributes.position.array;

        // Move particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            posArray[i * 3] += velocities[i].x;
            posArray[i * 3 + 1] += velocities[i].y;
            posArray[i * 3 + 2] += velocities[i].z;

            // Wrap around
            const halfSpread = spread / 2;
            if (posArray[i * 3] > halfSpread) posArray[i * 3] = -halfSpread;
            if (posArray[i * 3] < -halfSpread) posArray[i * 3] = halfSpread;
            if (posArray[i * 3 + 1] > halfSpread) posArray[i * 3 + 1] = -halfSpread;
            if (posArray[i * 3 + 1] < -halfSpread) posArray[i * 3 + 1] = halfSpread;
            if (posArray[i * 3 + 2] > halfSpread) posArray[i * 3 + 2] = -halfSpread;
            if (posArray[i * 3 + 2] < -halfSpread) posArray[i * 3 + 2] = halfSpread;
        }
        particleGeometry.attributes.position.needsUpdate = true;

        // Draw connection lines between nearby particles
        const linePositions = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            for (let j = i + 1; j < PARTICLE_COUNT; j++) {
                const dx = posArray[i * 3] - posArray[j * 3];
                const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < CONNECTION_DISTANCE) {
                    linePositions.push(
                        posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2],
                        posArray[j * 3], posArray[j * 3 + 1], posArray[j * 3 + 2]
                    );
                }
            }
        }
        lineGeometry.setAttribute('position',
            new THREE.Float32BufferAttribute(linePositions, 3)
        );

        // Animate shapes
        shapeMeshes.forEach((mesh) => {
            mesh.rotation.x += mesh.userData.rotSpeed.x;
            mesh.rotation.y += mesh.userData.rotSpeed.y;
            mesh.rotation.z += mesh.userData.rotSpeed.z;
            mesh.position.y += Math.sin(time + mesh.userData.floatOffset) * mesh.userData.floatSpeed;
        });

        // Subtle pulse on particle size
        particleMaterial.size = 0.35 + Math.sin(time * 2) * 0.05;

        // Camera follows mouse subtly
        camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Slow global rotation
        particles.rotation.y += 0.0005;
        shapesGroup.rotation.y += 0.0003;

        renderer.render(scene, camera);
    }

    animate();
})();
