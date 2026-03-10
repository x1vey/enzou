import * as THREE from 'three';

export function initHero3D(container, colors) {
  const scene = new THREE.Scene();
  
  // Use scene fog to fade panels out in the back
  scene.fog = new THREE.Fog(colors.dark, 5, 20);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparent background
  
  // High quality shadow map setup
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.pointerEvents = 'none';

  // --- LIGHTING (Studio / Architectural style) ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  // Main key light casting harsh industrial shadows
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(5, 5, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  scene.add(keyLight);

  // Accent fill light (Amber/Orange to match theme)
  const fillLight = new THREE.PointLight(colors.accent, 2, 20);
  fillLight.position.set(-5, -2, 2);
  scene.add(fillLight);
  
  // Rim light for edge definition
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
  rimLight.position.set(0, 5, -5);
  scene.add(rimLight);

  // --- DRYWALL PANELS ---
  // Create an array of large floating rectangular slabs
  const panels = [];
  
  // Material for the drywall panels: slightly rough, off-white
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: colors.cream,
    roughness: 0.9,
    metalness: 0.05,
  });

  // Geometry matching a standard 4x8 drywall sheet proportion
  const panelGeo = new THREE.BoxGeometry(2, 4, 0.05);

  const numPanels = 15;
  for (let i = 0; i < numPanels; i++) {
    const mesh = new THREE.Mesh(panelGeo, panelMaterial);
    
    // Position randomly within a volume
    mesh.position.x = (Math.random() - 0.5) * 15;
    mesh.position.y = (Math.random() - 0.5) * 10;
    mesh.position.z = (Math.random() - 0.5) * 10 - 2;
    
    // Give each panel a random initial rotation
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
    
    // Store random rotation speeds for animation
    panels.push({
      mesh: mesh,
      rotSpeedX: (Math.random() - 0.5) * 0.002,
      rotSpeedY: (Math.random() - 0.5) * 0.002,
      rotSpeedZ: (Math.random() - 0.5) * 0.002,
      floatSpeed: Math.random() * 0.005 + 0.002,
      floatOffset: Math.random() * Math.PI * 2
    });
  }

  // --- FLOATING DUST MOTES (Construction environment) ---
  const particlesGeo = new THREE.BufferGeometry();
  const pc = 300;
  const pPos = new Float32Array(pc * 3);
  for(let i=0; i<pc*3; i++) {
    pPos[i] = (Math.random() - 0.5) * 20;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  
  const particlesMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.03,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  
  const particleSystem = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particleSystem);


  // --- INTERACTIVITY (Mouse Move Parallax) ---
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
  }
  document.addEventListener('mousemove', onDocumentMouseMove);

  // --- ANIMATION LOOP ---
  const clock = new THREE.Clock();
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Subtle camera parallax
    targetX = mouseX * 2;
    targetY = mouseY * 2;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    // Slowly rotate and float the panels
    panels.forEach(p => {
      p.mesh.rotation.x += p.rotSpeedX;
      p.mesh.rotation.y += p.rotSpeedY;
      p.mesh.rotation.z += p.rotSpeedZ;
      
      // Gentle vertical floating
      p.mesh.position.y += Math.sin(time * p.floatSpeed + p.floatOffset) * 0.005;
    });
    
    // Slow rotation for dust
    particleSystem.rotation.y = time * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  // --- RESPONSIVE HANDLING ---
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  return function destroy() {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('mousemove', onDocumentMouseMove);
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
